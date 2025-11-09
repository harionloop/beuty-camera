export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  publicId: string;
  width: number;
  height: number;
}

export async function uploadToCloudinary(blob: Blob): Promise<CloudinaryUploadResponse> {
  const formData = new FormData();
  formData.append('file', blob, 'photo.jpg');

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload to Cloudinary');
  }

  return response.json();
}

