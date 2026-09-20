import { z } from 'zod';

export const torneoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  anio: z.coerce.number().min(2020, 'Año inválido').max(2100, 'Año inválido'),
  fecha_inicio: z.string().min(1, 'La fecha de inicio es obligatoria'),
  fecha_fin: z.string().min(1, 'La fecha de fin es obligatoria'),
  estado: z.enum(['planificado', 'activo', 'finalizado']),
});