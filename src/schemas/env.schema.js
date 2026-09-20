import { z } from 'zod';

const envSchema = z.object({
  VITE_API_URL: z.string().url('VITE_API_URL debe ser una URL válida'),
  VITE_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'VITE_CLOUDINARY_CLOUD_NAME es obligatoria'),
  VITE_CLOUDINARY_UPLOAD_PRESET: z.string().min(1, 'VITE_CLOUDINARY_UPLOAD_PRESET es obligatoria'),
});

export const env = envSchema.parse(import.meta.env);