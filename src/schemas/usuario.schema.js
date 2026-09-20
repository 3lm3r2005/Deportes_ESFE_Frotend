import { z } from 'zod';

const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;

const camposBase = {
  nombre: z.string().trim()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El nombre solo puede contener letras'),
  apellido: z.string().trim()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .regex(soloLetras, 'El apellido solo puede contener letras'),
  email: z.string().email('Correo electrónico inválido'),
  rol: z.enum(['admin', 'arbitro', 'delegado'], {
    errorMap: () => ({ message: 'Selecciona un rol válido' }),
  }),
  estado: z.enum(['activo', 'inactivo']),
};

export const usuarioCrearSchema = z.object({
  ...camposBase,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const usuarioEditarSchema = z.object({
  ...camposBase,
  password: z.union([
    z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    z.literal(''),
  ]).optional(),
});