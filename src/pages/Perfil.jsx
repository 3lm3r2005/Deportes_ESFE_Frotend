import { useState } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import ImageUpload from '../components/ImageUpload';
import { actualizarMiPerfil } from '../services/usuario.service';
import { getUsuarioActual, actualizarUsuarioLocal } from '../services/auth.service';

export default function Perfil() {
  const usuario = getUsuarioActual();
  const [fotoUrl, setFotoUrl] = useState(usuario?.foto_url || '');
  const [guardado, setGuardado] = useState(false);

  const handleCambiarFoto = async (url) => {
    setFotoUrl(url);
    await actualizarMiPerfil({ foto_url: url });
    actualizarUsuarioLocal({ foto_url: url });
    setGuardado(true);
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <Box sx={{ maxWidth: 500 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>Mi perfil</Typography>
      <Paper sx={{ p: 3 }}>
        {guardado && <Alert severity="success" sx={{ mb: 2 }}>Foto actualizada</Alert>}
        <Typography variant="h6">{usuario?.nombre} {usuario?.apellido}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {usuario?.email} · {usuario?.rol}
        </Typography>
        <ImageUpload
          valor={fotoUrl}
          onCambiar={handleCambiarFoto}
          label="Cambiar foto de perfil"
          variante="avatar"
        />
      </Paper>
    </Box>
  );
}