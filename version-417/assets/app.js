(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }

    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-menu-button]');
    var menu = document.querySelector('[data-mobile-menu]');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHeroSlider() {
    var slider = document.querySelector('[data-hero-slider]');

    if (!slider) {
      return;
    }

    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var next = slider.querySelector('[data-hero-next]');
    var prev = slider.querySelector('[data-hero-prev]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function schedule() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        show(dotIndex);
        schedule();
      });
    });

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        schedule();
      });
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        schedule();
      });
    }

    schedule();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var list = document.querySelector('[data-filter-list]');

    if (!list) {
      return;
    }

    var input = document.querySelector('[data-filter-input]');
    var selects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
    var emptyState = document.querySelector('[data-empty-state]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');

    if (input && query) {
      input.value = query;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.textContent
      ].join(' '));
    }

    function apply() {
      var search = normalize(input ? input.value : '');
      var activeFilters = selects.map(function (select) {
        return {
          key: select.getAttribute('data-filter-select'),
          value: normalize(select.value)
        };
      }).filter(function (filter) {
        return filter.value;
      });
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchesSearch = !search || text.indexOf(search) !== -1;
        var matchesSelects = activeFilters.every(function (filter) {
          return normalize(card.getAttribute('data-' + filter.key)).indexOf(filter.value) !== -1;
        });
        var keep = matchesSearch && matchesSelects;

        card.style.display = keep ? '' : 'none';

        if (keep) {
          visible += 1;
        }
      });

      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (input) {
      input.addEventListener('input', apply);
    }

    selects.forEach(function (select) {
      select.addEventListener('change', apply);
    });

    apply();
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-wrap'));

    players.forEach(function (player) {
      var video = player.querySelector('video');
      var button = player.querySelector('.player-start');
      var stream = player.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      if (!video || !stream) {
        return;
      }

      function load() {
        if (loaded) {
          return;
        }

        loaded = true;

        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        load();
        player.classList.add('is-playing');
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            player.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', play);
      }

      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        player.classList.remove('is-playing');
      });

      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  ready(function () {
    setupMobileMenu();
    setupHeroSlider();
    setupFilters();
    setupPlayers();
  });
}());
