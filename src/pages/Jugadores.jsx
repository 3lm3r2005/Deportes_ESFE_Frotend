import { useEffect, useState } from 'react';
import { Box, Button, Typography, TablePagination, Paper, Chip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import JugadorTable from '../components/jugadores/JugadorTable';
import JugadorDialog from '../components/jugadores/JugadorDialog';
import InscripcionTable from '../components/jugadores/InscripcionTable';
import InscripcionJugadorDialog from '../components/jugadores/InscripcionJugadorDialog';
import Loading from '../components/Loading';
import {
  listarJugadores, listarJugadoresPaginado, crearJugador, actualizarJugador, eliminarJugador
} from '../services/jugador.service';
import { listarEquipos, actualizarEquipo } from '../services/equipo.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Jugadores() {
  const usuario = getUsuarioActual();
  const esDelegado = usuario?.rol === 'delegado';
  const esAdmin = usuario?.rol === 'admin';

  const [jugadores, setJugadores] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [jugadorEditando, setJugadorEditando] = useState(null);
  const [miEquipo, setMiEquipo] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [totalJugadores, setTotalJugadores] = useState(0);

  const cargarJugadoresTabla = async () => {
    const data = await listarJugadoresPaginado(pagina + 1, filasPorPagina);
    setJugadores(data?.jugadores || []);
    setTotalJugadores(data?.total || 0);
  };

  const cargarJugadoresDelegado = async () => {
    const data = await listarJugadores();
    setJugadores(Array.isArray(data) ? data : []);
  };

  const cargarMiEquipo = async () => {
    const equipos = await listarEquipos();
    setMiEquipo(equipos[0] || null);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      if (esDelegado) {
        await cargarJugadoresDelegado();
        await cargarMiEquipo();
      } else {
        await cargarJugadoresTabla();
      }
      setCargando(false);
    };
    cargarDatos();
  }, [pagina, filasPorPagina]);

  const handleCambiarPagina = (evento, nuevaPagina) => setPagina(nuevaPagina);
  const handleCambiarFilasPorPagina = (evento) => {
    setFilasPorPagina(parseInt(evento.target.value, 10));
    setPagina(0);
  };

  const handleNuevo = () => {
    setJugadorEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (jugador) => {
    setJugadorEditando(jugador);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (jugadorEditando) {
      await actualizarJugador(jugadorEditando._id, datos);
    } else {
      await crearJugador(datos);
    }
    setDialogAbierto(false);
    cargarJugadoresTabla();
  };

  const handleEliminar = async (jugador) => {
    if (confirm(`¿Eliminar al jugador "${jugador.nombre} ${jugador.apellido}"?`)) {
      await eliminarJugador(jugador._id);
      cargarJugadoresTabla();
    }
  };

  const handleInscribir = async (datos) => {
    const { dorsal, ...datosJugador } = datos;
    const nuevoJugador = await crearJugador(datosJugador);

    const nuevaLista = [
      ...(miEquipo.jugadores_inscritos || []),
      {
        jugador_id: nuevoJugador._id,
        dorsal,
        estado: 'titular',
        fecha_alta: new Date().toISOString().slice(0, 10),
      },
    ];

    await actualizarEquipo(miEquipo._id, { jugadores_inscritos: nuevaLista });
    setDialogAbierto(false);
    await cargarJugadoresDelegado();
    await cargarMiEquipo();
  };

  const handleQuitar = async (jugadorId) => {
    if (!confirm('¿Quitar a este jugador de la nómina de tu equipo?')) return;
    const nuevaLista = miEquipo.jugadores_inscritos.filter((j) => j.jugador_id !== jugadorId);
    await actualizarEquipo(miEquipo._id, { jugadores_inscritos: nuevaLista });
    await cargarJugadoresDelegado();
    await cargarMiEquipo();
  };

  if (cargando) return <Loading />;

  if (esDelegado) {
    const inscritosCount = miEquipo?.jugadores_inscritos?.length || 0;

    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
        {/* HEADER DELEGADO */}
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
              <HowToRegRoundedIcon sx={{ fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
                Nómina Oficial: {miEquipo?.nombre || 'Mi Equipo'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B' }}>
                Inscribe y administra los futbolistas de tu equipo con su carné estudiantil y dorsal único.
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogAbierto(true)}
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
            Inscribir Jugador
          </Button>
        </Box>

        <InscripcionTable
          inscritos={miEquipo?.jugadores_inscritos || []}
          jugadoresCompletos={jugadores}
          onQuitar={handleQuitar}
        />

        <InscripcionJugadorDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleInscribir}
          dorsalesOcupados={(miEquipo?.jugadores_inscritos || [])
            .filter((j) => j.estado !== 'baja')
            .map((j) => Number(j.dorsal))}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* HEADER ADMIN */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#F5F3FF',
              color: '#7C3AED',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.15)',
            }}
          >
            <SportsSoccerRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Padrón General de Futbolistas
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Base de datos de estudiantes deportistas registrados en los torneos institucionales de ESFE.
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
            Nuevo Jugador
          </Button>
        )}
      </Box>

      <JugadorTable
        jugadores={jugadores}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        puedeEditar={esAdmin}
        puedeEliminar={esAdmin}
      />

      <TablePagination
        component="div"
        count={totalJugadores}
        page={pagina}
        onPageChange={handleCambiarPagina}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={handleCambiarFilasPorPagina}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Jugadores por página:"
        sx={{ mt: 1 }}
      />

      {esAdmin && (
        <JugadorDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleGuardar}
          jugador={jugadorEditando}
        />
      )}
    </Box>
  );
}