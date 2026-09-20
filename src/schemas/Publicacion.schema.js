import { z } from 'zod';

export const publicacionSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  mensaje: z.string().trim().min(5, 'El mensaje debe tener al menos 5 caracteres'),
});