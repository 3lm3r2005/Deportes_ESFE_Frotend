import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Alert } from '@mui/material';
import { jugadorSchema } from '../../schemas/jugador.schema';
import ImageUpload from '../ImageUpload';

const valoresPorDefecto = {
  nombre: '', apellido: '', carne: '', telefono: '', posicion: '',
};

const POSICIONES_FUTBOL = [
  'Portero',
  'Defensa',
  'Mediocampista',
  'Delantero',
];

export default function JugadorDialog({ open, onClose, onGuardar, jugador }) {
  const [fotoUrl, setFotoUrl] = useState('');
  const [errorApi, setErrorApi] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(jugadorSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (jugador) {
      reset({
        nombre: jugador.nombre,
        apellido: jugador.apellido,
        carne: jugador.carne,
        telefono: jugador.telefono,
        posicion: jugador.posicion,
      });
      setFotoUrl(jugador.foto_url || '');
    } else {
      reset(valoresPorDefecto);
      setFotoUrl('');
    }
    setErrorApi('');
  }, [jugador, open, reset]);

  const handleGuardarInterno = async (datos) => {
    setErrorApi('');
    try {
      await onGuardar({ ...datos, foto_url: fotoUrl });
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Error al guardar el jugador');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{jugador ? 'Editar jugador' : 'Nuevo jugador'}</DialogTitle>
      <DialogContent>
        {errorApi && (
          <Alert severity="error" sx={{ my: 1.5 }}>
            {errorApi}
          </Alert>
        )}

        <ImageUpload
          valor={fotoUrl}
          onCambiar={setFotoUrl}
          label="Subir foto del jugador"
          variante="avatar"
        />
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(handleGuardarInterno)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}