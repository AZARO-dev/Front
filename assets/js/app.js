/* rerun — vintage anime tees
 * Shared header/footer, cart (localStorage), and page renderers.
 * No build step, no dependencies.
 */
(function () {
  "use strict";

  var SHOP = window.SHOP || {};
  var PRODUCTS = window.PRODUCTS || [];
  var CART_KEY = "rerun-cart-v1";

  /* ---------- helpers ---------- */

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function money(n) { return (SHOP.currencySymbol || "$") + Number(n).toFixed(0); }
  function toInches(cm) { return (cm / 2.54).toFixed(1); }
  function byId(id) { for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i]; return null; }
  function pageName() { var el = document.querySelector("[data-page]"); return el ? el.getAttribute("data-page") : ""; }
  function hashId() { try { return decodeURIComponent(location.hash.slice(1)); } catch (e) { return location.hash.slice(1); } }
  function era(year) { return year < 1990 ? "80s" : year < 2000 ? "90s" : "00s"; }

  var CONDITION = {
    A: "A — Excellent. Little to no wear.",
    B: "B — Good. Normal vintage wear, fading or light marks.",
    C: "C — Fair. Visible flaws, priced accordingly.",
  };

  /* ---------- cart (one of each, so just a list of ids) ---------- */

  var memoryCart = [];
  function readCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      var ids = raw ? JSON.parse(raw) : [];
      return Array.isArray(ids) ? ids.filter(function (id) { return byId(id); }) : [];
    } catch (e) { return memoryCart.slice(); }
  }
  function writeCart(ids) {
    memoryCart = ids.slice();
    try { window.localStorage.setItem(CART_KEY, JSON.stringify(ids)); } catch (e) { /* private mode */ }
    updateCartCount();
  }
  function inCart(id) { return readCart().indexOf(id) !== -1; }
  function addToCart(id) { var c = readCart(); if (c.indexOf(id) === -1) { c.push(id); writeCart(c); } }
  function removeFromCart(id) { writeCart(readCart().filter(function (x) { return x !== id; })); }
  function updateCartCount() {
    $all("[data-cart-count]").forEach(function (el) { el.textContent = readCart().length; });
  }

  /* ---------- placeholder artwork (drawn tees) ----------
   * Used until real photos are added to `images` in products.js.
   */

  var uid = 0;
  var TEE = "M155,58 C175,80 225,80 245,58 L308,76 L354,140 L306,166 L290,146 L292,348 Q200,354 108,348 L110,146 L94,166 L46,140 L92,76 Z";

  function motifSVG(p, cx, cy, s) {
    var ink = p.ink, body = p.color, label = esc(p.label || p.year);
    var t = function (y, size, weight, ls) {
      return '<text x="' + cx + '" y="' + y + '" text-anchor="middle" font-family="IBM Plex Mono, ui-monospace, monospace" font-size="' + size + '" font-weight="' + (weight || 500) + '" letter-spacing="' + (ls || 2) + '" fill="' + ink + '">' + label + "</text>";
    };
    switch (p.motif) {
      case "sun":
        return '<circle cx="' + cx + '" cy="' + (cy - 10) + '" r="' + 50 * s + '" fill="' + ink + '"/>' +
          [0, 1, 2, 3].map(function (i) { return '<rect x="' + (cx - 60) + '" y="' + (cy + 2 + i * 11) + '" width="120" height="' + (3 + i) + '" fill="' + body + '"/>'; }).join("") +
          t(cy + 78, 20, 600, 6);
      case "star": {
        var pts = [], R = 52 * s, r = 22 * s;
        for (var i = 0; i < 10; i++) { var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R; pts.push((cx + rr * Math.cos(a)).toFixed(1) + "," + (cy - 10 + rr * Math.sin(a)).toFixed(1)); }
        return '<polygon points="' + pts.join(" ") + '" fill="' + ink + '"/>' +
          '<circle cx="' + (cx - 58) + '" cy="' + (cy - 46) + '" r="4" fill="' + ink + '"/><circle cx="' + (cx + 60) + '" cy="' + (cy + 18) + '" r="3" fill="' + ink + '"/>' +
          t(cy + 72, 16, 600, 5);
      }
      case "grid": {
        var g = "", x0 = cx - 62, y0 = cy - 48, w = 124, h = 96;
        for (var gx = 0; gx <= 6; gx++) g += '<line x1="' + (x0 + gx * w / 6) + '" y1="' + y0 + '" x2="' + (x0 + gx * w / 6) + '" y2="' + (y0 + h) + '" stroke="' + ink + '" stroke-width="1.4"/>';
        for (var gy = 0; gy <= 5; gy++) g += '<line x1="' + x0 + '" y1="' + (y0 + gy * h / 5) + '" x2="' + (x0 + w) + '" y2="' + (y0 + gy * h / 5) + '" stroke="' + ink + '" stroke-width="1.4"/>';
        return g + '<rect x="' + (cx - 14) + '" y="' + (cy - 30) + '" width="28" height="56" fill="' + ink + '"/>' + t(cy + 76, 18, 600, 8);
      }
      case "badge":
        return '<circle cx="' + (cx + 42) + '" cy="' + (cy - 52) + '" r="24" fill="none" stroke="' + ink + '" stroke-width="3"/>' +
          '<circle cx="' + (cx + 42) + '" cy="' + (cy - 52) + '" r="8" fill="' + ink + '"/>' +
          '<text x="' + (cx + 42) + '" y="' + (cy - 14) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="2" fill="' + ink + '">' + label + "</text>";
      case "type":
        return '<text x="' + (cx + 40) + '" y="' + (cy - 46) + '" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-size="22" font-style="italic" fill="' + ink + '">twenty</text>' +
          '<text x="' + (cx + 40) + '" y="' + (cy - 30) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="8" letter-spacing="3" fill="' + ink + '">' + label + " 2001</text>";
      case "burst": {
        var b = [], n = 16;
        for (var k = 0; k < n * 2; k++) { var ang = k * Math.PI / n, rad = k % 2 ? 40 * s : 62 * s; b.push((cx + rad * Math.cos(ang)).toFixed(1) + "," + (cy + rad * Math.sin(ang)).toFixed(1)); }
        return '<polygon points="' + b.join(" ") + '" fill="' + ink + '"/>' +
          '<text x="' + cx + '" y="' + (cy + 7) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="18" font-weight="700" letter-spacing="2" fill="' + body + '">' + label + "</text>";
      }
      case "dots": {
        var d = "";
        for (var row = 0; row < 7; row++) for (var col = 0; col < 9; col++) {
          var rr2 = Math.max(0.6, 6.2 - row * 0.85);
          d += '<circle cx="' + (cx - 64 + col * 16) + '" cy="' + (cy - 54 + row * 14) + '" r="' + rr2.toFixed(1) + '" fill="' + ink + '"/>';
        }
        return d + t(cy + 70, 18, 600, 4);
      }
      case "stripes":
        return [0, 1, 2].map(function (i) { return '<rect x="110" y="' + (cy - 44 + i * 16) + '" width="182" height="9" fill="' + ink + '"/>'; }).join("") +
          '<text x="' + cx + '" y="' + (cy + 52) + '" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="40" font-weight="700" fill="' + ink + '">' + label + "</text>";
      case "heart":
        return '<path transform="translate(' + cx + "," + (cy - 14) + ") scale(" + 2.4 * s + ')" d="M0,14 C-22,-2 -14,-20 0,-9 C14,-20 22,-2 0,14 Z" fill="' + ink + '"/>' +
          '<circle cx="' + (cx - 54) + '" cy="' + (cy - 44) + '" r="3" fill="' + ink + '"/><circle cx="' + (cx + 52) + '" cy="' + (cy - 30) + '" r="2.5" fill="' + ink + '"/>' +
          t(cy + 62, 16, 600, 6);
      case "moon": {
        var mid = "m" + (++uid);
        return '<mask id="' + mid + '"><rect x="0" y="0" width="400" height="400" fill="#fff"/><circle cx="' + (cx + 22) + '" cy="' + (cy - 22) + '" r="46" fill="#000"/></mask>' +
          '<circle cx="' + cx + '" cy="' + (cy - 12) + '" r="54" fill="' + ink + '" mask="url(#' + mid + ')"/>' +
          '<rect x="' + (cx + 24) + '" y="' + (cy - 70) + '" width="3" height="120" fill="' + ink + '" transform="rotate(18 ' + cx + " " + cy + ')"/>' +
          t(cy + 72, 16, 600, 10);
      }
      case "pixel": {
        var map = ["001111100", "011111110", "110111011", "111111111", "111000111", "011111110", "010000010"], px = "";
        for (var r3 = 0; r3 < map.length; r3++) for (var c3 = 0; c3 < map[r3].length; c3++)
          if (map[r3][c3] === "1") px += '<rect x="' + (cx - 54 + c3 * 12) + '" y="' + (cy - 56 + r3 * 12) + '" width="12" height="12" fill="' + ink + '"/>';
        return px + t(cy + 54, 18, 600, 8);
      }
      default:
        return t(cy, 24, 600, 4);
    }
  }

  function shirtSVG(p, view) {
    var id = "fx" + (++uid);
    var body = p.color, ink = p.ink;
    var defs =
      "<defs>" +
      '<filter id="' + id + '" x="0" y="0" width="100%" height="100%">' +
      '<feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" seed="' + (uid % 9) + '" result="n"/>' +
      '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -5 0 0 0 3.55" result="m"/>' +
      '<feComposite in="SourceGraphic" in2="m" operator="in"/>' +
      "</filter>" +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".10"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".10"/></linearGradient>' +
      "</defs>";

    if (view === "tag") {
      return '<svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Neck tag: size ' + esc(p.size) + '" xmlns="http://www.w3.org/2000/svg">' + defs +
        '<rect width="400" height="400" fill="' + body + '"/>' +
        '<path d="M-20,90 C90,170 310,170 420,90 L420,140 C310,220 90,220 -20,140 Z" fill="' + body + '" stroke="rgba(0,0,0,.18)" stroke-width="2"/>' +
        '<rect width="400" height="400" fill="url(#' + id + 'g)"/>' +
        '<g transform="rotate(-2 200 230)">' +
        '<rect x="120" y="170" width="160" height="120" fill="#f6f3ea" stroke="rgba(0,0,0,.15)"/>' +
        '<text x="200" y="204" text-anchor="middle" font-family="Instrument Serif, Georgia, serif" font-style="italic" font-size="22" fill="#1b1b1b">Cotton Club</text>' +
        '<text x="200" y="238" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="24" font-weight="700" fill="#1b1b1b">' + esc(p.size) + "</text>" +
        '<text x="200" y="262" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="#1b1b1b">' + esc((p.fabric || "").toUpperCase()) + "</text>" +
        '<text x="200" y="277" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="9" letter-spacing="1.5" fill="#1b1b1b">MADE IN ' + esc((p.madeIn || "").toUpperCase()) + "</text>" +
        "</g></svg>";
    }

    var neck = view === "back"
      ? '<path d="M155,58 C175,68 225,68 245,58" fill="none" stroke="rgba(0,0,0,.25)" stroke-width="3"/>'
      : '<path d="M155,58 C175,84 225,84 245,58 C225,68 175,68 155,58 Z" fill="rgba(0,0,0,.22)"/>' +
        '<path d="M155,58 C175,84 225,84 245,58" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="5"/>';

    var print = view === "back"
      ? '<text x="200" y="128" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="11" letter-spacing="4" fill="' + ink + '">' + (String(p.label) === String(p.year) ? esc(p.category || "").toUpperCase() : esc(p.label || "")) + " · " + esc(p.year) + "</text>"
      : motifSVG(p, 200, 196, 1);

    return '<svg viewBox="0 0 400 400" role="img" aria-label="' + esc(p.title) + " — " + view + '" xmlns="http://www.w3.org/2000/svg">' + defs +
      '<path d="' + TEE + '" fill="' + body + '"/>' +
      '<g filter="url(#' + id + ')">' + print + "</g>" +
      neck +
      '<path d="M92,76 L110,146 M308,76 L290,146" stroke="rgba(0,0,0,.12)" stroke-width="1.5" fill="none"/>' +
      '<path d="M112,338 Q200,344 288,338" stroke="rgba(0,0,0,.18)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>' +
      '<path d="M60,148 L98,160 M340,148 L302,160" stroke="rgba(0,0,0,.18)" stroke-width="1" stroke-dasharray="3 3" fill="none"/>' +
      '<path d="' + TEE + '" fill="url(#' + id + 'g)"/>' +
      '<path d="M150,210 Q170,260 160,330 M250,180 Q236,250 248,320" stroke="rgba(0,0,0,.05)" stroke-width="8" fill="none"/>' +
      "</svg>";
  }

  function media(p, index) {
    var views = ["front", "back", "tag"];
    if (p.images && p.images[index]) {
      return '<img src="' + esc(p.images[index]) + '" alt="' + esc(p.title) + " — photo " + (index + 1) + '" loading="lazy">';
    }
    return shirtSVG(p, views[index] || "front");
  }
  function mediaCount(p) { return p.images && p.images.length ? p.images.length : 3; }

  /* ---------- shared chrome ---------- */

  function renderHeader() {
    var el = $("#site-header");
    if (!el) return;
    var page = pageName();
    var link = function (href, label, key) {
      return '<a href="' + href + '"' + (page === key ? ' aria-current="page"' : "") + ">" + label + "</a>";
    };
    var ship = SHOP.freeShippingOver ? "Free worldwide shipping over " + money(SHOP.freeShippingOver) : "Shipping worldwide from Japan";
    el.innerHTML =
      '<div class="notice mono"><span class="hide-sm">Ships from Tokyo to anywhere &nbsp;/&nbsp; </span>' + esc(ship) + "</div>" +
      '<header class="site-header wrap">' +
      '<a class="logo" href="index.html" aria-label="' + esc(SHOP.name) + ' home">' + esc(SHOP.name) + '<span class="logo-dot">.</span><span class="logo-jp" lang="ja">再放送</span></a>' +
      '<nav class="nav" aria-label="Main">' +
      link("index.html", "Shop", "shop") +
      link("about.html", "About", "about") +
      link("info.html", "Info", "info") +
      link("cart.html", 'Cart (<span data-cart-count>0</span>)', "cart") +
      "</nav></header>";
  }

  function renderFooter() {
    var el = $("#site-footer");
    if (!el) return;
    var year = new Date().getFullYear();
    el.innerHTML =
      '<footer class="site-footer">' +
      '<div class="wrap footer-grid">' +
      '<div class="footer-news">' +
      '<p class="footer-title">Next drop, in your inbox.</p>' +
      '<p class="small">One email per drop. Usually Fridays, 8pm JST.</p>' +
      '<form class="news-form" novalidate>' +
      '<label class="sr-only" for="news-email">Email address</label>' +
      '<input id="news-email" type="email" placeholder="your@email.com" autocomplete="email" required>' +
      '<button type="submit">Subscribe</button>' +
      "</form>" +
      '<p class="news-msg small" role="status" aria-live="polite"></p>' +
      "</div>" +
      '<div class="footer-links">' +
      '<p class="mono label">Shop</p><a href="index.html">All tees</a><a href="index.html#90s">90s</a><a href="index.html#80s">80s</a><a href="cart.html">Cart</a>' +
      "</div>" +
      '<div class="footer-links">' +
      '<p class="mono label">Help</p><a href="info.html#shipping">Shipping</a><a href="info.html#sizing">Sizing</a><a href="info.html#condition">Condition</a><a href="info.html#returns">Returns</a>' +
      "</div>" +
      '<div class="footer-links">' +
      '<p class="mono label">Contact</p><a href="' + esc(SHOP.instagram) + '" target="_blank" rel="noopener">Instagram</a><a href="mailto:' + esc(SHOP.email) + '">Email</a><a href="about.html">About</a>' +
      "</div>" +
      "</div>" +
      '<div class="wrap"><div class="footer-base mono"><span>© ' + year + " " + esc(SHOP.name) + '</span><span lang="ja">東京より、世界へ。</span></div></div>' +
      "</footer>" +
      '<div class="toast" role="status" aria-live="polite"></div>';

    var form = $(".news-form", el);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = $("#news-email", el), msg = $(".news-msg", el);
      if (!input.value || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.value)) {
        msg.textContent = "Please enter a valid email address.";
        input.focus();
        return;
      }
      msg.textContent = "Thank you — see you at the next drop.";
      form.reset();
    });
  }

  var toastTimer;
  function toast(html) {
    var t = $(".toast");
    if (!t) return;
    t.innerHTML = html;
    t.classList.add("is-on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("is-on"); }, 3200);
  }

  /* ---------- product card ---------- */

  function card(p) {
    var badge = p.sold ? '<span class="badge">Sold</span>' : p.isNew ? '<span class="badge badge-new">New</span>' : "";
    return '<a class="card' + (p.sold ? " is-sold" : "") + '" href="product.html#' + encodeURIComponent(p.id) + '">' +
      '<div class="card-media">' +
      '<div class="card-img">' + media(p, 0) + "</div>" +
      '<div class="card-img card-img-alt" aria-hidden="true">' + media(p, 1) + "</div>" +
      badge +
      "</div>" +
      '<div class="card-body">' +
      '<p class="card-title">' + esc(p.title) + "</p>" +
      '<p class="card-meta mono">' + esc(p.year) + " &nbsp;·&nbsp; Size " + esc(p.size) + "</p>" +
      '<p class="card-price">' + (p.sold ? "<s>" + money(p.price) + "</s>" : money(p.price)) + "</p>" +
      "</div></a>";
  }

  /* ---------- pages ---------- */

  function pageShop() {
    var grid = $("#product-grid"), bar = $("#filters");
    if (!grid || !bar) return;

    var eras = ["all", "80s", "90s", "00s"];
    var eraFromHash = function () { var h = hashId(); return eras.indexOf(h) > 0 ? h : "all"; };
    var state = { era: eraFromHash(), hideSold: false, sort: "new" };
    var count = function (e) { return PRODUCTS.filter(function (p) { return e === "all" || era(p.year) === e; }).length; };

    bar.innerHTML =
      '<div class="filter-eras" role="group" aria-label="Filter by decade">' +
      eras.map(function (e) {
        return '<button type="button" data-era="' + e + '">' + (e === "all" ? "All" : e) + '<sup class="mono">' + count(e) + "</sup></button>";
      }).join("") +
      "</div>" +
      '<div class="filter-tools">' +
      '<label class="check"><input type="checkbox" id="hide-sold"> <span>Available only</span></label>' +
      '<label class="sort"><span class="sr-only">Sort</span><select id="sort">' +
      '<option value="new">Newest</option><option value="price-asc">Price, low to high</option><option value="price-desc">Price, high to low</option><option value="year">Oldest first</option>' +
      "</select></label>" +
      "</div>";

    function sync() {
      $all("[data-era]", bar).forEach(function (b) { b.setAttribute("aria-pressed", String(b.getAttribute("data-era") === state.era)); });
      $("#hide-sold").checked = state.hideSold;
      $("#sort").value = state.sort;

      var list = PRODUCTS.map(function (p, i) { return { p: p, i: i }; }).filter(function (o) {
        return (state.era === "all" || era(o.p.year) === state.era) && (!state.hideSold || !o.p.sold);
      });
      list.sort(function (a, b) {
        if (state.sort === "price-asc") return a.p.price - b.p.price;
        if (state.sort === "price-desc") return b.p.price - a.p.price;
        if (state.sort === "year") return a.p.year - b.p.year;
        // newest: new arrivals first, sold last, then catalogue order
        return (b.p.isNew - a.p.isNew) || (a.p.sold - b.p.sold) || (a.i - b.i);
      });

      grid.innerHTML = list.length
        ? list.map(function (o) { return card(o.p); }).join("")
        : '<p class="empty">Nothing here right now. New pieces drop every Friday.</p>';

      var shown = $("#result-count");
      if (shown) shown.textContent = list.length + (list.length === 1 ? " piece" : " pieces");

      var want = state.era === "all" ? "" : state.era;
      if (hashId() !== want) {
        try { history.replaceState(null, "", want ? "#" + want : location.pathname + location.search); } catch (e) { /* sandboxed frame */ }
      }
    }

    window.addEventListener("hashchange", function () { state.era = eraFromHash(); sync(); });

    bar.addEventListener("click", function (e) {
      var b = e.target.closest("[data-era]");
      if (b) { state.era = b.getAttribute("data-era"); sync(); }
    });
    $("#hide-sold").addEventListener("change", function (e) { state.hideSold = e.target.checked; sync(); });
    $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; sync(); });

    var drop = $("#drop-info");
    if (drop) {
      var avail = PRODUCTS.filter(function (p) { return !p.sold; }).length;
      drop.innerHTML =
        "<dt>Drop</dt><dd>No. " + esc(SHOP.dropNumber) + "</dd>" +
        "<dt>Date</dt><dd>" + esc(SHOP.dropDate) + "</dd>" +
        "<dt>Pieces</dt><dd>" + PRODUCTS.length + " (" + avail + " left)</dd>" +
        "<dt>From</dt><dd>Tokyo, Japan</dd>";
    }

    sync();
  }

  function pageProduct() {
    var root = $("#product");
    if (!root) return;
    var id = hashId() || new URLSearchParams(location.search).get("id");
    var p = byId(id);

    if (!p) {
      root.innerHTML = '<div class="wrap narrow not-found"><h1 class="display">Not found.</h1><p>This piece may have been removed. <a href="index.html">Back to the shop</a></p></div>';
      return;
    }
    document.title = p.title + " — " + SHOP.name;

    var n = mediaCount(p), gallery = "";
    for (var i = 0; i < n; i++) gallery += '<figure class="gallery-item' + (i === 0 ? " is-main" : "") + (!(p.images && p.images.length) && i === 2 ? " is-bleed" : "") + '">' + media(p, i) + "</figure>";

    var row = function (k, v) { return "<tr><th scope=\"row\">" + k + "</th><td>" + v + "</td></tr>"; };

    root.innerHTML =
      '<div class="wrap">' +
      '<nav class="crumbs mono" aria-label="Breadcrumb"><a href="index.html">Shop</a> / <a href="index.html#' + era(p.year) + '">' + era(p.year) + "</a> / <span>" + esc(p.title) + "</span></nav>" +
      '<div class="pdp">' +
      '<div class="gallery">' + gallery + "</div>" +
      '<aside class="pdp-info">' +
      '<p class="mono label">' + esc(p.category) + " &nbsp;·&nbsp; " + esc(p.year) + "</p>" +
      '<h1 class="pdp-title">' + esc(p.title) + "</h1>" +
      '<p class="pdp-price">' + money(p.price) + (p.sold ? ' <span class="mono sold-tag">Sold</span>' : "") + "</p>" +
      '<div class="pdp-size"><span class="mono label">Size</span><span class="size-chip">' + esc(p.size) + '</span><span class="small">One of one. Tagged size — please check measurements.</span></div>' +
      '<button type="button" class="btn btn-block" id="add-btn"></button>' +
      '<p class="small pdp-ship">Ships from Tokyo in 2–4 business days. ' + (SHOP.freeShippingOver ? "Free worldwide shipping over " + money(SHOP.freeShippingOver) + "." : "") + "</p>" +
      '<p class="pdp-desc">' + esc(p.description) + "</p>" +
      '<table class="spec mono"><caption class="sr-only">Details</caption><tbody>' +
      row("Pit to pit", p.pit + " cm / " + toInches(p.pit) + " in") +
      row("Length", p.length + " cm / " + toInches(p.length) + " in") +
      row("Condition", esc(p.condition) + " — " + esc(p.conditionNote)) +
      row("Fabric", esc(p.fabric)) +
      row("Stitch", esc(p.stitch)) +
      row("Made in", esc(p.madeIn)) +
      row("Origin", esc(p.license)) +
      "</tbody></table>" +
      '<details class="fold"><summary>How we measure</summary><p class="small">Laid flat. Pit to pit is straight across, 1 inch below the armpits. Length is from the highest point of the shoulder to the hem. Vintage Japanese sizes often run one size smaller than modern US sizing.</p></details>' +
      '<details class="fold"><summary>Condition grades</summary><p class="small">' + CONDITION.A + "<br>" + CONDITION.B + "<br>" + CONDITION.C + '</p></details>' +
      '<details class="fold"><summary>Shipping &amp; returns</summary><p class="small">Tracked shipping worldwide via Japan Post. Import duties may apply in your country. Returns accepted within 14 days if the item is not as described. <a href="info.html#returns">Read more</a></p></details>' +
      "</aside></div>" +
      '<section class="related"><h2 class="section-title">More from this drop</h2><div class="grid grid-4" id="related"></div></section>' +
      "</div>";

    var btn = $("#add-btn");
    function syncBtn() {
      if (p.sold) { btn.textContent = "Sold out"; btn.disabled = true; return; }
      if (inCart(p.id)) { btn.textContent = "In your cart — view cart"; btn.classList.add("btn-ghost"); }
      else { btn.textContent = "Add to cart — " + money(p.price); btn.classList.remove("btn-ghost"); }
    }
    btn.addEventListener("click", function () {
      if (p.sold) return;
      if (inCart(p.id)) { location.href = "cart.html"; return; }
      addToCart(p.id);
      syncBtn();
      toast('Added to cart. <a href="cart.html">View cart</a>');
    });
    syncBtn();

    var related = PRODUCTS.filter(function (x) { return x.id !== p.id && !x.sold; })
      .sort(function (a, b) { return Math.abs(a.year - p.year) - Math.abs(b.year - p.year); })
      .slice(0, 4);
    $("#related").innerHTML = related.map(card).join("");
  }

  function pageProductRouted() {
    pageProduct();
    window.addEventListener("hashchange", function () { pageProduct(); window.scrollTo(0, 0); });
  }

  function pageCart() {
    var root = $("#cart");
    if (!root) return;

    function render() {
      var ids = readCart();
      var items = ids.map(byId).filter(Boolean);
      var available = items.filter(function (p) { return !p.sold; });

      if (!items.length) {
        root.innerHTML = '<div class="cart-empty"><p class="display-sm">Your cart is empty.</p><p><a class="btn" href="index.html">Browse the shop</a></p></div>';
        return;
      }

      var subtotal = available.reduce(function (s, p) { return s + p.price; }, 0);
      var free = SHOP.freeShippingOver && subtotal >= SHOP.freeShippingOver;
      var shipping = available.length ? (free ? 0 : SHOP.shippingFlat) : 0;
      var toFree = SHOP.freeShippingOver ? SHOP.freeShippingOver - subtotal : 0;

      root.innerHTML =
        '<div class="cart-grid">' +
        '<ul class="cart-list">' +
        items.map(function (p) {
          return '<li class="cart-item' + (p.sold ? " is-sold" : "") + '">' +
            '<a class="cart-thumb" href="product.html#' + encodeURIComponent(p.id) + '">' + media(p, 0) + "</a>" +
            '<div class="cart-desc">' +
            '<a class="cart-title" href="product.html#' + encodeURIComponent(p.id) + '">' + esc(p.title) + "</a>" +
            '<p class="mono small">' + esc(p.year) + " · Size " + esc(p.size) + "<br>" + p.pit + " × " + p.length + " cm</p>" +
            (p.sold ? '<p class="small warn">Sorry — this piece has just sold.</p>' : "") +
            '<button type="button" class="link-btn small" data-remove="' + esc(p.id) + '">Remove</button>' +
            "</div>" +
            '<p class="cart-price">' + money(p.price) + "</p>" +
            "</li>";
        }).join("") +
        "</ul>" +
        '<aside class="summary">' +
        '<p class="mono label">Summary</p>' +
        '<dl class="summary-rows">' +
        "<dt>Subtotal</dt><dd>" + money(subtotal) + "</dd>" +
        "<dt>Shipping</dt><dd>" + (shipping === 0 && available.length ? "Free" : money(shipping)) + "</dd>" +
        '<dt class="total">Total</dt><dd class="total">' + money(subtotal + shipping) + " " + esc(SHOP.currency) + "</dd>" +
        "</dl>" +
        (toFree > 0 && available.length ? '<p class="small">Add ' + money(toFree) + " more for free shipping.</p>" : "") +
        '<button type="button" class="btn btn-block" id="checkout"' + (available.length ? "" : " disabled") + ">Checkout</button>" +
        '<p class="small">Every piece is one of a kind. Items are not reserved until checkout is complete.</p>' +
        "</aside></div>" +
        '<dialog class="dialog" id="demo-dialog" aria-labelledby="demo-title">' +
        '<p class="display-sm" id="demo-title">Checkout is not connected yet.</p>' +
        '<p class="small">This store is in demo mode. Set <code>checkoutUrl</code> in <code>assets/js/products.js</code> to connect Shopify, Stripe or another payment provider.</p>' +
        '<form method="dialog"><button class="btn">Close</button></form>' +
        "</dialog>";

      $all("[data-remove]", root).forEach(function (b) {
        b.addEventListener("click", function () { removeFromCart(b.getAttribute("data-remove")); render(); });
      });
      var co = $("#checkout");
      co.addEventListener("click", function () {
        if (SHOP.checkoutUrl) {
          var url = SHOP.checkoutUrl + (SHOP.checkoutUrl.indexOf("?") === -1 ? "?" : "&") + "items=" + encodeURIComponent(available.map(function (p) { return p.id; }).join(","));
          location.href = url;
          return;
        }
        var dlg = $("#demo-dialog");
        if (dlg && typeof dlg.showModal === "function") dlg.showModal();
        else alert("Checkout is not connected yet (demo mode).");
      });
    }
    render();
  }

  /* ---------- boot ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader();
    renderFooter();
    var page = pageName();
    if (page === "shop") pageShop();
    if (page === "product") pageProductRouted();
    if (page === "cart") pageCart();
    updateCartCount();
    // keep tabs in sync
    window.addEventListener("storage", function (e) { if (e.key === CART_KEY) updateCartCount(); });
  });
})();
