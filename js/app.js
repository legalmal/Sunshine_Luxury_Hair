/* =========================================================
   SUNSHINE'S LUXURY HAIR
   GLOBAL APPLICATION
   ========================================================= */


const themeToggle = document.getElementById("themeToggle");
const brandLogo = document.getElementById("brandLogo");

/* Keep the cart badge consistent across every client page. */
function updateHeaderCartCount() {
    let cart = [];
    try {
        const savedCart = JSON.parse(localStorage.getItem("sunshinesCart") || "[]");
        if (Array.isArray(savedCart)) cart = savedCart;
    } catch (error) {
        console.warn("Could not read the saved cart for the header badge.", error);
    }

    const total = cart.reduce((sum, item) => {
        const quantity = Number(item?.quantity);
        return sum + (Number.isFinite(quantity) && quantity > 0 ? Math.floor(quantity) : 1);
    }, 0);

    document.querySelectorAll("#cartCount").forEach(badge => {
        badge.textContent = String(total);
    });
}

updateHeaderCartCount();
window.addEventListener("storage", event => {
    if (event.key === "sunshinesCart") updateHeaderCartCount();
});
window.addEventListener("sunshines-cart-updated", updateHeaderCartCount);


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

    let navigationOverlay = document.getElementById("navigationOverlay");
    if (!navigationOverlay) {
        navigationOverlay = document.createElement("div");
        navigationOverlay.id = "navigationOverlay";
        navigationOverlay.className = "navigation-overlay";
        navigationOverlay.setAttribute("aria-hidden", "true");
        document.body.appendChild(navigationOverlay);
    }

    menuToggle.setAttribute("aria-controls", "mainNavigation");

    const setNavigationOpen = (open) => {
        mainNavigation.classList.toggle("active", open);
        navigationOverlay.classList.toggle("active", open);
        document.body.classList.toggle("navigation-open", open);
        menuToggle.setAttribute("aria-expanded", String(open));
        menuToggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    };

    menuToggle.addEventListener("click", () => {
        setNavigationOpen(!mainNavigation.classList.contains("active"));
    });

    navigationOverlay.addEventListener("click", () => setNavigationOpen(false));

    mainNavigation.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => setNavigationOpen(false));
    });

    document.addEventListener("keydown", event => {
        if (event.key !== "Escape" || !mainNavigation.classList.contains("active")) return;
        setNavigationOpen(false);
        menuToggle.focus();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) setNavigationOpen(false);
    });

}
