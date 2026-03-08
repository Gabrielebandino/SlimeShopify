document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const collectionTarget = params.get('collection');
  const gridContainer = document.getElementById('shop-grid-container');
  const sortSelect = document.getElementById('sort-order');
  const conditionSelect = document.getElementById('filter-condition');
  
  if (collectionTarget) {
    const titleEl = document.getElementById('shop-title');
    if (titleEl) {
      titleEl.innerText = collectionTarget.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    }
  }

  if (!gridContainer) return;

  gridContainer.innerHTML = '<div class="product-grid" id="main-product-grid"></div>';
  const mainGrid = document.getElementById('main-product-grid');

  const sentinel = document.createElement('div');
  sentinel.id = 'scroll-sentinel';
  sentinel.style.height = '20px';
  sentinel.style.width = '100%';
  sentinel.style.marginTop = '40px';
  gridContainer.appendChild(sentinel);

  // Storefront API Settings
  const STORE_DOMAIN = 'slime-resell.myshopify.com';
  const STOREFRONT_TOKEN = '8989149ca1282e74af5ebf3bdc79b5a4';
  const API_VERSION = '2024-01';

  let currentCursor = null;
  let hasNextPage = true;
  let isFetching = false;
  
  let currentSortKey = null;
  let currentReverse = false;
  let currentSearch = '';

  const getTier = (price) => {
    if (price < 100) return 'grey_green';
    if (price >= 100 && price < 200) return 'pale_green';
    if (price >= 200 && price < 300) return 'vivid_green';
    if (price >= 300 && price < 500) return 'pink';
    if (price >= 500 && price < 750) return 'purple';
    if (price >= 750 && price < 1000) return 'red';
    return 'gold';
  };

  const fetchProducts = async () => {
    if (isFetching || !hasNextPage) return;
    isFetching = true;

    const endpoint = `https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`;
    let queryArgs = `$first: Int!, $after: String`;
    let callArgs = `first: $first, after: $after`;
    
    let variables = { first: 12, after: currentCursor };

    // Set sorting
    if (currentSortKey) {
      queryArgs += `, $sortKey: ${collectionTarget ? 'ProductCollectionSortKeys' : 'ProductSortKeys'}, $reverse: Boolean`;
      callArgs += `, sortKey: $sortKey, reverse: $reverse`;
      variables.sortKey = currentSortKey;
      variables.reverse = currentReverse;
    }

    // Set filtering only for global products query natively
    if (!collectionTarget && currentSearch) {
      queryArgs += `, $query: String`;
      callArgs += `, query: $query`;
      variables.query = currentSearch;
    }

    let queryStr = '';
    if (collectionTarget) {
      queryStr = `query getCollectionProducts(${queryArgs}, $handle: String!) {
        collection(handle: $handle) {
          products(${callArgs}) {
            pageInfo { hasNextPage endCursor }
            edges { node { handle title variants(first: 1) { edges { node { price { amount currencyCode } image { url } } } } } }
          }
        }
      }`;
      variables.handle = collectionTarget;
    } else {
      queryStr = `query getProducts(${queryArgs}) {
        products(${callArgs}) {
          pageInfo { hasNextPage endCursor }
          edges { node { handle title variants(first: 1) { edges { node { price { amount currencyCode } image { url width height } } } } } }
        }
      }`;
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN
        },
        body: JSON.stringify({ query: queryStr, variables })
      });

      const { data } = await res.json();
      
      let productsConnection = collectionTarget ? data?.collection?.products : data?.products;
      if (!productsConnection) {
        hasNextPage = false;
        return;
      }
      
      hasNextPage = productsConnection.pageInfo.hasNextPage;
      currentCursor = productsConnection.pageInfo.endCursor;

      productsConnection.edges.forEach(edge => {
        const node = edge.node;
        const variant = node.variants.edges[0]?.node;
        if (!variant) return;

        const priceNum = parseFloat(variant.price.amount);
        const tier = getTier(priceNum);
        
        const formatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: variant.price.currencyCode });
        const imgUrl = variant.image?.url || '';

        // Title Parsing Logic: Split by first quote
        let mainTitle = node.title;
        let subtitle = '';
        const quoteMatch = node.title.match(/^(.*?)\s*"(.*)"/);
        if (quoteMatch) {
          mainTitle = quoteMatch[1].trim();
          subtitle = quoteMatch[2].trim();
        }

        const cardHtml = `
          <div class="product-card" data-price-tier="${tier}">
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
                    <span class="price-amount">${formatter.format(priceNum)}</span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        `;
        mainGrid.insertAdjacentHTML('beforeend', cardHtml);
      });
      
    } catch (e) {
      console.error('Failed to fetch Shopify products:', e);
    } finally {
      isFetching = false;
    }
  };

  const resetAndFetch = async () => {
    mainGrid.innerHTML = '';
    currentCursor = null;
    hasNextPage = true;
    
    if (sortSelect.value === 'price-asc') {
      currentSortKey = 'PRICE';
      currentReverse = false;
    } else if (sortSelect.value === 'price-desc') {
      currentSortKey = 'PRICE';
      currentReverse = true;
    } else {
      currentSortKey = null;
      currentReverse = false;
    }

    if (conditionSelect.value) {
      currentSearch = `tag:${conditionSelect.value}`;
    } else {
      currentSearch = '';
    }

    await fetchProducts();
  };

  // Bind dropdowns
  if (sortSelect) sortSelect.addEventListener('change', resetAndFetch);
  if (conditionSelect) conditionSelect.addEventListener('change', resetAndFetch);

  // Setup infinite scroll
  const scrollObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      fetchProducts();
    }
  }, { rootMargin: '300px' });
  
  scrollObserver.observe(sentinel);

  // Initial load
  resetAndFetch();

  // Intercept product links to use vanilla JS routing instead of standard Shopify URLs
  setTimeout(() => {
    const links = document.querySelectorAll('.product-link');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        const parts = href.split('/');
        const handle = parts[parts.length - 1];
        // Override the link to point to our local product page
        link.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = `/product.html?product=${handle}`;
        });
      }
    });

    // We can also bind the link dynamically if the template stamps out later
    document.addEventListener('click', (e) => {
      const link = e.target.closest('.product-link');
      if (link && link.getAttribute('href')) {
        e.preventDefault();
        const href = link.getAttribute('href');
        const parts = href.split('/');
        const handle = parts[parts.length - 1];
        window.location.href = `/product.html?product=${handle}`;
      }
    });

  }, 1000);
});
