// Sample data for standalone EDS preview (no bridge).
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = [
  {
    "name": "T&N Original Mattress",
    "description": "Foam mattress with T&N Adaptive foam for responsive, bounce-back support.",
    "image_url": "https://www.tuftandneedle.com/cdn/shop/files/OG_mattress.jpg",
    "price": "$695.00-$1,345.00",
    "category": "Foam Mattress",
    "brand": "Tuft & Needle"
  },
  {
    "name": "T&N Original Hybrid Mattress",
    "description": "Original foam comfort plus individually-wrapped coils for motion control between sleepers.",
    "image_url": "https://www.tuftandneedle.com/cdn/shop/files/OGHybrid-Hero-01_2x_263d07f2-7207-4a99-ad31-c59222e9f117.jpg",
    "price": "$1,045.00-$2,045.00",
    "category": "Hybrid Mattress",
    "brand": "Tuft & Needle"
  },
  {
    "name": "T&N Mint Mattress",
    "description": "Award-winning foam mattress with 2x T&N Flex and Adaptive foam for extra cooling and contouring.",
    "image_url": "https://www.tuftandneedle.com/cdn/shop/files/2604-TN-NL-OptPDP-Mint-Foam-Carousel-NapLap-Hero-v2.jpg",
    "price": "$845.00-$1,845.00",
    "category": "Foam Mattress",
    "brand": "Tuft & Needle"
  },
  {
    "name": "T&N Mint Hybrid Mattress",
    "description": "Most responsive build with micro coils for support and wrapped coils for best-in-class motion control.",
    "image_url": "https://www.tuftandneedle.com/cdn/shop/files/Mint-hybrid_fe5784d4-35b9-455a-9eb5-d7efd0e4f0d6.png",
    "price": "$1,445.00-$2,645.00",
    "category": "Hybrid Mattress",
    "brand": "Tuft & Needle"
  }
];

// Brand palette from BuildWidgetRequest.
const PALETTE = ['#ffd400', '#346e4a', '#3860be'];

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
    const mid=(lo+hi)/2;
    if (relLum(Math.round(r*mid),Math.round(g*mid),Math.round(b*mid)) > 0.12) hi=mid; else lo=mid;
  }
  const dr=Math.round(r*lo), dg=Math.round(g*lo), db=Math.round(b*lo);
  return {
    bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,
    fg:'#ffffff'
  };
}

const theme = getThemedCardBg(PALETTE);

export default async function decorate(block, bridge) {
  let product;

  if (bridge) {
    bridge.applyHostStyles();
    const isPreview = bridge.hostContext?.preview === true;
    if (isPreview) {
      product = SAMPLE_DATA[0];
    } else {
      // Production — structuredContent is the single product object
      const result = await bridge.toolResult;
      const structuredContent = result?.structuredContent || result;
      product = structuredContent;
    }
  } else {
    // Standalone EDS preview
    product = SAMPLE_DATA[0];
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
  if (!product) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = 'No product details available';
    block.appendChild(empty);
    return;
  }

  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Left side: Image with CTA overlay
  const imageSection = document.createElement('div');
  imageSection.className = 'image-section';

  if (product.image_url) {
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name || 'Product image';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = 'width:100%;height:100%;background-color:#378ef0;';
    img.onerror = () => {
      if (img.parentNode) {
        img.parentNode.replaceChild(colorDiv, img);
      }
    };
    imageSection.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = 'width:100%;height:100%;background-color:#378ef0;';
    imageSection.appendChild(colorDiv);
  }

  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'image-cta';
  ctaBtn.textContent = 'Learn More';
  ctaBtn.setAttribute('aria-label', `Learn more about ${product.name || 'this product'}`);
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${product.name}`);
    });
  }
  imageSection.appendChild(ctaBtn);

  card.appendChild(imageSection);

  // Right side: Product info with darkened palette background
  const infoSection = document.createElement('div');
  infoSection.className = 'info-section';
  infoSection.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'};`;

  const nameEl = document.createElement('h3');
  nameEl.className = 'product-name';
  nameEl.textContent = product.name || 'Untitled Product';
  infoSection.appendChild(nameEl);

  if (product.brand) {
    const brandEl = document.createElement('div');
    brandEl.className = 'product-brand';
    brandEl.textContent = product.brand;
    infoSection.appendChild(brandEl);
  }

  if (product.description) {
    const descEl = document.createElement('p');
    descEl.className = 'product-description';
    descEl.textContent = product.description;
    infoSection.appendChild(descEl);
  }

  if (product.price) {
    const priceEl = document.createElement('div');
    priceEl.className = 'product-price';
    priceEl.textContent = product.price;
    infoSection.appendChild(priceEl);
  }

  if (product.category) {
    const categoryEl = document.createElement('span');
    categoryEl.className = 'product-category';
    categoryEl.textContent = product.category;
    infoSection.appendChild(categoryEl);
  }

  card.appendChild(infoSection);
  block.appendChild(card);
}
