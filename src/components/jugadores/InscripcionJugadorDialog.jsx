import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Alert } from '@mui/material';
import { inscripcionJugadorSchema } from '../../schemas/inscripcionJugador.schema';

const valoresPorDefecto = {
  nombre: '', apellido: '', carne: '', telefono: '', posicion: '', dorsal: '',
};

const POSICIONES_FUTBOL = [
  'Portero',
  'Defensa',
  'Mediocampista',
  'Delantero',
];

export default function InscripcionJugadorDialog({ open, onClose, onGuardar, dorsalesOcupados = [] }) {
  const [errorApi, setErrorApi] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inscripcionJugadorSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (open) {
      reset(valoresPorDefecto);
      setErrorApi('');
    }
  }, [open, reset]);

  const handleGuardarInterno = async (datos) => {
    setErrorApi('');

    if (dorsalesOcupados.includes(Number(datos.dorsal))) {
      setErrorApi(`El dorsal #${datos.dorsal} ya está asignado a otro jugador de tu equipo`);
      return;
    }

    try {
      await onGuardar(datos);
      reset(valoresPorDefecto);
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Error al inscribir al jugador');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inscribir jugador</DialogTitle>
      <DialogContent>
        {errorApi && (
          <Alert severity="error" sx={{ my: 1.5 }}>
            {errorApi}
          </Alert>
        )}

        <TextField
          label="Nombre" fullWidth margin="normal"
          {...register('nombre')}
          error={!!errors.nombre} helperText={errors.nombre?.message}
        />
        <TextField
          label="Apellido" fullWidth margin="normal"
          {...register('apellido')}
          error={!!errors.apellido} helperText={errors.apellido?.message}
        />
        <Controller
          name="carne"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Carné (ej. PO2026, PO25001)"
              fullWidth
              margin="normal"
              onChange={(e) => field.onChange(e.target.value.toUpperCase().trim())}
              error={!!errors.carne}
              helperText={errors.carne?.message}
            />
          )}
        />
        <Controller
          name="telefono"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Teléfono" fullWidth margin="normal"
              onChange={(e) => {
                const soloNumeros = e.target.value.replace(/\D/g, '').slice(0, 8);
                field.onChange(soloNumeros);
              }}
              error={!!errors.telefono} helperText={errors.telefono?.message}
            />
          )}
        />
        <Controller
          name="posicion"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              select
              label="Posición"
              fullWidth
              margin="normal"
              error={!!errors.posicion}
              helperText={errors.posicion?.message}
            >
              {POSICIONES_FUTBOL.map((pos) => (
                <MenuItem key={pos} value={pos}>
                  {pos}
                </MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Dorsal (1-99)" type="number" fullWidth margin="normal"
          slotProps={{ htmlInput: { min: 1, max: 99 } }}
          {...register('dorsal')}
          error={!!errors.dorsal} helperText={errors.dorsal?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(handleGuardarInterno)}>Inscribir</Button>
      </DialogActions>
    </Dialog>
  );
}