(() => {
    let container;

    function getContainer() {
        if (container?.isConnected) return container;

        container = document.createElement("div");
        container.className = "site-notifications";
        container.setAttribute("aria-live", "polite");
        container.setAttribute("aria-relevant", "additions");
        container.setAttribute("aria-label", "Notifications");
        document.body.append(container);
        return container;
    }

    function showToast(message, type = "success", duration) {
        const safeType = ["success", "error", "info"].includes(type) ? type : "info";
        const toast = document.createElement("div");
        toast.className = `site-toast site-toast-${safeType}`;
        toast.setAttribute("role", safeType === "error" ? "alert" : "status");

        const icon = document.createElement("span");
        icon.className = "site-toast-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = safeType === "success" ? "✓" : safeType === "error" ? "!" : "i";

        const text = document.createElement("p");
        text.className = "site-toast-message";
        text.textContent = String(message ?? "");

        const close = document.createElement("button");
        close.className = "site-toast-close";
        close.type = "button";
        close.setAttribute("aria-label", "Dismiss notification");
        close.textContent = "×";

        const dismiss = () => {
            toast.classList.add("is-leaving");
            toast.addEventListener("transitionend", () => toast.remove(), { once: true });
            window.setTimeout(() => toast.remove(), 350);
        };

        close.addEventListener("click", dismiss);
        toast.append(icon, text, close);
        getContainer().append(toast);

        const timeout = duration ?? (safeType === "error" ? 6500 : 4500);
        if (timeout > 0) window.setTimeout(dismiss, timeout);
        return toast;
    }

    window.showToast = showToast;
})();
