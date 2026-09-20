import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TorneoTable from '../components/torneos/TorneoTable';
import TorneoDialog from '../components/torneos/TorneoDialog';
import InscripcionEquipoDialog from '../components/torneos/InscripcionEquipoDialog';
import Loading from '../components/Loading';
import {
  listarTorneos, crearTorneo, actualizarTorneo, eliminarTorneo, inscribirEquipoEnTorneo
} from '../services/torneo.service';
import { listarEquipos } from '../services/equipo.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Torneos() {
  const [torneos, setTorneos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [torneoEditando, setTorneoEditando] = useState(null);
  const [inscripcionAbierta, setInscripcionAbierta] = useState(false);
  const [torneoSeleccionado, setTorneoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  const usuario = getUsuarioActual();
  const esAdmin = usuario?.rol === 'admin';
  const esDelegado = usuario?.rol === 'delegado';

  const cargarTorneos = async () => {
    const data = await listarTorneos();
    setTorneos(data);
  };

  const cargarEquipos = async () => {
    const data = await listarEquipos();
    setEquipos(data);
  };

  useEffect(() => {
    Promise.all([cargarTorneos(), cargarEquipos()]).finally(() => setCargando(false));
  }, []);

  const handleNuevo = () => {
    setTorneoEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (torneo) => {
    setTorneoEditando(torneo);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (torneoEditando) {
      await actualizarTorneo(torneoEditando._id, datos);
    } else {
      await crearTorneo(datos);
    }
    setDialogAbierto(false);
    cargarTorneos();
  };

  const handleEliminar = async (torneo) => {
    if (confirm(`¿Eliminar el torneo "${torneo.nombre}"?`)) {
      await eliminarTorneo(torneo._id);
      cargarTorneos();
    }
  };

  const handleInscribirEquipo = (torneo) => {
    setTorneoSeleccionado(torneo);
    setInscripcionAbierta(true);
  };

  const handleGuardarInscripcion = async (datos) => {
    await inscribirEquipoEnTorneo(torneoSeleccionado._id, datos);
    setInscripcionAbierta(false);
    cargarTorneos();
  };

  if (cargando) return <Loading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Torneos</Typography>
        {esAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
            Nuevo torneo
          </Button>
        )}
      </Box>
      <TorneoTable
        torneos={torneos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onInscribirEquipo={handleInscribirEquipo}
        puedeEditar={esAdmin}
        puedeEliminar={esAdmin}
        puedeInscribir={esAdmin || esDelegado}
      />
      {esAdmin && (
        <TorneoDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleGuardar}
          torneo={torneoEditando}
        />
      )}
      <InscripcionEquipoDialog
        open={inscripcionAbierta}
        onClose={() => setInscripcionAbierta(false)}
        onGuardar={handleGuardarInscripcion}
        torneo={torneoSeleccionado}
        equipos={equipos}
      />
    </Box>
  );
}