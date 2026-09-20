import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box, Button, TextField, Typography, Alert, Paper,
  Link, IconButton, InputAdornment
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { registroSchema } from '../schemas/registro.schema';
import { registrar } from '../services/auth.service';

const valoresPorDefecto = {
  nombre: '', apellido: '', email: '', password: '',
};

export default function Registro() {
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState('');
  const [exito, setExito] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registroSchema),
    defaultValues: valoresPorDefecto,
  });

  const onSubmit = async (datos) => {
    setErrorApi('');
    try {
      await registrar({ ...datos, rol: 'aficionado' });
      setExito(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Error al registrarse');
    }
  };

  return (
    <Box
      sx={{
        height: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: 'grey.100',
      }}
    >
      <Paper sx={{ p: 4, width: 380 }}>
        <Typography variant="h5" sx={{ mb: 1, textAlign: 'center' }}>
          Crear cuenta de Aficionado
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Sigue los partidos, resultados y publicaciones del torneo
        </Typography>

        {errorApi && <Alert severity="error" sx={{ mb: 2 }}>{errorApi}</Alert>}
        {exito && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Cuenta creada. Redirigiendo al inicio de sesión...
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
            label="Contraseña"
            type={mostrarPassword ? 'text' : 'password'}
            fullWidth margin="normal"
            autoComplete="new-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setMostrarPassword((prev) => !prev)} edge="end">
                      {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }}>
            Registrarme
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          ¿Ya tienes cuenta?{' '}
          <Link component={RouterLink} to="/login">Inicia sesión aquí</Link>
        </Typography>
      </Paper>
    </Box>
  );
}