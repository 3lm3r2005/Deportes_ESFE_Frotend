import { useState } from 'react';
import { Box, Typography, Paper, Alert, Chip, Avatar, Divider } from '@mui/material';
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';
import ImageUpload from '../components/ImageUpload';
import { actualizarMiPerfil } from '../services/usuario.service';
import { getUsuarioActual, actualizarUsuarioLocal } from '../services/auth.service';

const ROL_CONFIG = {
  admin: { label: 'Administrador General', bg: '#FEF3C7', color: '#92400E' },
  delegado: { label: 'Delegado de Equipo', bg: '#E0F2FE', color: '#0369A1' },
  arbitro: { label: 'Colegiado / Árbitro', bg: '#FFEDD5', color: '#C2410C' },
  aficionado: { label: 'Aficionado', bg: '#D1FAE5', color: '#065F46' },
};

export default function Perfil() {
  const usuario = getUsuarioActual();
  const [fotoUrl, setFotoUrl] = useState(usuario?.foto_url || '');
  const [guardado, setGuardado] = useState(false);

  const rolInfo = ROL_CONFIG[usuario?.rol] || { label: usuario?.rol, bg: '#F1F5F9', color: '#475569' };

  const handleCambiarFoto = async (url) => {
    setFotoUrl(url);
    await actualizarMiPerfil({ foto_url: url });
    actualizarUsuarioLocal({ foto_url: url });
    setGuardado(true);
    setTimeout(() => window.location.reload(), 1200);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', pb: 4 }}>
      {/* HEADER DE PERFIL */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '12px',
            bgcolor: '#ECFDF5',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)',
          }}
        >
          <AccountCircleRoundedIcon sx={{ fontSize: 28 }} />
        </Box>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
            Mi Perfil de Usuario
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Información de tu cuenta deportiva institucional y personalización de avatar.
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3.5,
          borderRadius: 3,
          border: '1px solid #E2E8F0',
          bgcolor: '#FFFFFF',
        }}
      >
        {guardado && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            ¡Foto de perfil actualizada exitosamente! Recargando...
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
          <Avatar
            src={fotoUrl}
            sx={{
              width: 90,
              height: 90,
              bgcolor: '#1B5E20',
              fontSize: '2.2rem',
              fontWeight: 800,
              mb: 2,
              boxShadow: '0 4px 14px rgba(27,94,32,0.25)',
              border: '3px solid #FFFFFF',
              outline: '2px solid #10B981',
            }}
          >
            {usuario?.nombre?.charAt(0)}
          </Avatar>

          <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
            {usuario?.nombre} {usuario?.apellido}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', justifyContent: 'center', mb: 1.5 }}>
            <Chip
              label={rolInfo.label}
              size="small"
              sx={{ bgcolor: rolInfo.bg, color: rolInfo.color, fontWeight: 800 }}
            />
            <Chip
              icon={<BadgeRoundedIcon sx={{ fontSize: 14 }} />}
              label="Cuenta Activa"
              size="small"
              sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700 }}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
            <EmailRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
            <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
              {usuario?.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 2 }}>
            Actualizar Fotografía
          </Typography>
          <ImageUpload
            valor={fotoUrl}
            onCambiar={handleCambiarFoto}
            label="Subir nueva foto de perfil"
            variante="avatar"
          />
        </Box>
      </Paper>
    </Box>
  );
}