export function createNavbar() {
  const header = document.getElementById('main-header');
  if (!header) return;

  header.innerHTML = `
    <nav class="navbar">
      <div class="navbar-content">
        <button id="menu-toggle" class="icon-btn" aria-label="Open Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3 6H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path d="M3 18H21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        <a href="/" class="logo">
          <img src="/assets/slime_logo.png" alt="SLIME" style="max-height: 48px; display: block;" />
        </a>
        
        <button id="cart-toggle" class="icon-btn" aria-label="Open Cart" onclick="document.getElementById('main-cart').showModal()">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 22C8.55228 22 9 21.5523 9 21C9 20.4477 8.55228 20 8 20C7.44772 20 7 20.4477 7 21C7 21.5523 7.44772 22 8 22Z" fill="currentColor"/>
            <path d="M19 22C19.5523 22 20 21.5523 20 21C20 20.4477 19.5523 20 19 20C18.4477 20 18 20.4477 18 21C18 21.5523 18.4477 22 19 22Z" fill="currentColor"/>
            <path d="M2.5 3H5.5L8.5 16H18.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M19.5 6H7.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </nav>
  `;

  // Attach event listener for the menu button
  const menuToggle = document.getElementById('menu-toggle');
  if (menuToggle) {
    menuToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-open');
    });
  }
}
