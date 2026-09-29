(() => {
    const viewer = document.createElement("dialog");
    viewer.className = "product-video-viewer";
    viewer.setAttribute("aria-label", "Product video player");
    viewer.innerHTML = `
        <button class="product-video-viewer-close" type="button" aria-label="Close video">×</button>
        <div class="product-video-stage"></div>
        <div class="product-video-volume" aria-label="Video volume controls">
            <button class="product-video-mute" type="button" aria-label="Mute video" aria-pressed="false">🔊</button>
            <input class="product-video-volume-range" type="range" min="0" max="1" step="0.05" value="1" aria-label="Video volume">
        </div>
    `;
    document.body.append(viewer);

    const stage = viewer.querySelector(".product-video-stage");
    const closeButton = viewer.querySelector(".product-video-viewer-close");
    const muteButton = viewer.querySelector(".product-video-mute");
    const volumeRange = viewer.querySelector(".product-video-volume-range");
    let activeVideo = null;
    let originalParent = null;
    let originalNextSibling = null;

    function syncVolumeControls() {
        if (!activeVideo) return;
        const isMuted = activeVideo.muted || activeVideo.volume === 0;
        muteButton.textContent = isMuted ? "🔇" : "🔊";
        muteButton.setAttribute("aria-label", isMuted ? "Unmute video" : "Mute video");
        muteButton.setAttribute("aria-pressed", String(isMuted));
        volumeRange.value = String(isMuted ? 0 : activeVideo.volume);
    }

    function restoreVideo() {
        if (!activeVideo) return;
        activeVideo.pause();
        activeVideo.classList.remove("product-video-expanded");
        if (originalParent?.isConnected) {
            originalParent.insertBefore(
                activeVideo,
                originalNextSibling?.parentNode === originalParent ? originalNextSibling : null
            );
        }
        activeVideo = null;
        originalParent = null;
        originalNextSibling = null;
    }

    function closeViewer() {
        restoreVideo();
        if (viewer.open) viewer.close();
    }

    closeButton.addEventListener("click", closeViewer);
    viewer.addEventListener("click", event => {
        if (event.target === viewer) closeViewer();
    });
    viewer.addEventListener("close", restoreVideo);

    muteButton.addEventListener("click", () => {
        if (!activeVideo) return;
        activeVideo.muted = !activeVideo.muted;
        if (!activeVideo.muted && activeVideo.volume === 0) activeVideo.volume = 1;
        syncVolumeControls();
    });

    volumeRange.addEventListener("input", () => {
        if (!activeVideo) return;
        activeVideo.volume = Number(volumeRange.value);
        activeVideo.muted = activeVideo.volume === 0;
        syncVolumeControls();
    });

    document.addEventListener("play", event => {
        const video = event.target;
        if (!(video instanceof HTMLVideoElement) || video.classList.contains("product-video-expanded")) return;

        if (activeVideo && activeVideo !== video) restoreVideo();
        activeVideo = video;
        originalParent = video.parentNode;
        originalNextSibling = video.nextSibling;
        video.classList.add("product-video-expanded");
        video.addEventListener("volumechange", syncVolumeControls);
        stage.append(video);
        stage.dataset.productId = video.dataset.productId || "";
        syncVolumeControls();
        if (!viewer.open) viewer.showModal();
    }, true);
})();
