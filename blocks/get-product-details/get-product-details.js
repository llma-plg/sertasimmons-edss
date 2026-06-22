// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'T&N Original Mattress',
  description: 'Foam mattress with T&N Flex Foam and T&N Adaptive foam for responsive, bounce-back support.',
  image_url: 'https://www.tuftandneedle.com/cdn/shop/files/OG_mattress.jpg',
  price: 'Starting at $645',
  category: 'Mattresses',
  brand: 'Tuft & Needle'
};

// Brand palette from BuildWidgetRequest — used to derive card info-strip background.
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
  return {
    bg: `#${dr.toString(16).padStart(2, '0')}${dg.toString(16).padStart(2, '0')}${db.toString(16).padStart(2, '0')}`,
    fg: '#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let product;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      product = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      product = structuredContent || {};
    }
  } else {
    product = SAMPLE_DATA;
  }

  block.textContent = '';
  renderProduct(block, product, bridge);

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

function renderProduct(block, product, bridge) {
  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left side: Image container with CTA
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image-container';

  const CARD_COLORS = ['#378ef0', '#9256d9', '#0fb5ae', '#e68619', '#d83790', '#2dca72', '#4046ca', '#72b340'];
  const fallbackColor = CARD_COLORS[0];

  const colorDiv = () => {
    const d = document.createElement('div');
    d.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
    return d;
  };

  if (product.image_url) {
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name || 'Product image';
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

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn';
  ctaBtn.textContent = 'Learn More';
  ctaBtn.setAttribute('aria-label', `Learn more about ${product.name || 'this product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${product.name || 'this product'}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  // Right side: Product info with darkened palette background
  const infoContainer = document.createElement('div');
  infoContainer.className = 'product-info-container';
  infoContainer.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  // Brand
  if (product.brand) {
    const brand = document.createElement('div');
    brand.className = 'product-brand';
    brand.textContent = product.brand;
    brand.style.color = theme?.fg ?? '#fff';
    infoContainer.appendChild(brand);
  }

  // Name
  if (product.name) {
    const name = document.createElement('h2');
    name.className = 'product-name';
    name.textContent = product.name;
    name.style.color = theme?.fg ?? '#fff';
    infoContainer.appendChild(name);
  }

  // Description
  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    desc.style.color = theme?.fg ?? '#fff';
    infoContainer.appendChild(desc);
  }

  // Price
  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    price.style.color = theme?.fg ?? '#fff';
    infoContainer.appendChild(price);
  }

  // Category badge
  if (product.category) {
    const category = document.createElement('span');
    category.className = 'product-category';
    category.textContent = product.category;
    infoContainer.appendChild(category);
  }

  card.appendChild(infoContainer);
  block.appendChild(card);
}