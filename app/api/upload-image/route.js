import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      console.error("❌ No file in request");
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("📁 File received:", {
      name: file.name,
      size: file.size,
      type: file.type,
      isFile: file instanceof File,
      isBlob: file instanceof Blob
    });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: "Cloudinary not configured. Please set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in your .env file" },
        { status: 500 }
      );
    }

    // Convert file to FormData for Cloudinary
    const cloudinaryFormData = new FormData();
    
    // Ensure we have a proper File/Blob for Cloudinary
    let fileForUpload;
    if (file instanceof File) {
      fileForUpload = file;
    } else if (file instanceof Blob) {
      fileForUpload = file;
    } else {
      // If it's a stream or something else, convert to Blob
      const arrayBuffer = await file.arrayBuffer();
      fileForUpload = new Blob([arrayBuffer], { type: file.type || 'image/jpeg' });
    }
    
    cloudinaryFormData.append('file', fileForUpload, file.name || 'image.jpg');
    cloudinaryFormData.append('upload_preset', uploadPreset);

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    console.log("📤 Uploading to Cloudinary:", {
      cloudName,
      uploadPreset,
      fileName: file.name || 'unknown',
      fileSize: file.size || 'unknown',
      fileType: file.type || 'unknown'
    });

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Cloudinary upload error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      
      let errorMessage = "Error uploading image to Cloudinary";
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.error?.message || errorJson.error || errorText;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}: ${response.statusText}`;
      }
      
      return NextResponse.json(
        { error: errorMessage, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      url: data.secure_url, // URL HTTPS absoluta
    });

  } catch (error) {
    console.error("❌ Error in upload-image route:", error);
    return NextResponse.json(
      { error: "Error uploading image", details: error.message },
      { status: 500 }
    );
  }
}

