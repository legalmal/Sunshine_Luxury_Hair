(() => {
    const imageSelector = [
        ".product-card-image",
        "#mainProductImage",
        ".product-thumbnail img",
        ".cart-item-image img",
        ".checkout-item-image img",
        ".product-table-image",
        ".preview-image img",
        ".main-preview-card img",
        "#mainImagePreview img",
        "#imagePreview img",
        ".main-image-preview img",
        ".image-preview img"
    ].join(",");

    const dialog = document.createElement("dialog");
    dialog.className = "product-image-viewer";
    dialog.setAttribute("aria-label", "Expanded product image");
    dialog.innerHTML = '<button class="product-image-viewer-close" type="button" aria-label="Close image preview" autofocus>×</button><img alt="">';
    document.body.appendChild(dialog);

    const closeButton = dialog.querySelector(".product-image-viewer-close");
    const previewImage = dialog.querySelector("img");
    let returnFocusTo = null;

    const closeViewer = () => {
        if (dialog.open) dialog.close();
    };

    dialog.addEventListener("close", () => {
        if (returnFocusTo?.isConnected) returnFocusTo.focus?.();
        returnFocusTo = null;
    });

    document.addEventListener("click", event => {
        const image = event.target.closest?.(imageSelector);
        if (!image) return;
        const imageUrl = image.currentSrc || image.getAttribute("src");
        if (!imageUrl) return;
        if (image.closest(".home-product-image-link")) return;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        returnFocusTo = image.closest("button, a") || image;
        previewImage.src = imageUrl;
        previewImage.alt = image.alt || "Product image";
        if (!dialog.open) dialog.showModal();
    }, true);

    closeButton.addEventListener("click", closeViewer);
    dialog.addEventListener("click", event => {
        if (event.target === dialog) closeViewer();
    });
})();
