(function () {
    function normalize(value) {
        return (value || '').toString().toLowerCase().trim();
    }

    function initMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var links = document.querySelector('[data-nav-links]');
        if (!button || !links) {
            return;
        }
        button.addEventListener('click', function () {
            links.classList.toggle('is-open');
        });
    }

    function initHero() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        if (!slides.length) {
            return;
        }
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

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        roots.forEach(function (root) {
            var input = root.querySelector('[data-filter-input]');
            var region = root.querySelector('[data-filter-region]');
            var sort = root.querySelector('[data-sort]');
            var grid = root.querySelector('[data-grid]');
            var empty = root.querySelector('[data-empty]');
            var viewButtons = Array.prototype.slice.call(root.querySelectorAll('[data-view]'));
            if (!grid) {
                return;
            }
            var cards = Array.prototype.slice.call(grid.children);
            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && input) {
                input.value = query;
            }

            function applySort() {
                var mode = sort ? sort.value : 'default';
                var sorted = cards.slice();
                if (mode === 'year-desc') {
                    sorted.sort(function (a, b) {
                        return (Number(b.getAttribute('data-year')) || 0) - (Number(a.getAttribute('data-year')) || 0);
                    });
                } else if (mode === 'year-asc') {
                    sorted.sort(function (a, b) {
                        return (Number(a.getAttribute('data-year')) || 0) - (Number(b.getAttribute('data-year')) || 0);
                    });
                } else if (mode === 'title') {
                    sorted.sort(function (a, b) {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    });
                }
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            function filterCards() {
                var keyword = normalize(input ? input.value : '');
                var regionValue = normalize(region ? region.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-search'));
                    var cardRegion = normalize(card.getAttribute('data-region'));
                    var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                    var matchRegion = !regionValue || cardRegion.indexOf(regionValue) !== -1;
                    var matched = matchKeyword && matchRegion;
                    card.classList.toggle('is-hidden', !matched);
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('is-visible', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', filterCards);
            }
            if (region) {
                region.addEventListener('change', filterCards);
            }
            if (sort) {
                sort.addEventListener('change', function () {
                    applySort();
                    filterCards();
                });
            }
            viewButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    var view = button.getAttribute('data-view');
                    viewButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    grid.classList.toggle('is-list-view', view === 'list');
                });
            });
            applySort();
            filterCards();
        });
    }

    function initPlayer() {
        var video = document.querySelector('[data-player-video]');
        var button = document.querySelector('[data-play-button]');
        if (!video || !button) {
            return;
        }
        var streamUrl = video.getAttribute('data-stream');
        var ready = false;
        var hlsInstance = null;

        function prepare() {
            if (ready || !streamUrl) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
            ready = true;
        }

        function startPlayback() {
            prepare();
            button.classList.add('is-hidden');
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    button.classList.remove('is-hidden');
                });
            }
        }

        button.addEventListener('click', startPlayback);
        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            }
        });
        video.addEventListener('play', function () {
            button.classList.add('is-hidden');
        });
        video.addEventListener('pause', function () {
            if (video.currentTime === 0) {
                button.classList.remove('is-hidden');
            }
        });
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMenu();
        initHero();
        initFilters();
        initPlayer();
    });
})();
