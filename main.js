import './style.css';
import { createNavbar } from './components/navbar.js';
import { createSidebar } from './components/sidebar.js';
import { createCart } from './components/cart.js';
import { createHeroCarousel } from './components/hero-carousel.js';
import { createFeaturedProducts } from './components/featured-products.js';

document.addEventListener('DOMContentLoaded', () => {
  createNavbar();
  createSidebar();
  createCart();
  
  // Only create homepage components if we are on the homepage (app matches)
  const app = document.getElementById('app');
  if (app && window.location.pathname === '/') {
    createHeroCarousel();
    createFeaturedProducts();
  }

  // --- Visual Pricing System Observer ---
  // Shopify web components asynchronously render price text. We observe the DOM,
  // parse the product prices once they populate, and assign dynamic metallic tiers.
  const applyPriceTiers = () => {
    const cards = document.querySelectorAll('.product-card:not([data-price-tier])');
    cards.forEach(card => {
      const moneyComp = card.querySelector('.product-price shopify-money');
      if (!moneyComp) return; // No money component found inside card yet
      
      const text = moneyComp.textContent || '';
      if (!text.trim()) return; // Still hydrating
      
      // Parse the price text. We look for commas and dots.
      // E.g. $1,000.00 -> 1000.00, € 100,50 -> 100.50
      let cleanStr = text.replace(/,/g, ''); // Basic clean for standard Shopify formats
      let price = parseFloat(cleanStr.replace(/[^0-9.]/g, ''));
      
      if (isNaN(price)) return;
      
      let tier = '';
      if (price < 100) tier = 'grey_green';
      else if (price >= 100 && price < 200) tier = 'pale_green';
      else if (price >= 200 && price < 300) tier = 'vivid_green';
      else if (price >= 300 && price < 500) tier = 'pink';
      else if (price >= 500 && price < 750) tier = 'purple';
      else if (price >= 750 && price < 1000) tier = 'red';
      else if (price >= 1000) tier = 'gold';
      
      if (tier) {
        card.setAttribute('data-price-tier', tier);
      }

      // Title Parsing Logic for Homepage Web Components
      const titleContainer = card.querySelector('.product-title-container');
      const rawTitleDiv = card.querySelector('.raw-title-data');
      if (titleContainer && rawTitleDiv) {
        const rawTitle = rawTitleDiv.textContent || '';
        if (rawTitle.trim() && !titleContainer.dataset.parsed) {
          let mainTitle = rawTitle;
          let subtitle = '';
          const quoteMatch = rawTitle.match(/^(.*?)\s*"(.*)"/);
          if (quoteMatch) {
            mainTitle = quoteMatch[1].trim();
            subtitle = quoteMatch[2].trim();
          }

          titleContainer.querySelector('.product-title-main').textContent = mainTitle;
          const subEl = titleContainer.querySelector('.product-title-sub');
          if (subtitle) {
            subEl.textContent = `"${subtitle}"`;
          } else {
            subEl.style.display = 'none';
          }
          titleContainer.dataset.parsed = 'true';
        }
      }
    });
  };

  const observer = new MutationObserver((mutations) => {
    // Only check if text or nodes were actually altered to save performance
    let shouldCheck = false;
    for (let m of mutations) {
      if (m.type === 'childList' || m.type === 'characterData') {
        shouldCheck = true;
        break;
      }
    }
    if (shouldCheck) applyPriceTiers();
  });

  observer.observe(document.body, { childList: true, subtree: true, characterData: true });
});
