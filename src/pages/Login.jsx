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
import { loginSchema } from '../schemas/login.schema';
import { login } from '../services/auth.service';

export default function Login() {
  const navigate = useNavigate();
  const [errorApi, setErrorApi] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setErrorApi('');
    try {
      await login(data.email, data.password);
    navigate('/inicio');
    } catch (error) {
      setErrorApi(error.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
        p: 2,
      }}
    >
      <Paper sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 380, borderRadius: 3 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          Deportes ESFE
        </Typography>

        {errorApi && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorApi}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <TextField
            label="Correo electrónico"
            fullWidth
            margin="normal"
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            label="Contraseña"
            type={mostrarPassword ? 'text' : 'password'}
            fullWidth
            margin="normal"
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
            Iniciar sesión
          </Button>
        </Box>

        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
          ¿No tienes cuenta?{' '}
          <Link component={RouterLink} to="/registro">Regístrate aquí</Link>
        </Typography>
      </Paper>
    </Box>
  );
}