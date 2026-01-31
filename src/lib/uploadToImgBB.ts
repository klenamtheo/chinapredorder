/**
 * Upload an image to ImgBB and return the hosted URL
 * @param file - The image file to upload
 * @returns Promise resolving to the hosted image URL
 * @throws Error if upload fails
 */
export async function uploadToImgBB(file: File): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY;

    if (!apiKey) {
        throw new Error("ImgBB API key is not configured. Please add NEXT_PUBLIC_IMGBB_API_KEY to your .env.local file.");
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
        throw new Error("Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.");
    }

    // Validate file size (max 32MB for ImgBB)
    const maxSize = 32 * 1024 * 1024; // 32MB in bytes
    if (file.size > maxSize) {
        throw new Error("File size exceeds 32MB limit. Please choose a smaller image.");
    }

    try {
        // Convert file to base64
        const base64 = await fileToBase64(file);

        // Create form data
        const formData = new FormData();
        formData.append('key', apiKey);
        formData.append('image', base64.split(',')[1]); // Remove data:image/...;base64, prefix

        // Upload to ImgBB
        const response = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || 'Failed to upload image to ImgBB');
        }

        const data = await response.json();

        if (!data.success || !data.data?.url) {
            throw new Error('Invalid response from ImgBB');
        }

        return data.data.url;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('An unexpected error occurred while uploading the image');
    }
}

/**
 * Convert a File to base64 string
 * @param file - The file to convert
 * @returns Promise resolving to base64 string
 */
function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });
}
