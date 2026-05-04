(function () {
  'use strict';

  var STORAGE_KEY = 'anting_popup_shown_at';
  var COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
  var SCROLL_TRIGGER = 0.6;                    // 60% of page
  var TIME_TRIGGER_MS = 45 * 1000;             // 45 seconds (mobile fallback)
  var EXCLUDE_PATTERNS = [
    /\?share=/,
    /\?like_comment=/,
    /\?replytocom=/,
    /\?openidserver=/
  ];

  var fullPath = window.location.pathname + window.location.search;
  if (EXCLUDE_PATTERNS.some(function (re) { return re.test(fullPath); })) return;

  try {
    var lastShown = localStorage.getItem(STORAGE_KEY);
    if (lastShown && Date.now() - parseInt(lastShown, 10) < COOLDOWN_MS) return;
  } catch (e) { /* localStorage unavailable — proceed */ }

  var shown = false;

  var STYLES = [
    '.anting-popup-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;animation:anting-popup-fadein .25s ease-out}',
    '@keyframes anting-popup-fadein{from{opacity:0}to{opacity:1}}',
    '.anting-popup-modal{background:#fff;color:#000;max-width:460px;width:100%;padding:36px 32px;position:relative;box-shadow:0 8px 40px rgba(0,0,0,0.25);font-family:var(--wp--preset--font-family--dm-sans),-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;animation:anting-popup-slidein .3s ease-out;box-sizing:border-box}',
    '@keyframes anting-popup-slidein{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}',
    '.anting-popup-close{position:absolute;top:8px;right:8px;background:transparent;border:0;cursor:pointer;font-size:28px;line-height:1;padding:6px 12px;color:#000}',
    '.anting-popup-close:hover{opacity:.7}',
    '.anting-popup-title{font-size:22px;font-weight:700;margin:0 0 12px;letter-spacing:.02em}',
    '.anting-popup-body{font-size:15px;line-height:1.5;margin:0 0 20px}',
    '.anting-popup-form{margin:0}',
    '.anting-popup-input{width:100%;font-size:16px;padding:12px 14px;border:1px solid #000;background:#fff;color:#000;box-sizing:border-box;margin-bottom:10px;font-family:inherit}',
    '.anting-popup-button{width:100%;font-size:16px;padding:12px 14px;background:#000;color:#fff;border:1px solid #000;cursor:pointer;font-weight:600;font-family:inherit;letter-spacing:.02em}',
    '.anting-popup-button:hover{background:#333}'
  ].join('');

  function injectStyles() {
    if (document.getElementById('anting-popup-styles')) return;
    var style = document.createElement('style');
    style.id = 'anting-popup-styles';
    style.textContent = STYLES;
    document.head.appendChild(style);
  }

  function buildPopup() {
    injectStyles();
    var overlay = document.createElement('div');
    overlay.className = 'anting-popup-overlay';
    overlay.innerHTML = [
      '<div class="anting-popup-modal" role="dialog" aria-modal="true" aria-labelledby="anting-popup-title">',
      '<button type="button" class="anting-popup-close" aria-label="Close">&times;</button>',
      '<h2 id="anting-popup-title" class="anting-popup-title">Stay in the loop</h2>',
      '<p class="anting-popup-body">Get tour dates and new releases first, straight to your inbox.</p>',
      '<form class="anting-popup-form validate" action="https://anting.us12.list-manage.com/subscribe/post?u=e8c87d68628c983f1881437f4&id=ca35f551ea&f_id=008c61e9f0" method="post" target="_blank" novalidate>',
      '<input class="anting-popup-input required email" type="email" name="EMAIL" placeholder="Your email…" autocomplete="email" required />',
      '<div aria-hidden="true" style="position:absolute;left:-5000px;">',
      '<input type="text" name="b_e8c87d68628c983f1881437f4_ca35f551ea" tabindex="-1" value="" />',
      '</div>',
      '<button type="submit" class="anting-popup-button">Subscribe</button>',
      '</form>',
      '</div>'
    ].join('');

    function dismiss() {
      overlay.remove();
      document.removeEventListener('keydown', escListener);
    }

    function escListener(e) {
      if (e.key === 'Escape') dismiss();
    }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismiss();
    });
    overlay.querySelector('.anting-popup-close').addEventListener('click', dismiss);
    overlay.querySelector('form').addEventListener('submit', function () {
      setTimeout(dismiss, 100);
    });
    document.addEventListener('keydown', escListener);

    document.body.appendChild(overlay);
  }

  function show() {
    if (shown) return;
    shown = true;
    buildPopup();
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch (e) {}
  }

  var isMobile = window.matchMedia('(hover: none), (max-width: 768px)').matches;

  if (isMobile) {
    var onScroll = function () {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) return;
      if (window.scrollY / docHeight >= SCROLL_TRIGGER) show();
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    setTimeout(show, TIME_TRIGGER_MS);
  } else {
    document.addEventListener('mouseleave', function (e) {
      if (e.clientY <= 0) show();
    });
  }
})();
