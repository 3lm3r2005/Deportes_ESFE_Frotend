import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { convocatoriaSchema } from '../../schemas/convocatoria.schema';

const valoresPorDefecto = {
  torneo_id: '', titulo: '', mensaje: '', fecha_publicacion: '', fecha_limite: '', estado: 'abierta',
};

export default function ConvocatoriaDialog({ open, onClose, onGuardar, convocatoria, torneos }) {
  const [errorApi, setErrorApi] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(convocatoriaSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (convocatoria) {
      reset({
        torneo_id: convocatoria.torneo_id,
        titulo: convocatoria.titulo,
        mensaje: convocatoria.mensaje,
        fecha_publicacion: convocatoria.fecha_publicacion?.slice(0, 10),
        fecha_limite: convocatoria.fecha_limite?.slice(0, 10) || '',
        estado: convocatoria.estado,
      });
    } else {
      reset(valoresPorDefecto);
    }
    setErrorApi('');
  }, [convocatoria, open, reset]);

  const handleGuardarInterno = async (datos) => {
    setErrorApi('');
    try {
      await onGuardar(datos);
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Error al guardar la convocatoria');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{convocatoria ? 'Editar convocatoria' : 'Nueva convocatoria'}</DialogTitle>
      <DialogContent>
        {errorApi && (
          <Alert severity="error" sx={{ my: 1.5 }}>
            {errorApi}
          </Alert>
        )}
        <Controller
          name="torneo_id" control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Torneo" fullWidth margin="normal"
              error={!!errors.torneo_id} helperText={errors.torneo_id?.message}
            >
              {torneos.map((t) => (
                <MenuItem key={t._id} value={t._id}>{t.nombre}</MenuItem>
              ))}
            </TextField>
          )}
        />
        <TextField
          label="Título" fullWidth margin="normal"
          {...register('titulo')}
          error={!!errors.titulo} helperText={errors.titulo?.message}
        />
        <TextField
          label="Mensaje" fullWidth margin="normal" multiline rows={3}
          {...register('mensaje')}
          error={!!errors.mensaje} helperText={errors.mensaje?.message}
        />
        <Controller
          name="fecha_publicacion"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha de publicación"
              value={field.value ? dayjs(field.value) : null}
              onChange={(nuevaFecha) => field.onChange(nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true, margin: 'normal',
                  error: !!errors.fecha_publicacion, helperText: errors.fecha_publicacion?.message,
                },
              }}
            />
          )}
        />
        <Controller
          name="fecha_limite"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha límite (opcional)"
              value={field.value ? dayjs(field.value) : null}
              onChange={(nuevaFecha) => field.onChange(nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
          )}
        />
        <Controller
          name="estado" control={control}
          render={({ field }) => (
            <TextField {...field} select label="Estado" fullWidth margin="normal">
              <MenuItem value="abierta">Abierta</MenuItem>
              <MenuItem value="cerrada">Cerrada</MenuItem>
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