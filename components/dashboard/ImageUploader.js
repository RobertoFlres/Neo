"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";

export function ImageUploader({ onImageUpload, currentImage }) {
  const [uploadedImage, setUploadedImage] = useState(currentImage);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Por favor selecciona una imagen");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("La imagen debe ser menor a 5MB");
      return;
    }

    setUploading(true);

    try {
      // Upload to Cloudinary via our API route
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al subir la imagen');
      }

      if (!data.success || !data.url) {
        throw new Error('No se recibió la URL de la imagen');
      }

      const imageUrl = data.url; // URL HTTPS absoluta de Cloudinary
      
      console.log("📸 Image uploaded to Cloudinary:", imageUrl);
      setUploadedImage(imageUrl);
      onImageUpload(imageUrl);
      toast.success("Imagen cargada exitosamente");
      setUploading(false);
    } catch (error) {
      console.error("❌ Error uploading image:", error);
      toast.error(error.message || "Error al cargar la imagen");
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      {uploadedImage && (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Article preview"
            className="w-full h-auto object-contain rounded-lg"
          />
          <button
            onClick={() => {
              setUploadedImage(null);
              onImageUpload(null);
            }}
            className="btn btn-sm btn-error absolute top-2 right-2"
          >
            ✕
          </button>
        </div>
      )}
      
      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
        className="file-input file-input-bordered w-full"
      />
      {uploading && <p className="text-sm opacity-60">Subiendo imagen...</p>}
    </div>
  );
}
