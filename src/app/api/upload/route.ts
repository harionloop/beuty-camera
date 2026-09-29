import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: 'Cloudinary configuration missing' },
        { status: 500 }
      );
    }

    // Convert File to base64 or FormData for Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataURI = `data:${file.type};base64,${base64}`;

    // Upload to Cloudinary using unsigned upload preset
    const formDataCloudinary = new FormData();
    formDataCloudinary.append('file', dataURI);
    formDataCloudinary.append('upload_preset', uploadPreset);
    formDataCloudinary.append('folder', 'beautycam'); // Optional: organize in folder

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formDataCloudinary,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Cloudinary upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload to Cloudinary' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      result: {
        url: data.secure_url,
        publicId: data.public_id,
        width: data.width,
        height: data.height,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

