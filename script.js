/**
 * MADHAN MATTHEW S — PORTFOLIO · script.js
 * 1. Scroll-Spy via Max Visible Section Area (Flawless Math)
 * 2. Custom Dual Cursor (Dot + Ring)
 * 3. High-Contrast Overlay Canvas (Shooting Stars + Cosmic Particles + Cursor Sparks)
 */
'use strict';

// ══════════════════════════════════════════════════
// 1. FLAWLESS SCROLL-SPY (MAX VISIBLE AREA MATH)
// ══════════════════════════════════════════════════
const mainContainer = document.getElementById('main');
const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
const sectionEls = document.querySelectorAll('.section[id]');
const drawer = document.getElementById('drawer');
const menuBtn = document.getElementById('menu-btn');
const drawerClose = document.getElementById('drawer-close');
let isClickScrolling = false;

function setActiveNavItem(activeId) {
  navItems.forEach(item => {
    const href = item.getAttribute('href').replace('#', '');
    item.classList.toggle('active', href === activeId);
  });
}

function calculateActiveSection() {
  if (isClickScrolling) return;

  const containerTop = mainContainer ? mainContainer.getBoundingClientRect().top : 0;
  const containerHeight = mainContainer ? mainContainer.clientHeight : window.innerHeight;
  const scrollPos = mainContainer ? mainContainer.scrollTop : window.scrollY;
  const scrollHeight = mainContainer ? mainContainer.scrollHeight : document.body.scrollHeight;

  // Bottom of page check -> highlight Contact
  if (scrollPos + containerHeight >= scrollHeight - 40) {
    setActiveNavItem(sectionEls[sectionEls.length - 1].id);
    return;
  }

  let bestSectionId = sectionEls[0].id;
  let maxVisiblePixels = -1;

  sectionEls.forEach(sec => {
    const rect = sec.getBoundingClientRect();
    const secTop = rect.top - containerTop;
    const secBottom = rect.bottom - containerTop;

    // Calculate overlap range of this section with the viewport [0, containerHeight]
    const visibleTop = Math.max(0, secTop);
    const visibleBottom = Math.min(containerHeight, secBottom);
    const visibleHeight = Math.max(0, visibleBottom - visibleTop);

    if (visibleHeight > maxVisiblePixels) {
      maxVisiblePixels = visibleHeight;
      bestSectionId = sec.id;
    }
  });

  setActiveNavItem(bestSectionId);
}

// Attach scroll listeners
if (mainContainer) {
  mainContainer.addEventListener('scroll', calculateActiveSection, { passive: true });
}
window.addEventListener('scroll', calculateActiveSection, { passive: true });
calculateActiveSection(); // Run immediately

function scrollElementIntoView(targetEl) {
  if (!targetEl) return;
  const isMobile = window.innerWidth <= 768;
  if (isMobile) {
    const topOffset = 60;
    const elementPosition = targetEl.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - topOffset;
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  } else if (mainContainer) {
    mainContainer.scrollTo({
      top: targetEl.offsetTop,
      behavior: 'smooth'
    });
  } else {
    targetEl.scrollIntoView({ behavior: 'smooth' });
  }
}

// Universal smooth scroll handler for all internal section links (#intro, #about, #projects, etc.)
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const targetId = link.getAttribute('href').replace('#', '');
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);

    if (targetEl) {
      e.preventDefault();

      // Close mobile drawer if open
      if (drawer) {
        drawer.classList.remove('open');
      }

      isClickScrolling = true;
      setActiveNavItem(targetId);
      scrollElementIntoView(targetEl);

      // Re-enable scroll spy after smooth scroll completes
      setTimeout(() => {
        isClickScrolling = false;
        calculateActiveSection();
      }, 700);
    }
  });
});

// ══════════════════════════════════════════════════
// 2. MOBILE DRAWER
// ══════════════════════════════════════════════════
if (menuBtn && drawer) {
  menuBtn.addEventListener('click', () => drawer.classList.add('open'));
  if (drawerClose) drawerClose.addEventListener('click', () => drawer.classList.remove('open'));
}

// ══════════════════════════════════════════════════
// 3. DUAL CURSOR POSITIONING
// ══════════════════════════════════════════════════
const dotEl = document.getElementById('cursor-dot');
const ringEl = document.getElementById('cursor-ring');

let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let ringX = mouseX;
let ringY = mouseY;

// Cursor movement spark trail generator
let lastSparkX = 0, lastSparkY = 0;

const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || window.matchMedia('(pointer: coarse)').matches;

document.addEventListener('mousemove', e => {
  if (isTouchDevice || window.innerWidth <= 768) return;

  mouseX = e.clientX;
  mouseY = e.clientY;

  // Calculate distance moved since last spark
  const dist = Math.hypot(mouseX - lastSparkX, mouseY - lastSparkY);
  if (dist > 6) {
    lastSparkX = mouseX;
    lastSparkY = mouseY;
    spawnSparkTrail(mouseX, mouseY);
  }
});

function spawnSparkTrail(x, y) {
  if (isTouchDevice || window.innerWidth <= 768) return;

  const spark = document.createElement('div');
  spark.className = 'star-spark';

  // Subtle random offset & size
  const size = Math.random() * 9 + 6; // 6px to 15px spark
  const offsetX = (Math.random() - 0.5) * 8;
  const offsetY = (Math.random() - 0.5) * 8;

  spark.style.width = size + 'px';
  spark.style.height = size + 'px';
  spark.style.left = (x + offsetX) + 'px';
  spark.style.top = (y + offsetY) + 'px';

  document.body.appendChild(spark);

  // Auto remove after animation completes (550ms)
  setTimeout(() => {
    if (spark.parentNode) {
      spark.parentNode.removeChild(spark);
    }
  }, 550);
}

// Lerp ring follow
function updateCursorUI() {
  if (!isTouchDevice && window.innerWidth > 768) {
    ringX += (mouseX - ringX) * 0.2;
    ringY += (mouseY - ringY) * 0.2;

    if (dotEl) { dotEl.style.left = mouseX + 'px'; dotEl.style.top = mouseY + 'px'; }
    if (ringEl) { ringEl.style.left = ringX + 'px'; ringEl.style.top = ringY + 'px'; }
  }

  requestAnimationFrame(updateCursorUI);
}
updateCursorUI();

// Hover effect on interactives
function initHoverEffects() {
  const interactives = document.querySelectorAll('a, button, .project-entry, .cert-card, .contact-row, .nav-item');
  interactives.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (dotEl) dotEl.classList.add('hovered');
      if (ringEl) ringEl.classList.add('hovered');
    });
    el.addEventListener('mouseleave', () => {
      if (dotEl) dotEl.classList.remove('hovered');
      if (ringEl) ringEl.classList.remove('hovered');
    });
  });
}
initHoverEffects();

// ══════════════════════════════════════════════════
// 4. HIGH-CONTRAST OVERLAY CANVAS
// ══════════════════════════════════════════════════
const bgCanvas = document.getElementById('bg-canvas');

if (bgCanvas) {
  const ctx = bgCanvas.getContext('2d');

  function resizeCanvas() {
    bgCanvas.width = window.innerWidth;
    bgCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Subtle Ambient Floating Dust Motes
  class CosmicParticle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x = Math.random() * bgCanvas.width;
      this.y = initial ? Math.random() * bgCanvas.height : bgCanvas.height + 10;
      this.radius = Math.random() * 1.2 + 0.6; // Tiny 0.6px to 1.8px dust
      this.speedY = -(Math.random() * 0.25 + 0.08); // Very slow drift
      this.speedX = (Math.random() - 0.5) * 0.15;
      this.alpha = Math.random() * 0.25 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.008;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.alpha += Math.sin(Date.now() * this.pulseSpeed) * 0.008;

      if (this.y < -10 || this.x < -10 || this.x > bgCanvas.width + 10) {
        this.reset(false);
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(147, 51, 234, ${Math.max(0.05, Math.min(0.35, this.alpha))})`;
      ctx.fill();
    }
  }

  // Rare, Faint Ambient Meteor
  class Meteor {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * bgCanvas.width * 0.8;
      this.y = Math.random() * bgCanvas.height * 0.3;
      this.length = Math.random() * 70 + 40;
      this.speed = Math.random() * 6 + 4;
      this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.1;
      this.alpha = 0;
      this.maxAlpha = Math.random() * 0.25 + 0.1; // Very faint (10-35% opacity)
      this.state = 'waiting';
      this.timer = Math.floor(Math.random() * 400 + 200); // Rare spawn
    }
    update() {
      if (this.state === 'waiting') {
        this.timer--;
        if (this.timer <= 0) this.state = 'active';
        return;
      }

      this.x += Math.cos(this.angle) * this.speed;
      this.y += Math.sin(this.angle) * this.speed;
      this.alpha += 0.02;

      if (this.x > bgCanvas.width + this.length || this.y > bgCanvas.height + this.length) {
        this.reset();
      }
    }
    draw() {
      if (this.state !== 'active') return;

      const tailX = this.x - Math.cos(this.angle) * this.length;
      const tailY = this.y - Math.sin(this.angle) * this.length;

      const grad = ctx.createLinearGradient(this.x, this.y, tailX, tailY);
      const a = Math.min(this.alpha, this.maxAlpha);

      grad.addColorStop(0, `rgba(147, 51, 234, ${a})`);
      grad.addColorStop(1, `rgba(147, 51, 234, 0)`);

      ctx.beginPath();
      ctx.moveTo(this.x, this.y);
      ctx.lineTo(tailX, tailY);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  // Reduced count for clean, non-distracting background
  const particles = Array.from({ length: 22 }, () => new CosmicParticle());
  const meteors = Array.from({ length: 2 }, () => new Meteor());

  function renderCanvasFrame() {
    ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

    // Draw background cosmic particles & meteors
    particles.forEach(p => { p.update(); p.draw(); });
    meteors.forEach(m => { m.update(); m.draw(); });

    requestAnimationFrame(renderCanvasFrame);
  }
  renderCanvasFrame();
}
