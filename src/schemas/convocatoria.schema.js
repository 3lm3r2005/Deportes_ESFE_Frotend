import { z } from 'zod';

export const convocatoriaSchema = z.object({
  torneo_id: z.string().min(1, 'Selecciona un torneo'),
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres'),
  mensaje: z.string().trim().min(5, 'El mensaje debe tener al menos 5 caracteres'),
  fecha_publicacion: z.string().min(1, 'La fecha de publicación es obligatoria'),
  fecha_limite: z.string().optional(),
  estado: z.enum(['abierta', 'cerrada']),
}).refine(
  (datos) => {
    if (!datos.fecha_publicacion || !datos.fecha_limite) return true;
    return new Date(datos.fecha_limite) >= new Date(datos.fecha_publicacion);
  },
  {
    message: 'La fecha límite debe ser igual o posterior a la fecha de publicación',
    path: ['fecha_limite'],
  }
);