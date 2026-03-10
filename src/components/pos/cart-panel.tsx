"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TAX_RATE, TAX_RATE_DISPLAY } from "@/lib/config";

export interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface CartPanelProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onCharge: () => void;
  terminalStatus: "disconnected" | "connecting" | "connected" | "processing";
  isCharging: boolean;
}

export function CartPanel({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCharge,
  terminalStatus,
  isCharging,
}: CartPanelProps) {
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const statusColors = {
    disconnected: "bg-red-500",
    connecting: "bg-yellow-500",
    connected: "bg-green-500",
    processing: "bg-blue-500 animate-pulse",
  };

  const statusLabels = {
    disconnected: "Disconnected",
    connecting: "Connecting...",
    connected: "Reader Ready",
    processing: "Processing...",
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border-2 border-amber-200">
      {/* Header with terminal status */}
      <div className="flex items-center justify-between p-4 border-b border-amber-200">
        <h2 className="font-semibold text-amber-900">Cart</h2>
        <div className="flex items-center gap-2 text-xs">
          <div className={cn("w-2 h-2 rounded-full", statusColors[terminalStatus])} />
          <span className="text-amber-600">{statusLabels[terminalStatus]}</span>
        </div>
      </div>

      {/* Cart items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-center text-amber-400 text-sm py-8">
            Tap products to add them
          </p>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className="flex items-center gap-2 p-2 rounded-lg bg-amber-50"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-900 truncate">
                  {item.productName}
                </p>
                <p className="text-xs text-amber-600">
                  ${item.unitPrice.toFixed(2)} each
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => onUpdateQuantity(item.productId, -1)}
                  className="p-1 rounded hover:bg-amber-200 text-amber-700"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-6 text-center text-sm font-medium text-amber-900">
                  {item.quantity}
                </span>
                <button
                  onClick={() => onUpdateQuantity(item.productId, 1)}
                  className="p-1 rounded hover:bg-amber-200 text-amber-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                onClick={() => onRemoveItem(item.productId)}
                className="p-1 rounded hover:bg-red-100 text-red-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Totals and charge button */}
      <div className="border-t border-amber-200 p-4 space-y-2">
        <div className="flex justify-between text-sm text-amber-700">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-amber-700">
          <span>Tax ({TAX_RATE_DISPLAY})</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-semibold text-amber-900 text-lg pt-1 border-t border-amber-100">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <Button
          onClick={onCharge}
          disabled={items.length === 0 || terminalStatus !== "connected" || isCharging}
          className="w-full h-14 text-lg font-semibold bg-amber-600 hover:bg-amber-700 text-white mt-2"
        >
          {isCharging ? "Processing..." : `Charge $${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
