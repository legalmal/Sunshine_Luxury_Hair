/* =========================================================
   SUNSHINE'S LUXURY HAIR
   EDIT PRODUCT - FIRESTORE + CLOUDINARY
   ========================================================= */

import {
    db,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "./firebase.js";

import {
    uploadProductImage,
    uploadProductVideo
} from "./cloudinary.js";


document.addEventListener("DOMContentLoaded", async () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const form =
        document.getElementById("editProductForm");

    const productNotFound =
        document.getElementById("productNotFound");

    const optionsContainer =
        document.getElementById("optionsContainer");

    const addOptionBtn =
        document.getElementById("addOptionBtn");

    const existingImages =
        document.getElementById("existingImages");

    const newImageInput =
        document.getElementById("productImages");

    const newImagePreview =
        document.getElementById("newImagePreview");

    const videoInput =
        document.getElementById("productVideo");

    const videoPreview =
        document.getElementById("videoPreview");

    const existingVideo =
        document.getElementById("existingVideo");


    /* =====================================================
       GET PRODUCT ID
    ===================================================== */

    const editingProductId =
        localStorage.getItem("editingProductId");


    if (!editingProductId) {

        showProductNotFound();

        return;
    }


    /* =====================================================
       PRODUCT DATA
    ===================================================== */

    let product = null;


    try {

        console.log(
            "Loading product:",
            editingProductId
        );


        const productRef =
            doc(
                db,
                "products",
                editingProductId
            );


        const productSnapshot =
            await getDoc(productRef);


        if (!productSnapshot.exists()) {

            showProductNotFound();

            return;
        }


        product = {

            id: productSnapshot.id,

            ...productSnapshot.data()

        };


        console.log(
            "Product loaded:",
            product
        );


    } catch (error) {

        console.error(
            "Error loading product:",
            error
        );


        alert(
            "Unable to load product."
        );

        return;
    }


    /* =====================================================
       SHOW FORM
    ===================================================== */

    form.hidden = false;


    /* =====================================================
       LOAD BASIC INFORMATION
    ===================================================== */

    document.getElementById("productName").value =
        product.name || "";


    document.getElementById("productPrice").value =
        product.price ?? "";


    document.getElementById("productCategory").value =
        product.category || "";


    document.getElementById("productDescription").value =
        product.description || "";


    document.getElementById("productStatus").value =
        product.status || "in-stock";


    document.getElementById("productStock").value =
        product.stock ?? 0;


    document.getElementById("productFeatured").checked =
        product.featured === true;


    /* =====================================================
       LOAD COLORS
    ===================================================== */

    document.getElementById("productColors").value =
        Array.isArray(product.colors)
            ? product.colors.join(", ")
            : "";


    /* =====================================================
       LOAD OPTIONS
    ===================================================== */

    optionsContainer.innerHTML = "";


    const productOptions =
        Array.isArray(product.options)
            ? product.options
            : [];


    productOptions.forEach(option => {

        createOption(
            option.name || "",
            Array.isArray(option.values)
                ? option.values.join(", ")
                : ""
        );

    });


    if (productOptions.length === 0) {

        createOption();

    }


    /* =====================================================
       LOAD EXISTING IMAGES
    ===================================================== */

    product.images =
        Array.isArray(product.images)
            ? [...product.images]
            : product.mainImage
                ? [product.mainImage]
                : [];


    product.mainImage =
        product.images[0] || "";


    renderExistingImages();


    /* =====================================================
       LOAD VIDEO
    ===================================================== */

    renderExistingVideo();


    /* =====================================================
       ADD OPTION
    ===================================================== */

    addOptionBtn.addEventListener(
        "click",
        () => createOption()
    );


    /* =====================================================
       NEW IMAGE PREVIEW
    ===================================================== */

    newImageInput.addEventListener(
        "change",
        previewNewImages
    );


    /* =====================================================
       VIDEO PREVIEW
    ===================================================== */

    videoInput.addEventListener(
        "change",
        previewNewVideo
    );


    /* =====================================================
       SAVE
    ===================================================== */

    form.addEventListener(
        "submit",
        saveProduct
    );


    /* =====================================================
       CREATE OPTION
    ===================================================== */

    function createOption(
        name = "",
        values = ""
    ) {

        const option =
            document.createElement("div");

        option.className =
            "product-option";


        option.innerHTML = `

            <div class="option-fields">

                <div class="form-group">

                    <label>
                        Option Name
                    </label>

                    <input
                        type="text"
                        class="option-name"
                        placeholder="e.g. Length"
                        value="${escapeHTML(name)}"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Option Values
                    </label>

                    <input
                        type="text"
                        class="option-values"
                        placeholder="16, 18, 20, 22"
                        value="${escapeHTML(values)}"
                    >

                </div>

            </div>


            <button
                type="button"
                class="remove-option"
            >
                Remove
            </button>

        `;


        optionsContainer.appendChild(option);


        const removeButton =
            option.querySelector(
                ".remove-option"
            );


        removeButton.addEventListener(
            "click",
            () => option.remove()
        );

    }


    /* =====================================================
       EXISTING IMAGES
    ===================================================== */

    function renderExistingImages() {

        existingImages.innerHTML = "";


        if (
            !Array.isArray(product.images) ||
            product.images.length === 0
        ) {

            existingImages.innerHTML = `

                <p class="form-help">
                    No product images found.
                </p>

            `;

            return;
        }


        product.images.forEach(
            (image, index) => {

                const wrapper =
                    document.createElement("div");

                wrapper.className =
                    "preview-image";


                const img =
                    document.createElement("img");

                img.src = image;

                img.alt =
                    `${product.name} image ${index + 1}`;


                const removeButton =
                    document.createElement("button");

                removeButton.type =
                    "button";

                removeButton.className =
                    "remove-image";

                removeButton.innerHTML =
                    "×";

                removeButton.title =
                    "Remove image";


                removeButton.addEventListener(
                    "click",
                    () => removeExistingImage(index)
                );


                wrapper.appendChild(img);


                if (index === 0) {

                    const label =
                        document.createElement("span");

                    label.className =
                        "main-image-label";

                    label.textContent =
                        "MAIN IMAGE";

                    wrapper.appendChild(label);

                }


                wrapper.appendChild(
                    removeButton
                );


                existingImages.appendChild(
                    wrapper
                );

            }
        );

    }


    /* =====================================================
       REMOVE EXISTING IMAGE
    ===================================================== */

    function removeExistingImage(index) {

        if (
            product.images.length <= 1
        ) {

            alert(
                "A product must have at least one image."
            );

            return;
        }


        const confirmed =
            confirm(
                "Remove this product image?"
            );


        if (!confirmed) {
            return;
        }


        product.images.splice(
            index,
            1
        );


        product.mainImage =
            product.images[0];


        renderExistingImages();

    }


    /* =====================================================
       NEW IMAGE PREVIEW
    ===================================================== */

    function previewNewImages() {

        newImagePreview.innerHTML = "";


        const files =
            Array.from(
                newImageInput.files
            );


        files.forEach(
            (file, index) => {

                if (
                    !file.type.startsWith("image/")
                ) {
                    return;
                }


                const reader =
                    new FileReader();


                reader.onload =
                    event => {

                        const wrapper =
                            document.createElement("div");

                        wrapper.className =
                            "preview-image";


                        const img =
                            document.createElement("img");

                        img.src =
                            event.target.result;

                        img.alt =
                            `New image ${index + 1}`;


                        wrapper.appendChild(img);


                        newImagePreview.appendChild(
                            wrapper
                        );

                    };


                reader.readAsDataURL(file);

            }
        );

    }


    /* =====================================================
       EXISTING VIDEO
    ===================================================== */

    function renderExistingVideo() {

        existingVideo.innerHTML = "";


        if (!product.videoUrl) {

            existingVideo.innerHTML = `

                <p class="form-help">
                    No product video added.
                </p>

            `;

            return;
        }


        const video =
            document.createElement("video");

        video.controls = true;

        video.poster = product.mainImage || product.images?.[0] || "";

        video.src =
            product.videoUrl;


        existingVideo.appendChild(
            video
        );

    }


    /* =====================================================
       NEW VIDEO PREVIEW
    ===================================================== */

    function previewNewVideo() {

        videoPreview.innerHTML = "";


        const file =
            videoInput.files[0];


        if (!file) {
            return;
        }


        const videoURL =
            URL.createObjectURL(file);


        const video =
            document.createElement("video");

        video.controls = true;

        video.poster = product.mainImage || product.images?.[0] || "";

        video.src =
            videoURL;


        videoPreview.appendChild(
            video
        );

    }


    /* =====================================================
       SAVE PRODUCT
    ===================================================== */

    async function saveProduct(event) {

        event.preventDefault();


        const saveButton =
            form.querySelector(
                ".save-product-btn"
            );


        try {

            /* ---------------------------------------------
               BASIC INFORMATION
            --------------------------------------------- */

            const name =
                document
                    .getElementById("productName")
                    .value
                    .trim();


            const price =
                Number(
                    document
                        .getElementById("productPrice")
                        .value
                );


            const category =
                document
                    .getElementById("productCategory")
                    .value;


            const description =
                document
                    .getElementById("productDescription")
                    .value
                    .trim();


            const colors =
                document
                    .getElementById("productColors")
                    .value
                    .split(",")
                    .map(
                        color => color.trim()
                    )
                    .filter(Boolean);


            let status =
                document
                    .getElementById("productStatus")
                    .value;


            const stock =
                Number(
                    document
                        .getElementById("productStock")
                        .value
                );


            const featured =
                document
                    .getElementById("productFeatured")
                    .checked;


            /* ---------------------------------------------
               VALIDATION
            --------------------------------------------- */

            if (!name) {

                alert(
                    "Please enter a product name."
                );

                return;
            }


            if (
                !Number.isFinite(price) ||
                price < 0
            ) {

                alert(
                    "Please enter a valid product price."
                );

                return;
            }


            if (
                !Number.isFinite(stock) ||
                stock < 0
            ) {

                alert(
                    "Please enter a valid stock quantity."
                );

                return;
            }


            if (stock === 0) {

                status =
                    "out-of-stock";

            }


            /* ---------------------------------------------
               OPTIONS
            --------------------------------------------- */

            const options = [];


            document
                .querySelectorAll(".product-option")
                .forEach(option => {

                    const optionName =
                        option
                            .querySelector(".option-name")
                            .value
                            .trim();


                    const optionValues =
                        option
                            .querySelector(".option-values")
                            .value
                            .split(",")
                            .map(
                                value => value.trim()
                            )
                            .filter(Boolean);


                    if (
                        optionName &&
                        optionValues.length
                    ) {

                        options.push({

                            name:
                                optionName,

                            values:
                                optionValues

                        });

                    }

                });


            /* ---------------------------------------------
               NEW IMAGES
            --------------------------------------------- */

            const newFiles =
                Array.from(
                    newImageInput.files
                );


            const hasNewVideo = Boolean(videoInput.files.length);
            const hasExistingVideo = Boolean(product.videoUrl || product.video);

            if (
                product.images.length === 0 &&
                newFiles.length === 0 &&
                !hasNewVideo &&
                !hasExistingVideo
            ) {

                alert(
                    "Please add at least one product image or video."
                );

                return;
            }


            let newImages = [];


            /* ---------------------------------------------
               UPLOAD NEW IMAGES TO CLOUDINARY
            --------------------------------------------- */

            if (newFiles.length > 0) {

                saveButton.disabled = true;

                saveButton.textContent =
                    "Uploading images...";


                console.log(
                    "Uploading new product images..."
                );


                for (
                    let i = 0;
                    i < newFiles.length;
                    i++
                ) {

                    console.log(
                        `Uploading image ${i + 1} of ${newFiles.length}...`
                    );


                    const uploaded =
                        await uploadProductImage(
                            newFiles[i]
                        );


                    newImages.push(
                        uploaded.url
                    );

                }

            }


            /* ---------------------------------------------
               COMBINE IMAGES
            --------------------------------------------- */

            const finalImages = [

                ...(product.images || []),

                ...newImages

            ];


            const mainImage =
                finalImages[0] || "";


            /* ---------------------------------------------
               VIDEO
            --------------------------------------------- */

            let videoUrl =
                product.videoUrl || "";


            if (
                videoInput.files.length > 0
            ) {

                saveButton.textContent =
                    "Uploading video...";


                console.log(
                    "Uploading new product video..."
                );


                const uploadedVideo =
                    await uploadProductVideo(
                        videoInput.files[0]
                    );


                videoUrl =
                    uploadedVideo.url;

            }


            /* ---------------------------------------------
               UPDATE FIRESTORE
            --------------------------------------------- */

            saveButton.textContent =
                "Saving changes...";


            const productRef =
                doc(
                    db,
                    "products",
                    editingProductId
                );


            const updatedProduct = {

                name,

                slug:
                    createSlug(name),

                category,

                description,

                price,

                colors,

                stock,

                status,

                featured,

                options,

                images:
                    finalImages,

                mainImage,

                videoUrl,

                updatedAt:
                    serverTimestamp()

            };


            console.log(
                "Updating Firestore:",
                updatedProduct
            );


            await updateDoc(
                productRef,
                updatedProduct
            );


            /* ---------------------------------------------
               SUCCESS
            --------------------------------------------- */

            localStorage.removeItem(
                "editingProductId"
            );


            alert(
                "Product updated successfully!"
            );


            window.location.href =
                "products.html";


        } catch (error) {

            console.error(
                "Error updating product:",
                error
            );


            alert(
                "Failed to update product.\n\n" +
                error.message
            );


            saveButton.disabled =
                false;

            saveButton.textContent =
                "Save Changes";

        }

    }


    /* =====================================================
       SLUG
    ===================================================== */

    function createSlug(name) {

        return name
            .toLowerCase()
            .trim()
            .replace(
                /[^a-z0-9]+/g,
                "-"
            )
            .replace(
                /^-+|-+$/g,
                "");

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(value) {

        return String(value)
            .replace(
                /&/g,
                "&amp;"
            )
            .replace(
                /</g,
                "&lt;"
            )
            .replace(
                />/g,
                "&gt;"
            )
            .replace(
                /"/g,
                "&quot;"
            )
            .replace(
                /'/g,
                "&#039;"
            );

    }


    /* =====================================================
       PRODUCT NOT FOUND
    ===================================================== */

    function showProductNotFound() {

        if (form) {
            form.hidden = true;
        }

        if (productNotFound) {
            productNotFound.hidden = false;
        }

    }

});
