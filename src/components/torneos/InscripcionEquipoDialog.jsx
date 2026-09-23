import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, MenuItem, Alert } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import { getUsuarioActual } from '../../services/auth.service';

export default function InscripcionEquipoDialog({ open, onClose, onGuardar, torneo, equipos }) {
  const usuario = getUsuarioActual();
  const esDelegado = usuario?.rol === 'delegado';
  const [errorApi, setErrorApi] = useState('');

  const idsYaInscritos = (torneo?.equipos_inscritos || [])
    .filter((e) => e.estado === 'inscrito')
    .map((e) => e.equipo_id);

  const miEquipo = esDelegado ? equipos.find((e) => e.delegado_id === usuario.id) : null;
  const equiposDisponibles = equipos.filter((e) => !idsYaInscritos.includes(e._id));

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues: { equipo_id: '', fecha_inscripcion: '', firma: '' },
  });

  useEffect(() => {
    reset({
      equipo_id: esDelegado ? (miEquipo?._id || '') : '',
      fecha_inscripcion: new Date().toISOString().slice(0, 10),
      firma: '',
    });
    setErrorApi('');
  }, [open, torneo]);

  const yaEstaInscritoMiEquipo = esDelegado && miEquipo && idsYaInscritos.includes(miEquipo._id);
  const torneoFinalizado = torneo?.estado === 'finalizado';

  const handleGuardarInterno = async (datos) => {
    setErrorApi('');
    if (torneoFinalizado) {
      setErrorApi('No se pueden inscribir equipos en un torneo que ya ha finalizado');
      return;
    }
    try {
      await onGuardar(datos);
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Error al inscribir el equipo');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Inscribir equipo en {torneo?.nombre}</DialogTitle>
      <DialogContent>
        {errorApi && (
          <Alert severity="error" sx={{ my: 1.5 }}>
            {errorApi}
          </Alert>
        )}
        {torneoFinalizado && (
          <Alert severity="warning" sx={{ my: 1.5 }}>
            Este torneo ya está finalizado. No se permiten nuevas inscripciones.
          </Alert>
        )}
        {esDelegado ? (
          yaEstaInscritoMiEquipo ? (
            <p>Tu equipo ya está inscrito en este torneo.</p>
          ) : !miEquipo ? (
            <p>Primero debes crear tu equipo antes de poder inscribirlo.</p>
          ) : (
            <TextField label="Tu equipo" fullWidth margin="normal" disabled value={miEquipo.nombre} />
          )
        ) : (
          <Controller
            name="equipo_id"
            control={control}
            render={({ field }) => (
              <TextField {...field} select label="Equipo" fullWidth margin="normal">
                {equiposDisponibles.map((e) => (
                  <MenuItem key={e._id} value={e._id}>{e.nombre}</MenuItem>
                ))}
              </TextField>
            )}
          />
        )}
        <Controller
          name="fecha_inscripcion"
          control={control}
          render={({ field }) => (
            <DatePicker
              label="Fecha de inscripción"
              value={field.value ? dayjs(field.value) : null}
              onChange={(nuevaFecha) => field.onChange(nuevaFecha ? nuevaFecha.format('YYYY-MM-DD') : '')}
              format="DD/MM/YYYY"
              slotProps={{ textField: { fullWidth: true, margin: 'normal' } }}
            />
          )}
        />
        <TextField label="Firma (opcional)" fullWidth margin="normal" {...register('firma')} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          disabled={(esDelegado && (!miEquipo || yaEstaInscritoMiEquipo)) || torneoFinalizado}
          onClick={handleSubmit(handleGuardarInterno)}
        >
          Inscribir
        </Button>
      </DialogActions>
    </Dialog>
  );
}