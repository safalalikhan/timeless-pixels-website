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
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// ---------- Theme Toggle ----------
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
    // REFACTOR: Use class toggle for visual state
    if (theme === 'dark') {
        themeToggle.classList.add('dark-active');
    } else {
        themeToggle.classList.remove('dark-active');
    }
}

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
});

// Apply saved theme on initial load
applyTheme(localStorage.getItem('theme') || 'light');


// ---------- Header scroll shadow ----------
window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 50);
});

// ---------- Reveal animations on load ----------
window.addEventListener('load', () => {
    revealEls.forEach(el => el.classList.add('revealed'));
});

// ---------- Scroll spy (IntersectionObserver) ----------
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
let galleryImgs = [];
let currentIndex = 0;

if (gallery) {
    galleryImgs = Array.from(gallery.querySelectorAll('img'));
    gallery.addEventListener('click', (e) => {
        const item = e.target.closest('.gallery-item');
        if (!item) return;
        currentIndex = galleryImgs.indexOf(item.querySelector('img'));
        openLightbox();
    });
}

function openLightbox() {
    renderLightboxImage();
    lightbox.classList.add('show');
    lightbox.setAttribute('aria-hidden', 'false');
    lbPrev.focus();
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    lightbox.classList.remove('show');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function renderLightboxImage() {
    if (galleryImgs[currentIndex]) {
        lightboxContent.innerHTML = `<img src="${galleryImgs[currentIndex].src}" alt="${galleryImgs[currentIndex].alt}" />`;
    }
}

function showPrevImage() {
    currentIndex = (currentIndex - 1 + galleryImgs.length) % galleryImgs.length;
    renderLightboxImage();
}

function showNextImage() {
    currentIndex = (currentIndex + 1) % galleryImgs.length;
    renderLightboxImage();
}

lbPrev.addEventListener('click', showPrevImage);
lbNext.addEventListener('click', showNextImage);
lbClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
});
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
        dot.addEventListener('click', () => goTo(i));
        dotsWrap.appendChild(dot);
        return dot;
    });

    function update() {
        stage.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }
    function goTo(newIndex) {
        index = (newIndex + total) % total;
        update();
    }
    function startAutoplay() {
        stopAutoplay();
        autoplayInterval = setInterval(() => goTo(index + 1), 5000);
    }
    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    viewport.addEventListener('mouseenter', stopAutoplay);
    viewport.addEventListener('mouseleave', startAutoplay);
    
    update();
    startAutoplay();
}

// ---------- Form handling (Netlify AJAX submit + validation) ----------
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearFieldErrors(contactForm);
        formStatus.textContent = 'Sending...';
        const formData = new FormData(contactForm);
        const requiredFields = ['name', 'email', 'service', 'message'];
        let hasError = false;

        requiredFields.forEach(name => {
            const el = contactForm.querySelector(`[name="${name}"]`);
            if (el && !el.value.trim()) {
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
            formStatus.textContent = '';
            return;
        }

        try {
            const res = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams(formData).toString()
            });
            if (res.ok) {
                formStatus.textContent = 'Thanks! Your message has been sent.';
                contactForm.reset();
            } else {
                throw new Error(`Server responded with status: ${res.status}`);
            }
        } catch (err) {
            formStatus.textContent = 'Sorry, there was an error. Please try again.';
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