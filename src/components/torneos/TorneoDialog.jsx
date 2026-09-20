import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { torneoSchema } from '../../schemas/torneo.schema';

const valoresPorDefecto = {
  nombre: '',
  anio: new Date().getFullYear(),
  fecha_inicio: '',
  fecha_fin: '',
  estado: 'planificado',
};

export default function TorneoDialog({ open, onClose, onGuardar, torneo }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(torneoSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (torneo) {
      reset({
        nombre: torneo.nombre,
        anio: torneo.anio,
        fecha_inicio: torneo.fecha_inicio?.slice(0, 10),
        fecha_fin: torneo.fecha_fin?.slice(0, 10),
        estado: torneo.estado,
      });
    } else {
      reset(valoresPorDefecto);
    }
  }, [torneo, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{torneo ? 'Editar torneo' : 'Nuevo torneo'}</DialogTitle>
      <DialogContent>
        <TextField
          label="Nombre" fullWidth margin="normal"
          {...register('nombre')}
          error={!!errors.nombre} helperText={errors.nombre?.message}
        />
        <TextField
          label="Año" type="number" fullWidth margin="normal"
          slotProps={{ htmlInput: { min: 2020, max: 2100 } }}
          {...register('anio')}
          error={!!errors.anio} helperText={errors.anio?.message}
        />
        <Controller
          name="fecha_inicio"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha de inicio"
              value={field.value ? dayjs(field.value) : null}
              onChange={(nuevaFecha) => field.onChange(nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true, margin: 'normal',
                  error: !!errors.fecha_inicio, helperText: errors.fecha_inicio?.message,
                },
              }}
            />
          )}
        />
        <Controller
          name="fecha_fin"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha de fin"
              value={field.value ? dayjs(field.value) : null}
              onChange={(nuevaFecha) => field.onChange(nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true, margin: 'normal',
                  error: !!errors.fecha_fin, helperText: errors.fecha_fin?.message,
                },
              }}
            />
          )}
        />
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Estado" fullWidth margin="normal">
              <MenuItem value="planificado">Planificado</MenuItem>
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="finalizado">Finalizado</MenuItem>
            </TextField>
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(onGuardar)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}