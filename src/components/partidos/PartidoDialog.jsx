import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { partidoSchema } from '../../schemas/partido.schema';

const valoresPorDefecto = {
  torneo_id: '', equipo_local_id: '', equipo_visitante_id: '', arbitro_id: '',
  fecha: '', hora: '', estado: 'programado',
};

export default function PartidoDialog({ open, onClose, onGuardar, partido, torneos, equipos, arbitros }) {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(partidoSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (partido) {
      reset({
        torneo_id: partido.torneo_id,
        equipo_local_id: partido.equipo_local_id,
        equipo_visitante_id: partido.equipo_visitante_id,
        arbitro_id: partido.arbitro_id,
        fecha: partido.fecha?.slice(0, 10),
        hora: partido.hora,
        estado: partido.estado,
      });
    } else {
      reset(valoresPorDefecto);
    }
  }, [partido, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{partido ? 'Editar partido' : 'Programar partido'}</DialogTitle>
      <DialogContent>
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
        <Controller
          name="equipo_local_id" control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Equipo local" fullWidth margin="normal"
              error={!!errors.equipo_local_id} helperText={errors.equipo_local_id?.message}
            >
              {equipos.map((e) => (
                <MenuItem key={e._id} value={e._id}>{e.nombre}</MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="equipo_visitante_id" control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Equipo visitante" fullWidth margin="normal"
              error={!!errors.equipo_visitante_id} helperText={errors.equipo_visitante_id?.message}
            >
              {equipos.map((e) => (
                <MenuItem key={e._id} value={e._id}>{e.nombre}</MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="arbitro_id" control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Árbitro" fullWidth margin="normal"
              error={!!errors.arbitro_id} helperText={errors.arbitro_id?.message}
            >
              {arbitros.map((a) => (
                <MenuItem key={a._id} value={a._id}>{a.nombre} {a.apellido}</MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="fecha"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha"
              value={field.value ? dayjs(field.value) : null}
              onChange={(nuevaFecha) => field.onChange(nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              slotProps={{
                textField: {
                  fullWidth: true, margin: 'normal',
                  error: !!errors.fecha, helperText: errors.fecha?.message,
                },
              }}
            />
          )}
        />
        <Controller
          name="hora"
          control={control}
          render={({ field }) => (
            <TimePicker
              label="Hora"
              value={field.value ? dayjs(`2000-01-01T${field.value}`) : null}
              onChange={(nuevaHora) => field.onChange(nuevaHora ? nuevaHora.format('HH:mm') : '')}
              ampm={false}
              slotProps={{
                textField: {
                  fullWidth: true, margin: 'normal',
                  error: !!errors.hora, helperText: errors.hora?.message,
                },
              }}
            />
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