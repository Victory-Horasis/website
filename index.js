/* ============================================================
   THE VICTORY HORASIS INITIATIVE — JAVASCRIPT
   ============================================================ */

(function () {
  'use strict';

  // ---- 1. NAVBAR: Scroll shadow + logo shrink ----
  const navbar = document.getElementById('navbar');

  function handleNavbarScroll() {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', handleNavbarScroll, { passive: true });
  handleNavbarScroll(); // run on page load


  // ---- 2. HAMBURGER MENU ----
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  // Create backdrop element
  const backdrop = document.createElement('div');
  backdrop.style.cssText = `
    position: fixed; inset: 0; z-index: 998;
    background: rgba(0,0,0,0.45);
    opacity: 0; pointer-events: none;
    transition: opacity 0.3s ease;
  `;
  document.body.appendChild(backdrop);

  function openMenu() {
    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    backdrop.style.opacity = '1';
    backdrop.style.pointerEvents = 'auto';
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    backdrop.style.opacity = '0';
    backdrop.style.pointerEvents = 'none';
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    if (navLinks.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close when a nav link is clicked
  navLinks.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close when backdrop is clicked
  backdrop.addEventListener('click', closeMenu);

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      closeMenu();
    }
  });


  // ---- 3. SCROLL REVEAL (Intersection Observer) ----
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Respect individual delay from CSS custom property
            const delay = entry.target.style.getPropertyValue('--delay') || '0s';
            entry.target.style.transitionDelay = delay;
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target); // fire once
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    // Fallback: show all immediately for older browsers
    revealElements.forEach(function (el) {
      el.classList.add('visible');
    });
  }


  // ---- 4. STAT COUNTER ANIMATION ----
  const statNumbers = document.querySelectorAll('.stat-number[data-target]');

  function animateCounter(el) {
    const target  = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800; // ms
    const startTime = performance.now();

    function easeOutExpo(t) {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function tick(currentTime) {
      const elapsed  = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutExpo(progress);
      const current  = Math.floor(eased * target);

      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = target;
      }
    }

    requestAnimationFrame(tick);
  }

  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    statNumbers.forEach(function (el) {
      counterObserver.observe(el);
    });
  } else {
    // Fallback: set final values immediately
    statNumbers.forEach(function (el) {
      el.textContent = el.getAttribute('data-target');
    });
  }


  // ---- 5. SMOOTH ACTIVE NAV LINK HIGHLIGHTING ----
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  function updateActiveLink() {
    let currentSection = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(function (section) {
      if (scrollPos >= section.offsetTop) {
        currentSection = section.getAttribute('id');
      }
    });

    navAnchors.forEach(function (a) {
      a.classList.remove('active');
      if (a.getAttribute('href') === '#' + currentSection) {
        a.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // Add the active style via JS (avoids extra CSS rule specificity issues)
  const style = document.createElement('style');
  style.textContent = `
    .nav-links a.active:not(.nav-cta) {
      color: #ffffff;
      background: rgba(255,255,255,0.12);
    }
  `;
  document.head.appendChild(style);


  // ---- 6. GALLERY LIGHTBOX (simple, no dependencies) ----
  const galleryItems = document.querySelectorAll('.gallery-item');

  // Create lightbox DOM
  const lightbox = document.createElement('div');
  lightbox.setAttribute('role', 'dialog');
  lightbox.setAttribute('aria-modal', 'true');
  lightbox.setAttribute('aria-label', 'Image lightbox');
  lightbox.style.cssText = `
    display: none; position: fixed; inset: 0; z-index: 2000;
    background: rgba(8,18,39,0.95); align-items: center;
    justify-content: center; padding: 1.5rem;
    cursor: zoom-out;
  `;

  const lightboxImg = document.createElement('img');
  lightboxImg.style.cssText = `
    max-width: 90vw; max-height: 88vh; object-fit: contain;
    border-radius: 8px; box-shadow: 0 8px 60px rgba(0,0,0,0.6);
    cursor: default; display: block;
  `;

  const lightboxCaption = document.createElement('p');
  lightboxCaption.style.cssText = `
    position: absolute; bottom: 1.5rem; left: 50%; transform: translateX(-50%);
    color: rgba(255,255,255,0.70); font-size: 0.85rem; font-family: inherit;
    text-align: center; max-width: 500px; pointer-events: none;
    background: rgba(0,0,0,0.4); padding: 0.5rem 1.25rem; border-radius: 50px;
  `;

  const lightboxClose = document.createElement('button');
  lightboxClose.innerHTML = '&times;';
  lightboxClose.setAttribute('aria-label', 'Close lightbox');
  lightboxClose.style.cssText = `
    position: absolute; top: 1.25rem; right: 1.5rem;
    background: rgba(255,255,255,0.12); border: none; color: white;
    font-size: 2rem; line-height: 1; width: 44px; height: 44px;
    border-radius: 50%; cursor: pointer; display: flex;
    align-items: center; justify-content: center;
    transition: background 0.2s ease;
  `;
  lightboxClose.addEventListener('mouseover', function () {
    this.style.background = 'rgba(255,255,255,0.24)';
  });
  lightboxClose.addEventListener('mouseout', function () {
    this.style.background = 'rgba(255,255,255,0.12)';
  });

  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(lightboxCaption);
  lightbox.appendChild(lightboxClose);
  document.body.appendChild(lightbox);

  function openLightbox(src, caption) {
    lightboxImg.src = src;
    lightboxCaption.textContent = caption;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.style.display = 'none';
    lightboxImg.src = '';
    document.body.style.overflow = '';
  }

  galleryItems.forEach(function (item) {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', function () {
      const img     = item.querySelector('img');
      const caption = item.querySelector('.gallery-overlay p');
      openLightbox(img.src, caption ? caption.textContent : '');
    });
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', 'View larger image');
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.style.display === 'flex') {
      closeLightbox();
    }
  });

})();
