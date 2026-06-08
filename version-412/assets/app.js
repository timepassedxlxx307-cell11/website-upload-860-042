(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function text(value) {
        return String(value || "").toLowerCase();
    }

    function card(movie) {
        return [
            '<article class="movie-card">',
            '<a class="poster-link" href="' + movie.file + '" aria-label="观看 ' + movie.title + '">',
            '<img src="' + movie.image + '" alt="' + movie.title + '" loading="lazy">',
            '<span class="score">★ ' + movie.rating + '</span>',
            '</a>',
            '<div class="card-body">',
            '<a class="card-category" href="' + movie.categoryFile + '">' + movie.category + '</a>',
            '<h3><a href="' + movie.file + '">' + movie.title + '</a></h3>',
            '<p>' + movie.oneLine + '</p>',
            '<div class="meta-row"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.type + '</span></div>',
            '</div>',
            '</article>'
        ].join("");
    }

    function setupMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var panel = document.querySelector("[data-mobile-panel]");
        if (!button || !panel) {
            return;
        }
        button.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length < 2) {
            return;
        }
        var index = 0;
        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }
        dots.forEach(function (dot, i) {
            dot.addEventListener("click", function () {
                show(i);
            });
        });
        setInterval(function () {
            show(index + 1);
        }, 5600);
    }

    function setupFilter() {
        var input = document.querySelector("[data-filter-input]");
        var list = document.querySelector("[data-filter-list]");
        if (!input || !list) {
            return;
        }
        var items = Array.prototype.slice.call(list.children);
        input.addEventListener("input", function () {
            var q = text(input.value).trim();
            items.forEach(function (item) {
                var haystack = text([
                    item.getAttribute("data-title"),
                    item.getAttribute("data-region"),
                    item.getAttribute("data-type"),
                    item.getAttribute("data-genre"),
                    item.getAttribute("data-year"),
                    item.textContent
                ].join(" "));
                item.classList.toggle("is-hidden", q && haystack.indexOf(q) === -1);
            });
        });
    }

    function setupSearch() {
        var result = document.querySelector("[data-search-results]");
        var input = document.querySelector("[data-search-input]");
        var title = document.querySelector("[data-search-title]");
        if (!result || !input || typeof movieCatalog === "undefined") {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var initial = params.get("q") || "";
        input.value = initial;
        function render() {
            var q = text(input.value).trim();
            if (!q) {
                title.textContent = "热门推荐";
                result.innerHTML = movieCatalog.slice(0, 24).map(card).join("");
                return;
            }
            var words = q.split(/\s+/).filter(Boolean);
            var matches = movieCatalog.filter(function (movie) {
                var haystack = text([movie.title, movie.region, movie.type, movie.genre, movie.tags, movie.year, movie.oneLine].join(" "));
                return words.every(function (word) {
                    return haystack.indexOf(word) !== -1;
                });
            }).slice(0, 120);
            title.textContent = "搜索结果";
            result.innerHTML = matches.map(card).join("");
        }
        input.addEventListener("input", render);
        render();
    }

    function setupPlayer() {
        var player = document.querySelector("[data-stream]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play]");
        var stream = player.getAttribute("data-stream");
        var hlsInstance = null;
        function prepare() {
            if (video.getAttribute("data-ready") === "1") {
                return;
            }
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
            video.setAttribute("data-ready", "1");
        }
        function start() {
            prepare();
            player.classList.add("is-playing");
            var playTask = video.play();
            if (playTask && typeof playTask.catch === "function") {
                playTask.catch(function () {});
            }
        }
        if (button) {
            button.addEventListener("click", start);
        }
        video.addEventListener("click", function () {
            if (video.getAttribute("data-ready") !== "1") {
                start();
            }
        });
        window.addEventListener("pagehide", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilter();
        setupSearch();
        setupPlayer();
    });
})();
