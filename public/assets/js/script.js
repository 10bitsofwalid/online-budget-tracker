document.addEventListener('DOMContentLoaded', function () {
    const themeKey = 'budget_tracker_theme';
    const html = document.documentElement;

    const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'theme-toggle';
    toggleBtn.title = 'Toggle Theme';
    toggleBtn.setAttribute('aria-label', 'Toggle Theme');
    document.body.appendChild(toggleBtn);

    function applyTheme(theme) {
        html.setAttribute('data-theme', theme);
        localStorage.setItem(themeKey, theme);
        toggleBtn.innerHTML = theme === 'dark' ? sunIcon : moonIcon;
    }

    const savedTheme = localStorage.getItem(themeKey);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    let currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'dark');
    applyTheme(currentTheme);

    toggleBtn.addEventListener('click', function () {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(currentTheme);
    });

    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }
    window.addEventListener('resize', resize);

    let mouse = { x: null, y: null };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.x;
        mouse.y = e.y;
        updateParallax(e.x, e.y);
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function updateParallax(mx, my) {
        const decorations = document.querySelectorAll('.decor-item');
        decorations.forEach((decor, index) => {
            const speed = (index + 1) * 2;
            const x = (window.innerWidth / 2 - mx) * speed / 100;
            const y = (window.innerHeight / 2 - my) * speed / 100;
            decor.style.transform = `translate(${x}px, ${y}px)`;
        });
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.15;
            this.vy = (Math.random() - 0.5) * 0.15;
            this.size = Math.random() * 2 + 1;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 120) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (120 - distance) / 120;
                    const directionX = forceDirectionX * force * 0.05;
                    const directionY = forceDirectionY * force * 0.05;

                    this.vx += directionX;
                    this.vy += directionY;
                }
            }
            this.vx *= 0.99;
            this.vy *= 0.99;
            if (Math.abs(this.vx) < 0.05) this.vx += (Math.random() - 0.5) * 0.01;
            if (Math.abs(this.vy) < 0.05) this.vy += (Math.random() - 0.5) * 0.01;
        }
        draw(color) {
            ctx.fillStyle = color;
            ctx.globalAlpha = 0.5;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(width * 0.1, 80);
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        const primaryColor = getComputedStyle(html).getPropertyValue('--primary-color').trim();

        particles.forEach(p => {
            p.update();
            p.draw(primaryColor);
        });

        connectParticles(primaryColor);
        requestAnimationFrame(animate);
    }

    function connectParticles(color) {
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let dx = particles[a].x - particles[b].x;
                let dy = particles[a].y - particles[b].y;
                let distance = dx * dx + dy * dy;

                if (distance < 150 * 150) {
                    ctx.strokeStyle = color;
                    ctx.lineWidth = 1;
                    ctx.globalAlpha = 1 - (distance / (150 * 150));
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }
    }

    resize();
    animate();
});
