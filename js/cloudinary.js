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

    const uploadURL =
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`;

    // Cloudinary requires chunked uploads for files over 100 MB.
    if (file.size > 100 * 1024 * 1024) {
        const chunkSize = 20 * 1024 * 1024;
        const uploadId = globalThis.crypto?.randomUUID?.()
            || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        let data = null;

        for (let start = 0; start < file.size; start += chunkSize) {
            const end = Math.min(start + chunkSize, file.size) - 1;
            const formData = new FormData();
            formData.append("file", file.slice(start, end + 1), file.name);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
            let response;
            try {
                response = await fetch(uploadURL, {
                    method: "POST",
                    headers: {
                        "X-Unique-Upload-Id": uploadId,
                        "Content-Range": `bytes ${start}-${end}/${file.size}`
                    },
                    body: formData
                });
            } catch (error) {
                throw new Error(`Network request for ${file.name} could not reach Cloudinary: ${error?.message || "check your connection and Cloudinary upload access."}`);
            }
            const chunkResponse = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(chunkResponse?.error?.message || `Video upload failed (HTTP ${response.status}).`);
            }
            if (chunkResponse.done !== false) data = chunkResponse;
        }

        if (!data?.secure_url) throw new Error("Cloudinary did not finish the video upload.");
        return { url: data.secure_url, publicId: data.public_id, resourceType: data.resource_type };
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    let response;
    try {
        response = await fetch(uploadURL, { method: "POST", body: formData });
    } catch (error) {
        throw new Error(`Network request for ${file.name} could not reach Cloudinary: ${error?.message || "check your connection and Cloudinary upload access."}`);
    }

    const data = await response.json().catch(() => ({}));


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
