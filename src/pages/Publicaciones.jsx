import { useEffect, useState } from 'react';
import {
  Box, Button, Typography, Card, CardContent, CardActions,
  IconButton, Stack
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
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

  const cargarPublicaciones = async () => {
    const data = await listarPublicaciones();
    setPublicaciones(data);
  };

  useEffect(() => {
    cargarPublicaciones().finally(() => setCargando(false));
  }, []);

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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Publicaciones</Typography>
        {esAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNueva}>
            Nueva publicación
          </Button>
        )}
      </Box>

      {publicaciones.length === 0 && (
        <Typography color="text.secondary">Todavía no hay publicaciones.</Typography>
      )}

      <Stack spacing={2}>
        {publicaciones.map((p) => (
          <Card key={p._id}>
            <CardContent>
              <Typography variant="h6">{p.titulo}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {new Date(p.fecha_publicacion).toLocaleDateString()}
              </Typography>
              {p.imagen_url && (
                <Box
                  component="img"
                  src={p.imagen_url}
                  sx={{ width: '100%', maxHeight: 400, objectFit: 'contain', borderRadius: 1, mb: 2, bgcolor: 'grey.100' }}
                />
              )}
              <Typography variant="body1">{p.mensaje}</Typography>

              <Comentarios publicacion={p} onActualizar={handleActualizarPublicacion} />
            </CardContent>
            {esAdmin && (
              <CardActions>
                <IconButton onClick={() => handleEditar(p)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleEliminar(p)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
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