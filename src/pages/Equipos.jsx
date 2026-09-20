import { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EquipoTable from '../components/equipos/EquipoTable';
import EquipoDialog from '../components/equipos/EquipoDialog';
import PlantillaDialog from '../components/equipos/PlantillaDialog';
import Loading from '../components/Loading';
import {
  listarEquipos, crearEquipo, actualizarEquipo, eliminarEquipo
} from '../services/equipo.service';
import { listarJugadores } from '../services/jugador.service';

export default function Equipos() {
  const [equipos, setEquipos] = useState([]);
  const [jugadores, setJugadores] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [equipoEditando, setEquipoEditando] = useState(null);
  const [plantillaAbierta, setPlantillaAbierta] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarEquipos = async () => {
    const data = await listarEquipos();
    setEquipos(data);
  };

  const cargarJugadores = async () => {
    const data = await listarJugadores();
    setJugadores(data);
  };

  useEffect(() => {
    Promise.all([cargarEquipos(), cargarJugadores()]).finally(() => setCargando(false));
  }, []);

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
    cargarEquipos();
  };

  const handleEliminar = async (equipo) => {
    if (confirm(`¿Eliminar el equipo "${equipo.nombre}"?`)) {
      await eliminarEquipo(equipo._id);
      cargarEquipos();
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

      <EquipoDialog
        open={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        onGuardar={handleGuardar}
        equipo={equipoEditando}
        equiposExistentes={equipos}
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