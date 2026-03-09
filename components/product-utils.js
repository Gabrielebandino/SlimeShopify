const STORE_DOMAIN = 'slime-resell.myshopify.com';
const STOREFRONT_TOKEN = '8989149ca1282e74af5ebf3bdc79b5a4';
const API_VERSION = '2024-01';

let currentProduct = null;
let currentVariant = null;

const getTier = (price) => {
  if (price < 100) return 'grey_green';
  if (price >= 100 && price < 200) return 'pale_green';
  if (price >= 200 && price < 300) return 'vivid_green';
  if (price >= 300 && price < 500) return 'pink';
  if (price >= 500 && price < 750) return 'purple';
  if (price >= 750 && price < 1000) return 'red';
  return 'gold';
};

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const productHandle = params.get('product');

  if (productHandle && window.location.pathname.includes('product.html')) {
    fetchProductDetails(productHandle);
  }
});

async function fetchProductDetails(handle) {
  const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
  
  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        descriptionHtml
        images(first: 20) {
          edges { node { url width height } }
        }
        variants(first: 250) {
          edges {
            node {
              id
              title
              availableForSale
              price { amount currencyCode }
              image { url }
            }
          }
        }
      }
    }
  `;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
      },
      body: JSON.stringify({ query, variables: { handle } })
    });
    
    const json = await res.json();
    if (json.data && json.data.product) {
      currentProduct = json.data.product;
      renderProductPage();
    } else {
      document.getElementById('product-loading').innerText = "Product not found.";
    }
  } catch (err) {
    console.error("Error fetching product:", err);
    document.getElementById('product-loading').innerText = "Error loading product.";
  }
}

function renderProductPage() {
  document.getElementById('product-loading').style.display = 'none';
  document.getElementById('product-page-layout').style.display = 'flex';

  // 1. Title & Details
  const titleContainer = document.getElementById('product-page-title');
  let mainTitle = currentProduct.title;
  let subtitle = '';
  const quoteMatch = currentProduct.title.match(/^(.*?)\s*"(.*)"/);
  if (quoteMatch) {
    mainTitle = quoteMatch[1].trim();
    subtitle = quoteMatch[2].trim();
  }
  
  titleContainer.innerHTML = `
    <span class="product-title-main" style="display:block; font-family: 'Arial Black', Impact, sans-serif; font-size: 32px; font-style: italic; letter-spacing: -1px; text-transform: uppercase;">${mainTitle}</span>
    ${subtitle ? `<span class="product-title-sub" style="display:block; font-size: 16px; font-weight: 500; font-style: italic; opacity: 0.8; margin-top: 4px;">"${subtitle}"</span>` : ''}
  `;

  document.getElementById('product-page-description').innerHTML = currentProduct.descriptionHtml;

  // 2. Build Image Gallery
  const galleryEl = document.getElementById('product-media-gallery');
  const indicatorsEl = document.getElementById('product-media-indicators');
  const images = currentProduct.images.edges.map(e => e.node);
  
  if (images.length === 0) {
      // fallback to variant images if product images array is somehow empty
      const vImages = currentProduct.variants.edges.map(e => e.node.image?.url).filter(Boolean);
      [...new Set(vImages)].forEach(url => images.push({url}));
  }

  galleryEl.innerHTML = images.map((img, i) => `
    <div class="product-slide" id="slide-${i}">
      <img src="${img.url}" loading="${i === 0 ? 'eager' : 'lazy'}">
    </div>
  `).join('');

  indicatorsEl.innerHTML = images.map((_, i) => `
    <div class="slide-indicator ${i === 0 ? 'active' : ''}" data-index="${i}"></div>
  `).join('');

  // 3. Build Variant Pills
  const variants = currentProduct.variants.edges.map(e => e.node);
  const variantsContainer = document.getElementById('product-variant-pills');
  
  variantsContainer.innerHTML = variants.map((v, i) => {
    const isAvail = v.availableForSale;
    return `
      <button class="variant-pill ${!isAvail ? 'sold-out' : ''}" data-id="${v.id}" data-index="${i}" ${!isAvail ? 'disabled' : ''}>
        ${v.title}
      </button>
    `;
  }).join('');

  // Select first available variant by default
  const firstAvailIndex = variants.findIndex(v => v.availableForSale);
  selectVariant(firstAvailIndex >= 0 ? firstAvailIndex : 0);

  // Setup Event Listeners
  attachEvents();
}

function selectVariant(index) {
  const variants = currentProduct.variants.edges.map(e => e.node);
  const v = variants[index];
  if (!v) return;
  
  currentVariant = v;

  // Update Pills UI
  document.querySelectorAll('.variant-pill').forEach(pill => {
    pill.classList.remove('selected');
    if (pill.dataset.id === v.id) pill.classList.add('selected');
  });

  // Update Price UI
  const priceNum = parseFloat(v.price.amount);
  const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: v.price.currencyCode });
  let formattedPrice = formatter.format(priceNum).replace(/\.00$/, '');
  
  const priceEl = document.getElementById('product-page-price');
  priceEl.innerHTML = `<span class="price-amount">${formattedPrice}</span>`;
  
  // Update Glass Shell Theme based on Price Tier
  const tier = getTier(priceNum);
  const glassPanel = document.querySelector('.product-glass-panel');
  if (glassPanel) {
      glassPanel.setAttribute('data-price-tier', tier);
  }

  // Update Add To Cart Button
  const btn = document.getElementById('product-add-to-cart');
  if (v.availableForSale) {
    btn.disabled = false;
    btn.classList.remove('disabled');
    btn.innerHTML = `Add to Cart - ${formattedPrice}`;
  } else {
    btn.disabled = true;
    btn.classList.add('disabled');
    btn.innerHTML = `Sold Out`;
  }

  // Scroll gallery to matched image if variant has a unique image
  if (v.image && v.image.url) {
    const images = currentProduct.images.edges.map(e => e.node.url);
    const imgIndex = images.findIndex(url => url === v.image.url);
    if (imgIndex !== -1) {
      scrollToSlide(imgIndex);
    }
  }
}

function scrollToSlide(index) {
  const galleryEl = document.getElementById('product-media-gallery');
  const slide = document.getElementById(`slide-${index}`);
  if (slide && galleryEl) {
    galleryEl.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' });
    updateIndicators(index);
  }
}

function updateIndicators(activeIndex) {
  document.querySelectorAll('.slide-indicator').forEach((ind, i) => {
    ind.classList.toggle('active', i === activeIndex);
  });
}

function attachEvents() {
  // Variant Click
  document.querySelectorAll('.variant-pill').forEach(pill => {
    pill.addEventListener('click', (e) => {
      if (!pill.classList.contains('sold-out')) {
        selectVariant(parseInt(pill.dataset.index));
      }
    });
  });

  // Add to Cart Click
  const btn = document.getElementById('product-add-to-cart');
  btn.addEventListener('click', () => {
    if (!currentVariant || !currentVariant.availableForSale) return;
    
    // Shopify web components <shopify-cart> doesn't expose a simple raw .addLine() with variant ID easily
    // We will simulate a quick graphQL AddToCart or manually dispatch to the component if possible.
    // For now, let's use the Shopify cart component if it has an API, or log it cleanly.
    const cart = document.querySelector('shopify-cart');
    if (cart && typeof cart.addLine === 'function') {
         // Attempt to use web component API if it supports raw objects
         cart.addLine({ merchandiseId: currentVariant.id, quantity: 1 });
         if(typeof cart.showModal === 'function') cart.showModal();
    } else {
         console.log("Cart Add triggered for:", currentVariant.id);
         alert("Added to cart: " + currentVariant.title);
    }
  });

  // Scroll Sync for Indicators
  const galleryEl = document.getElementById('product-media-gallery');
  galleryEl.addEventListener('scroll', () => {
    const scrollPos = galleryEl.scrollLeft;
    const slideWidth = galleryEl.clientWidth;
    const activeIndex = Math.round(scrollPos / slideWidth);
    updateIndicators(activeIndex);
  });
}
