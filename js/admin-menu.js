function initializeAdminMenu() {
    const toggle = document.getElementById("adminMenuToggle");
    const sidebar = document.getElementById("adminSidebar") || document.querySelector(".admin-sidebar");

    if (!toggle || !sidebar) return;

    let overlay = document.querySelector(".admin-overlay, .admin-sidebar-overlay");

    if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "admin-sidebar-overlay";
        overlay.setAttribute("aria-hidden", "true");
        document.body.appendChild(overlay);
    }

    const setOpen = (open) => {
        sidebar.classList.toggle("active", open);
        overlay.classList.toggle("active", open);
        toggle.setAttribute("aria-expanded", String(open));
        toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
        document.body.classList.toggle("admin-menu-open", open);
    };

    toggle.addEventListener("click", () => {
        setOpen(!sidebar.classList.contains("active"));
    });

    overlay.addEventListener("click", () => setOpen(false));

    sidebar.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => setOpen(false));
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && sidebar.classList.contains("active")) {
            setOpen(false);
            toggle.focus();
        }
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 900) setOpen(false);
    });
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeAdminMenu, { once: true });
} else {
    initializeAdminMenu();
}
