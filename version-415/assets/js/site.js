(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('open');
      });
    }

    document.querySelectorAll('.site-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = form.querySelector('input[name="q"]');
        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = 'search.html';
        }
      });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var panels = Array.prototype.slice.call(hero.querySelectorAll('.hero-panel'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        panels.forEach(function (panel, i) {
          panel.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };
      dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
          show(index);
        });
      });
      if (slides.length > 1) {
        window.setInterval(function () {
          show(current + 1);
        }, 5000);
      }
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
      var input = searchPage.querySelector('[data-search-input]');
      var region = searchPage.querySelector('[data-region-filter]');
      var year = searchPage.querySelector('[data-year-filter]');
      var cards = Array.prototype.slice.call(searchPage.querySelectorAll('.movie-card'));
      var params = new URLSearchParams(window.location.search);
      var initial = params.get('q') || '';
      if (input) {
        input.value = initial;
      }
      var applyFilter = function () {
        var q = input ? input.value.trim().toLowerCase() : '';
        var r = region ? region.value : '';
        var y = year ? year.value : '';
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || ''
          ].join(' ').toLowerCase();
          var okQuery = !q || haystack.indexOf(q) !== -1;
          var okRegion = !r || (card.getAttribute('data-region') || '').indexOf(r) !== -1;
          var okYear = !y || (card.getAttribute('data-year') || '') === y;
          card.classList.toggle('search-hidden', !(okQuery && okRegion && okYear));
        });
      };
      [input, region, year].forEach(function (node) {
        if (node) {
          node.addEventListener('input', applyFilter);
          node.addEventListener('change', applyFilter);
        }
      });
      applyFilter();
    }
  });
})();
