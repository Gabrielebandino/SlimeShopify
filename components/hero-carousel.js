export function createHeroCarousel() {
  const carouselHTML = `
    <section class="hero-carousel" id="hero-carousel">
      <div class="carousel-track" id="carousel-track">
        
        <!-- Slide 1 (Video) -->
        <div class="carousel-slide">
          <video class="carousel-media" src="/assets/mobile_carousel1.mp4" autoplay loop muted playsinline poster=""></video>
          <div class="carousel-overlay"></div>
          <div class="carousel-content">
            <h2 class="carousel-headline">Explore New Arrivals</h2>
            <a href="/shop.html?collection=new-arrivals" class="carousel-cta">Explore</a>
          </div>
        </div>

        <!-- Slide 2 (Video 2) -->
        <div class="carousel-slide">
          <video class="carousel-media" src="/assets/mobile_carousel2.mp4" autoplay loop muted playsinline poster=""></video>
          <div class="carousel-overlay"></div>
          <div class="carousel-content">
            <h2 class="carousel-headline">Explore Chrome Hearts</h2>
            <a href="/shop.html?collection=chrome-hearts" class="carousel-cta">Shop Now</a>
          </div>
        </div>

        <!-- Slide 3 (Video 3) -->
        <div class="carousel-slide">
          <video class="carousel-media" src="/assets/mobile_carousel3.mp4" autoplay loop muted playsinline poster=""></video>
          <div class="carousel-overlay"></div>
          <div class="carousel-content">
            <h2 class="carousel-headline">Explore Sneakers</h2>
            <a href="/shop.html?collection=sneakers" class="carousel-cta">Discover</a>
          </div>
        </div>

      </div>
      
      <div class="carousel-indicators" id="carousel-indicators">
        <button class="indicator active"></button>
        <button class="indicator"></button>
        <button class="indicator"></button>
      </div>
    </section>
  `;

  const app = document.getElementById('app');
  if (app) {
    app.insertAdjacentHTML('afterbegin', carouselHTML);
    initCarousel();
  }
}

function initCarousel() {
  const track = document.getElementById('carousel-track');
  const slides = Array.from(track.children);
  const indicators = Array.from(document.getElementById('carousel-indicators').children);
  
  let currentIndex = 0;
  const slideCount = slides.length;
  let autoplayInterval;

  const goToSlide = (index) => {
    track.style.transform = `translateX(-${index * 100}vw)`;
    indicators.forEach((ind, i) => {
      ind.classList.toggle('active', i === index);
    });
    currentIndex = index;
  };

  const nextSlide = () => {
    goToSlide((currentIndex + 1) % slideCount);
  };

  // Autoplay
  const startAutoplay = () => {
    autoplayInterval = setInterval(nextSlide, 3000); // 3 seconds per requirement
  };

  const stopAutoplay = () => {
    clearInterval(autoplayInterval);
  };

  startAutoplay();

  // Swipe Support (Touch Events)
  let startX = 0;
  let currentTranslate = 0;
  let prevTranslate = 0;
  let isDragging = false;

  track.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    isDragging = true;
    stopAutoplay();
    track.style.transition = 'none';
  });

  track.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    track.style.transform = `translateX(calc(-${currentIndex * 100}vw + ${diff}px))`;
  });

  track.addEventListener('touchend', (e) => {
    isDragging = false;
    track.style.transition = 'transform 0.4s ease-out';
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;

    if (diff > 50 && currentIndex < slideCount - 1) {
      nextSlide();
    } else if (diff < -50 && currentIndex > 0) {
      goToSlide(currentIndex - 1);
    } else {
      // Snap back
      goToSlide(currentIndex);
    }
    startAutoplay();
  });

  // Indicators click
  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', () => {
      stopAutoplay();
      goToSlide(index);
      startAutoplay();
    });
  });
}
