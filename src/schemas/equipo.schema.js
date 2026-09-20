import { z } from 'zod';

export const equipoSchema = z.object({
  nombre: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
 carrera: z.enum(
  [
    'Técnico en Ingeniería Eléctrica',
    'Técnico en Desarrollo de Software',
    'Técnico en Mercadeo',
    'Técnico en Turismo',
  ],
  { errorMap: () => ({ message: 'Selecciona una carrera válida' }) }
),
  anio: z.coerce.number().min(2020, 'Año inválido').max(2100, 'Año inválido'),
  delegado_id: z.string().min(1, 'Debes seleccionar un delegado'),
});