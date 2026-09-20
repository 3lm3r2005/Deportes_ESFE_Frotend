import { z } from 'zod';

export const partidoSchema = z.object({
  torneo_id: z.string().min(1, 'Selecciona un torneo'),
  equipo_local_id: z.string().min(1, 'Selecciona el equipo local'),
  equipo_visitante_id: z.string().min(1, 'Selecciona el equipo visitante'),
  arbitro_id: z.string().min(1, 'Selecciona un árbitro'),
  fecha: z.string().min(1, 'La fecha es obligatoria'),
  hora: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'La hora debe tener formato HH:MM'),
  estado: z.enum(['programado', 'en_juego', 'finalizado']),
}).refine((datos) => datos.equipo_local_id !== datos.equipo_visitante_id, {
  message: 'El equipo local y visitante no pueden ser el mismo',
  path: ['equipo_visitante_id'],
});