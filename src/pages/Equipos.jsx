import { useEffect, useState } from 'react';
import { Box, Button, Typography, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
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
  const esAdmin = usuario?.rol === 'admin';

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
      setEquipos(Array.isArray(data) ? data : []);
      return;
    }
    const data = await listarEquiposPaginado(pagina + 1, filasPorPagina);
    setEquipos(data?.equipos || []);
    setTotalEquipos(data?.total || 0);
  };

  const cargarTodosLosEquipos = async () => {
    const data = await listarEquipos();
    setTodosLosEquipos(Array.isArray(data) ? data : []);
  };

  const cargarJugadores = async () => {
    const data = await listarJugadores();
    setJugadores(Array.isArray(data) ? data : (data?.jugadores || []));
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
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* HEADER DE LA PÁGINA */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 42, sm: 48 },
              height: { xs: 42, sm: 48 },
              borderRadius: '12px',
              bgcolor: '#F0F9FF',
              color: '#0284C7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
              flexShrink: 0,
            }}
          >
            <GroupsRoundedIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
              {esDelegado ? 'Mi Equipo y Nómina' : 'Equipos de Carreras'}
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
              {esDelegado
                ? 'Información de tu representativo institucional, nómina de titulares y suplentes.'
                : 'Catálogo de selecciones representativas de las carreras técnicas de ESFE.'}
            </Typography>
          </Box>
        </Box>

        {(esAdmin || esDelegado) && (
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
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { bgcolor: '#14532D' },
            }}
          >
            {esDelegado ? 'Inscribir Equipo' : 'Nuevo Equipo'}
          </Button>
        )}
      </Box>

      {/* TABLA DE EQUIPOS */}
      <EquipoTable
        equipos={equipos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        onVerPlantilla={handleVerPlantilla}
        puedeEliminar={esAdmin}
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
          labelRowsPerPage="Equipos por página:"
          sx={{ mt: 1 }}
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