// The demo store of the old cut — AURORA — and its 24 "New Arrivals". Art is the
// site's own product illustrations (public/products), tinted per tile.
window.AURORA = [
  ['Camden Trench', 149, 'tote', '#ece6da'], ['Shell Jacket', 164, 'cap', '#e4e8ea'], ['Oud Eau de Parfum', 98, 'perfume-rose', '#efe4d9'],
  ['Soft Loafer', 129, 'sneaker', '#efe9df'], ['Bias Skirt', 118, 'tee', '#e9ecd9'], ['Cloud Pant', 112, 'tee', '#e6e9ee'],
  ['Vista Sunglasses', 95, 'watch', '#ebe6dd'], ['Trailhead Pack', 139, 'tote', '#e4e6dd'], ['Curve Vase', 54, 'bottle', '#f0ebe2'],
  ['Wool Scarf', 76, 'tee', '#e9e0d3'], ['Linen Overshirt', 128, 'cap', '#ede8dd'], ['Standard Denim', 96, 'tee', '#dfe3ea'],
  ['Field Tote', 68, 'tote', '#ede3d4'], ['Ridge Wool Sweater', 165, 'tee', '#efe8da'], ['Aurora Low', 142, 'sneaker', '#eaeae6'],
  ['Clarity Serum', 64, 'bottle', '#e7eeea'], ['Pulse Buds', 129, 'headphones', '#eceff0'], ['Alpine Throw', 98, 'tote', '#eee6d8'],
  ['Ceremonial Matcha', 32, 'mug', '#e3ecdc'], ['Ember Candle', 38, 'candle-amber', '#f0e3d3'], ['Everyday Tee', 42, 'tee', '#efede6'],
  ['Matte Lip 04', 28, 'perfume-rose', '#f1e2e0'], ['Cold Brew Concentrate', 22, 'bottle', '#ebe4da'], ['Port Hub 7', 89, 'box', '#e6e8ea'],
];
window.tile = (p, i, opts = {}) => `<div class="p ${opts.cls || ''}" style="--tint:${p[3]}"><div class="im"><img src="../assets/products/${p[2]}.svg"></div>
  ${opts.flag ? `<span class="fl">${opts.flag}</span>` : ''}<span class="no">${i + 1}</span><div class="nm">${p[0]}</div><div class="pr">$${p[1]}</div></div>`;
window.shop = (title, count, inner, opts = {}) => `<div class="shop ${opts.cls || ''}"><div class="nav">AURORA<span><b>New Arrivals</b><b>Apparel</b><b>Home</b><b>Beauty</b><b>Journal</b></span></div>
  <h3>${title}<small>${count} PRODUCTS</small></h3>${inner}</div>`;
