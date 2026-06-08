document.addEventListener('DOMContentLoaded', function () {
  const header = document.getElementById('siteHeader');
  const navToggle = document.getElementById('navToggle');
  const mobilePanel = document.getElementById('mobilePanel');

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (navToggle && mobilePanel) {
    navToggle.addEventListener('click', function () {
      mobilePanel.classList.toggle('is-open');
    });
  }

  const heroSlider = document.getElementById('heroSlider');
  if (heroSlider) {
    const slides = Array.from(heroSlider.querySelectorAll('.hero-slide'));
    const thumbs = Array.from(heroSlider.querySelectorAll('.hero-thumb'));
    const prev = heroSlider.querySelector('[data-hero-prev]');
    const next = heroSlider.querySelector('[data-hero-next]');
    let index = Math.max(0, slides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    }));
    let timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      thumbs.forEach(function (thumb, thumbIndex) {
        thumb.classList.toggle('is-active', thumbIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        showSlide(Number(thumb.dataset.slide || 0));
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(index - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(index + 1);
        startTimer();
      });
    }

    showSlide(index);
    startTimer();
  }

  const filterInput = document.querySelector('.page-filter-input');
  const filterYear = document.querySelector('.page-filter-year');
  const filterType = document.querySelector('.page-filter-type');
  const cards = Array.from(document.querySelectorAll('.movie-card'));
  const emptyState = document.querySelector('.empty-state');

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyFilters() {
    if (!cards.length || (!filterInput && !filterYear && !filterType)) {
      return;
    }

    const keyword = normalize(filterInput ? filterInput.value : '');
    const year = filterYear ? filterYear.value : '';
    const type = filterType ? filterType.value : '';
    let visible = 0;

    cards.forEach(function (card) {
      const haystack = [
        card.dataset.title,
        card.dataset.tags,
        card.dataset.region,
        card.dataset.type,
        card.dataset.year,
        card.dataset.category
      ].map(normalize).join(' ');
      const matchedKeyword = !keyword || haystack.includes(keyword);
      const matchedYear = !year || card.dataset.year === year;
      const matchedType = !type || card.dataset.type === type;
      const matched = matchedKeyword && matchedYear && matchedType;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (filterInput || filterYear || filterType) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && filterInput) {
      filterInput.value = query;
    }
    [filterInput, filterYear, filterType].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  }
});
