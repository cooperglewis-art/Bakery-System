"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import { TAX_RATE } from "@/lib/config";
import { formatOrderNumber } from "@/lib/order-number";
import { ProductGrid } from "./product-grid";
import { CartPanel, type CartItem } from "./cart-panel";
import type { Product, Category } from "@/types/database";

interface PosTerminalProps {
  products: (Product & { category: Category | null })[];
  categories: Category[];
}

type TerminalStatus = "disconnected" | "connecting" | "connected" | "processing";

export function PosTerminal({ products, categories }: PosTerminalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [terminalStatus, setTerminalStatus] = useState<TerminalStatus>("disconnected");
  const [isCharging, setIsCharging] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const terminalRef = useRef<any>(null);

  const supabase = createClient();

  // Initialize Stripe Terminal
  useEffect(() => {
    let mounted = true;

    async function initTerminal() {
      setTerminalStatus("connecting");

      try {
        const { loadStripeTerminal } = await import("@stripe/terminal-js");

        const StripeTerminal = await loadStripeTerminal();
        if (!StripeTerminal || !mounted) return;

        const terminal = StripeTerminal.create({
          onFetchConnectionToken: async () => {
            const res = await fetch("/api/pos/connection-token", { method: "POST" });
            const data = await res.json();
            if (!data.secret) throw new Error("No connection token");
            return data.secret;
          },
          onUnexpectedReaderDisconnect: () => {
            if (mounted) {
              setTerminalStatus("disconnected");
              toast.error("Reader disconnected");
            }
          },
        });

        terminalRef.current = terminal;

        // Discover and connect to simulated reader
        const discoverResult = await terminal.discoverReaders({
          simulated: true,
        });

        if ("error" in discoverResult) {
          throw new Error(discoverResult.error.message);
        }

        const readers = discoverResult.discoveredReaders;
        if (readers.length === 0) {
          throw new Error("No readers found");
        }

        const connectResult = await terminal.connectReader(readers[0]);

        if ("error" in connectResult) {
          throw new Error(connectResult.error.message);
        }

        if (mounted) {
          setTerminalStatus("connected");
          toast.success("Card reader connected");
        }
      } catch (error) {
        console.error("Terminal init error:", error);
        if (mounted) {
          setTerminalStatus("disconnected");
          toast.error("Failed to connect card reader");
        }
      }
    }

    initTerminal();
    return () => {
      mounted = false;
    };
  }, []);

  const handleProductTap = useCallback(
    (product: Product & { category: Category | null }) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.productId === product.id);
        if (existing) {
          return prev.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [
          ...prev,
          {
            productId: product.id,
            productName: product.name,
            unitPrice: product.base_price,
            quantity: 1,
          },
        ];
      });
    },
    []
  );

  const handleUpdateQuantity = useCallback(
    (productId: string, delta: number) => {
      setCart((prev) =>
        prev
          .map((item) =>
            item.productId === productId
              ? { ...item, quantity: item.quantity + delta }
              : item
          )
          .filter((item) => item.quantity > 0)
      );
    },
    []
  );

  const handleRemoveItem = useCallback((productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const handleCharge = async () => {
    const terminal = terminalRef.current;
    if (!terminal || cart.length === 0) return;

    setIsCharging(true);
    setTerminalStatus("processing");

    try {
      const subtotal = cart.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );
      const tax = subtotal * TAX_RATE;
      const total = subtotal + tax;
      const amountInCents = Math.round(total * 100);

      // 1. Create PaymentIntent
      const piRes = await fetch("/api/pos/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amountInCents }),
      });
      const piData = await piRes.json();

      if (!piData.client_secret) {
        throw new Error(piData.error || "Failed to create payment intent");
      }

      // 2. Collect payment method (reader waits for card)
      const collectResult = await terminal.collectPaymentMethod(piData.client_secret);
      if (collectResult.error) {
        throw new Error(collectResult.error.message);
      }

      // 3. Process payment
      const processResult = await terminal.processPayment(collectResult.paymentIntent);
      if (processResult.error) {
        throw new Error(processResult.error.message);
      }

      const paymentIntentId = processResult.paymentIntent.id;

      // 4. Confirm server-side
      const confirmRes = await fetch("/api/pos/confirm-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ payment_intent_id: paymentIntentId }),
      });
      const confirmData = await confirmRes.json();

      if (!confirmData.success) {
        throw new Error(confirmData.error || "Payment confirmation failed");
      }

      // 5. Create order in Supabase
      const today = format(new Date(), "yyyy-MM-dd");

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          source: "walk_in" as const,
          status: "completed" as const,
          delivery_date: today,
          is_delivery: false,
          subtotal,
          tax,
          total,
          deposit_paid: total,
          notes: `Stripe PI: ${paymentIntentId}`,
        })
        .select()
        .single();

      if (orderError) throw orderError;
      if (!order) throw new Error("Failed to create order");

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      toast.success(`Order ${formatOrderNumber(order.order_number)} — $${total.toFixed(2)} paid!`);
      setCart([]);
    } catch (error) {
      console.error("Charge error:", error);
      toast.error(
        error instanceof Error ? error.message : "Payment failed"
      );
    } finally {
      setIsCharging(false);
      setTerminalStatus("connected");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-[calc(100vh-8rem)]">
      {/* Left panel — product grid */}
      <div className="flex-1 lg:w-[65%] min-w-0">
        <ProductGrid
          products={products}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onProductTap={handleProductTap}
        />
      </div>

      {/* Right panel — cart */}
      <div className="lg:w-[35%] min-w-[300px]">
        <CartPanel
          items={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCharge={handleCharge}
          terminalStatus={terminalStatus}
          isCharging={isCharging}
        />
      </div>
    </div>
  );
}
