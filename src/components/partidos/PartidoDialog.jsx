import { useEffect, useState } from 'react';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import { partidoSchema } from '../../schemas/partido.schema';

const valoresPorDefecto = {
  torneo_id: '', equipo_local_id: '', equipo_visitante_id: '', arbitro_id: '',
  fecha: '', hora: '', estado: 'programado',
};

const MENSAJE_NO_INSCRITO = 'Este equipo no está inscrito en el torneo seleccionado';

export default function PartidoDialog({ open, onClose, onGuardar, partido, torneos, equipos, arbitros }) {
  const [errorApi, setErrorApi] = useState('');

  const {
    handleSubmit,
    control,
    reset,
    setValue,
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
    setErrorApi('');
  }, [partido, open, reset]);

  // Vigilamos el torneo y los dos equipos elegidos
  const [torneoSeleccionadoId, localId, visitanteId] = useWatch({
    control,
    name: ['torneo_id', 'equipo_local_id', 'equipo_visitante_id'],
  });

  const torneoSeleccionado = torneos.find((t) => t._id === torneoSeleccionadoId);

  // IDs de los equipos inscritos (y no retirados) en ese torneo
  const idsInscritos = (torneoSeleccionado?.equipos_inscritos || [])
    .filter((inscripcion) => inscripcion.estado === 'inscrito')
    .map((inscripcion) => String(inscripcion.equipo_id));

  const estaInscrito = (equipoId) => idsInscritos.includes(equipoId);

  // Mensaje de error de cada campo si el equipo elegido no está inscrito
  const errorLocal = torneoSeleccionadoId && localId && !estaInscrito(localId) ? MENSAJE_NO_INSCRITO : '';
  const errorVisitante = torneoSeleccionadoId && visitanteId && !estaInscrito(visitanteId) ? MENSAJE_NO_INSCRITO : '';

  const handleGuardar = async (datos) => {
    setErrorApi('');

    if (errorLocal || errorVisitante) {
      setErrorApi('No se puede guardar: hay equipos que no están inscritos en este torneo. Inscríbelos desde Torneos o elige otros equipos.');
      return;
    }

    try {
      await onGuardar(datos);
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Ocurrió un error al guardar el partido');
    }
  };

  // Texto de cada equipo en la lista: agrega "(no inscrito)" cuando corresponde
  const textoEquipo = (equipo) =>
    torneoSeleccionadoId && !estaInscrito(equipo._id)
      ? `${equipo.nombre} (no inscrito)`
      : equipo.nombre;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{partido ? 'Editar partido' : 'Programar partido'}</DialogTitle>
      <DialogContent>
        {errorApi && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {errorApi}
          </Alert>
        )}

        <Controller
          name="torneo_id" control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Torneo" fullWidth margin="normal"
              error={!!errors.torneo_id} helperText={errors.torneo_id?.message}
              onChange={(evento) => {
                field.onChange(evento);
                // Al cambiar de torneo, los equipos elegidos ya no sirven
                setValue('equipo_local_id', '');
                setValue('equipo_visitante_id', '');
                setErrorApi('');
              }}
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
              disabled={!torneoSeleccionadoId}
              error={!!errors.equipo_local_id || !!errorLocal}
              helperText={
                errors.equipo_local_id?.message ||
                errorLocal ||
                (!torneoSeleccionadoId ? 'Primero selecciona un torneo' : '')
              }
            >
              {equipos.map((e) => (
                <MenuItem key={e._id} value={e._id}>{textoEquipo(e)}</MenuItem>
              ))}
            </TextField>
          )}
        />
        <Controller
          name="equipo_visitante_id" control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Equipo visitante" fullWidth margin="normal"
              disabled={!torneoSeleccionadoId}
              error={!!errors.equipo_visitante_id || !!errorVisitante}
              helperText={errors.equipo_visitante_id?.message || errorVisitante}
            >
              {equipos.map((e) => (
                <MenuItem key={e._id} value={e._id}>{textoEquipo(e)}</MenuItem>
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
        <Button variant="contained" onClick={handleSubmit(handleGuardar)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}