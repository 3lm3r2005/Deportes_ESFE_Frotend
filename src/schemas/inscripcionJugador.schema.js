import { z } from 'zod';

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const soloNumeros8 = /^[0-9]{8}$/;
const formatoCarne = /^[A-Za-z]{2}[0-9]{4,6}$/;

export const inscripcionJugadorSchema = z.object({
  nombre: z.string().trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El nombre solo puede contener letras'),
  apellido: z.string().trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El apellido solo puede contener letras'),
  carne: z.string().trim()
    .regex(formatoCarne, 'El carné debe iniciar con 2 letras y de 4 a 6 números (ej. PO2026, PO25001)'),
  telefono: z.string().regex(soloNumeros8, 'El teléfono debe tener exactamente 8 dígitos numéricos'),
  posicion: z.enum(['Portero', 'Defensa', 'Mediocampista', 'Delantero'], {
    errorMap: () => ({ message: 'Selecciona una posición válida' }),
  }),
  dorsal: z.coerce.number().min(1, 'El dorsal debe ser mayor a 0').max(99, 'El dorsal máximo es 99'),
});