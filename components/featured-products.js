export function createFeaturedProducts() {
  const STORE_DOMAIN = 'slime-resell.myshopify.com';
  const STOREFRONT_TOKEN = '8989149ca1282e74af5ebf3bdc79b5a4';
  const API_VERSION = '2024-01';
  
  const getTier = (price) => {
    if (price < 100) return 'grey_green';
    if (price >= 100 && price < 200) return 'pale_green';
    if (price >= 200 && price < 300) return 'vivid_green';
    if (price >= 300 && price < 500) return 'pink';
    if (price >= 500 && price < 750) return 'purple';
    if (price >= 750 && price < 1000) return 'red';
    return 'gold';
  };

  const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;

  const fetchGrids = async () => {
    // We run one massive query to get both New Arrivals and Featured
    const query = `
      query getHomepageProducts {
        newArrivals: products(first: 9, sortKey: CREATED_AT, reverse: true) {
          edges {
            node {
              handle
              title
              variants(first: 1) {
                edges { node { price { amount currencyCode } image { url } } }
              }
            }
          }
        }
        featuredCollection: collection(handle: "featured") {
          products(first: 9) {
            edges {
              node {
                handle
                title
                variants(first: 1) {
                  edges { node { price { amount currencyCode } image { url } } }
                }
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
        body: JSON.stringify({ query })
      });
      const json = await res.json();
      
      const newArrivals = json.data?.newArrivals?.edges || [];
      const featured = json.data?.featuredCollection?.products?.edges || [];

      renderSection('New Arrivals', newArrivals, '/shop.html');
      if (featured.length > 0) {
        renderSection('Featured', featured, '/shop.html?collection=featured');
      }

    } catch (e) {
      console.error('Error fetching homepage products:', e);
    }
  };

  const renderSection = (title, items, viewAllLink) => {
    // Generate Cards HTML
    let cardsHtml = items.map(edge => {
      const node = edge.node;
      const variant = node.variants.edges[0]?.node;
      if (!variant) return '';
      const priceNum = parseFloat(variant.price.amount);
      const tier = getTier(priceNum);
      const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: variant.price.currencyCode });
      const imgUrl = variant.image?.url || '';

      // Title Parsing
      let mainTitle = node.title;
      let subtitle = '';
      const quoteMatch = node.title.match(/^(.*?)\s*"(.*)"/);
      if (quoteMatch) {
        mainTitle = quoteMatch[1].trim();
        subtitle = quoteMatch[2].trim();
      }

      return `
        <div class="product-card scroll-card" data-price-tier="${tier}">
          <a href="/product.html?product=${node.handle}" class="product-link">
            <div class="product-image-wrapper">
              <img src="${imgUrl}" style="width:100%; height:100%; object-fit:cover;" loading="lazy">
            </div>
            <div class="product-info">
              <div class="product-title-container">
                <h3 class="product-title-main">${mainTitle}</h3>
                ${subtitle ? `<p class="product-title-sub">"${subtitle}"</p>` : ''}
              </div>
              <div class="product-price-row">
                <div class="product-price-custom">
                  <span class="price-from">FROM</span>
                  <span class="price-amount">${formatter.format(priceNum).replace(/\.00$/, '')}</span>
                </div>
              </div>
            </div>
          </a>
        </div>
      `;
    }).join('');

    // Add View All Card
    cardsHtml += `
      <div class="product-card scroll-card view-all-card" data-price-tier="grey_green">
        <a href="${viewAllLink}" class="product-link" style="height: 100%; display: flex; align-items: center; justify-content: center; flex-direction: column;">
          <h3 class="product-title-main" style="font-size: 24px;">Shop ${title}</h3>
          <p class="product-title-sub" style="margin-top: 8px;">View All →</p>
        </a>
      </div>
    `;

    const sectionHTML = `
      <section class="horizontal-scroll-section" style="overflow: hidden;">
        <div class="container" style="padding: 0 16px;">
          <h2 class="section-title">${title}</h2>
        </div>
        <div class="scroll-track-container">
          <div class="scroll-track-inner">
            ${cardsHtml}
          </div>
        </div>
      </section>
    `;

    const app = document.getElementById('app');
    if (app && window.location.pathname === '/') {
      app.insertAdjacentHTML('beforeend', sectionHTML);
      observeJiggleAnimation();
    }
  };

  const observeJiggleAnimation = () => {
    const tracks = document.querySelectorAll('.scroll-track-inner:not(.observed)');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Add jiggle class to hint that it's scrollable
          entry.target.classList.add('jiggle');
          entry.target.classList.add('observed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    tracks.forEach(t => observer.observe(t));
  };

  if (document.getElementById('app') && window.location.pathname === '/') {
    fetchGrids();
  }
}
