const CLOUDINARY_CLOUD_NAME = "s3pvzwa0";
const CLOUDINARY_UPLOAD_PRESET = "sunshines_products";


/* =========================================
   UPLOAD IMAGE
========================================= */

async function uploadProductImage(file) {

    if (!file) {
        throw new Error("No image selected.");
    }

    if (!file.type.startsWith("image/")) {
        throw new Error("Selected file is not an image.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;


    const response = await fetch(uploadURL, {
        method: "POST",
        body: formData
    });


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            "Image upload failed."
        );

    }


    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type
    };

}


/* =========================================
   UPLOAD VIDEO
========================================= */

async function uploadProductVideo(file) {

    if (!file) {
        throw new Error("No video selected.");
    }

    if (!file.type.startsWith("video/")) {
        throw new Error("Selected file is not a video.");
    }

    const formData = new FormData();

    formData.append("file", file);
    formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET
    );


    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;


    const response = await fetch(uploadURL, {
        method: "POST",
        body: formData
    });


    const data = await response.json();


    if (!response.ok) {

        throw new Error(
            data?.error?.message ||
            "Video upload failed."
        );

    }


    return {
        url: data.secure_url,
        publicId: data.public_id,
        resourceType: data.resource_type
    };

}


/* =========================================
   EXPORT
========================================= */

export {
    uploadProductImage,
    uploadProductVideo
};