import { db, collection, addDoc, serverTimestamp } from "./firebase.js";

const form = document.getElementById("contactForm");
const submitButton = document.getElementById("contactSubmit");
const status = document.getElementById("contactFormStatus");

if (form && submitButton && status) {
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!form.reportValidity()) return;

        const formData = new FormData(form);
        const message = {
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim(),
            subject: String(formData.get("subject") || "").trim(),
            message: String(formData.get("message") || "").trim(),
            status: "received",
            createdAt: serverTimestamp()
        };

        if (!message.name || !message.email || !message.message) return;

        submitButton.disabled = true;
        submitButton.textContent = "Sending…";
        status.textContent = "";
        status.classList.remove("is-error");
        status.classList.remove("is-success");

        try {
            await addDoc(collection(db, "messages"), message);
            form.reset();
            status.textContent = "Message received. Thank you for getting in touch!";
            status.classList.add("is-success");
        } catch (error) {
            console.error("Unable to submit contact message:", error);
            status.textContent = error.code === "permission-denied"
                ? "We couldn't send your message because the database permissions need updating. Please try again later."
                : "We couldn't send your message just now. Please check your connection and try again.";
            status.classList.add("is-error");
        } finally {
            submitButton.disabled = false;
            submitButton.innerHTML = 'Send message <span aria-hidden="true">→</span>';
        }
    });
}
