import { useEffect, useState } from 'react';
import { Box, Button, Typography, Tabs, Tab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PartidoTable from '../components/partidos/PartidoTable';
import PartidoDialog from '../components/partidos/PartidoDialog';
import ResultadoDialog from '../components/partidos/ResultadoDialog';
import Loading from '../components/Loading';
import {
  listarPartidos, crearPartido, actualizarPartido, eliminarPartido
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

  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [partidoEditando, setPartidoEditando] = useState(null);
  const [resultadoAbierto, setResultadoAbierto] = useState(false);
  const [partidoResultado, setPartidoResultado] = useState(null);

  const cargarTodo = async () => {
    const [p, t, e, j] = await Promise.all([
      listarPartidos(), listarTorneos(), listarEquipos(), listarJugadores(),
    ]);
    setPartidos(p);
    setTorneos(t);
    setEquipos(e);
    setJugadores(j);

    if (esAdmin) {
      const u = await listarUsuarios();
      setArbitros(u.filter((usr) => usr.rol === 'arbitro'));
    }
  };

  useEffect(() => {
    cargarTodo().finally(() => setCargando(false));
  }, []);

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
    cargarTodo();
  };

  const handleEliminar = async (partido) => {
    if (confirm('¿Eliminar este partido?')) {
      await eliminarPartido(partido._id);
      cargarTodo();
    }
  };

  const handleAbrirResultado = (partido) => {
    setPartidoResultado(partido);
    setResultadoAbierto(true);
  };

  const handleGuardarResultado = async (datos) => {
    await actualizarPartido(partidoResultado._id, datos);
    setResultadoAbierto(false);
    cargarTodo();
  };

  const partidosFiltrados = filtroEstado === 'todos'
    ? partidos
    : partidos.filter((p) => p.estado === filtroEstado);

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

      <Tabs value={filtroEstado} onChange={(e, val) => setFiltroEstado(val)} sx={{ mb: 2 }}>
        <Tab label="Todos" value="todos" />
        <Tab label="Programados" value="programado" />
        <Tab label="En juego" value="en_juego" />
        <Tab label="Finalizados" value="finalizado" />
      </Tabs>

      <PartidoTable
        partidos={partidosFiltrados}
        equipos={equipos}
        torneos={torneos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onRegistrarResultado={handleAbrirResultado}
        puedeEditar={esAdmin}
        puedeEliminar={esAdmin}
        puedeRegistrar={esArbitro}
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