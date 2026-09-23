import { useEffect, useState } from 'react';
import { Box, Button, Typography, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
    setJugadores(data.jugadores);
    setTotalJugadores(data.total);
  };

  const cargarJugadoresDelegado = async () => {
    const data = await listarJugadores();
    setJugadores(data);
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
    if (!confirm('¿Quitar a este jugador de tu equipo?')) return;
    const nuevaLista = miEquipo.jugadores_inscritos.filter((j) => j.jugador_id !== jugadorId);
    await actualizarEquipo(miEquipo._id, { jugadores_inscritos: nuevaLista });
    await cargarJugadoresDelegado();
    await cargarMiEquipo();
  };

  if (cargando) return <Loading />;

  if (esDelegado) {
    return (
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h4">Inscribe tus jugadores</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogAbierto(true)}>
            Inscribir jugador
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
        />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Jugadores</Typography>
        {esAdmin && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
            Nuevo jugador
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
        labelRowsPerPage="Filas por página:"
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