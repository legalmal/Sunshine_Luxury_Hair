import { db, doc, getDoc, setDoc, serverTimestamp } from "./firebase.js";
import { DEFAULT_STORE_SETTINGS } from "./store-settings.js";
import { loadProducts } from "./product-data.js";
import { uploadProductImage, uploadProductVideo } from "./cloudinary.js";

const form = document.getElementById("settingsForm");
const status = document.getElementById("settingsStatus");
const saveButton = document.getElementById("settingsSave");
const settingsRef = doc(db, "settings", "storefront");
const notificationSettingsRef = doc(db, "settings", "adminNotifications");
const categoryKeys = ["wigs", "bundles", "closures", "frontals"];
const serviceEditorList = document.getElementById("serviceEditorList");
let availableProducts = [];
let currentDecemberExtraImage = "";

function setStatus(message, type = "") {
    status.textContent = message;
    status.className = `settings-status ${type}`.trim();
}

function populate(settings) {
    document.getElementById("settingStoreName").value = settings.storeName || "";
    document.getElementById("settingStoreLocationAddress").value = settings.storeLocationAddress || "";
    document.getElementById("settingSupportEmail").value = settings.supportEmail || "";
    document.getElementById("settingOrderNotificationEmail").value = settings.orderNotificationEmail || "";
    document.getElementById("settingSupportPhone").value = settings.supportPhone || "";
    document.getElementById("settingWhatsapp").value = settings.whatsappNumber || "";
    document.getElementById("settingCurrency").value = settings.currency === "XAF" ? "XAF" : "NGN";
    document.getElementById("settingStockThreshold").value = Number(settings.lowStockThreshold ?? 5);
    document.getElementById("settingDeliveryNote").value = settings.deliveryNote || "";
    categoryKeys.forEach((category) => {
        const select = document.getElementById(`categoryImage${category[0].toUpperCase()}${category.slice(1)}`);
        const preview = document.getElementById(`categoryPreview${category[0].toUpperCase()}${category.slice(1)}`);
        const selectedImage = settings.categoryImages?.[category] || "";
        if (select) select.value = selectedImage;
        if (preview) {
            preview.src = selectedImage;
            preview.hidden = !selectedImage;
        }
    });
    serviceEditorList.replaceChildren();
    (Array.isArray(settings.services) ? settings.services : []).forEach(addServiceEditor);
    const extra = settings.decemberExtra || DEFAULT_STORE_SETTINGS.decemberExtra;
    currentDecemberExtraImage = extra.image || "";
    document.getElementById("settingDecemberExtraEnabled").checked = Boolean(extra.enabled);
    document.getElementById("settingDecemberExtraTitle").value = extra.title || "";
    document.getElementById("settingDecemberExtraMessage").value = extra.message || "";
    const extraPreview = document.getElementById("decemberExtraPreview");
    extraPreview.src = extra.image || "";
    extraPreview.hidden = !extra.image;
}

function addServiceEditor(service = {}) {
    const card = document.createElement("div");
    card.className = "service-editor-card";
    card.innerHTML = `
        <div class="service-editor-heading"><strong>Service</strong><button type="button" class="service-remove-button">Delete service</button></div>
        <label class="settings-field">Service name<input class="service-name" maxlength="80" value=""></label>
        <label class="settings-field">Photo URL (optional)<input class="service-image-url" type="url" placeholder="https://..."></label>
        <label class="settings-field">Or upload a photo<input class="service-image-file" type="file" accept="image/*"></label>
        <label class="settings-field">Video URL (optional)<input class="service-video-url" type="url" placeholder="https://..."></label>
        <label class="settings-field">Or upload a video<input class="service-video-file" type="file" accept="video/*"></label>`;
    card.querySelector(".service-name").value = service.name || "";
    card.querySelector(".service-image-url").value = service.image || "";
    card.querySelector(".service-video-url").value = service.video || "";
    card.querySelector(".service-remove-button").addEventListener("click", () => card.remove());
    serviceEditorList.append(card);
}

document.getElementById("addServiceButton").addEventListener("click", () => addServiceEditor());
document.getElementById("settingDecemberExtraImage").addEventListener("change", event => {
    const file = event.target.files?.[0];
    const preview = document.getElementById("decemberExtraPreview");
    if (file && !file.type.startsWith("image/")) {
        event.target.value = "";
        setStatus("Please choose a valid bag image.", "error");
        return;
    }
    if (file) {
        preview.src = URL.createObjectURL(file);
        preview.hidden = false;
    }
});

function populateCategoryImageOptions(products, categoryImages = {}) {
    categoryKeys.forEach((category) => {
        const suffix = `${category[0].toUpperCase()}${category.slice(1)}`;
        const select = document.getElementById(`categoryImage${suffix}`);
        if (!select) return;

        select.replaceChildren(new Option("Use default artwork", ""));
        products.forEach((product) => {
            const images = [product.mainImage, product.image, ...(Array.isArray(product.images) ? product.images : [])]
                .filter((url, index, list) => typeof url === "string" && url && list.indexOf(url) === index);
            images.forEach((url, index) => {
                const option = new Option(`${product.name || "Product"} — photo ${index + 1}`, url);
                select.add(option);
            });
        });

        const selectedImage = categoryImages[category] || "";
        if (selectedImage && !Array.from(select.options).some(option => option.value === selectedImage)) {
            select.add(new Option("Saved category picture", selectedImage));
        }
        select.value = selectedImage;
    });
}

function updateCategoryPreview(category, imageUrl) {
    const suffix = `${category[0].toUpperCase()}${category.slice(1)}`;
    const preview = document.getElementById(`categoryPreview${suffix}`);
    if (!preview) return;
    preview.src = imageUrl || "";
    preview.hidden = !imageUrl;
}

async function loadSettings() {
    try {
        const [snapshot, notificationSnapshot, products] = await Promise.all([
            getDoc(settingsRef),
            getDoc(notificationSettingsRef),
            loadProducts().catch(error => {
                console.warn("Product photos could not be loaded for category selection.", error);
                return [];
            })
        ]);
        availableProducts = products;
        const settings = {
            ...DEFAULT_STORE_SETTINGS,
            ...(snapshot.exists() ? snapshot.data() : {}),
            ...(notificationSnapshot.exists() ? notificationSnapshot.data() : {})
        };
        populateCategoryImageOptions(availableProducts, settings.categoryImages || {});
        populate(settings);
    } catch (error) {
        console.error("Unable to load store settings:", error);
        populateCategoryImageOptions(availableProducts, {});
        populate(DEFAULT_STORE_SETTINGS);
        setStatus("Could not load saved settings. Check your connection and permissions before saving.", "error");
    }
}

categoryKeys.forEach((category) => {
    const suffix = `${category[0].toUpperCase()}${category.slice(1)}`;
    const select = document.getElementById(`categoryImage${suffix}`);
    const fileInput = document.getElementById(`categoryUpload${suffix}`);
    select?.addEventListener("change", () => {
        if (fileInput) fileInput.value = "";
        updateCategoryPreview(category, select.value);
    });
    fileInput?.addEventListener("change", () => {
        const file = fileInput.files?.[0];
        if (file && !file.type.startsWith("image/")) {
            fileInput.value = "";
            setStatus("Please choose a valid image file.", "error");
            return;
        }
        if (file) {
            if (select) select.value = "";
            updateCategoryPreview(category, URL.createObjectURL(file));
        }
    });
});

form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const phone = document.getElementById("settingWhatsapp").value.replace(/\D/g, "");
    if (phone && (phone.length < 8 || phone.length > 15)) {
        setStatus("Enter a WhatsApp number with country code, using 8 to 15 digits.", "error");
        return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Preparing images…";
    const categoryImages = {};
    const services = [];
    let decemberExtraImage = "";
    try {
        for (const category of categoryKeys) {
            const suffix = `${category[0].toUpperCase()}${category.slice(1)}`;
            const selectedFile = document.getElementById(`categoryUpload${suffix}`).files?.[0];
            const selectedUrl = document.getElementById(`categoryImage${suffix}`).value;
            categoryImages[category] = selectedFile
                ? (await uploadProductImage(selectedFile)).url
                : selectedUrl;
        }
        for (const card of serviceEditorList.querySelectorAll(".service-editor-card")) {
            const name = card.querySelector(".service-name").value.trim();
            let image = card.querySelector(".service-image-url").value.trim();
            let video = card.querySelector(".service-video-url").value.trim();
            const imageFile = card.querySelector(".service-image-file").files?.[0];
            const videoFile = card.querySelector(".service-video-file").files?.[0];
            if (!name && !image && !video && !imageFile && !videoFile) continue;
            if (!name) throw new Error("Enter a name for each service you want to save.");
            for (const mediaUrl of [image, video].filter(Boolean)) {
                if (new URL(mediaUrl).protocol !== "https:") throw new Error("Service media links must use HTTPS.");
            }
            if (imageFile) image = (await uploadProductImage(imageFile)).url;
            if (videoFile) video = (await uploadProductVideo(videoFile)).url;
            services.push({ name, image, video });
        }
        const extraFile = document.getElementById("settingDecemberExtraImage").files?.[0];
        decemberExtraImage = extraFile ? (await uploadProductImage(extraFile)).url : currentDecemberExtraImage;
    } catch (error) {
        console.error("Unable to prepare store media:", error);
        setStatus(error.message || "A selected image or video could not be uploaded.", "error");
        saveButton.disabled = false;
        saveButton.textContent = "Save settings";
        return;
    }

    const data = {
        storeName: document.getElementById("settingStoreName").value.trim(),
        storeLocationAddress: document.getElementById("settingStoreLocationAddress").value.trim(),
        supportEmail: document.getElementById("settingSupportEmail").value.trim(),
        supportPhone: document.getElementById("settingSupportPhone").value.trim(),
        whatsappNumber: phone,
        currency: document.getElementById("settingCurrency").value,
        lowStockThreshold: Number(document.getElementById("settingStockThreshold").value),
        deliveryNote: document.getElementById("settingDeliveryNote").value.trim(),
        categoryImages,
        services,
        decemberExtra: {
            enabled: document.getElementById("settingDecemberExtraEnabled").checked,
            title: document.getElementById("settingDecemberExtraTitle").value.trim(),
            message: document.getElementById("settingDecemberExtraMessage").value.trim(),
            image: decemberExtraImage
        },
        updatedAt: serverTimestamp()
    };
    const notificationData = {
        orderNotificationEmail: document.getElementById("settingOrderNotificationEmail").value.trim(),
        updatedAt: serverTimestamp()
    };

    saveButton.textContent = "Saving…";
    setStatus("Saving your store settings…");

    try {
        await Promise.all([
            setDoc(settingsRef, data, { merge: true }),
            setDoc(notificationSettingsRef, notificationData, { merge: true })
        ]);
        localStorage.removeItem("sunshinesStoreSettingsCache");
        categoryKeys.forEach((category) => {
            const suffix = `${category[0].toUpperCase()}${category.slice(1)}`;
            document.getElementById(`categoryUpload${suffix}`).value = "";
            updateCategoryPreview(category, categoryImages[category]);
        });
        serviceEditorList.querySelectorAll("input[type=file]").forEach(input => { input.value = ""; });
        document.getElementById("settingDecemberExtraImage").value = "";
        currentDecemberExtraImage = decemberExtraImage;
        const extraPreview = document.getElementById("decemberExtraPreview");
        extraPreview.src = decemberExtraImage;
        extraPreview.hidden = !decemberExtraImage;
        setStatus("Settings saved successfully.", "success");
    } catch (error) {
        console.error("Unable to save store settings:", error);
        setStatus("Settings could not be saved. Check your connection and Firestore permissions.", "error");
    } finally {
        saveButton.disabled = false;
        saveButton.textContent = "Save settings";
    }
});

document.getElementById("settingsReset").addEventListener("click", () => {
    populate(DEFAULT_STORE_SETTINGS);
    categoryKeys.forEach((category) => {
        const suffix = `${category[0].toUpperCase()}${category.slice(1)}`;
        document.getElementById(`categoryUpload${suffix}`).value = "";
    });
    document.getElementById("settingDecemberExtraImage").value = "";
    serviceEditorList.replaceChildren();
    setStatus("Default values restored. Save settings to apply them.");
});

loadSettings();
