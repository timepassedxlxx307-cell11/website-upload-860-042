(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function initMenu() {
    var button = document.querySelector("[data-menu-button]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
    var prev = slider.querySelector("[data-hero-prev]");
    var next = slider.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
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
    restart();
  }

  function initImageFallback() {
    var images = document.querySelectorAll("img");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-missing");
      });
    });
  }

  function createSearchCard(item) {
    var tags = (item.tags || []).slice(0, 3).map(function (tag) {
      return '<span class="tag">' + escapeHtml(tag) + '</span>';
    }).join("");
    return [
      '<article class="movie-card">',
      '<a class="poster" href="' + item.url + '" aria-label="观看' + escapeHtml(item.title) + '">',
      '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
      '<span class="poster-shade"></span>',
      '</a>',
      '<div class="card-body">',
      '<div class="card-meta">',
      '<span>' + escapeHtml(item.year) + '</span>',
      '<span>' + escapeHtml(item.region) + '</span>',
      '<span>' + escapeHtml(item.type) + '</span>',
      '</div>',
      '<h2><a href="' + item.url + '">' + escapeHtml(item.title) + '</a></h2>',
      '<p>' + escapeHtml(item.oneLine) + '</p>',
      '<div class="tag-row">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join("");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initSearch() {
    var form = document.querySelector("[data-search-form]");
    var input = document.querySelector("[data-search-input]");
    var results = document.querySelector("[data-search-results]");
    var title = document.querySelector("[data-search-title]");
    var summary = document.querySelector("[data-search-summary]");
    if (!form || !input || !results || !window.SEARCH_DATA) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    input.value = query;

    function render(keyword) {
      var value = keyword.trim().toLowerCase();
      if (!value) {
        return;
      }
      var terms = value.split(/\s+/).filter(Boolean);
      var matched = window.SEARCH_DATA.filter(function (item) {
        var haystack = [
          item.title,
          item.region,
          item.type,
          item.year,
          item.genre,
          item.category,
          (item.tags || []).join(" "),
          item.oneLine
        ].join(" ").toLowerCase();
        return terms.every(function (term) {
          return haystack.indexOf(term) !== -1;
        });
      }).slice(0, 80);
      if (title) {
        title.textContent = "搜索结果";
      }
      if (summary) {
        summary.textContent = matched.length ? "为你找到相关内容，点击卡片进入详情页。" : "没有找到完全匹配的内容，可以换个关键词继续搜索。";
      }
      results.innerHTML = matched.map(createSearchCard).join("");
      initImageFallback();
    }

    form.addEventListener("submit", function (event) {
      var value = input.value.trim();
      if (!value) {
        event.preventDefault();
        return;
      }
    });

    render(query);
  }

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById("moviePlayer");
      var button = document.querySelector("[data-play-button]");
      var status = document.querySelector("[data-player-status]");
      var hlsInstance = null;
      var prepared = false;

      if (!video || !button || !sourceUrl) {
        return;
      }

      function setStatus(text) {
        if (status) {
          status.textContent = text || "";
        }
      }

      function prepare() {
        if (prepared) {
          return;
        }
        prepared = true;
        setStatus("正在加载播放内容…");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = sourceUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(sourceUrl);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            setStatus("");
            video.play().catch(function () {
              button.classList.remove("is-hidden");
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function () {
            setStatus("当前网络下播放加载较慢，请稍后重试。");
          });
        } else {
          video.src = sourceUrl;
        }
      }

      function play() {
        button.classList.add("is-hidden");
        prepare();
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.then(function () {
            setStatus("");
          }).catch(function () {
            button.classList.remove("is-hidden");
            setStatus("点击播放按钮继续观看。");
          });
        }
      }

      button.addEventListener("click", play);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
        setStatus("");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    initMenu();
    initHero();
    initImageFallback();
    initSearch();
  });
})();
