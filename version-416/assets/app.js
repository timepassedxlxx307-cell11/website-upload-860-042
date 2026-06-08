document.addEventListener("DOMContentLoaded", function () {
    var menuButton = document.querySelector("[data-menu-button]");
    var mobileMenu = document.querySelector("[data-mobile-menu]");
    if (menuButton && mobileMenu) {
        menuButton.addEventListener("click", function () {
            mobileMenu.classList.toggle("is-open");
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var activeSlide = 0;
    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle("is-active", i === activeSlide);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle("is-active", i === activeSlide);
        });
    }
    dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
            showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showSlide(activeSlide + 1);
        }, 5200);
    }

    var localFilter = document.querySelector("[data-local-filter]");
    var filterList = document.querySelector("[data-filter-list]");
    var emptyState = document.querySelector("[data-empty-state]");
    if (localFilter && filterList) {
        localFilter.addEventListener("input", function () {
            var query = localFilter.value.trim().toLowerCase();
            var cards = Array.prototype.slice.call(filterList.querySelectorAll("[data-search]"));
            var visible = 0;
            cards.forEach(function (card) {
                var text = (card.getAttribute("data-search") || "").toLowerCase();
                var matched = !query || text.indexOf(query) !== -1;
                card.style.display = matched ? "" : "none";
                if (matched) {
                    visible += 1;
                }
            });
            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        });
    }

    var globalSearch = document.querySelector("[data-global-search]");
    var results = document.querySelector("[data-search-results]");
    var defaultBlock = document.querySelector("[data-search-default]");
    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }
    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");
        return "<article class="movie-card card card-hover">" +
            "<a class="movie-cover" href="./" + escapeHtml(movie.file) + "" aria-label="" + escapeHtml(movie.title) + "">" +
            "<img src="" + escapeHtml(movie.cover) + "" alt="" + escapeHtml(movie.title) + "" loading="lazy">" +
            "<span class="movie-play">▶</span>" +
            "</a>" +
            "<div class="movie-info">" +
            "<div class="movie-meta-line"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.type) + "</span></div>" +
            "<h3><a href="./" + escapeHtml(movie.file) + "">" + escapeHtml(movie.title) + "</a></h3>" +
            "<p>" + escapeHtml(movie.oneLine) + "</p>" +
            "<div class="movie-tags">" + tags + "</div>" +
            "</div>" +
            "</article>";
    }
    function renderSearch() {
        if (!globalSearch || !results || !window.SEARCH_MOVIES) {
            return;
        }
        var query = globalSearch.value.trim().toLowerCase();
        if (!query) {
            results.innerHTML = "";
            if (defaultBlock) {
                defaultBlock.style.display = "";
            }
            return;
        }
        var terms = query.split(/\s+/).filter(Boolean);
        var matches = window.SEARCH_MOVIES.filter(function (movie) {
            var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.oneLine].concat(movie.tags || []).join(" ").toLowerCase();
            return terms.every(function (term) {
                return haystack.indexOf(term) !== -1;
            });
        }).slice(0, 120);
        results.innerHTML = matches.length ? matches.map(cardTemplate).join("") : "<div class="empty-state is-visible">暂无匹配内容</div>";
        if (defaultBlock) {
            defaultBlock.style.display = matches.length ? "none" : "";
        }
    }
    if (globalSearch && results) {
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        if (initial) {
            globalSearch.value = initial;
        }
        globalSearch.addEventListener("input", renderSearch);
        setTimeout(renderSearch, 0);
    }
});
