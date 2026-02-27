"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

export interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_cost: number;
}

interface InvoiceLineItemsEditorProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export function InvoiceLineItemsEditor({
  items,
  onChange,
}: InvoiceLineItemsEditorProps) {
  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const addItem = () => {
    onChange([...items, { description: "", quantity: 1, unit: "", unit_cost: 0 }]);
  };

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[200px]">Description</TableHead>
            <TableHead className="w-[100px]">Quantity</TableHead>
            <TableHead className="w-[100px]">Unit</TableHead>
            <TableHead className="w-[120px]">Unit Cost</TableHead>
            <TableHead className="w-[120px]">Total</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item, index) => (
            <TableRow key={index}>
              <TableCell>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  placeholder="Item description"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, "quantity", parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="any"
                />
              </TableCell>
              <TableCell>
                <Input
                  value={item.unit}
                  onChange={(e) => updateItem(index, "unit", e.target.value)}
                  placeholder="e.g. lbs"
                />
              </TableCell>
              <TableCell>
                <Input
                  type="number"
                  value={item.unit_cost}
                  onChange={(e) =>
                    updateItem(index, "unit_cost", parseFloat(e.target.value) || 0)
                  }
                  min={0}
                  step="0.01"
                />
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">
                  ${(item.quantity * item.unit_cost).toFixed(2)}
                </span>
              </TableCell>
              <TableCell>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                No line items. Click &quot;Add Item&quot; to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Button type="button" variant="outline" size="sm" onClick={addItem}>
        <Plus className="h-4 w-4 mr-1" />
        Add Item
      </Button>
    </div>
  );
}
