import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { inscripcionJugadorSchema } from '../../schemas/inscripcionJugador.schema';

const valoresPorDefecto = {
  nombre: '', apellido: '', carne: '', telefono: '', posicion: '', dorsal: '',
};

export default function InscripcionJugadorDialog({ open, onClose, onGuardar }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(inscripcionJugadorSchema),
    defaultValues: valoresPorDefecto,
  });

  const handleGuardarInterno = async (datos) => {
    await onGuardar(datos);
    reset(valoresPorDefecto);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inscribir jugador</DialogTitle>
      <DialogContent>
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
        <TextField
          label="Carné" fullWidth margin="normal"
          {...register('carne')}
          error={!!errors.carne} helperText={errors.carne?.message}
        />
        <TextField
          label="Teléfono" fullWidth margin="normal"
          {...register('telefono')}
          error={!!errors.telefono} helperText={errors.telefono?.message}
        />
        <TextField
          label="Posición" fullWidth margin="normal"
          {...register('posicion')}
          error={!!errors.posicion} helperText={errors.posicion?.message}
        />
        <TextField
          label="Dorsal" type="number" fullWidth margin="normal"
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