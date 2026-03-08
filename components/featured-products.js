export function createFeaturedProducts() {
  const productsHTML = `
    <section class="featured-products container" style="margin-top: 64px; margin-bottom: 64px;">
      <h2 class="section-title">Featured</h2>
      
      <div class="product-grid">
        <shopify-list-context type="product" query="products" first="6">
          <template>
            <div class="product-card">
              <a shopify-attr--href="product.onlineStoreUrl" class="product-link">
                <!-- Fallback to handle since vanilla JS router requires handles -->
                <div class="product-image-wrapper">
                  <shopify-media width="400" height="400" query="product.selectedOrFirstAvailableVariant.image"></shopify-media>
                </div>
                <div class="product-info">
                  <div class="raw-title-data" style="display:none;"><shopify-data query="product.title"></shopify-data></div>
                  <div class="product-title-container">
                    <h3 class="product-title-main"></h3>
                    <p class="product-title-sub"></p>
                  </div>
                  <div class="product-price-row">
                    <div class="product-price-custom">
                      <span class="price-from">FROM</span>
                      <span class="price-amount"><shopify-money query="product.selectedOrFirstAvailableVariant.price"></shopify-money></span>
                    </div>
                  </div>
                </div>
              </a>
            </div>
          </template>
        </shopify-list-context>
      </div>

    </section>
  `;

  const app = document.getElementById('app');
  if (app && window.location.pathname === '/') {
    app.insertAdjacentHTML('beforeend', productsHTML);
  }
}
