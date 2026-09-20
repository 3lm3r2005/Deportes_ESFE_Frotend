import { z } from 'zod';

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
const soloNumeros8 = /^[0-9]{8}$/;

export const inscripcionJugadorSchema = z.object({
  nombre: z.string().trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El nombre solo puede contener letras'),
  apellido: z.string().trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El apellido solo puede contener letras'),
  carne: z.string().min(3, 'El carné es obligatorio'),
  telefono: z.string().regex(soloNumeros8, 'El teléfono debe tener exactamente 8 dígitos numéricos'),
  posicion: z.string().min(2, 'La posición es obligatoria'),
  dorsal: z.coerce.number().min(1, 'El dorsal debe ser mayor a 0').max(99, 'El dorsal máximo es 99'),
});