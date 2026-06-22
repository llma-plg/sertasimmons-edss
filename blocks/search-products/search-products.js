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

const PALETTE = ['#ffd400','#346e4a','#3860be'];

function getThemedCardBg(palette) {
  if (!palette || !palette[0]) return null;
  let hex = palette[0].replace('#','');
  if(hex.length===3)hex=hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  if(hex.length!==6)return null;
  let [r,g,b]=[parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)];
  if(isNaN(r)||isNaN(g)||isNaN(b))return null;
  const lum=(c)=>{const s=c/255;return s<=0.03928?s/12.92:Math.pow((s+0.055)/1.055,2.4);};
  const relLum=(r,g,b)=>0.2126*lum(r)+0.7152*lum(g)+0.0722*lum(b);
  if(relLum(r,g,b)<=0.12)return{bg:`#${hex}`,fg:'#ffffff'};
  let lo=0,hi=1;
  for(let i=0;i<20;i++){const m=(lo+hi)/2;if(relLum(Math.round(r*m),Math.round(g*m),Math.round(b*m))>0.12)hi=m;else lo=m;}
  const dr=Math.round(r*lo),dg=Math.round(g*lo),db=Math.round(b*lo);
  return{bg:`#${dr.toString(16).padStart(2,'0')}${dg.toString(16).padStart(2,'0')}${db.toString(16).padStart(2,'0')}`,fg:'#ffffff'};
}

const CARD_COLORS = ['#378ef0','#9256d9','#0fb5ae','#e68619','#d83790','#2dca72','#4046ca','#72b340'];

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
  const theme = getThemedCardBg(PALETTE);
  renderCarousel(block, items, bridge, theme);

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

function renderCarousel(block, items, bridge, theme) {
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const container = document.createElement('div');
  container.className = 'carousel-container';

  items.slice(0, 5).forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    const imageContainer = document.createElement('div');
    imageContainer.className = 'product-image';

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
    ctaBtn.className = 'cta-overlay';
    ctaBtn.textContent = 'View Details';
    if (bridge) {
      ctaBtn.addEventListener('click', () => {
        bridge.sendMessage(`Tell me more about ${item.name}`);
      });
    }
    imageContainer.appendChild(ctaBtn);
    card.appendChild(imageContainer);

    const content = document.createElement('div');
    content.className = 'product-content';
    content.style.cssText = `background:${theme?.bg ?? '#1a1a1a'};color:${theme?.fg ?? '#fff'}`;

    const name = document.createElement('h3');
    name.className = 'product-name';
    name.textContent = item.name || '';
    content.appendChild(name);

    const brand = document.createElement('p');
    brand.className = 'product-brand';
    brand.textContent = item.brand || '';
    content.appendChild(brand);

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

    content.appendChild(priceRow);
    card.appendChild(content);
    container.appendChild(card);
  });

  const leftArrow = document.createElement('button');
  leftArrow.className = 'nav-arrow left-arrow';
  leftArrow.setAttribute('aria-label', 'Scroll left');
  leftArrow.textContent = '◀';
  leftArrow.style.display = 'none';

  const rightArrow = document.createElement('button');
  rightArrow.className = 'nav-arrow right-arrow';
  rightArrow.setAttribute('aria-label', 'Scroll right');
  rightArrow.textContent = '▶';

  const updateArrows = () => {
    const scrollLeft = container.scrollLeft;
    const maxScroll = container.scrollWidth - container.clientWidth;
    leftArrow.style.display = scrollLeft <= 0 ? 'none' : 'flex';
    rightArrow.style.display = scrollLeft >= maxScroll - 1 ? 'none' : 'flex';
  };

  const scrollByCard = (direction) => {
    const cardWidth = 220 + 16;
    container.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  };

  leftArrow.addEventListener('click', () => scrollByCard(-1));
  rightArrow.addEventListener('click', () => scrollByCard(1));

  [leftArrow, rightArrow].forEach(arrow => {
    arrow.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        arrow.click();
      }
    });
  });

  container.addEventListener('scroll', updateArrows);

  const fade = document.createElement('div');
  fade.className = 'fade-overlay';
  fade.style.cssText = `position:absolute;top:0;right:0;height:100%;width:60px;background:linear-gradient(to right,transparent,${theme?.bg ?? '#1a1a1a'}cc);pointer-events:none;border-radius:0 10px 10px 0;`;

  wrapper.appendChild(leftArrow);
  wrapper.appendChild(container);
  wrapper.appendChild(rightArrow);
  wrapper.appendChild(fade);
  block.appendChild(wrapper);

  updateArrows();
}
