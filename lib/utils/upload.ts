import { compressImage, validateImageSize, getFileSizeInMB } from './imageValidation';

export async function uploadImage(file: File): Promise<string> {
  // Comprimir imagen si es muy grande
  let fileToUpload = file;
  
  if (!validateImageSize(file, 4)) {
    console.log(`Comprimiendo imagen: ${getFileSizeInMB(file).toFixed(2)}MB`);
    fileToUpload = await compressImage(file, 2);
    console.log(`Imagen comprimida: ${getFileSizeInMB(fileToUpload).toFixed(2)}MB`);
  }

  const formData = new FormData();
  formData.append('file', fileToUpload);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al subir imagen');
  }

  const data = await response.json();
  return data.url;
}

export async function uploadMultipleImages(files: File[]): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file));
  return Promise.all(uploadPromises);
}


