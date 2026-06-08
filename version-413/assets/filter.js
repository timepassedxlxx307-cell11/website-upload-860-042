(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  ready(function () {
    var scope = document.querySelector("[data-filter-scope]");
    var list = document.querySelector("[data-card-list]");
    if (!scope || !list) {
      return;
    }

    var input = scope.querySelector("[data-filter-input]");
    var genre = scope.querySelector("[data-genre-filter]");
    var sort = scope.querySelector("[data-sort-filter]");
    var count = scope.querySelector("[data-result-count]");
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));
    var urlQuery = new URLSearchParams(window.location.search).get("q") || "";

    if (input && urlQuery) {
      input.value = urlQuery;
    }

    function applyFilters() {
      var keyword = normalize(input ? input.value : "");
      var genreValue = normalize(genre ? genre.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var searchText = normalize(card.getAttribute("data-search"));
        var genreText = normalize(card.getAttribute("data-genre"));
        var matchesKeyword = !keyword || searchText.indexOf(keyword) !== -1;
        var matchesGenre = !genreValue || genreText.indexOf(genreValue) !== -1;
        var show = matchesKeyword && matchesGenre;
        card.classList.toggle("is-hidden", !show);
        if (show) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = String(visible);
      }
    }

    function applySort() {
      var mode = sort ? sort.value : "default";
      var sorted = cards.slice();

      if (mode === "rating") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-rating")) - Number(a.getAttribute("data-rating"));
        });
      } else if (mode === "year") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else if (mode === "title") {
        sorted.sort(function (a, b) {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        });
      }

      sorted.forEach(function (card) {
        list.appendChild(card);
      });
    }

    if (input) {
      input.addEventListener("input", applyFilters);
    }
    if (genre) {
      genre.addEventListener("change", applyFilters);
    }
    if (sort) {
      sort.addEventListener("change", function () {
        applySort();
        applyFilters();
      });
    }

    applySort();
    applyFilters();
  });
})();
