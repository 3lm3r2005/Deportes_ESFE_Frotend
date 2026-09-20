import { useState } from 'react';
import {
  Box, TextField, Button, Avatar, Typography, IconButton, Divider, Stack,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { getUsuarioActual } from '../../services/auth.service';
import { agregarComentario, editarComentario, eliminarComentario } from '../../services/publicacion.service';

export default function Comentarios({ publicacion, onActualizar }) {
  const usuarioActual = getUsuarioActual();
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [comentarioEditando, setComentarioEditando] = useState(null);
  const [textoEdicion, setTextoEdicion] = useState('');

  const [comentarioAEliminar, setComentarioAEliminar] = useState(null);

  const handleEnviar = async () => {
    if (!mensaje.trim()) return;
    setEnviando(true);
    try {
      const publicacionActualizada = await agregarComentario(publicacion._id, mensaje.trim());
      onActualizar(publicacionActualizada);
      setMensaje('');
    } finally {
      setEnviando(false);
    }
  };

  const handleAbrirEdicion = (comentario) => {
    setComentarioEditando(comentario);
    setTextoEdicion(comentario.mensaje);
  };

  const handleGuardarEdicion = async () => {
    if (!textoEdicion.trim()) return;
    const publicacionActualizada = await editarComentario(publicacion._id, comentarioEditando._id, textoEdicion.trim());
    onActualizar(publicacionActualizada);
    setComentarioEditando(null);
  };

  const handleConfirmarEliminar = async () => {
    const publicacionActualizada = await eliminarComentario(publicacion._id, comentarioAEliminar._id);
    onActualizar(publicacionActualizada);
    setComentarioAEliminar(null);
  };

  const comentarios = publicacion.comentarios || [];

  return (
    <Box sx={{ mt: 2 }}>
      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1.5} sx={{ mb: 2 }}>
        {comentarios.map((c) => {
          const esAutor = c.autor_id === usuarioActual?.id;
          const puedeEliminar = esAutor || usuarioActual?.rol === 'admin';
          return (
            <Box key={c._id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
              <Avatar src={c.autor_foto} sx={{ width: 32, height: 32 }} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {c.autor_nombre}
                </Typography>
                <Typography variant="body2">{c.mensaje}</Typography>
              </Box>
              {esAutor && (
                <IconButton size="small" onClick={() => handleAbrirEdicion(c)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
              {puedeEliminar && (
                <IconButton size="small" onClick={() => setComentarioAEliminar(c)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          );
        })}
        {comentarios.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            Sé el primero en comentar.
          </Typography>
        )}
      </Stack>

      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          size="small" fullWidth placeholder="Escribe un comentario..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
        />
        <Button variant="contained" onClick={handleEnviar} disabled={enviando || !mensaje.trim()}>
          Enviar
        </Button>
      </Box>

      <Dialog open={!!comentarioEditando} onClose={() => setComentarioEditando(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Editar comentario</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth multiline rows={3} margin="normal"
            value={textoEdicion}
            onChange={(e) => setTextoEdicion(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComentarioEditando(null)}>Descartar</Button>
          <Button variant="contained" onClick={handleGuardarEdicion}>Guardar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!comentarioAEliminar} onClose={() => setComentarioAEliminar(null)}>
        <DialogTitle>¿Eliminar este comentario?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Esta acción no se puede deshacer.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComentarioAEliminar(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleConfirmarEliminar}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}