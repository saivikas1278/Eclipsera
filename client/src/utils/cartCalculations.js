/**
 * Pure cart and order financial calculation utilities.
 */

export const calculateCartTotals = (cartItems = []) => {
  const totalItems = cartItems.reduce((acc, item) => acc + (Number(item.qty) || 0), 0);
  const itemsPrice = cartItems.reduce((acc, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 0;
    return acc + price * qty;
  }, 0);

  // Free shipping on orders over ₹500
  const shippingPrice = itemsPrice > 500 || itemsPrice === 0 ? 0 : 50;
  const totalPrice = itemsPrice + shippingPrice;

  return {
    totalItems,
    itemsPrice: Number(itemsPrice.toFixed(2)),
    shippingPrice: Number(shippingPrice.toFixed(2)),
    totalPrice: Number(totalPrice.toFixed(2)),
  };
};

export const formatPrice = (amount) => {
  const numeric = Number(amount) || 0;
  return `₹${numeric.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
