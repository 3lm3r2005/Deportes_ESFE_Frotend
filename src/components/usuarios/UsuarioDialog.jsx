import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Alert
} from '@mui/material';
import { usuarioCrearSchema, usuarioEditarSchema } from '../../schemas/usuario.schema';
import ImageUpload from '../ImageUpload';

const valoresPorDefecto = {
  nombre: '', apellido: '', email: '', password: '', rol: 'delegado', estado: 'activo',
};

export default function UsuarioDialog({ open, onClose, onGuardar, usuario }) {
  const [fotoUrl, setFotoUrl] = useState('');
  const [errorApi, setErrorApi] = useState('');

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(usuario ? usuarioEditarSchema : usuarioCrearSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (usuario) {
      reset({
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        password: '',
        rol: usuario.rol,
        estado: usuario.estado,
      });
      setFotoUrl(usuario.foto_url || '');
    } else {
      reset(valoresPorDefecto);
      setFotoUrl('');
    }
    setErrorApi('');
  }, [usuario, open, reset]);

  const handleGuardarInterno = async (datos) => {
    setErrorApi('');
    const datosConFoto = { ...datos, foto_url: fotoUrl };
    try {
      if (usuario && !datosConFoto.password) {
        const { password, ...sinPassword } = datosConFoto;
        await onGuardar(sinPassword);
      } else {
        await onGuardar(datosConFoto);
      }
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Ocurrió un error al guardar');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{usuario ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
      <DialogContent>
        {errorApi && <Alert severity="error" sx={{ mb: 2 }}>{errorApi}</Alert>}
        <ImageUpload
          valor={fotoUrl}
          onCambiar={setFotoUrl}
          label="Subir foto de perfil"
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
        <TextField
          label="Correo electrónico" fullWidth margin="normal"
          {...register('email')}
          error={!!errors.email} helperText={errors.email?.message}
        />
        <TextField
          label={usuario ? 'Nueva contraseña (opcional)' : 'Contraseña'}
          type="password" fullWidth margin="normal"
          {...register('password')}
          error={!!errors.password} helperText={errors.password?.message}
        />
        <Controller
          name="rol"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Rol" fullWidth margin="normal">
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="arbitro">Árbitro</MenuItem>
              <MenuItem value="delegado">Delegado</MenuItem>
              <MenuItem value="aficionado">Aficionado</MenuItem>
            </TextField>
          )}
        />
        <Controller
          name="estado"
          control={control}
          render={({ field }) => (
            <TextField {...field} select label="Estado" fullWidth margin="normal">
              <MenuItem value="activo">Activo</MenuItem>
              <MenuItem value="inactivo">Inactivo</MenuItem>
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