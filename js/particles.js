/**
 * NexaFlow — Particle System & Background Canvas
 * Creates an interactive neural network / particle field effect
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, animId;
  let particles = [];
  let mouse = { x: null, y: null };

  const CONFIG = {
    particleCount: window.innerWidth < 768 ? 50 : 100,
    particleRadius: 1.5,
    particleSpeed: 0.3,
    connectDistance: 120,
    mouseRadius: 150,
    colors: ['#00f5ff', '#0080ff', '#8b5cf6', '#00ff87'],
    opacityBase: 0.4,
  };

  /* ---- Resize ---- */
  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  /* ---- Particle ---- */
  class Particle {
    constructor() {
      this.reset();
    }

    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * CONFIG.particleSpeed;
      this.vy = (Math.random() - 0.5) * CONFIG.particleSpeed;
      this.color = CONFIG.colors[Math.floor(Math.random() * CONFIG.colors.length)];
      this.radius = Math.random() * CONFIG.particleRadius + 0.5;
      this.opacity = Math.random() * 0.4 + 0.1;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    update(t) {
      this.x += this.vx;
      this.y += this.vy;

      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONFIG.mouseRadius) {
          const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
          this.x += (dx / dist) * force * 2;
          this.y += (dy / dist) * force * 2;
        }
      }

      // Boundary wrap
      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      // Pulsing opacity
      this.currentOpacity = this.opacity + Math.sin(t * this.pulseSpeed + this.pulsePhase) * 0.1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(this.color, this.currentOpacity);
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius * 3, 0, Math.PI * 2);
      const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
      grad.addColorStop(0, hexToRgba(this.color, 0.08));
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }

  /* ---- Connections ---- */
  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONFIG.connectDistance) {
          const opacity = (1 - dist / CONFIG.connectDistance) * 0.15;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = hexToRgba(a.color, opacity);
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  /* ---- Data packets flowing along connections ---- */
  const packets = [];

  class DataPacket {
    constructor(from, to) {
      this.from = from;
      this.to = to;
      this.progress = 0;
      this.speed = Math.random() * 0.01 + 0.005;
      this.color = from.color;
    }

    update() {
      this.progress += this.speed;
      return this.progress < 1;
    }

    draw() {
      const x = this.from.x + (this.to.x - this.from.x) * this.progress;
      const y = this.from.y + (this.to.y - this.from.y) * this.progress;
      const opacity = Math.sin(this.progress * Math.PI) * 0.8;

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(this.color, opacity);
      ctx.fill();

      // Tail
      const tailLength = 0.08;
      const tailProgress = Math.max(0, this.progress - tailLength);
      const tx = this.from.x + (this.to.x - this.from.x) * tailProgress;
      const ty = this.from.y + (this.to.y - this.from.y) * tailProgress;

      const grad = ctx.createLinearGradient(tx, ty, x, y);
      grad.addColorStop(0, 'transparent');
      grad.addColorStop(1, hexToRgba(this.color, opacity * 0.6));

      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  /* ---- Main Loop ---- */
  let frame = 0;

  function animate() {
    animId = requestAnimationFrame(animate);
    frame++;

    ctx.clearRect(0, 0, width, height);

    // Spawn data packets occasionally
    if (frame % 120 === 0 && particles.length > 2) {
      const a = particles[Math.floor(Math.random() * particles.length)];
      const b = particles[Math.floor(Math.random() * particles.length)];
      const dx = a.x - b.x;
      const dy = a.y - b.y;
      if (Math.sqrt(dx * dx + dy * dy) < CONFIG.connectDistance) {
        packets.push(new DataPacket(a, b));
      }
    }

    // Update particles
    particles.forEach(p => p.update(frame));

    // Draw connections
    drawConnections();

    // Draw/update packets
    for (let i = packets.length - 1; i >= 0; i--) {
      packets[i].draw();
      if (!packets[i].update()) {
        packets.splice(i, 1);
      }
    }

    // Draw particles
    particles.forEach(p => p.draw());
  }

  /* ---- Init ---- */
  function init() {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
    if (animId) cancelAnimationFrame(animId);
    animate();
  }

  /* ---- Mouse tracking ---- */
  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  window.addEventListener('resize', () => {
    resize();
    particles = Array.from({ length: CONFIG.particleCount }, () => new Particle());
  });

  /* ---- Helpers ---- */
  function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Start
  init();

})();
