// Sample data for standalone/preview mode.
// In production, data comes dynamically from bridge.toolResult.
const SAMPLE_DATA = {
  name: 'T&N Original Mattress',
  description: 'Foam mattress with T&N Flex Foam and T&N Adaptive foam for responsive bounce-back support.',
  image_url: 'https://www.tuftandneedle.com/cdn/shop/files/oksvmhgrhub0norly5ko.jpg?v=1752099260&width=533',
  price: '$695.00-$1,345.00',
  category: 'Foam Mattress',
  brand: 'Tuft & Needle'
};

// Brand palette from BuildWidgetRequest
const PALETTE = ['#ffd400','#346e4a','#3860be'];

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
      product = SAMPLE_DATA;
    } else {
      const _result = await bridge.toolResult;
      const structuredContent = _result?.structuredContent || _result;
      product = structuredContent;
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
  if (!product || !product.name) {
    block.textContent = 'No product data available.';
    return;
  }

  const card = document.createElement('div');
  card.className = 'product-detail-card';

  // Image container (left side)
  const imageContainer = document.createElement('div');
  imageContainer.className = 'product-image-container';

  if (product.image_url) {
    const img = document.createElement('img');
    img.src = product.image_url;
    img.alt = product.name || 'Product image';
    img.className = 'product-image';

    const fallbackColor = '#378ef0';
    img.onerror = () => {
      const colorDiv = document.createElement('div');
      colorDiv.style.cssText = `width:100%;height:100%;background-color:${fallbackColor};`;
      img.parentNode.replaceChild(colorDiv, img);
    };

    imageContainer.appendChild(img);
  } else {
    const colorDiv = document.createElement('div');
    colorDiv.style.cssText = 'width:100%;height:100%;background-color:#378ef0;';
    imageContainer.appendChild(colorDiv);
  }

  // CTA button on image
  const ctaBtn = document.createElement('button');
  ctaBtn.className = 'cta-btn-on-image';
  ctaBtn.textContent = 'Learn More';
  if (bridge) {
    ctaBtn.addEventListener('click', () => {
      bridge.sendMessage(`Tell me more about ${product.name}`);
    });
  }
  imageContainer.appendChild(ctaBtn);

  card.appendChild(imageContainer);

  // Content container (right side)
  const contentContainer = document.createElement('div');
  contentContainer.className = 'product-content';
  contentContainer.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

  // Brand label
  if (product.brand) {
    const brandLabel = document.createElement('div');
    brandLabel.className = 'product-brand';
    brandLabel.textContent = product.brand;
    contentContainer.appendChild(brandLabel);
  }

  // Product name
  const name = document.createElement('h3');
  name.className = 'product-name';
  name.textContent = product.name;
  contentContainer.appendChild(name);

  // Description
  if (product.description) {
    const desc = document.createElement('p');
    desc.className = 'product-description';
    desc.textContent = product.description;
    contentContainer.appendChild(desc);
  }

  // Price
  if (product.price) {
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = product.price;
    contentContainer.appendChild(price);
  }

  // Category badge
  if (product.category) {
    const categoryBadge = document.createElement('span');
    categoryBadge.className = 'product-category';
    categoryBadge.textContent = product.category;
    contentContainer.appendChild(categoryBadge);
  }

  card.appendChild(contentContainer);
  block.appendChild(card);
}
