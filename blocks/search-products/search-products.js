// Sample data for standalone EDS preview
const SAMPLE_DATA = [
  {
    name: 'T&N Original Mattress',
    description: 'Foam mattress with T&N Flex Foam and T&N Adaptive foam for responsive bounce-back support.',
    image_url: 'https://www.tuftandneedle.com/cdn/shop/files/oksvmhgrhub0norly5ko.jpg?v=1752099260&width=533',
    price: '$695.00-$1,345.00',
    category: 'Foam Mattress',
    brand: 'Tuft & Needle'
  },
  {
    name: 'Beautyrest Black Series One',
    description: 'Luxury mattress featuring Triple-Stranded Pocketed Coil Technology for advanced individualized support and motion separation.',
    image_url: 'https://www.beautyrest.com/s/files/1/0666/8841/7984/files/2405-BR-PDP-Black-S1_EXFM_Carousel-01_2x_14a54c6b-2758-40c3-b675-94155aa61a21.jpg',
    price: '$1,749-$3,199',
    category: 'Mattress',
    brand: 'Beautyrest'
  },
  {
    name: 'T&N Mint Mattress',
    description: 'Foam mattress with 2x T&N Flex foam and 2x T&N Adaptive foam for extra cooling and contouring, named best foam mattress by NapLab.',
    image_url: 'https://www.tuftandneedle.com/cdn/shop/files/2604-TN-NL-OptPDP-Mint-Foam-Carousel-NapLap-Hero-v2.jpg?v=1779210844&width=533',
    price: '$845.00-$1,845.00',
    category: 'Foam Mattress',
    brand: 'Tuft & Needle'
  },
  {
    name: 'Beautyrest Black Hybrid Series Three XCS',
    description: 'Premium hybrid mattress with 30% more cooling power and advanced support for all sleep positions.',
    image_url: 'https://www.beautyrest.com/s/files/1/0666/8841/7984/files/BR26-BR-PDP-BHXCS-S3-FM-Hero_2x_890b35e2-379d-4c64-9868-415fe310b81f.jpg',
    price: '$2,849-$4,699',
    category: 'Hybrid Mattress',
    brand: 'Beautyrest'
  },
  {
    name: 'T&N Original Hybrid Mattress',
    description: 'Everything from the T&N Original plus individually-wrapped coils for motion control between sleepers.',
    image_url: 'https://www.tuftandneedle.com/cdn/shop/files/OGHybrid-Hero-01_2x_263d07f2-7207-4a99-ad31-c59222e9f117.jpg?v=1752099249&width=533',
    price: '$1,045.00-$2,045.00',
    category: 'Hybrid Mattress',
    brand: 'Tuft & Needle'
  },
  {
    name: 'Beautyrest World Class',
    description: 'Premier collection with 1000 Density Pocketed Coil Technology and foams that react to body temperature for pressure relief.',
    image_url: 'https://www.beautyrest.com/adobe/assets/urn:aaid:aem:48a9723c-c43d-498a-81cc-f19fc58b7b80/as/July4th_2up-WC@2x.avif',
    price: 'Starting at $1,299',
    category: 'Mattress',
    brand: 'Beautyrest'
  }
];

const PALETTE = ['#ffd400', '#346e4a', '#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return null;
  let [r, g, b] = [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)];
  if (isNaN(r) || isNaN(g) || isNaN(b)) return null;
  const lum = (c) => { const s = c / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
  const relLum = (r, g, b) => 0.2126 * lum(r) + 0.7152 * lum(g) + 0.0722 * lum(b);
  if (relLum(r, g, b) <= 0.12) return { bg: `#${hex}`, fg: '#ffffff' };
  let lo = 0, hi = 1;
  for (let i = 0; i < 20; i++) {
    const m = (lo + hi) / 2;
    if (relLum(Math.round(r * m), Math.round(g * m), Math.round(b * m)) > 0.12) hi = m; else lo = m;
  }
  const dr = Math.round(r * lo), dg = Math.round(g * lo), db = Math.round(b * lo);
  return { bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`, fg: '#ffffff' };
}

const theme = getThemedCardBg(PALETTE);

const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];

export default async function decorate(block, bridge) {
  let items;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      items = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      // structuredContent.products — bare array outputSchema; key derived from actionName "search_products"
      items = structuredContent?.products || [];
    }
  } else {
    items = SAMPLE_DATA;
  }

  block.textContent = '';
  renderCarousel(block, items, bridge);

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

function renderCarousel(block, items, bridge) {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const scrollContainer = document.createElement('div');
  scrollContainer.className = 'carousel-scroll';

  items.slice(0, 6).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'card-image';

    const fallbackColor = CARD_COLORS[i % CARD_COLORS.length];
    const colorDiv = () => {
      const d = document.createElement('div');
      d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      return d;
    };

    if (item.image_url) {
      const img = document.createElement('img');
      img.src = item.image_url;
      img.alt = item.name || '';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
      img.onerror = () => img.parentNode.replaceChild(colorDiv(), img);
      imageContainer.appendChild(img);
    } else {
      imageContainer.appendChild(colorDiv());
    }

    const ctaBtn = document.createElement('button');
    ctaBtn.className = 'cta-button';
    ctaBtn.textContent = 'View Details';
    ctaBtn.setAttribute('aria-label', `View details for ${item.name || 'product'}`);
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
    card.appendChild(imageContainer);

    const cardInfo = document.createElement('div');
    cardInfo.className = 'card-info';
    cardInfo.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = item.name || '';
    cardInfo.appendChild(name);

    const brand = document.createElement('div');
    brand.className = 'product-brand';
    brand.textContent = item.brand || '';
    cardInfo.appendChild(brand);

    const priceRow = document.createElement('div');
    priceRow.className = 'price-row';

    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = item.price || '';
    priceRow.appendChild(price);

    if (item.category) {
      const badge = document.createElement('span');
      badge.className = 'category-badge';
      badge.textContent = item.category;
      priceRow.appendChild(badge);
    }

    cardInfo.appendChild(priceRow);
    card.appendChild(cardInfo);
    scrollContainer.appendChild(card);
  });

  wrapper.appendChild(scrollContainer);

  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow left-arrow';
  leftArrow.innerHTML = '◀';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.style.display = 'none';
  wrapper.appendChild(leftArrow);

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow right-arrow';
  rightArrow.innerHTML = '▶';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  wrapper.appendChild(rightArrow);

  const fade = document.createElement('div');
  fade.className = 'fade-gradient';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;
  wrapper.appendChild(fade);

  block.appendChild(wrapper);

  const cardWidth = 220 + 16;
  const updateArrows = () => {
    const atStart = scrollContainer.scrollLeft <= 1;
    const atEnd = scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth - 1;
    leftArrow.style.display = atStart ? 'none' : 'flex';
    rightArrow.style.display = atEnd ? 'none' : 'flex';
    fade.style.display = atEnd ? 'none' : 'block';
  };

  scrollContainer.addEventListener('scroll', updateArrows);
  updateArrows();

  const scrollBy = (direction) => {
    scrollContainer.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  leftArrow.addEventListener('click', () => scrollBy(-1));
  rightArrow.addEventListener('click', () => scrollBy(1));

  [leftArrow, rightArrow].forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });
}