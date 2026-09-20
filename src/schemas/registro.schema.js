import { z } from 'zod';

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

export const registroSchema = z.object({
  nombre: z.string().trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El nombre solo puede contener letras'),
  apellido: z.string().trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El apellido solo puede contener letras'),
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});