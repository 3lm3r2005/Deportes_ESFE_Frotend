import { useEffect, useState } from 'react';
import { Box, Button, Typography, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EquipoTable from '../components/equipos/EquipoTable';
import EquipoDialog from '../components/equipos/EquipoDialog';
import PlantillaDialog from '../components/equipos/PlantillaDialog';
import Loading from '../components/Loading';
import {
  listarEquipos, listarEquiposPaginado, crearEquipo, actualizarEquipo, eliminarEquipo
} from '../services/equipo.service';
import { listarJugadores } from '../services/jugador.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Equipos() {
  const usuario = getUsuarioActual();
  const esDelegado = usuario?.rol === 'delegado';

  const [equipos, setEquipos] = useState([]);
  const [todosLosEquipos, setTodosLosEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState(null);
  const [plantillaAbierta, setPlantillaAbierta] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [totalEquipos, setTotalEquipos] = useState(0);

  const cargarEquiposTabla = async () => {
    if (esDelegado) {
      const data = await listarEquipos();
      setEquipos(data);
      return;
    }
    const data = await listarEquiposPaginado(pagina + 1, filasPorPagina);
    setEquipos(data.equipos);
    setTotalEquipos(data.total);
  };

  const cargarTodosLosEquipos = async () => {
    const data = await listarEquipos();
    setTodosLosEquipos(data);
  };

  const cargarJugadores = async () => {
    const data = await listarJugadores();
    setJugadores(data);
  };

  useEffect(() => {
    const cargarDatos = async () => {
      await Promise.all([cargarEquiposTabla(), cargarTodosLosEquipos(), cargarJugadores()]);
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
    setEquipoEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (equipo) => {
    setEquipoEditando(equipo);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (equipoEditando) {
      await actualizarEquipo(equipoEditando._id, datos);
    } else {
      await crearEquipo(datos);
    }
    setDialogAbierto(false);
    await cargarEquiposTabla();
    await cargarTodosLosEquipos();
  };

  const handleEliminar = async (equipo) => {
    if (confirm(`¿Eliminar el equipo "${equipo.nombre}"?`)) {
      await eliminarEquipo(equipo._id);
      await cargarEquiposTabla();
      await cargarTodosLosEquipos();
    }
  };

  const handleVerPlantilla = (equipo) => {
    setEquipoSeleccionado(equipo);
    setPlantillaAbierta(true);
  };

  if (cargando) return <Loading />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Equipos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
          Nuevo equipo
        </Button>
      </Box>

      <EquipoTable
        equipos={equipos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onVerPlantilla={handleVerPlantilla}
      />

      {!esDelegado && (
        <TablePagination
          component="div"
          count={totalEquipos}
          page={pagina}
          onPageChange={handleCambiarPagina}
          rowsPerPage={filasPorPagina}
          onRowsPerPageChange={handleCambiarFilasPorPagina}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Filas por página:"
        />
      )}

      <EquipoDialog
        open={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        onGuardar={handleGuardar}
        equipo={equipoEditando}
        equiposExistentes={todosLosEquipos}
      />

      <PlantillaDialog
        open={plantillaAbierta}
        onClose={() => setPlantillaAbierta(false)}
        equipo={equipoSeleccionado}
        jugadoresCompletos={jugadores}
      />
    </Box>
  );
}