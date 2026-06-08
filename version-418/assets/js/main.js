(function () {
    const header = document.querySelector('.site-header');
    const menuButton = document.querySelector('.menu-button');
    const mobileNav = document.querySelector('.mobile-nav');

    function onScroll() {
        if (!header) {
            return;
        }
        header.classList.toggle('header-scrolled', window.scrollY > 8);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            const open = mobileNav.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
        });
    }

    const hero = document.querySelector('[data-hero]');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
        let active = 0;
        let timer = null;

        function show(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function play() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5000);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                play();
            });
        });

        show(0);
        play();
    }

    document.querySelectorAll('[data-filter-bar]').forEach(function (bar) {
        const list = bar.parentElement.querySelector('[data-filter-list]');
        const cards = list ? Array.from(list.querySelectorAll('.movie-card')) : [];
        bar.addEventListener('click', function (event) {
            const button = event.target.closest('[data-filter]');
            if (!button) {
                return;
            }
            const value = button.getAttribute('data-filter');
            bar.querySelectorAll('[data-filter]').forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            cards.forEach(function (card) {
                const matched = value === 'all' || card.getAttribute('data-type') === value || card.getAttribute('data-region') === value;
                card.classList.toggle('is-hidden', !matched);
            });
        });
    });

    function imagePath(item) {
        return './' + item.cover + '.jpg';
    }

    function moviePath(item) {
        return './movie/' + item.id + '.html';
    }

    function cardTemplate(item) {
        const tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card movie-card-small">',
            '    <a class="movie-cover" href="' + moviePath(item) + '" aria-label="观看 ' + escapeHtml(item.title) + '">',
            '        <img src="' + imagePath(item) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '        <span class="cover-shade"></span>',
            '        <span class="play-badge">▶</span>',
            '        <span class="movie-year">' + escapeHtml(item.year) + '</span>',
            '    </a>',
            '    <div class="movie-info">',
            '        <div class="movie-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>',
            '        <h2><a href="' + moviePath(item) + '">' + escapeHtml(item.title) + '</a></h2>',
            '        <p>' + escapeHtml(item.oneLine) + '</p>',
            '        <div class="tag-row">' + tags + '</div>',
            '    </div>',
            '</article>'
        ].join('\n');
    }

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"']/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char];
        });
    }

    const searchPage = document.querySelector('[data-search-page]');
    if (searchPage && typeof MovieSearchData !== 'undefined') {
        const form = searchPage.querySelector('[data-search-form]');
        const input = form ? form.querySelector('input[name="q"]') : null;
        const results = searchPage.querySelector('[data-search-results]');
        const count = searchPage.querySelector('[data-search-count]');
        const params = new URLSearchParams(window.location.search);
        const initial = params.get('q') || '';

        function normalize(value) {
            return String(value || '').trim().toLowerCase();
        }

        function haystack(item) {
            return [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                item.category,
                item.oneLine,
                (item.tags || []).join(' ')
            ].join(' ').toLowerCase();
        }

        function render(query) {
            const keyword = normalize(query);
            const matched = keyword ? MovieSearchData.filter(function (item) {
                return haystack(item).indexOf(keyword) !== -1;
            }) : MovieSearchData.slice(0, 48);
            const limited = matched.slice(0, 120);
            if (input) {
                input.value = query;
            }
            if (count) {
                count.textContent = keyword ? '搜索结果：' + matched.length + ' 条相关内容' : '推荐内容';
            }
            if (results) {
                results.innerHTML = limited.map(cardTemplate).join('\n');
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                render(input ? input.value : '');
            });
        }

        searchPage.querySelectorAll('[data-search-word]').forEach(function (button) {
            button.addEventListener('click', function () {
                render(button.getAttribute('data-search-word'));
            });
        });

        render(initial);
    }

    window.AppPlayer = {
        start: function (config) {
            const video = document.getElementById(config.videoId);
            const overlay = document.getElementById(config.overlayId);
            let initialized = false;
            let hls = null;

            if (!video || !config.source) {
                return;
            }

            function load() {
                if (initialized) {
                    return;
                }
                initialized = true;
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = config.source;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(config.source);
                    hls.attachMedia(video);
                } else {
                    video.src = config.source;
                }
            }

            function begin() {
                load();
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
                const playResult = video.play();
                if (playResult && typeof playResult.catch === 'function') {
                    playResult.catch(function () {});
                }
            }

            if (overlay) {
                overlay.addEventListener('click', begin);
            }

            video.addEventListener('click', function () {
                if (video.paused) {
                    begin();
                }
            });

            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });

            window.addEventListener('pagehide', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        }
    };
})();
