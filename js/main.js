/* ========================================
   IBK Farm — Main JavaScript
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.getElementById('navbar');

  function handleNavScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar--scrolled');
    } else {
      navbar.classList.remove('navbar--scrolled');
    }
  }

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  /* ---------- Mobile menu toggle ---------- */
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('navbar__nav--open');
    navToggle.classList.toggle('navbar__toggle--active');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  // Close mobile menu on link click
  navMenu.querySelectorAll('.navbar__link').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('navbar__nav--open');
      navToggle.classList.remove('navbar__toggle--active');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.navbar__link');

  function setActiveLink() {
    const scrollY = window.scrollY + 120;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('navbar__link--active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('navbar__link--active');
          }
        });
      }
    });
  }

  window.addEventListener('scroll', setActiveLink, { passive: true });
  setActiveLink();

  /* ---------- Scroll animations (IntersectionObserver) ---------- */
  const fadeElements = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const fadeObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in--visible');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    fadeElements.forEach(el => fadeObserver.observe(el));
  } else {
    // Fallback: show everything
    fadeElements.forEach(el => el.classList.add('fade-in--visible'));
  }

  /* ---------- Founders sliding carousel ---------- */
  const foundersGrid = document.getElementById('foundersGrid');

  if (foundersGrid) {
    const cards = foundersGrid.querySelectorAll('.founder-card');
    // positions[i] = quelle position (0=gauche, 1=centre, 2=droite) pour la carte i
    let positions = [0, 1, 2];
    let timer = null;

    function applyPositions() {
      cards.forEach((card, i) => {
        card.setAttribute('data-pos', positions[i]);
      });
    }

    function rotate() {
      // Chaque carte avance d'une position vers la gauche, la gauche va à droite
      positions = positions.map(p => (p + 2) % 3);
      applyPositions();
    }

    // Carousel dots for mobile
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'founders__dots';
    foundersGrid.parentNode.appendChild(dotsContainer);

    cards.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'founders__dot';
      dot.setAttribute('aria-label', `Fondateur ${i + 1}`);
      dot.addEventListener('click', () => {
        clearInterval(timer);
        // Set positions so card i is at center (pos 1)
        positions = cards.length === 3
          ? [(3 - i + 0) % 3, (3 - i + 1) % 3, (3 - i + 2) % 3].map((_, idx) => (idx - i + 3) % 3)
          : positions;
        // Direct assignment for 3 cards
        positions = [];
        for (let j = 0; j < cards.length; j++) {
          positions.push((j - i + 3) % 3);
        }
        applyPositions();
        updateDots();
        timer = setInterval(rotate, 3000);
      });
      dotsContainer.appendChild(dot);
    });

    function updateDots() {
      const dots = dotsContainer.querySelectorAll('.founders__dot');
      dots.forEach((dot, i) => {
        dot.classList.toggle('founders__dot--active', positions[i] === 1);
      });
    }

    const origApply = applyPositions;
    applyPositions = function() {
      origApply();
      updateDots();
    };

    // Init
    applyPositions();

    timer = setInterval(rotate, 3000);

    foundersGrid.addEventListener('mouseenter', () => clearInterval(timer));
    foundersGrid.addEventListener('mouseleave', () => {
      timer = setInterval(rotate, 3000);
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    foundersGrid.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      clearInterval(timer);
    }, { passive: true });

    foundersGrid.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          rotate(); // swipe left = next
        } else {
          positions = positions.map(p => (p + 1) % 3); // swipe right = prev
          applyPositions();
        }
      }
      timer = setInterval(rotate, 3000);
    }, { passive: true });
  }

  /* ---------- Gallery pagination on mobile ---------- */
  const gallery = document.querySelector('.gallery');
  if (gallery) {
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'gallery-toggle';
    toggleBtn.textContent = 'Voir plus';
    gallery.insertAdjacentElement('afterend', toggleBtn);

    toggleBtn.addEventListener('click', () => {
      const expanded = gallery.classList.toggle('gallery--expanded');
      toggleBtn.textContent = expanded ? 'Voir moins' : 'Voir plus';
    });
  }

  /* ---------- Animated counters ---------- */
  const statNumbers = document.querySelectorAll('.stat__number');
  let countersAnimated = false;

  function animateCounters() {
    if (countersAnimated) return;

    statNumbers.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target'), 10);
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);

        counter.textContent = current.toLocaleString('fr-FR');

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          counter.textContent = target.toLocaleString('fr-FR');
        }
      }

      requestAnimationFrame(updateCounter);
    });

    countersAnimated = true;
  }

  if ('IntersectionObserver' in window && statNumbers.length > 0) {
    const statsSection = document.querySelector('.stats');
    if (statsSection) {
      const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            statsObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });

      statsObserver.observe(statsSection);
    }
  }

  /* ---------- Contact form ---------- */
  const contactForm = document.getElementById('contactForm');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Validate
      if (!data.name || !data.email || !data.message) {
        showFormMessage('Veuillez remplir tous les champs obligatoires.', 'error');
        return;
      }

      // Simulate submission
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Envoi en cours...';
      submitBtn.disabled = true;

      setTimeout(() => {
        showFormMessage('Merci ! Votre message a été envoyé avec succès. Nous vous répondrons bientôt.', 'success');
        contactForm.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 1500);
    });
  }

  function showFormMessage(text, type) {
    // Remove existing message
    const existing = contactForm.querySelector('.form-message');
    if (existing) existing.remove();

    const msg = document.createElement('div');
    msg.className = 'form-message';
    msg.textContent = text;
    msg.style.cssText = `
      padding: 14px 20px;
      border-radius: 8px;
      margin-top: 16px;
      font-size: 0.95rem;
      font-weight: 500;
      ${type === 'success'
        ? 'background: #e8f5e9; color: #2e7d32; border: 1px solid #c8e6c9;'
        : 'background: #ffebee; color: #c62828; border: 1px solid #ffcdd2;'}
    `;

    contactForm.appendChild(msg);

    setTimeout(() => {
      if (msg.parentNode) msg.remove();
    }, 5000);
  }

  /* ---------- Smooth scroll for anchor links ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

});
