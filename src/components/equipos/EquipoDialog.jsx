import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem
} from '@mui/material';
import { equipoSchema } from '../../schemas/equipo.schema';
import { listarUsuarios } from '../../services/usuario.service';
import { getUsuarioActual } from '../../services/auth.service';
import ImageUpload from '../ImageUpload';

const valoresPorDefecto = {
  nombre: '',
  carrera: '',
  anio: new Date().getFullYear(),
  delegado_id: '',
};

export default function EquipoDialog({ open, onClose, onGuardar, equipo, equiposExistentes }) {
  const usuarioActual = getUsuarioActual();
  const esDelegado = usuarioActual?.rol === 'delegado';

  const [delegados, setDelegados] = useState([]);
  const [logoUrl, setLogoUrl] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(equipoSchema),
    defaultValues: esDelegado
      ? { ...valoresPorDefecto, delegado_id: usuarioActual.id }
      : valoresPorDefecto,
  });

  useEffect(() => {
    if (esDelegado) return;

    listarUsuarios().then((usuarios) => {
      const delegadosOcupados = equiposExistentes
        .filter((e) => e._id !== equipo?._id)
        .map((e) => e.delegado_id);

      const disponibles = usuarios.filter(
        (u) => u.rol === 'delegado' && !delegadosOcupados.includes(u._id)
      );
      setDelegados(disponibles);
    });
  }, [equiposExistentes, equipo]);

  useEffect(() => {
    if (equipo) {
      reset({
        nombre: equipo.nombre,
        carrera: equipo.carrera,
        anio: equipo.anio,
        delegado_id: equipo.delegado_id,
      });
      setLogoUrl(equipo.logo_url || '');
    } else {
      reset(
        esDelegado
          ? { ...valoresPorDefecto, delegado_id: usuarioActual.id }
          : valoresPorDefecto
      );
      setLogoUrl('');
    }
  }, [equipo, open, reset]);

  const handleGuardarInterno = (datos) => {
    onGuardar({ ...datos, logo_url: logoUrl });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{equipo ? 'Editar equipo' : 'Nuevo equipo'}</DialogTitle>
      <DialogContent>
        <ImageUpload
          valor={logoUrl}
          onCambiar={setLogoUrl}
          label="Subir logo del equipo"
          variante="avatar"
        />
        <TextField
          label="Nombre" fullWidth margin="normal"
          {...register('nombre')}
          error={!!errors.nombre} helperText={errors.nombre?.message}
        />
        <Controller
          name="carrera"
          control={control}
          render={({ field }) => (
            <TextField
              {...field} select label="Carrera" fullWidth margin="normal"
              error={!!errors.carrera} helperText={errors.carrera?.message}
            >
              <MenuItem value="Técnico en Ingeniería Eléctrica">Técnico en Ingeniería Eléctrica</MenuItem>
              <MenuItem value="Técnico en Desarrollo de Software">Técnico en Desarrollo de Software</MenuItem>
              <MenuItem value="Técnico en Mercadeo">Técnico en Mercadeo</MenuItem>
              <MenuItem value="Técnico en Turismo">Técnico en Turismo</MenuItem>
            </TextField>
          )}
        />
        <TextField
          label="Año" type="number" fullWidth margin="normal"
          slotProps={{ htmlInput: { min: 2020, max: 2100 } }}
          {...register('anio')}
          error={!!errors.anio} helperText={errors.anio?.message}
        />

        {esDelegado ? (
          <TextField
            label="Delegado" fullWidth margin="normal" disabled
            value={`${usuarioActual.nombre} ${usuarioActual.apellido} (${usuarioActual.email})`}
          />
        ) : (
          <Controller
            name="delegado_id"
            control={control}
            render={({ field }) => (
              <TextField
                {...field} select label="Delegado" fullWidth margin="normal"
                error={!!errors.delegado_id} helperText={errors.delegado_id?.message}
              >
                {delegados.map((d) => (
                  <MenuItem key={d._id} value={d._id}>
                    {d.nombre} {d.apellido} ({d.email})
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(handleGuardarInterno)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}