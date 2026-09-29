(() => {
    const slideshow = document.querySelector("[data-about-slideshow]");
    if (!slideshow) return;

    const slides = Array.from(slideshow.querySelectorAll(".about-slide"));
    const dots = Array.from(slideshow.querySelectorAll("[data-slide-to]"));
    const previousButton = slideshow.querySelector("[data-slide-previous]");
    const nextButton = slideshow.querySelector("[data-slide-next]");
    const toggleButton = slideshow.querySelector("[data-slide-toggle]");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const intervalMs = 6000;

    if (slides.length < 2 || !previousButton || !nextButton || !toggleButton) return;

    let activeIndex = Math.max(0, slides.findIndex(slide => slide.classList.contains("is-active")));
    let timer = null;
    let userPaused = reducedMotion.matches;
    let temporarilyPaused = false;

    function render() {
        slides.forEach((slide, index) => {
            const active = index === activeIndex;
            slide.classList.toggle("is-active", active);
            slide.setAttribute("aria-hidden", String(!active));
            slide.toggleAttribute("inert", !active);
        });

        dots.forEach((dot, index) => {
            const active = index === activeIndex;
            dot.classList.toggle("is-active", active);
            if (active) dot.setAttribute("aria-current", "true");
            else dot.removeAttribute("aria-current");
        });
    }

    function stopAutoplay() {
        if (timer) window.clearInterval(timer);
        timer = null;
    }

    function syncAutoplay() {
        stopAutoplay();
        const shouldPlay = !userPaused && !temporarilyPaused && !document.hidden;
        toggleButton.setAttribute("aria-pressed", String(userPaused));
        toggleButton.setAttribute("aria-label", userPaused ? "Play slideshow" : "Pause slideshow");
        if (shouldPlay) timer = window.setInterval(showNext, intervalMs);
    }

    function showSlide(index) {
        activeIndex = (index + slides.length) % slides.length;
        render();
        syncAutoplay();
    }

    function showNext() {
        activeIndex = (activeIndex + 1) % slides.length;
        render();
    }

    previousButton.addEventListener("click", () => showSlide(activeIndex - 1));
    nextButton.addEventListener("click", () => showSlide(activeIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener("click", () => showSlide(index)));

    toggleButton.addEventListener("click", () => {
        userPaused = !userPaused;
        syncAutoplay();
    });

    slideshow.addEventListener("mouseenter", () => {
        temporarilyPaused = true;
        syncAutoplay();
    });
    slideshow.addEventListener("mouseleave", () => {
        temporarilyPaused = false;
        syncAutoplay();
    });
    slideshow.addEventListener("focusin", () => {
        temporarilyPaused = true;
        syncAutoplay();
    });
    slideshow.addEventListener("focusout", event => {
        if (!slideshow.contains(event.relatedTarget)) {
            temporarilyPaused = false;
            syncAutoplay();
        }
    });
    document.addEventListener("visibilitychange", syncAutoplay);
    reducedMotion.addEventListener?.("change", event => {
        if (event.matches) userPaused = true;
        syncAutoplay();
    });

    render();
    syncAutoplay();
})();
