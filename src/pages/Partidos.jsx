import { useEffect, useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, TablePagination, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import PartidoTable from '../components/partidos/PartidoTable';
import PartidoDialog from '../components/partidos/PartidoDialog';
import ResultadoDialog from '../components/partidos/ResultadoDialog';
import Loading from '../components/Loading';
import {
  listarPartidosPaginado, crearPartido, actualizarPartido, eliminarPartido
} from '../services/partido.service';
import { listarTorneos } from '../services/torneo.service';
import { listarEquipos } from '../services/equipo.service';
import { listarJugadores } from '../services/jugador.service';
import { listarUsuarios } from '../services/usuario.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Partidos() {
  const usuario = getUsuarioActual();
  const esAdmin = usuario?.rol === 'admin';
  const esArbitro = usuario?.rol === 'arbitro';

  const [partidos, setPartidos] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [arbitros, setArbitros] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('todos');

  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [totalPartidos, setTotalPartidos] = useState(0);

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [partidoEditando, setPartidoEditando] = useState(null);
  const [resultadoAbierto, setResultadoAbierto] = useState(false);
  const [partidoResultado, setPartidoResultado] = useState(null);

  const cargarListasBase = async () => {
    const [t, e, j] = await Promise.all([listarTorneos(), listarEquipos(), listarJugadores()]);
    setTorneos(Array.isArray(t) ? t : []);
    setEquipos(Array.isArray(e) ? e : []);
    setJugadores(Array.isArray(j) ? j : (j?.jugadores || []));

    if (esAdmin) {
      const u = await listarUsuarios();
      const listaU = Array.isArray(u) ? u : (u?.usuarios || []);
      setArbitros(listaU.filter((usr) => usr.rol === 'arbitro'));
    }
  };

  const cargarPartidosTabla = async () => {
    const data = await listarPartidosPaginado(pagina + 1, filasPorPagina, filtroEstado);
    setPartidos(data?.partidos || []);
    setTotalPartidos(data?.total || 0);
  };

  useEffect(() => {
    const cargarInicial = async () => {
      await Promise.all([cargarListasBase(), cargarPartidosTabla()]);
      setCargando(false);
    };
    cargarInicial();
  }, []);

  useEffect(() => {
    if (cargando) return;
    cargarPartidosTabla();
  }, [pagina, filasPorPagina, filtroEstado]);

  const handleCambiarPagina = (evento, nuevaPagina) => setPagina(nuevaPagina);
  const handleCambiarFilasPorPagina = (evento) => {
    setFilasPorPagina(parseInt(evento.target.value, 10));
    setPagina(0);
  };
  const handleCambiarFiltro = (evento, nuevoValor) => {
    setFiltroEstado(nuevoValor);
    setPagina(0);
  };

  const handleNuevo = () => {
    setPartidoEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (partido) => {
    setPartidoEditando(partido);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (partidoEditando) {
      await actualizarPartido(partidoEditando._id, datos);
    } else {
      await crearPartido(datos);
    }
    setDialogAbierto(false);
    cargarPartidosTabla();
  };

  const handleEliminar = async (partido) => {
    if (confirm('¿Eliminar este partido del calendario?')) {
      await eliminarPartido(partido._id);
      cargarPartidosTabla();
    }
  };

  const handleAbrirResultado = (partido) => {
    setPartidoResultado(partido);
    setResultadoAbierto(true);
  };

  const handleGuardarResultado = async (datos) => {
    await actualizarPartido(partidoResultado._id, datos);
    setResultadoAbierto(false);
    cargarPartidosTabla();
  };

  if (cargando) return <Loading />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* HEADER DE PARTIDOS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#FFFBEB',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
            }}
          >
            <EventNoteRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Fixture y Calendario de Partidos
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Programación de jornadas deportivas, marcadores oficiales y actas arbitrales.
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
            Programar Partido
          </Button>
        )}
      </Box>

      {/* FILTROS POR ESTADO */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          mb: 3,
          p: 0.5,
          bgcolor: '#FFFFFF',
        }}
      >
        <Tabs
          value={filtroEstado}
          onChange={handleCambiarFiltro}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            minHeight: 44,
            '& .MuiTab-root': {
              fontWeight: 700,
              fontSize: '0.88rem',
              textTransform: 'none',
              minHeight: 42,
              borderRadius: 2,
              transition: 'all 0.2s',
            },
          }}
        >
          <Tab label="Todos los Encuentros" value="todos" />
          <Tab label="📅 Programados" value="programado" />
          <Tab label="⏱️ En Juego" value="en_juego" />
          <Tab label="✅ Finalizados" value="finalizado" />
        </Tabs>
      </Paper>

      {/* TABLA DE PARTIDOS */}
      <PartidoTable
        partidos={partidos}
        equipos={equipos}
        torneos={torneos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onRegistrarResultado={handleAbrirResultado}
        puedeEditar={esAdmin}
        puedeEliminar={esAdmin}
        puedeRegistrar={esArbitro}
      />

      <TablePagination
        component="div"
        count={totalPartidos}
        page={pagina}
        onPageChange={handleCambiarPagina}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={handleCambiarFilasPorPagina}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Partidos por página:"
      />

      {esAdmin && (
        <PartidoDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleGuardar}
          partido={partidoEditando}
          torneos={torneos}
          equipos={equipos}
          arbitros={arbitros}
        />
      )}

      {esArbitro && (
        <ResultadoDialog
          open={resultadoAbierto}
          onClose={() => setResultadoAbierto(false)}
          onGuardar={handleGuardarResultado}
          partido={partidoResultado}
          equipos={equipos}
          jugadores={jugadores}
        />
      )}
    </Box>
  );
}