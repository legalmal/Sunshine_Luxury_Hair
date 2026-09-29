(() => {
    let button = document.getElementById("backToTop");

    if (!button) {
        button = document.createElement("button");
        button.id = "backToTop";
        button.className = "back-to-top";
        button.type = "button";
        button.setAttribute("aria-label", "Back to top");
        button.textContent = "↑";
        document.body.appendChild(button);
    } else {
        button.classList.add("back-to-top");
    }

    const updateButton = () => {
        const show = window.scrollY > 300;
        button.classList.toggle("show", show);
        button.setAttribute("aria-hidden", String(!show));
        button.tabIndex = show ? 0 : -1;

        const whatsapp = document.querySelector(".whatsapp-float");
        if (whatsapp) {
            const box = whatsapp.getBoundingClientRect();
            const bottomOffset = window.innerHeight - box.top + 12;
            button.style.bottom = `${Math.max(20, bottomOffset)}px`;
        }
    };

    button.addEventListener("click", () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    });

    window.addEventListener("scroll", updateButton, { passive: true });
    window.addEventListener("resize", updateButton);
    updateButton();
})();
