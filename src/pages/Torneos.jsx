import { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
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
    setTorneos(Array.isArray(data) ? data : []);
  };

  const cargarEquipos = async () => {
    const data = await listarEquipos();
    setEquipos(Array.isArray(data) ? data : []);
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* HEADER DE LA PÁGINA */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
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
            <EmojiEventsRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Torneos y Campeonatos
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Gestión de campeonatos oficiales de ESFE, períodos de vigencia e inscripción de selecciones.
            </Typography>
          </Box>
        </Box>

        {esAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
            sx={{
              bgcolor: '#1B5E20',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.25)',
              '&:hover': { bgcolor: '#14532D' },
            }}
          >
            Nuevo Torneo
          </Button>
        )}
      </Box>

      {/* TABLA DE TORNEOS */}
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