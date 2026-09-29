(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const selector = [
        "main section",
        "main article",
        "#message",
        ".admin-main > *",
        ".admin-content > *",
        ".orders-page > *",
        ".product-form > .form-section",
        ".edit-product-page > *",
        ".login-card",
        ".dashboard-stat-card",
        ".admin-card",
        ".form-section",
        ".product-card",
        ".home-product-card",
        ".shop-video-card",
        ".latest-video-card",
        ".category-card",
        ".why-card",
        ".value-card"
    ].join(",");

    if (reduceMotion || !("IntersectionObserver" in window)) return;

    const observed = new WeakSet();
    let sequence = 0;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.12,
        rootMargin: "0px 0px -40px 0px"
    });

    const observeElements = root => {
        if (root.nodeType !== Node.ELEMENT_NODE) return;
        const elements = [];
        if (root.matches(selector)) elements.push(root);
        elements.push(...root.querySelectorAll(selector));

        elements.forEach(element => {
            if (observed.has(element)) return;
            observed.add(element);
            element.classList.add("scroll-reveal");
            element.style.setProperty("--scroll-reveal-delay", `${(sequence++ % 4) * 65}ms`);
            observer.observe(element);
        });
    };

    observeElements(document.body);
    const mutationObserver = new MutationObserver(records => {
        records.forEach(record => record.addedNodes.forEach(observeElements));
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
})();
