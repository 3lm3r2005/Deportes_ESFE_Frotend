import { z } from 'zod';

export const convocatoriaSchema = z.object({
  torneo_id: z.string().min(1, 'Selecciona un torneo'),
  titulo: z.string().min(3, 'El título debe tener al menos 3 caracteres'),
  mensaje: z.string().min(5, 'El mensaje debe tener al menos 5 caracteres'),
  fecha_publicacion: z.string().min(1, 'La fecha de publicación es obligatoria'),
  fecha_limite: z.string().optional(),
  estado: z.enum(['abierta', 'cerrada']),
});