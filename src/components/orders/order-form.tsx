"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import {
  Plus,
  Trash2,
  CalendarIcon,
  Search,
  User,
  Loader2,
} from "lucide-react";
import type { Customer, Product, Category } from "@/types/database";

export interface OrderItemData {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes: string;
}

export interface OrderFormData {
  customerId: string | null;
  source: string;
  deliveryDate: Date | undefined;
  deliveryTimeSlot: string;
  isDelivery: boolean;
  deliveryAddress: string;
  depositPaid: number;
  notes: string;
  orderItems: OrderItemData[];
}

interface OrderFormProps {
  initialData?: OrderFormData;
  customers: Customer[];
  products: (Product & { category: Category | null })[];
  onSubmit: (data: OrderFormData) => Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
}

export function OrderForm({
  initialData,
  customers,
  products,
  onSubmit,
  submitLabel,
  isSubmitting = false,
}: OrderFormProps) {
  const [customerId, setCustomerId] = useState<string | null>(
    initialData?.customerId ?? null
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPopoverOpen, setCustomerPopoverOpen] = useState(false);
  const [source, setSource] = useState(initialData?.source ?? "call");
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(
    initialData?.deliveryDate
  );
  const [deliveryTimeSlot, setDeliveryTimeSlot] = useState(
    initialData?.deliveryTimeSlot ?? ""
  );
  const [isDelivery, setIsDelivery] = useState(
    initialData?.isDelivery ?? false
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    initialData?.deliveryAddress ?? ""
  );
  const [depositPaid, setDepositPaid] = useState(
    initialData?.depositPaid ?? 0
  );
  const [notes, setNotes] = useState(initialData?.notes ?? "");
  const [orderItems, setOrderItems] = useState<OrderItemData[]>(
    initialData?.orderItems ?? [
      {
        id: "1",
        productId: null,
        productName: "",
        quantity: 1,
        unitPrice: 0,
        notes: "",
      },
    ]
  );

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null;

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone?.includes(customerSearch)
  );

  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );
  const tax = subtotal * 0.075;
  const total = subtotal + tax;

  const handleSelectCustomer = (customer: Customer) => {
    setCustomerId(customer.id);
    setCustomerSearch(customer.name);
    setCustomerPopoverOpen(false);
  };

  const handleSelectProduct = (itemId: string, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setOrderItems((items) =>
        items.map((item) =>
          item.id === itemId
            ? {
                ...item,
                productId: product.id,
                productName: product.name,
                unitPrice: product.base_price,
              }
            : item
        )
      );
    }
  };

  const handleAddItem = () => {
    setOrderItems((items) => [
      ...items,
      {
        id: Date.now().toString(),
        productId: null,
        productName: "",
        quantity: 1,
        unitPrice: 0,
        notes: "",
      },
    ]);
  };

  const handleRemoveItem = (itemId: string) => {
    if (orderItems.length > 1) {
      setOrderItems((items) => items.filter((item) => item.id !== itemId));
    }
  };

  const updateItem = (
    itemId: string,
    field: keyof OrderItemData,
    value: string | number
  ) => {
    setOrderItems((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      customerId,
      source,
      deliveryDate,
      deliveryTimeSlot,
      isDelivery,
      deliveryAddress,
      depositPaid,
      notes,
      orderItems,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Customer</Label>
            <Popover
              open={customerPopoverOpen}
              onOpenChange={setCustomerPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between"
                >
                  {selectedCustomer ? (
                    <span>
                      {selectedCustomer.name}
                      {selectedCustomer.phone &&
                        ` - ${selectedCustomer.phone}`}
                    </span>
                  ) : (
                    <span className="text-gray-500">Search customer...</span>
                  )}
                  <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search by name or phone..."
                    value={customerSearch}
                    onValueChange={setCustomerSearch}
                  />
                  <CommandList>
                    <CommandEmpty>
                      <div className="p-2 text-center">
                        <p className="text-sm text-gray-500">
                          No customer found
                        </p>
                      </div>
                    </CommandEmpty>
                    <CommandGroup>
                      {filteredCustomers.map((customer) => (
                        <CommandItem
                          key={customer.id}
                          value={customer.name}
                          onSelect={() => handleSelectCustomer(customer)}
                        >
                          <div>
                            <p className="font-medium">{customer.name}</p>
                            {customer.phone && (
                              <p className="text-sm text-gray-500">
                                {customer.phone}
                              </p>
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <p className="text-sm text-gray-500">
              Leave empty for walk-in customer
            </p>
          </div>

          <div className="space-y-2">
            <Label>Order Source</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Phone Call</SelectItem>
                <SelectItem value="text">Text Message</SelectItem>
                <SelectItem value="dm_instagram">Instagram DM</SelectItem>
                <SelectItem value="dm_facebook">Facebook DM</SelectItem>
                <SelectItem value="walk_in">Walk-in</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Pickup / Delivery
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deliveryDate
                      ? format(deliveryDate, "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time Slot</Label>
              <Select
                value={deliveryTimeSlot}
                onValueChange={setDeliveryTimeSlot}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">
                    Morning (8am-12pm)
                  </SelectItem>
                  <SelectItem value="afternoon">
                    Afternoon (12pm-4pm)
                  </SelectItem>
                  <SelectItem value="evening">
                    Evening (4pm-7pm)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is-delivery"
              checked={isDelivery}
              onChange={(e) => setIsDelivery(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="is-delivery">
              This is a delivery (not pickup)
            </Label>
          </div>

          {isDelivery && (
            <div className="space-y-2">
              <Label>Delivery Address</Label>
              <Textarea
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="Enter delivery address..."
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Order Items Section */}
      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {orderItems.map((item, index) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg space-y-4 bg-gray-50"
            >
              <div className="flex items-start justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Item {index + 1}
                </span>
                {orderItems.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <Label>Product</Label>
                  <Select
                    value={item.productId || ""}
                    onValueChange={(value) =>
                      handleSelectProduct(item.id, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          <div className="flex justify-between items-center gap-4">
                            <span>{product.name}</span>
                            <span className="text-gray-500">
                              ${product.base_price.toFixed(2)}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "quantity",
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Unit Price</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice}
                    onChange={(e) =>
                      updateItem(
                        item.id,
                        "unitPrice",
                        parseFloat(e.target.value) || 0
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subtotal</Label>
                  <Input
                    type="text"
                    value={`$${(item.quantity * item.unitPrice).toFixed(2)}`}
                    disabled
                    className="bg-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes / Customizations</Label>
                <Input
                  value={item.notes}
                  onChange={(e) =>
                    updateItem(item.id, "notes", e.target.value)
                  }
                  placeholder='e.g., "Chocolate frosting", "Happy Birthday inscription"'
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddItem}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Order Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any special instructions or notes for this order..."
            rows={3}
          />
        </CardContent>
      </Card>

      {/* Deposit */}
      <Card>
        <CardHeader>
          <CardTitle>Deposit</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Deposit Paid</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={depositPaid}
              onChange={(e) =>
                setDepositPaid(parseFloat(e.target.value) || 0)
              }
              placeholder="0.00"
            />
          </div>
        </CardContent>
      </Card>

      {/* Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Tax (7.5%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {depositPaid > 0 && (
              <>
                <div className="flex justify-between text-sm text-green-600">
                  <span>Deposit</span>
                  <span>-${depositPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Balance Due</span>
                  <span>${(total - depositPaid).toFixed(2)}</span>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Submit */}
      <div className="flex gap-4">
        <Button
          type="submit"
          className="flex-1 bg-amber-600 hover:bg-amber-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}
