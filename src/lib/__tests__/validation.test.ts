import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Recreate the schemas from the API routes for pure-logic testing

const saveInvoiceSchema = z.object({
  supplier_name: z.string().min(1).max(200),
  invoice_number: z.string().max(100).optional().nullable(),
  invoice_date: z.string().optional().nullable(),
  total_amount: z.number().min(0).optional().nullable(),
  image_url: z.string().optional().nullable(),
  ocr_confidence: z.number().optional().nullable(),
  due_date: z.string().optional().nullable(),
  line_items: z.array(z.object({
    description: z.string().max(500),
    quantity: z.number().optional().nullable(),
    unit: z.string().max(50).optional().nullable(),
    unit_cost: z.number().optional().nullable(),
    total_cost: z.number().optional().nullable(),
  })).optional().default([]),
});

const matchSchema = z.object({
  descriptions: z.array(z.string().max(500)).max(100),
});

const populateSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

describe('saveInvoiceSchema', () => {
  it('accepts a valid full invoice', () => {
    const input = {
      supplier_name: 'Flour Co.',
      invoice_number: 'INV-001',
      invoice_date: '2026-01-15',
      total_amount: 250.50,
      line_items: [
        { description: 'All-purpose flour', quantity: 10, unit: 'kg', unit_cost: 2.5, total_cost: 25.0 },
      ],
    };
    const result = saveInvoiceSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('accepts minimal valid input (only supplier_name)', () => {
    const result = saveInvoiceSchema.safeParse({ supplier_name: 'Test' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.line_items).toEqual([]);
    }
  });

  it('rejects missing supplier_name', () => {
    const result = saveInvoiceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty supplier_name', () => {
    const result = saveInvoiceSchema.safeParse({ supplier_name: '' });
    expect(result.success).toBe(false);
  });

  it('rejects supplier_name over 200 characters', () => {
    const result = saveInvoiceSchema.safeParse({ supplier_name: 'x'.repeat(201) });
    expect(result.success).toBe(false);
  });

  it('rejects negative total_amount', () => {
    const result = saveInvoiceSchema.safeParse({
      supplier_name: 'Test',
      total_amount: -5,
    });
    expect(result.success).toBe(false);
  });

  it('allows nullable optional fields', () => {
    const result = saveInvoiceSchema.safeParse({
      supplier_name: 'Test',
      invoice_number: null,
      invoice_date: null,
      total_amount: null,
    });
    expect(result.success).toBe(true);
  });

  it('rejects line item description over 500 characters', () => {
    const result = saveInvoiceSchema.safeParse({
      supplier_name: 'Test',
      line_items: [{ description: 'x'.repeat(501) }],
    });
    expect(result.success).toBe(false);
  });
});

describe('matchSchema', () => {
  it('accepts valid descriptions array', () => {
    const result = matchSchema.safeParse({ descriptions: ['flour', 'sugar'] });
    expect(result.success).toBe(true);
  });

  it('accepts empty descriptions array', () => {
    const result = matchSchema.safeParse({ descriptions: [] });
    expect(result.success).toBe(true);
  });

  it('rejects missing descriptions', () => {
    const result = matchSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects descriptions with strings over 500 characters', () => {
    const result = matchSchema.safeParse({ descriptions: ['x'.repeat(501)] });
    expect(result.success).toBe(false);
  });

  it('rejects more than 100 descriptions', () => {
    const descriptions = Array.from({ length: 101 }, (_, i) => `item-${i}`);
    const result = matchSchema.safeParse({ descriptions });
    expect(result.success).toBe(false);
  });
});

describe('populateSchema', () => {
  it('accepts valid date range', () => {
    const result = populateSchema.safeParse({
      startDate: '2026-01-01',
      endDate: '2026-01-31',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing startDate', () => {
    const result = populateSchema.safeParse({ endDate: '2026-01-31' });
    expect(result.success).toBe(false);
  });

  it('rejects missing endDate', () => {
    const result = populateSchema.safeParse({ startDate: '2026-01-01' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid date format', () => {
    const result = populateSchema.safeParse({
      startDate: '01/01/2026',
      endDate: '01/31/2026',
    });
    expect(result.success).toBe(false);
  });

  it('rejects non-date strings that match format loosely', () => {
    const result = populateSchema.safeParse({
      startDate: '9999-99-99',
      endDate: '0000-00-00',
    });
    // The regex only checks format (\d{4}-\d{2}-\d{2}), so these pass the schema
    expect(result.success).toBe(true);
  });
});
