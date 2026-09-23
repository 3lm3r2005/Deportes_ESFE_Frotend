import { useEffect, useState } from 'react';
import { Box, Button, Typography, Tabs, Tab, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
    setTorneos(t);
    setEquipos(e);
    setJugadores(j);

    if (esAdmin) {
      const u = await listarUsuarios();
      setArbitros(u.filter((usr) => usr.rol === 'arbitro'));
    }
  };

  const cargarPartidosTabla = async () => {
    const data = await listarPartidosPaginado(pagina + 1, filasPorPagina, filtroEstado);
    setPartidos(data.partidos);
    setTotalPartidos(data.total);
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
    if (confirm('¿Eliminar este partido?')) {
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Partidos</Typography>
        {esAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
            Programar partido
          </Button>
        )}
      </Box>

      <Tabs value={filtroEstado} onChange={handleCambiarFiltro} sx={{ mb: 2 }}>
        <Tab label="Todos" value="todos" />
        <Tab label="Programados" value="programado" />
        <Tab label="En juego" value="en_juego" />
        <Tab label="Finalizados" value="finalizado" />
      </Tabs>

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
        labelRowsPerPage="Filas por página:"
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