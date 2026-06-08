(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var menuPanel = document.querySelector("[data-menu-panel]");

    if (menuButton && menuPanel) {
      menuButton.addEventListener("click", function () {
        menuPanel.classList.toggle("open");
      });
    }

    document.querySelectorAll("[data-hero-slider]").forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
      var prev = slider.querySelector("[data-hero-prev]");
      var next = slider.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      function restart() {
        if (timer) {
          window.clearInterval(timer);
        }
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      if (prev) {
        prev.addEventListener("click", function () {
          show(index - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          show(index + 1);
          restart();
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
          restart();
        });
      });

      show(0);
      restart();
    });

    document.querySelectorAll("[data-filter-input]").forEach(function (input) {
      var targetSelector = input.getAttribute("data-filter-input");
      var target = document.querySelector(targetSelector);
      var empty = document.querySelector(input.getAttribute("data-empty-target") || "");

      function applyFilter() {
        if (!target) {
          return;
        }
        var value = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(target.querySelectorAll("[data-movie-card]"));
        var visible = 0;

        cards.forEach(function (card) {
          var searchText = (card.getAttribute("data-search") || "").toLowerCase();
          var matched = !value || searchText.indexOf(value) !== -1;
          card.classList.toggle("is-hidden", !matched);
          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("active", visible === 0);
        }
      }

      input.addEventListener("input", applyFilter);
      applyFilter();
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    var globalSearch = document.querySelector("[data-global-search]");
    if (globalSearch && query) {
      globalSearch.value = query;
      globalSearch.dispatchEvent(new Event("input"));
    }
  });
})();

function initMoviePlayer(videoId, sourceUrl) {
  var video = document.getElementById(videoId);
  if (!video || !sourceUrl) {
    return;
  }

  var shell = video.closest(".video-shell");
  var coverButton = shell ? shell.querySelector(".player-cover-button") : null;
  var started = false;
  var hlsInstance = null;

  function attachSource() {
    if (started) {
      return;
    }

    started = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = sourceUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
    } else {
      video.src = sourceUrl;
    }
  }

  function playNow() {
    attachSource();

    if (coverButton) {
      coverButton.classList.add("is-hidden");
    }

    var promise = video.play();
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  if (coverButton) {
    coverButton.addEventListener("click", playNow);
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      playNow();
    }
  });

  video.addEventListener("play", function () {
    if (coverButton) {
      coverButton.classList.add("is-hidden");
    }
  });

  video.addEventListener("emptied", function () {
    if (hlsInstance && typeof hlsInstance.destroy === "function") {
      hlsInstance.destroy();
      hlsInstance = null;
    }
    started = false;
  });
}
