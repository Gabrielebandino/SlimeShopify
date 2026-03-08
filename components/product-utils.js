document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productHandle = params.get('product');
  
  if (productHandle) {
    const context = document.getElementById('main-product-context');
    if (context) {
      context.setAttribute('handle', productHandle);
    }
  }
});
