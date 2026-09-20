import { env } from '../schemas/env.schema';

export const subirImagen = async (archivo) => {
  const formData = new FormData();
  formData.append('file', archivo);
  formData.append('upload_preset', env.VITE_CLOUDINARY_UPLOAD_PRESET);

  const url = `https://api.cloudinary.com/v1_1/${env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`;

  const respuesta = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!respuesta.ok) {
    throw new Error('No se pudo subir la imagen');
  }

  const data = await respuesta.json();
  return data.secure_url;
};