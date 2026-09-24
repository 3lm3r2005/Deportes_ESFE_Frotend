import { useState, useEffect, useRef } from 'react';
import {
  Box, TextField, Button, Avatar, Typography, IconButton, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions, Tooltip, Chip
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { getUsuarioActual } from '../../services/auth.service';
import { agregarComentario, editarComentario, eliminarComentario } from '../../services/publicacion.service';

export default function Comentarios({ publicacion, onActualizar }) {
  const [usuarioActual, setUsuarioActual] = useState(getUsuarioActual());
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [desplegado, setDesplegado] = useState(false);

  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState('');
  const [guardandoEdicion, setGuardandoEdicion] = useState(false);

  const [comentarioAEliminar, setComentarioAEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cajaRef = useRef(null);

  // Escuchar cuando el usuario actualiza su foto de perfil en /perfil para reflejarla en vivo
  useEffect(() => {
    const sincronizarPerfil = () => {
      setUsuarioActual(getUsuarioActual());
    };
    window.addEventListener('usuario-perfil-actualizado', sincronizarPerfil);
    window.addEventListener('storage', sincronizarPerfil);
    return () => {
      window.removeEventListener('usuario-perfil-actualizado', sincronizarPerfil);
      window.removeEventListener('storage', sincronizarPerfil);
    };
  }, []);

  const comentarios = publicacion?.comentarios || [];
  const totalComentarios = comentarios.length;
  const tieneMasDeDos = totalComentarios > 2;

  // Si no está desplegada la caja y hay más de 2 comentarios, mostrar los 2 más recientes
  const comentariosAMostrar = (!desplegado && tieneMasDeDos)
    ? comentarios.slice(-2)
    : comentarios;

  const handleEnviar = async () => {
    if (!mensaje.trim() || enviando) return;
    setEnviando(true);
    try {
      const publicacionActualizada = await agregarComentario(publicacion._id, mensaje.trim());
      onActualizar(publicacionActualizada);
      setMensaje('');
      setDesplegado(true); // Desplegar automáticamente para ver el nuevo mensaje
      setTimeout(() => {
        if (cajaRef.current) {
          cajaRef.current.scrollTo({
            top: cajaRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }
      }, 150);
    } catch (err) {
      console.error('Error al enviar comentario:', err);
    } finally {
      setEnviando(false);
    }
  };

  const handleAbrirEdicion = (comentario) => {
    setComentarioEditando(comentario);
    setTextoEdicion(comentario.mensaje);
  };

  const handleGuardarEdicion = async () => {
    if (!textoEdicion.trim() || guardandoEdicion) return;
    setGuardandoEdicion(true);
    try {
      const publicacionActualizada = await editarComentario(
        publicacion._id,
        comentarioEditando._id,
        textoEdicion.trim()
      );
      onActualizar(publicacionActualizada);
      setComentarioEditando(null);
    } catch (err) {
      console.error('Error al editar comentario:', err);
    } finally {
      setGuardandoEdicion(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!comentarioAEliminar || eliminando) return;
    setEliminando(true);
    try {
      const publicacionActualizada = await eliminarComentario(
        publicacion._id,
        comentarioAEliminar._id
      );
      onActualizar(publicacionActualizada);
      setComentarioAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
    } finally {
      setEliminando(false);
    }
  };

  const formatearFecha = (fecha) => {
    if (!fecha) return '';
    try {
      const d = new Date(fecha);
      return d.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const renderComentario = (c) => {
    const autorIdStr = String(c.autor_id?._id || c.autor_id || '');
    const actualIdStr = String(usuarioActual?.id || usuarioActual?._id || '');
    const esAutor = !!actualIdStr && autorIdStr === actualIdStr;
    const puedeEliminar = esAutor || usuarioActual?.rol === 'admin';

    // Priorizar foto y nombre actualizados del usuario logueado en todos sus mensajes antiguos
    const foto = esAutor && usuarioActual?.foto_url
      ? usuarioActual.foto_url
      : (c.autor_foto || c.autor_id?.foto_url);

    const nombre = esAutor && usuarioActual?.nombre
      ? `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim()
      : (c.autor_id?.nombre ? `${c.autor_id.nombre} ${c.autor_id.apellido || ''}`.trim() : c.autor_nombre);

    const inicial = nombre ? nombre.charAt(0).toUpperCase() : 'U';

    return (
      <Box
        key={c._id}
        sx={{
          display: 'flex',
          justifyContent: esAutor ? 'flex-end' : 'flex-start',
          width: '100%',
          my: 0.5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: esAutor ? 'row-reverse' : 'row',
            alignItems: 'flex-end',
            gap: 1,
            maxWidth: { xs: '92%', sm: '82%' },
          }}
        >
          {/* Avatar del autor */}
          <Avatar
            src={foto}
            sx={{
              width: 30,
              height: 30,
              bgcolor: esAutor ? '#1B5E20' : '#2E7D32',
              fontSize: '0.78rem',
              fontWeight: 800,
              border: '2px solid #FFFFFF',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              flexShrink: 0,
              mb: 0.3,
            }}
          >
            {inicial}
          </Avatar>

          {/* BURBUJA ESTILO WHATSAPP */}
          <Box
            sx={{
              position: 'relative',
              p: 1.2,
              px: 1.6,
              // Mis mensajes: Color menta fresco WhatsApp (#D1FAE5)
              // Mensajes de los demás: Color verdecito pasto claro institucional (#E8F5E9)
              bgcolor: esAutor ? '#D1FAE5' : '#E8F5E9',
              border: esAutor ? '1px solid #A7F3D0' : '1px solid #C8E6C9',
              borderRadius: esAutor ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              transition: 'all 0.15s ease',
              minWidth: 140,
              '&:hover': {
                boxShadow: '0 2px 6px rgba(0,0,0,0.09)',
              },
            }}
          >
            {/* Cabecera de la burbuja: Nombre / Rol y Acciones */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 0.3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    color: esAutor ? '#065F46' : '#1B5E20', // Verdecito pasto oscuro
                  }}
                >
                  {esAutor ? 'Tú' : nombre}
                </Typography>
                {esAutor && (
                  <Chip
                    label="Mío"
                    size="small"
                    sx={{
                      height: 16,
                      fontSize: '0.62rem',
                      bgcolor: '#A7F3D0',
                      color: '#064E3B',
                      fontWeight: 800,
                      px: 0.2,
                    }}
                  />
                )}
              </Box>

              {/* Botones de acción dentro de la burbuja */}
              {(esAutor || puedeEliminar) && (
                <Box sx={{ display: 'flex', gap: 0.2, ml: 1 }}>
                  {esAutor && (
                    <Tooltip title="Editar comentario">
                      <IconButton
                        size="small"
                        onClick={() => handleAbrirEdicion(c)}
                        sx={{
                          color: '#065F46',
                          p: 0.2,
                          '&:hover': { color: '#0284C7', bgcolor: 'rgba(2,132,199,0.1)' },
                        }}
                      >
                        <EditRoundedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                  {puedeEliminar && (
                    <Tooltip title="Eliminar comentario">
                      <IconButton
                        size="small"
                        onClick={() => setComentarioAEliminar(c)}
                        sx={{
                          color: esAutor ? '#065F46' : '#64748B',
                          p: 0.2,
                          '&:hover': { color: '#DC2626', bgcolor: 'rgba(220,38,38,0.1)' },
                        }}
                      >
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 13 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              )}
            </Box>

            {/* Contenido del mensaje */}
            <Typography
              variant="body2"
              sx={{
                color: esAutor ? '#064E3B' : '#1F2937',
                lineHeight: 1.45,
                wordBreak: 'break-word',
                fontSize: '0.86rem',
                pr: 2,
              }}
            >
              {c.mensaje}
            </Typography>

            {/* Fecha / Hora estilo WhatsApp en la esquina inferior */}
            {c.fecha && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.4 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: '0.67rem',
                    color: esAutor ? '#047857' : '#64748B',
                    fontWeight: 600,
                  }}
                >
                  {formatearFecha(c.fecha)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={{ mt: 2.5 }}>
      <Divider sx={{ mb: 2, borderColor: '#F1F5F9' }} />

      {/* CABECERA / TOGGLE DE COMENTARIOS */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ForumRoundedIcon sx={{ fontSize: 20, color: '#1B5E20' }} />
          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B' }}>
            Comentarios
          </Typography>
          <Chip
            label={totalComentarios}
            size="small"
            sx={{
              height: 20,
              fontSize: '0.72rem',
              fontWeight: 800,
              bgcolor: totalComentarios > 0 ? '#E8F5E9' : '#F1F5F9',
              color: totalComentarios > 0 ? '#1B5E20' : '#64748B',
            }}
          />
        </Box>

        {tieneMasDeDos && (
          <Button
            size="small"
            variant="text"
            onClick={() => setDesplegado((prev) => !prev)}
            endIcon={desplegado ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
            sx={{
              fontWeight: 700,
              fontSize: '0.78rem',
              color: '#1B5E20',
              textTransform: 'none',
              px: 1.2,
              py: 0.4,
              borderRadius: 2,
              bgcolor: '#F0FDF4',
              '&:hover': { bgcolor: '#DCFCE7' },
            }}
          >
            {desplegado
              ? 'Ocultar caja de comentarios'
              : `Ver todos los comentarios (${totalComentarios})`}
          </Button>
        )}
      </Box>

      {/* ESTADO VACÍO */}
      {totalComentarios === 0 && (
        <Box
          sx={{
            py: 2.5,
            px: 2,
            textAlign: 'center',
            bgcolor: '#F8FAFC',
            borderRadius: 2.5,
            border: '1px dashed #CBD5E1',
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 500 }}>
            Sé el primero en compartir un comentario o mensaje en esta publicación.
          </Typography>
        </Box>
      )}

      {/* CAJA DE MENSAJES DESPLEGADA (SCROLLABLE) O VISTA PREVIA COMPACTA (HASTA 2 MENSAJES) */}
      {totalComentarios > 0 && (
        desplegado ? (
          <Box
            ref={cajaRef}
            sx={{
              maxHeight: 320,
              overflowY: 'auto',
              p: 2,
              borderRadius: 3,
              bgcolor: '#F3F7F4',
              border: '1px solid #D5E1D7',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.6,
              mb: 2,
              backgroundImage: 'radial-gradient(#CBD5E1 0.8px, transparent 0.8px)',
              backgroundSize: '14px 14px',
              boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.03)',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#EAEFEA',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#A7F3D0',
                borderRadius: '8px',
              },
              '&::-webkit-scrollbar-thumb:hover': {
                background: '#10B981',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1, px: 0.5, borderBottom: '1px solid #E2E8F0', mb: 0.8 }}>
              <Typography variant="caption" sx={{ color: '#1B5E20', fontWeight: 800, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
                Chat de comentarios ({totalComentarios})
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B', fontSize: '0.7rem' }}>
                Menta: tus mensajes • Pasto: otros usuarios
              </Typography>
            </Box>
            {comentarios.map((c) => renderComentario(c))}
          </Box>
        ) : (
          <Stack spacing={0.6} sx={{ mb: 2 }}>
            {comentariosAMostrar.map((c) => renderComentario(c))}
          </Stack>
        )
      )}

      {/* INPUT PARA ESCRIBIR COMENTARIO */}
      <Box sx={{ display: 'flex', gap: 1.2, alignItems: 'center' }}>
        <Avatar
          src={usuarioActual?.foto_url}
          sx={{
            width: 36,
            height: 36,
            bgcolor: '#1B5E20',
            fontWeight: 700,
            fontSize: '0.85rem',
            border: '2px solid #E2E8F0',
          }}
        >
          {usuarioActual?.nombre?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>

        <TextField
          size="small"
          fullWidth
          placeholder="Escribe un comentario institucional..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleEnviar();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2.5,
              bgcolor: '#FFFFFF',
              '&:hover fieldset': { borderColor: '#1B5E20' },
              '&.Mui-focused fieldset': { borderColor: '#1B5E20' },
            },
          }}
        />

        <Button
          variant="contained"
          onClick={handleEnviar}
          disabled={enviando || !mensaje.trim()}
          startIcon={<SendRoundedIcon />}
          sx={{
            bgcolor: '#1B5E20',
            fontWeight: 700,
            px: 2.2,
            py: 0.9,
            borderRadius: 2.5,
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 10px rgba(27, 94, 32, 0.2)',
            '&:hover': { bgcolor: '#14532D' },
          }}
        >
          {enviando ? 'Enviando...' : 'Comentar'}
        </Button>
      </Box>

      {/* DIÁLOGO PARA EDITAR COMENTARIO */}
      <Dialog
        open={!!comentarioEditando}
        onClose={() => setComentarioEditando(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          Editar Comentario
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={textoEdicion}
            onChange={(e) => setTextoEdicion(e.target.value)}
            placeholder="Modifica tu comentario..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setComentarioEditando(null)}
            sx={{ color: '#64748B', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            onClick={handleGuardarEdicion}
            disabled={guardandoEdicion || !textoEdicion.trim()}
            sx={{ bgcolor: '#1B5E20', fontWeight: 700, '&:hover': { bgcolor: '#14532D' } }}
          >
            {guardandoEdicion ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DIÁLOGO PARA CONFIRMAR ELIMINACIÓN */}
      <Dialog
        open={!!comentarioAEliminar}
        onClose={() => setComentarioAEliminar(null)}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0F172A', pb: 1 }}>
          ¿Eliminar comentario?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: '#64748B' }}>
            Esta acción eliminará el comentario de la publicación permanentemente.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button
            onClick={() => setComentarioAEliminar(null)}
            sx={{ color: '#64748B', fontWeight: 600 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleConfirmarEliminar}
            disabled={eliminando}
            sx={{ fontWeight: 700 }}
          >
            {eliminando ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}