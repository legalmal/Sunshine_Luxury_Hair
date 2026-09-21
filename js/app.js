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

if (savedTheme === "dark") {
    setTheme("dark");
} else {
    setTheme("light");
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

    });

}