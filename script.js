// ===================================================
// NAYEPANKH FOUNDATION — MAIN JAVASCRIPT
// ===================================================

document.addEventListener('DOMContentLoaded', () => {

  // ─── State ────────────────────────────────────────
  let currentPage = 'home';

  // ─── DOM References ───────────────────────────────
  const navbar        = document.getElementById('navbar');
  const hamburger     = document.getElementById('hamburger');
  const mobileMenu    = document.getElementById('mobile-menu');
  const scrollTopBtn  = document.getElementById('scroll-top');
  const overlay       = document.getElementById('page-transition-overlay');
  const toastContainer = document.getElementById('toast-container');

  // ─── NAVBAR SCROLL EFFECT ─────────────────────────
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    scrollTopBtn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });

  // ─── HAMBURGER MENU ───────────────────────────────
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  // Close mobile menu on outside click
  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
      closeMobileMenu();
    }
  });

  function closeMobileMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ─── PAGE NAVIGATION ──────────────────────────────
  function navigateTo(page, skipAnimation = false) {
    if (page === currentPage && !skipAnimation) return;

    // Close mobile menu if open
    closeMobileMenu();

    if (skipAnimation) {
      showPage(page);
      return;
    }

    // Transition animation
    overlay.classList.add('active');

    setTimeout(() => {
      showPage(page);
      window.scrollTo({ top: 0, behavior: 'instant' });

      setTimeout(() => {
        overlay.classList.remove('active');
        // Trigger reveal animations for new page
        setTimeout(triggerReveals, 100);
      }, 200);
    }, 250);
  }

  function showPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show requested page
    const pageEl = document.getElementById(`page-${page}`);
    if (pageEl) pageEl.classList.add('active');

    currentPage = page;

    // Update nav links
    document.querySelectorAll('.nav-link[data-page], .mobile-nav-link[data-page]').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Reset reveals for new page
    pageEl.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('visible');
    });
  }

  // All navigation triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-page]');
    if (trigger) {
      e.preventDefault();
      navigateTo(trigger.dataset.page);
    }
  });

  // ─── SCROLL REVEAL ────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  function triggerReveals() {
    const activePage = document.querySelector('.page.active');
    if (!activePage) return;
    activePage.querySelectorAll('.reveal').forEach(el => {
      revealObserver.unobserve(el);
      revealObserver.observe(el);
    });
  }

  // Initial reveals
  triggerReveals();

  // ─── SCROLL TO TOP ────────────────────────────────
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // ─── DONATION AMOUNT BUTTONS ──────────────────────
  const amountBtns = document.querySelectorAll('.amount-btn');
  const amountInput = document.getElementById('donation-amount');
  let customMode = false;

  amountBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      amountBtns.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');

      if (btn.dataset.amount === 'custom') {
        customMode = true;
        amountInput.value = '';
        amountInput.focus();
      } else {
        customMode = false;
        amountInput.value = btn.dataset.amount;
      }
    });
  });

  amountInput.addEventListener('input', () => {
    if (customMode || amountInput.value) {
      amountBtns.forEach(b => b.classList.remove('selected'));
      const matchBtn = [...amountBtns].find(b => b.dataset.amount === amountInput.value);
      if (matchBtn) matchBtn.classList.add('selected');
    }
  });

  // ─── DONATION FORM ────────────────────────────────
  const donationForm = document.getElementById('donation-form');
  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const amount = amountInput.value;
      const name   = document.getElementById('donor-name').value;
      const email  = document.getElementById('donor-email').value;
      const phone  = document.getElementById('donor-phone').value;

      if (!amount || !name || !email || !phone) {
        showToast('Please fill in all required fields.', 'error');
        return;
      }

      if (isNaN(amount) || Number(amount) < 10) {
        showToast('Please enter a valid donation amount (min ₹10).', 'error');
        return;
      }

      showToast(`Thank you, ${name}! ₹${amount} donation initiated. Please complete via UPI/Bank transfer.`, 'success');
      donationForm.reset();
      amountBtns.forEach(b => b.classList.remove('selected'));
    });
  }

  // ─── CONTACT FORM ─────────────────────────────────
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;

      if (!name) {
        showToast('Please fill in your name.', 'error');
        return;
      }

      showToast(`Thank you, ${name}! We'll get back to you soon.`, 'success');
      contactForm.reset();
    });
  }

  // ─── TOAST NOTIFICATIONS ──────────────────────────
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✅' : '⚠️'}</span>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => toast.classList.add('show'));
    });

    // Auto-remove after 4.5s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // ─── COUNTER ANIMATION ────────────────────────────
  function animateCounter(el) {
    const target = parseInt(el.dataset.target, 10);
    const duration = 1800;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current.toLocaleString('en-IN');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = el.dataset.display || current.toLocaleString('en-IN');
    }
    requestAnimationFrame(update);
  }

  // Observe stat numbers
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('.stat-number[data-target]').forEach(el => {
    statObserver.observe(el);
  });

  // ─── NAV LOGO CLICK ───────────────────────────────
  document.querySelectorAll('.nav-logo').forEach(logo => {
    logo.addEventListener('click', () => navigateTo('home'));
  });

  // ─── INITIAL PAGE ─────────────────────────────────
  showPage('home');
  setTimeout(triggerReveals, 150);
});
