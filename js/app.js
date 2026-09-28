/* =========================================================
   SUNSHINE'S LUXURY HAIR
   GLOBAL APPLICATION
   ========================================================= */


const themeToggle = document.getElementById("themeToggle");
const brandLogo = document.getElementById("brandLogo");


/* ---------- THEME ---------- */

function setTheme(theme) {

    if (theme === "dark") {

        document.body.classList.add("dark-theme");

        if (brandLogo) {
            brandLogo.src = "assets/logos/logo-dark.png";
        }

        if (themeToggle) {
            themeToggle.textContent = "☀";
        }

        localStorage.setItem("theme", "dark");

    } else {

        document.body.classList.remove("dark-theme");

        if (brandLogo) {
            brandLogo.src = "assets/logos/logo-light.png";
        }

        if (themeToggle) {
            themeToggle.textContent = "☾";
        }

        localStorage.setItem("theme", "light");
    }
}


/* ---------- LOAD SAVED THEME ---------- */

const savedTheme = localStorage.getItem("theme");

if (savedTheme === "light") {
    setTheme("light");
} else {
    // Dark mode is the storefront default until the visitor chooses otherwise.
    setTheme("dark");
}


/* ---------- THEME TOGGLE ---------- */

if (themeToggle) {

    themeToggle.addEventListener("click", () => {

        const isDark =
            document.body.classList.contains("dark-theme");

        setTheme(isDark ? "light" : "dark");

    });

}
/* ---------- MOBILE MENU ---------- */

const menuToggle = document.getElementById("menuToggle");
const mainNavigation = document.getElementById("mainNavigation");

if (menuToggle && mainNavigation) {

    menuToggle.addEventListener("click", () => {

        const isOpen =
            mainNavigation.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            isOpen
        );

        menuToggle.setAttribute(
            "aria-label",
            isOpen ? "Close navigation menu" : "Open navigation menu"
        );

    });

    mainNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
            mainNavigation.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "Open navigation menu");
        });
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape") return;
        mainNavigation.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Open navigation menu");
    });

}


/* ---------- LIGHTWEIGHT SCROLL REVEALS ---------- */

const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && !motionPreference.matches) {
    const revealTargets = document.querySelectorAll(
        "main section, .product-card, .home-product-card, .shop-video-card, .value-card"
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
    });

    revealTargets.forEach((element, index) => {
        element.classList.add("reveal-ready");
        element.style.setProperty("--reveal-delay", `${(index % 4) * 70}ms`);
        revealObserver.observe(element);
    });
}
