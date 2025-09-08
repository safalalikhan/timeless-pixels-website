// ---------- Cached DOM ----------
const hamburger = document.getElementById('hamburger-menu');
const navLinks = document.getElementById('nav-links');
const themeToggle = document.getElementById('theme-toggle');
const sections = document.querySelectorAll('section[id]');
const revealEls = document.querySelectorAll('.reveal');
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const header = document.querySelector('header');

// ---------- Hamburger Toggle ----------
hamburger.addEventListener('click', () => {
  const isOpened = navLinks.classList.toggle('nav-active');
  hamburger.setAttribute('aria-expanded', String(isOpened));
});

document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    if (navLinks.classList.contains('nav-active')) {
      navLinks.classList.remove('nav-active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
});

// ---------- Smooth Scroll ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (!href || href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ---------- Theme Toggle ----------
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  themeToggle.classList.toggle('dark-active', theme === 'dark');
}
applyTheme(localStorage.getItem('theme') || 'light');

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

// ---------- Header scroll shadow ----------
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});

// ---------- Reveal animations on view ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealEls.forEach(el => revealObserver.observe(el));

// ---------- Scroll spy ----------
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.getAttribute('id');
    const link = document.querySelector(`.nav-links a[href="#${id}"]`);
    if (!link) return;
    if (entry.isIntersecting) {
      document.querySelectorAll('.nav-links a.active').forEach(a => a.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -40% 0px' });
sections.forEach(section => spyObserver.observe(section));

// ---------- Gallery Lightbox ----------
const gallery = document.getElementById('gallery');
const lightbox = document.getElementById('lightbox');
const lightboxContent = document.getElementById('lightbox-content');
const lbPrev = document.getElementById('lightbox-prev');
const lbNext = document.getElementById('lightbox-next');
const lbClose = document.getElementById('lightbox-close');

let lightboxImages = [];
let currentIndex = 0;

if (gallery) {
  gallery.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (!item) return;

    const imagesAttr = item.dataset.images;
    if (!imagesAttr) return;

    lightboxImages = imagesAttr.split(',');
    const clickedImg = e.target.closest('img');
    if (clickedImg) {
      const clickedName = clickedImg.src.split('/').pop();
      const idx = lightboxImages.findIndex(src => src.split('/').pop() === clickedName);
      currentIndex = idx >= 0 ? idx : 0;
    } else {
      currentIndex = 0;
    }
    openLightbox();
  });
}

function openLightbox() {
  renderLightboxImage();
  lightbox.classList.add('show');
  lightbox.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  lbNext.focus();
}

function closeLightbox() {
  lightbox.classList.remove('show');
  lightbox.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function renderLightboxImage() {
  if (!lightboxImages.length) return;
  const src = lightboxImages[currentIndex];
  const img = new Image();
  img.onload = () => {
    lightboxContent.innerHTML = '';
    lightboxContent.appendChild(img);
  };
  img.alt = 'Gallery image';
  img.src = src;
  lightboxContent.innerHTML = `<p style="color:#fff">Loading...</p>`;
}

function showPrevImage() {
  currentIndex = (currentIndex - 1 + lightboxImages.length) % lightboxImages.length;
  renderLightboxImage();
}
function showNextImage() {
  currentIndex = (currentIndex + 1) % lightboxImages.length;
  renderLightboxImage();
}

lbPrev.addEventListener('click', showPrevImage);
lbNext.addEventListener('click', showNextImage);
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('show')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') showPrevImage();
  if (e.key === 'ArrowRight') showNextImage();
});

// ---------- Testimonials Carousel ----------
const viewport = document.getElementById('testimonial-viewport');
if (viewport) {
  const stage = document.createElement('div');
  stage.className = 'testimonial-stage';
  viewport.querySelectorAll('.testimonial-slide').forEach(slide => stage.appendChild(slide));
  viewport.innerHTML = '';
  viewport.appendChild(stage);

  const slides = stage.querySelectorAll('.testimonial-slide');
  const total = slides.length;
  let index = 0;
  let autoplayInterval;

  const prevBtn = document.querySelector('.test-prev');
  const nextBtn = document.querySelector('.test-next');
  const dotsWrap = document.getElementById('testimonial-dots');
  dotsWrap.innerHTML = '';
  const dots = Array.from({length: total}, (_, i) => {
    const dot = document.createElement('button');
    dot.className = 'test-dot';
    dot.addEventListener('click', () => goTo(i, true));
    dotsWrap.appendChild(dot);
    return dot;
  });

  function update() {
    stage.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
  }
  function goTo(newIndex, user = false) {
    index = (newIndex + total) % total;
    update();
    if (user) restartAutoplay();
  }
  function restartAutoplay() {
    stopAutoplay();
    autoplayInterval = setInterval(() => goTo(index + 1), 5000);
  }
  function stopAutoplay() { clearInterval(autoplayInterval); }

  prevBtn.addEventListener('click', () => goTo(index - 1, true));
  nextBtn.addEventListener('click', () => goTo(index + 1, true));

  [viewport, prevBtn, nextBtn, ...dots].forEach(el => {
    el.addEventListener('mouseenter', stopAutoplay);
    el.addEventListener('mouseleave', restartAutoplay);
  });

  update();
  restartAutoplay();
}

// ---------- Form handling (Netlify AJAX submit + validation) ----------
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(contactForm);
    if (formStatus) formStatus.textContent = 'Sending...';

    const formData = new FormData(contactForm);
    const requiredFields = ['name', 'email', 'session_type', 'preferred_date', 'preferred_location', 'message'];
    let hasError = false;

    requiredFields.forEach(name => {
      const el = contactForm.querySelector(`[name="${name}"]`);
      if (el && !String(el.value).trim()) {
        showFieldError(el, 'This field is required.');
        hasError = true;
      }
    });
    const emailEl = contactForm.querySelector('[name="email"]');
    if (emailEl.value && !/^\S+@\S+\.\S+$/.test(emailEl.value)) {
      showFieldError(emailEl, 'Please enter a valid email address.');
      hasError = true;
    }
    if (hasError) {
      if (formStatus) formStatus.textContent = '';
      return;
    }

    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString()
      });
      if (res.ok) {
        if (formStatus) formStatus.textContent = 'Thanks! Your message has been sent.';
        contactForm.reset();
      } else {
        throw new Error(`Server responded with status: ${res.status}`);
      }
    } catch (err) {
      if (formStatus) formStatus.textContent = 'Sorry, there was an error. Please try again.';
      console.error('Form submission error:', err);
    }
  });
}

function showFieldError(el, message) {
  const container = el.closest('.form-group');
  const errEl = container.querySelector('.field-error');
  if (errEl) errEl.textContent = message;
  el.setAttribute('aria-invalid', 'true');
}
function clearFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach(e => e.textContent = '');
  form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
}
