import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ConvocatoriaTable from '../components/convocatorias/ConvocatoriaTable';
import ConvocatoriaDialog from '../components/convocatorias/ConvocatoriaDialog';
import Loading from '../components/Loading';
import {
  listarConvocatorias, crearConvocatoria, actualizarConvocatoria, eliminarConvocatoria
} from '../services/convocatoria.service';
import { listarTorneos } from '../services/torneo.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Convocatorias() {
  const usuario = getUsuarioActual();
  const esAdmin = usuario?.rol === 'admin';

  const [convocatorias, setConvocatorias] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [convocatoriaEditando, setConvocatoriaEditando] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarTodo = async () => {
    const [c, t] = await Promise.all([listarConvocatorias(), listarTorneos()]);
    setConvocatorias(c);
    setTorneos(t);
  };

  useEffect(() => {
    cargarTodo().finally(() => setCargando(false));
  }, []);

  const handleNuevo = () => {
    setConvocatoriaEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (convocatoria) => {
    setConvocatoriaEditando(convocatoria);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (convocatoriaEditando) {
      await actualizarConvocatoria(convocatoriaEditando._id, datos);
    } else {
      await crearConvocatoria(datos);
    }
    setDialogAbierto(false);
    cargarTodo();
  };

  const handleEliminar = async (convocatoria) => {
    if (confirm(`¿Eliminar la convocatoria "${convocatoria.titulo}"?`)) {
      await eliminarConvocatoria(convocatoria._id);
      cargarTodo();
    }
  };

  if (cargando) return <Loading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Convocatorias</Typography>
        {esAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
            Nueva convocatoria
          </Button>
        )}
      </Box>
      <ConvocatoriaTable
        convocatorias={convocatorias}
        torneos={torneos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        puedeEditar={esAdmin}
        puedeEliminar={esAdmin}
      />
      {esAdmin && (
        <ConvocatoriaDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleGuardar}
          convocatoria={convocatoriaEditando}
          torneos={torneos}
        />
      )}
    </Box>
  );
}