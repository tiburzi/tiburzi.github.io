const slideshowTemplate = document.createElement('template');
slideshowTemplate.innerHTML = `
  <style>
    .slideshow{
      --w:720px;
      --h:420px;
      --corner-radius:10px;
      --dot-size:10px;
      --dot-selected-scale:1.7;
      --dot-color:var(--color-accent-soft);
      --dot-bg:var(--color-base);
      --duration:600ms;
    }

    body{display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#111;color:#fff;font-family:system-ui,Segoe UI,Roboto;}

    /* Allow dots to be visible below the viewport and reserve space */
    .slideshow{
      width:var(--w);
      max-width:100%;
      height:var(--custom_height, var(--h));
      max-height:60vh;
      position:relative;
      user-select:none;
      overflow:visible;
      border-radius:var(--corner-radius);
      background:transparent;
      margin:20px 0px 70px 0px;
    }

    .viewport{
      position:absolute;
      inset:0;
      overflow:hidden;
      border-radius:var(--corner-radius);
      background:transparent;
    }

    /* Use absolutely stacked slides for crossfade */
    .slides{
      position:relative;
      width:100%;
      height:100%;
    }

    .slides img{
      position:absolute;
      inset:0;
      width:100%;
      height:100%;
      object-fit:cover;
      opacity:0;
      //transform:scale(1.02);
      transition:opacity var(--duration) ease, transform calc(var(--duration) * 1.05) ease;
      pointer-events:none;
    }

    .slides img.is-active{
      opacity:1;
      //transform:scale(1);
      z-index:2;
    }

    /* Dots row placed below viewport */
    .dots{
      position:absolute;
      left:0;
      right:0;
      top:100%;                 /* immediately below the viewport */
      margin-top:30px;          /* gap between viewport and dots */
      display:flex;
      justify-content:center;
      gap:24px;
      padding:0;
      z-index:999;              /* above images */
      pointer-events:auto;
    }

    .dot{
      width:var(--dot-size);
      height:var(--dot-size);
      border-radius:50%;
      background:var(--dot-bg);
      border:0;
      cursor:pointer;
      padding:0;
      transition:transform 180ms ease, background 180ms ease;
      position:relative;
      z-index:0;
    }

    .dot::after{                /* increases the clickable region of the dot */
      content:'';
      position:absolute;
      inset-block:-8px;
      inset-inline:-8px;
      //background:#ff000030;
    }
    
    .dot[aria-current="true"]{
      background:var(--dot-color);
      transform:scale(var(--dot-selected-scale));
      z-index:-1;
    }

    .dot:focus{outline:3px solid rgba(255,255,255,.12)}

    /* Full-height arrow areas */
    .nav{
      opacity:0%;
      position:absolute;
      top:0;
      bottom:0;
      width:20%;
      display:flex;
      align-items:center;
      justify-content:center;
      background:rgba(0,0,0,.35);
      color:white;
      border:0;
      cursor:pointer;
      padding:0;
      z-index:50;
    }
    .nav.left{ left:0; }
    .nav.right{ right:0; transform: rotate(180deg);}
    .nav svg{width:22px;height:22px;pointer-events:none}
    //.nav:active{transform:translateY(0) scale(.98)}

    /* Small accessible hit targets on mobile */
    @media (max-width:420px){
      :root{ --dot-size:10px; --w:100%; }
      .nav{width:48px}
    }
  </style>

  <div class="slideshow" id="slideshow" aria-roledescription="slideshow">
    <div class="viewport">
      <div class="slides" id="slides"></div>
    </div>

    <button class="nav left" id="prev" aria-label="Previous slide">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>

    <button class="nav right" id="next" aria-label="Next slide">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>

    <div class="dots" id="dots" role="tablist" aria-label="Slide dots"></div>
  </div>
`;

class Slideshow extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(slideshowTemplate.content.cloneNode(true));
  }

  // Optional: observed attributes
  static get observedAttributes() { return ['highlight']; }
  attributeChangedCallback(name, oldVal, newVal) {
    if (name === 'highlight') {
      this.shadowRoot.host.style.boxShadow = newVal !== null ? '0 0 0 3px rgba(255,200,0,0.2)' : '';
    }
  }

  // Slideshow behaviors
  connectedCallback(){
    const slidesEl = this.shadowRoot.getElementById('slides');
    const dotsEl = this.shadowRoot.getElementById('dots');
    const prevBtn = this.shadowRoot.getElementById('prev');
    const nextBtn = this.shadowRoot.getElementById('next');
    
    //Append all children img as slides
    const childs = Array.from(this.querySelectorAll('img'));
    childs.forEach((child) => {
      slidesEl.appendChild(child);
    });

    const imgs = Array.from(slidesEl.querySelectorAll('img'));
    let current = 0;

    if (imgs.length === 0) return;

    // Initialize stacking order and first active
    imgs.forEach((img, i) => {
      if (i === 0) img.classList.add('is-active');
      img.style.zIndex = imgs.length - i;
    });

    // Build dots dynamically
    imgs.forEach((img, i) => {
      const btn = document.createElement('button');
      btn.className = 'dot';
      btn.type = 'button';
      btn.setAttribute('aria-label', `Go to slide ${i+1}`);
      btn.setAttribute('role','tab');
      btn.addEventListener('click', () => goTo(i));
      btn.addEventListener('mouseover', () => goTo(i));
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goTo(i); }
      });
      dotsEl.appendChild(btn);
    });

    const dotNodes = Array.from(dotsEl.children);

    function update() {
      imgs.forEach((img, i) => {
        if (i === current) {
          img.classList.add('is-active');
          img.style.zIndex = imgs.length + 1; // bring forward
        } else {
          img.classList.remove('is-active');
          img.style.zIndex = imgs.length - i;
        }
      });
      dotNodes.forEach((d, i) => d.setAttribute('aria-current', i === current ? 'true' : 'false'));
    }

    function goTo(index) {
      current = (index + imgs.length) % imgs.length;
      update();
    }

    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));

    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goTo(current - 1);
      if (e.key === 'ArrowRight') goTo(current + 1);
    });

    // Touch swipe
    let startX = null;
    slidesEl.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; });
    slidesEl.addEventListener('touchend', (e) => {
      if (startX == null) return;
      const dx = (e.changedTouches[0].clientX - startX);
      if (Math.abs(dx) > 40) goTo(current - Math.sign(dx));
      startX = null;
    });

    // Init
    update();

    // Expose API
    const slideshow = this.shadowRoot.getElementById('slideshow');
    slideshow.slideshowGoTo = goTo;
    slideshow.slideshowNext = () => goTo(current + 1);
    slideshow.slideshowPrev = () => goTo(current - 1);
  }
};

customElements.define('my-slideshow', Slideshow);
export default Slideshow;