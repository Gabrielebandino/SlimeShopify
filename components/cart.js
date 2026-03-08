export function createCart() {
  const cartHTML = `
    <shopify-cart id="main-cart">
      <div slot="empty">Your cart is empty. Time to get drippy.</div>
      <div slot="checkout-button">Checkout securely</div>
    </shopify-cart>
  `;
  document.body.insertAdjacentHTML('beforeend', cartHTML);
}
