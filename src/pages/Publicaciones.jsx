import { useEffect, useState, useCallback } from 'react';
import {
  Box, Button, Typography, Card, CardContent, CardActions,
  IconButton, Stack, Paper, Chip, Avatar, Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import Loading from '../components/Loading';
import PublicacionDialog from '../components/publicaciones/PublicacionDialog';
import Comentarios from '../components/publicaciones/Comentarios';
import {
  listarPublicaciones, crearPublicacion, actualizarPublicacion, eliminarPublicacion
} from '../services/publicacion.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Publicaciones() {
  const usuario = getUsuarioActual();
  const esAdmin = usuario?.rol === 'admin';

  const [publicaciones, setPublicaciones] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [publicacionEditando, setPublicacionEditando] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);

  const cargarPublicaciones = useCallback(async (mostrarSpinner = false) => {
    if (mostrarSpinner) setCargando(true);
    try {
      const data = await listarPublicaciones();
      setPublicaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error al cargar publicaciones:', err);
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    let activo = true;

    const iniciarCarga = async () => {
      try {
        const data = await listarPublicaciones();
        if (activo) {
          setPublicaciones(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error al cargar publicaciones iniciales:', err);
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    iniciarCarga();

    // Auto-refresco periódico en segundo plano cada 5 segundos para sincronizar mensajes y comentarios
    const intervalo = setInterval(() => {
      cargarPublicaciones(false);
    }, 5000);

    // Refrescar inmediatamente al enfocar la ventana
    const onVentanaEnfocada = () => cargarPublicaciones(false);
    window.addEventListener('focus', onVentanaEnfocada);

    // Refrescar si el usuario actualiza su foto de perfil
    const onPerfilActualizado = () => cargarPublicaciones(false);
    window.addEventListener('usuario-perfil-actualizado', onPerfilActualizado);

    return () => {
      activo = false;
      clearInterval(intervalo);
      window.removeEventListener('focus', onVentanaEnfocada);
      window.removeEventListener('usuario-perfil-actualizado', onPerfilActualizado);
    };
  }, [cargarPublicaciones]);

  const handleRefrescarManual = async () => {
    setRefrescando(true);
    await cargarPublicaciones(false);
    setTimeout(() => setRefrescando(false), 500);
  };

  const handleNueva = () => {
    setPublicacionEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (publicacion) => {
    setPublicacionEditando(publicacion);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (publicacionEditando) {
      await actualizarPublicacion(publicacionEditando._id, datos);
    } else {
      await crearPublicacion(datos);
    }
    setDialogAbierto(false);
    cargarPublicaciones();
  };

  const handleEliminar = async (publicacion) => {
    if (confirm(`¿Eliminar la publicación "${publicacion.titulo}"?`)) {
      await eliminarPublicacion(publicacion._id);
      cargarPublicaciones();
    }
  };

  const handleActualizarPublicacion = (publicacionActualizada) => {
    setPublicaciones((prev) =>
      prev.map((p) => (p._id === publicacionActualizada._id ? publicacionActualizada : p))
    );
  };

  if (cargando) return <Loading />;

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto', pb: 4 }}>
      {/* HEADER DE PUBLICACIONES */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 42, sm: 48 },
              height: { xs: 42, sm: 48 },
              borderRadius: '12px',
              bgcolor: '#F0FDF4',
              color: '#16A34A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)',
              flexShrink: 0,
            }}
          >
            <FeedRoundedIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
              Muro Deportivo y Noticias
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
              Comunicados oficiales de los torneos, crónicas de partidos y espacio de interacción estudiantil.
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', sm: 'auto' } }}>
          <Tooltip title="Actualizar publicaciones y comentarios en tiempo real">
            <Button
              variant="outlined"
              onClick={handleRefrescarManual}
              disabled={refrescando}
              startIcon={
                <RefreshRoundedIcon
                  sx={{
                    animation: refrescando ? 'spin 1s linear infinite' : 'none',
                    '@keyframes spin': {
                      '0%': { transform: 'rotate(0deg)' },
                      '100%': { transform: 'rotate(360deg)' },
                    },
                  }}
                />
              }
              sx={{
                color: '#1B5E20',
                borderColor: '#A7F3D0',
                bgcolor: '#FFFFFF',
                fontWeight: 700,
                px: 2,
                py: 0.9,
                borderRadius: 2,
                boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                flex: { xs: 1, sm: 'none' },
                '&:hover': {
                  bgcolor: '#ECFDF5',
                  borderColor: '#10B981',
                },
              }}
            >
              {refrescando ? 'Actualizando...' : 'Refrescar'}
            </Button>
          </Tooltip>

          {esAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleNueva}
              sx={{
                bgcolor: '#1B5E20',
                fontWeight: 700,
                px: 2.5,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 4px 12px rgba(27, 94, 32, 0.25)',
                flex: { xs: 1, sm: 'none' },
                '&:hover': { bgcolor: '#14532D' },
              }}
            >
              Nueva Publicación
            </Button>
          )}
        </Box>
      </Box>

      {publicaciones.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
          <Typography color="text.secondary">Todavía no hay publicaciones registradas.</Typography>
        </Paper>
      )}

      {/* FEED DE PUBLICACIONES */}
      <Stack spacing={3}>
        {publicaciones.map((p) => (
          <Card
            key={p._id}
            elevation={0}
            sx={{
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              transition: 'box-shadow 0.2s ease',
              '&:hover': {
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.06)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              {/* Meta cabecera */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                  <Avatar sx={{ width: 36, height: 36, bgcolor: '#1B5E20', fontWeight: 700, fontSize: '0.85rem' }}>
                    E
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                      Deportes ESFE
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarMonthRoundedIcon sx={{ fontSize: 13, color: '#94A3B8' }} />
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {p.fecha_publicacion ? new Date(p.fecha_publicacion).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Chip label="Comunicado Oficial" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: '0.72rem' }} />
              </Box>

              {/* Título */}
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1.5, letterSpacing: '-0.3px' }}>
                {p.titulo}
              </Typography>

              {/* Imagen opcional */}
              {p.imagen_url && (
                <Box
                  component="img"
                  src={p.imagen_url}
                  alt={p.titulo}
                  sx={{
                    width: '100%',
                    maxHeight: 420,
                    objectFit: 'cover',
                    borderRadius: 2.5,
                    mb: 2.5,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                  }}
                />
              )}

              {/* Mensaje */}
              <Typography variant="body1" sx={{ color: '#334155', lineHeight: 1.7, mb: 2.5, whiteSpace: 'pre-line' }}>
                {p.mensaje}
              </Typography>

              {/* Comentarios interactivos */}
              <Comentarios publicacion={p} onActualizar={handleActualizarPublicacion} />
            </CardContent>

            {esAdmin && (
              <CardActions sx={{ px: 3, py: 1.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'flex-end', gap: 1 }}>
                <Tooltip title="Editar Publicación">
                  <IconButton size="small" onClick={() => handleEditar(p)} sx={{ color: '#0284C7' }}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar Publicación">
                  <IconButton size="small" onClick={() => handleEliminar(p)} sx={{ color: '#DC2626' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </CardActions>
            )}
          </Card>
        ))}
      </Stack>

      {esAdmin && (
        <PublicacionDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleGuardar}
          publicacion={publicacionEditando}
        />
      )}
    </Box>
  );
}