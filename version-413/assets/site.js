(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback);
    }
  }

  ready(function () {
    var toggle = document.querySelector(".mobile-toggle");
    var menu = document.getElementById("mobile-menu");

    if (toggle && menu) {
      toggle.addEventListener("click", function () {
        var expanded = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!expanded));
        menu.classList.toggle("is-open", !expanded);
      });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
      var prev = hero.querySelector("[data-hero-prev]");
      var next = hero.querySelector("[data-hero-next]");
      var index = 0;
      var timer = null;

      function showSlide(nextIndex) {
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

      function startAutoPlay() {
        window.clearInterval(timer);
        timer = window.setInterval(function () {
          showSlide(index + 1);
        }, 5000);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
          startAutoPlay();
        });
      });

      if (prev) {
        prev.addEventListener("click", function () {
          showSlide(index - 1);
          startAutoPlay();
        });
      }

      if (next) {
        next.addEventListener("click", function () {
          showSlide(index + 1);
          startAutoPlay();
        });
      }

      showSlide(0);
      startAutoPlay();
    }

    var scrollButton = document.querySelector("[data-scroll-player]");
    var player = document.querySelector("[data-player]");
    if (scrollButton && player) {
      scrollButton.addEventListener("click", function (event) {
        event.preventDefault();
        player.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    }
  });
})();
