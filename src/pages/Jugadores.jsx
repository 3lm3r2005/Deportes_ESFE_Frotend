import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import JugadorTable from '../components/jugadores/JugadorTable';
import JugadorDialog from '../components/jugadores/JugadorDialog';
import InscripcionTable from '../components/jugadores/InscripcionTable';
import InscripcionJugadorDialog from '../components/jugadores/InscripcionJugadorDialog';
import Loading from '../components/Loading';
import {
  listarJugadores, crearJugador, actualizarJugador, eliminarJugador
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

  const cargarJugadores = async () => {
    const data = await listarJugadores();
    setJugadores(data);
  };

  const cargarMiEquipo = async () => {
    const equipos = await listarEquipos();
    setMiEquipo(equipos[0] || null);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await cargarJugadores();
      if (esDelegado) await cargarMiEquipo();
      setCargando(false);
    };
    cargarDatos();
  }, []);

  // ---- Flujo ADMIN ----
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
    cargarJugadores();
  };

  const handleEliminar = async (jugador) => {
    if (confirm(`¿Eliminar al jugador "${jugador.nombre} ${jugador.apellido}"?`)) {
      await eliminarJugador(jugador._id);
      cargarJugadores();
    }
  };

  // ---- Flujo DELEGADO ----
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
    await cargarJugadores();
    await cargarMiEquipo();
  };

  const handleQuitar = async (jugadorId) => {
    if (!confirm('¿Quitar a este jugador de tu equipo?')) return;
    const nuevaLista = miEquipo.jugadores_inscritos.filter((j) => j.jugador_id !== jugadorId);
    await actualizarEquipo(miEquipo._id, { jugadores_inscritos: nuevaLista });
    await cargarJugadores();
    await cargarMiEquipo();
  };

  if (cargando) return <Loading />;

  // ---- Vista DELEGADO ----
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

  // ---- Vista ADMIN / ÁRBITRO ----
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