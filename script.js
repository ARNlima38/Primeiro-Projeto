document.addEventListener('DOMContentLoaded', () => {
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ===================== FOTO (fallback com iniciais) ===================== */
  const photo = $('#profilePhoto');
  const usePhotoFallback = () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#06b6d4"/>
          </linearGradient>
        </defs>
        <rect width="400" height="400" fill="url(#g)"/>
        <text x="50%" y="54%" text-anchor="middle" dominant-baseline="middle"
              font-family="Poppins, sans-serif" font-size="140" font-weight="700" fill="#fff">AL</text>
      </svg>`;
    photo.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  };
  if (photo.complete && photo.naturalWidth === 0) usePhotoFallback();
  else photo.addEventListener('error', usePhotoFallback, { once: true });

  /* ===================== EFEITO DE DIGITAÇÃO ===================== */
  const phrases = [
    'Engenharia de Dados',
    'Power BI & Dashboards',
    'Excel e Power Query',
    'Automação de Processos',
    'Python & Inteligência Artificial',
  ];
  const typed = $('#typed');
  let phraseIdx = 0, charIdx = 0, deleting = false;

  (function type() {
    const current = phrases[phraseIdx];
    typed.textContent = current.slice(0, charIdx);

    let delay = deleting ? 45 : 95;
    if (!deleting && charIdx === current.length) {
      delay = 1800;
      deleting = true;
    } else if (deleting && charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
      delay = 400;
    } else {
      charIdx += deleting ? -1 : 1;
    }
    setTimeout(type, delay);
  })();

  /* ===================== TEMA CLARO / ESCURO ===================== */
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');
  const setTheme = (theme) => {
    root.dataset.theme = theme;
    themeBtn.setAttribute('aria-checked', theme === 'dark');
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'Modo escuro' : 'Modo claro');
    localStorage.setItem('cv-theme', theme);
  };
  setTheme(localStorage.getItem('cv-theme') || 'dark');
  themeBtn.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ===================== MENU MOBILE ===================== */
  const navLinks = $('#navLinks');
  const menuBtn = $('#menuBtn');
  menuBtn.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    menuBtn.innerHTML = open ? '<i class="fa-solid fa-xmark"></i>' : '<i class="fa-solid fa-bars"></i>';
  });
  $$('.nav-link').forEach(link => link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    menuBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }));

  /* ===================== SCROLL: navbar, progresso, voltar ao topo ===================== */
  const navbar = $('#navbar');
  const progress = $('#scrollProgress');
  const backToTop = $('#backToTop');

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${(y / max) * 100}%`;
    navbar.classList.toggle('scrolled', y > 40);
    backToTop.classList.toggle('show', y > 500);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ===================== LINK ATIVO NA NAVBAR ===================== */
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      $$('.nav-link').forEach(l =>
        l.classList.toggle('active', l.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => sectionObserver.observe(s));

  /* ===================== ANIMAÇÃO DE ENTRADA ===================== */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ===================== ANÉIS DE IDIOMAS ===================== */
  const CIRCUMFERENCE = 2 * Math.PI * 52;

  const animateRing = (ring) => {
    const percent = +ring.dataset.percent;
    const fg = $('.ring-fg', ring);
    const label = $('.ring-value', ring);
    fg.style.strokeDashoffset = CIRCUMFERENCE * (1 - percent / 100);

    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      label.textContent = `${Math.round(percent * eased)}%`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const ringObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      animateRing(entry.target);
      ringObserver.unobserve(entry.target);
    });
  }, { threshold: 0.5 });
  $$('.ring').forEach(r => ringObserver.observe(r));

  /* ===================== FILTRO DE PROJETOS ===================== */
  const cards = $$('.project-card');
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    $$('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    cards.forEach(card => {
      const match = filter === 'all' || card.dataset.category === filter;
      card.classList.toggle('hide', !match);
      if (match) {
        card.animate(
          [{ opacity: 0, transform: 'scale(.92)' }, { opacity: 1, transform: 'scale(1)' }],
          { duration: 400, easing: 'ease-out' }
        );
      }
    });
  }));

  /* ===================== EFEITO TILT 3D NOS PROJETOS ===================== */
  if (window.matchMedia('(hover: hover)').matches) {
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        card.style.transition = 'transform .1s';
        card.style.transform = `perspective(900px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-6px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transition = 'transform .5s ease';
        card.style.transform = '';
      });
    });
  }

  /* ===================== BAIXAR CV (imprimir / salvar PDF) ===================== */
  $('#printBtn').addEventListener('click', () => {
    $$('.reveal').forEach(el => el.classList.add('visible'));
    $$('.ring').forEach(animateRing);
    setTimeout(() => window.print(), 300);
  });

  /* ===================== ANO NO RODAPÉ ===================== */
  $('#year').textContent = new Date().getFullYear();
});
