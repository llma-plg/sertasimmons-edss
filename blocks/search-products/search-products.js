// blocks/search-products/search-products.js
const SAMPLE_DATA = [
  {
    name: 'T&N Original Mattress',
    description: 'Foam mattress with T&N Flex Foam and T&N Adaptive foam for responsive, bounce-back support.',
    image_url: 'https://www.tuftandneedle.com/cdn/shop/files/OG_mattress.jpg',
    price: 'Starting at $645',
    category: 'Mattresses',
    brand: 'Tuft & Needle'
  },
  {
    name: 'T&N Original Hybrid Mattress',
    description: 'Combines the T&N Original feel with individually-wrapped coils for motion control between sleepers.',
    image_url: 'https://www.tuftandneedle.com/cdn/shop/files/OGHybrid-Hero-01_2x_263d07f2-7207-4a99-ad31-c59222e9f117.jpg',
    price: 'Starting at $995',
    category: 'Mattresses',
    brand: 'Tuft & Needle'
  },
  {
    name: 'T&N Mint Mattress',
    description: 'Award-winning foam mattress with 2x T&N Flex and Adaptive foam for added cooling and contouring.',
    image_url: 'https://www.tuftandneedle.com/cdn/shop/files/2604-TN-NL-OptPDP-Mint-Foam-Carousel-NapLap-Hero-v2.jpg',
    price: 'Starting at $795',
    category: 'Mattresses',
    brand: 'Tuft & Needle'
  }
];

const PALETTE = ['#ffd400', '#346e4a', '#3860be'];
const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0,2),16), parseInt(hex.slice(2,4),16), parseInt(hex.slice(4,6),16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s=c/255; return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4); };
  const relLum = (r,g,b) => 0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if (relLum(r,g,b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo=0, hi=1;
  for (let i=0; i<20; i++) {
    const m=(lo+hi)/2;
    if (relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m)) > 0.12) hi=m; else lo=m;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return { bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`, fg:'#ffffff' };
}

export default async function decorate(block, bridge) {
  let products;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      products = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      products = structuredContent?.products || [];
    }
  } else {
    products = SAMPLE_DATA;
  }

  block.textContent = '';
  const theme = getThemedCardBg(PALETTE);
  renderCarousel(block, products, theme, bridge);

  if (bridge) {
    bridge.reportSize(block.offsetWidth, block.offsetHeight);
    let resizeTimer;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => bridge.reportSize(block.offsetWidth, block.offsetHeight), 150);
    });
    ro.observe(block);
  }
}

function renderCarousel(block, products, theme, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const carousel = document.createElement('div');
  carousel.className = 'carousel';
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-label', 'Product carousel');

  products.forEach((product, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'image-container';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };

    if (product.image_url) {
      const img = document.createElement('img');
      img.src = product.image_url;
      img.alt = product.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => {
        if (img.parentNode) {
          img.parentNode.replaceChild(colorDiv(), img);
        }
      };
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-button';
    ctaBtn.textContent = 'View Details';
    ctaBtn.setAttribute('aria-label', `View details for ${product.name || 'product'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about the ${product.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);

    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'card-content';
    content.style.cssText = `background: ${theme?.bg ?? '#1a1a1a'}; color: ${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = product.name || '';
    name.style.color = theme?.fg ?? '#fff';
    content.appendChild(name);

    const brand = document.createElement('div');
    brand.className = 'product-brand';
    brand.textContent = product.brand || '';
    brand.style.color = theme?.fg ?? '#fff';
    content.appendChild(brand);

    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = product.price || '';
    price.style.color = theme?.fg ?? '#fff';
    priceRow.appendChild(price);

    if (product.category) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = product.category;
      priceRow.appendChild(badge);
    }

    content.appendChild(priceRow);
    card.appendChild(content);
    carousel.appendChild(card);
  });

  wrapper.appendChild(carousel);

  const leftBtn = document.createElement('button');
  leftBtn.className = 'nav-arrow left';
  leftBtn.innerHTML = '◀';
  leftBtn.setAttribute('aria-label', 'Scroll left');
  leftBtn.style.display = 'none';
  leftBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: -236, behavior: 'smooth' });
  });
  leftBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: -236, behavior: 'smooth' });
    }
  });

  const rightBtn = document.createElement('button');
  rightBtn.className = 'nav-arrow right';
  rightBtn.innerHTML = '▶';
  rightBtn.setAttribute('aria-label', 'Scroll right');
  rightBtn.addEventListener('click', () => {
    carousel.scrollBy({ left: 236, behavior: 'smooth' });
  });
  rightBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      carousel.scrollBy({ left: 236, behavior: 'smooth' });
    }
  });

  const updateArrows = () => {
    const atStart = carousel.scrollLeft <= 1;
    const atEnd = carousel.scrollLeft >= carousel.scrollWidth - carousel.clientWidth - 1;
    leftBtn.style.display = atStart ? 'none' : 'flex';
    rightBtn.style.display = atEnd ? 'none' : 'flex';
  };

  carousel.addEventListener('scroll', updateArrows);
  updateArrows();

  wrapper.appendChild(leftBtn);
  wrapper.appendChild(rightBtn);

  const fade = document.createElement('div');
  fade.className = 'fade-gradient';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  block.appendChild(wrapper);
}