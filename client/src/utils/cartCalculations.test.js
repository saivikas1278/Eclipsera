import { describe, it, expect } from 'vitest';
import { calculateCartTotals, formatPrice } from './cartCalculations';

describe('cartCalculations', () => {
  it('should return 0 totals for empty cart', () => {
    const result = calculateCartTotals([]);
    expect(result.totalItems).toBe(0);
    expect(result.itemsPrice).toBe(0);
    expect(result.shippingPrice).toBe(0);
    expect(result.totalPrice).toBe(0);
  });

  it('should compute totals and apply shipping fee for orders <= ₹500', () => {
    const items = [
      { price: 150, qty: 2 }, // 300
    ];
    const result = calculateCartTotals(items);
    expect(result.totalItems).toBe(2);
    expect(result.itemsPrice).toBe(300);
    expect(result.shippingPrice).toBe(50);
    expect(result.totalPrice).toBe(350);
  });

  it('should apply free shipping for orders exceeding ₹500', () => {
    const items = [
      { price: 699, qty: 1 },
      { price: 299, qty: 2 }, // 598 -> Total 1297
    ];
    const result = calculateCartTotals(items);
    expect(result.totalItems).toBe(3);
    expect(result.itemsPrice).toBe(1297);
    expect(result.shippingPrice).toBe(0);
    expect(result.totalPrice).toBe(1297);
  });

  it('should format currency correctly with INR symbol', () => {
    expect(formatPrice(1299.5)).toBe('₹1,299.50');
    expect(formatPrice(0)).toBe('₹0.00');
  });
});
