export function createSidebar() {
  const sidebarHTML = `
    <div class="sidebar-overlay" id="sidebar-overlay"></div>
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-header">
        <button id="sidebar-close" class="icon-btn" aria-label="Close Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
      <div class="sidebar-content">
        <ul class="nav-list">
          <li class="nav-item"><a href="/shop.html" class="nav-link text-large">Shop All</a></li>
          <li class="nav-item"><a href="/shop.html?collection=new-arrivals" class="nav-link text-large">New Arrivals</a></li>
          
          <li class="nav-item accordion">
            <button class="accordion-toggle nav-link text-large">
              Clothing 
              <span class="accordion-icon">+</span>
            </button>
            <div class="accordion-content">
              <ul>
                <li><a href="/shop.html?collection=jackets">Jackets</a></li>
                <li><a href="/shop.html?collection=outerwear">Outerwear</a></li>
                <li><a href="/shop.html?collection=tops">Tops</a></li>
                <li><a href="/shop.html?collection=hoodies">Hoodies</a></li>
                <li><a href="/shop.html?collection=t-shirts">T-Shirts</a></li>
                <li><a href="/shop.html?collection=bottoms">Bottoms</a></li>
                <li><a href="/shop.html?collection=denim">Denim</a></li>
                <li><a href="/shop.html?collection=coordinated-sets">Coordinated Sets</a></li>
              </ul>
            </div>
          </li>

          <li class="nav-item"><a href="/shop.html?collection=sneakers" class="nav-link text-large">Sneakers</a></li>

          <li class="nav-item accordion">
            <button class="accordion-toggle nav-link text-large">
              Accessories
              <span class="accordion-icon">+</span>
            </button>
            <div class="accordion-content">
              <ul>
                <li><a href="/shop.html?collection=bags">Bags</a></li>
                <li><a href="/shop.html?collection=belts">Belts</a></li>
                <li><a href="/shop.html?collection=shoes">Shoes</a></li>
                <li><a href="/shop.html?collection=chain-belts">Chain Belts</a></li>
                <li><a href="/shop.html?collection=glasses">Glasses</a></li>
                <li><a href="/shop.html?collection=hats">Hats</a></li>
                <li><a href="/shop.html?collection=scarves">Scarves</a></li>
              </ul>
            </div>
          </li>

          <li class="nav-item accordion">
            <button class="accordion-toggle nav-link text-large">
              Shop by Brand
              <span class="accordion-icon">+</span>
            </button>
            <div class="accordion-content">
              <ul>
                <li><a href="/shop.html?collection=jordan">Jordan</a></li>
                <li><a href="/shop.html?collection=chrome-hearts">Chrome Hearts</a></li>
                <li><a href="/shop.html?collection=enfants-riches-deprimes">Enfants Riches Déprimés</a></li>
              </ul>
            </div>
          </li>

          <li class="nav-item"><a href="/shop.html?collection=sale" class="nav-link text-large text-sale">Sale</a></li>
          <li class="nav-item"><a href="/appointment.html" class="nav-link text-large">Book Appointment</a></li>
        </ul>
      </div>
    </aside>
  `;

  document.body.insertAdjacentHTML('beforeend', sidebarHTML);

  const sidebarOverlay = document.getElementById('sidebar-overlay');
  const sidebarClose = document.getElementById('sidebar-close');

  const closeSidebar = () => document.body.classList.remove('sidebar-open');

  sidebarOverlay.addEventListener('click', closeSidebar);
  sidebarClose.addEventListener('click', closeSidebar);

  // Accordion Logic
  const accordions = document.querySelectorAll('.accordion-toggle');
  accordions.forEach(acc => {
    acc.addEventListener('click', function() {
      this.classList.toggle('active');
      const content = this.nextElementSibling;
      const icon = this.querySelector('.accordion-icon');
      
      if (content.style.maxHeight) {
        content.style.maxHeight = null;
        icon.textContent = '+';
      } else {
        content.style.maxHeight = content.scrollHeight + "px";
        icon.textContent = '-';
      }
    });
  });
}
