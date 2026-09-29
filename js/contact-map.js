import { loadStoreSettings } from "./store-settings.js";

const mapFrame = document.getElementById("contactStoreMap");
const mapPlaceholder = document.getElementById("contactMapPlaceholder");
const directionsLink = document.getElementById("contactMapDirections");
const addressLabel = document.getElementById("contactMapAddress");

if (mapFrame && mapPlaceholder && directionsLink && addressLabel) {
    const settings = await loadStoreSettings();
    const address = String(settings.storeLocationAddress || "").trim();

    if (address) {
        const query = encodeURIComponent(address);
        mapFrame.src = `https://maps.google.com/maps?q=${query}&output=embed`;
        directionsLink.href = `https://www.google.com/maps/search/?api=1&query=${query}`;
        addressLabel.textContent = address;
        mapFrame.hidden = false;
        mapPlaceholder.hidden = true;
        directionsLink.hidden = false;
    }
}
