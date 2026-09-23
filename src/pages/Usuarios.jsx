import { useEffect, useState } from 'react';
import { Box, Button, Typography, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import UsuarioTable from '../components/usuarios/UsuarioTable';
import UsuarioDialog from '../components/usuarios/UsuarioDialog';
import Loading from '../components/Loading';
import {
  listarUsuariosPaginado, crearUsuario, actualizarUsuario, eliminarUsuario
} from '../services/usuario.service';

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [cargando, setCargando] = useState(true);

  const [pagina, setPagina] = useState(0);
  const [filasPorPagina, setFilasPorPagina] = useState(10);
  const [totalUsuarios, setTotalUsuarios] = useState(0);

  const cargarUsuarios = async () => {
    const data = await listarUsuariosPaginado(pagina + 1, filasPorPagina);
    setUsuarios(data?.usuarios || []);
    setTotalUsuarios(data?.total || 0);
  };

  useEffect(() => {
    cargarUsuarios().finally(() => setCargando(false));
  }, [pagina, filasPorPagina]);

  const handleCambiarPagina = (evento, nuevaPagina) => setPagina(nuevaPagina);
  const handleCambiarFilasPorPagina = (evento) => {
    setFilasPorPagina(parseInt(evento.target.value, 10));
    setPagina(0);
  };

  const handleNuevo = () => {
    setUsuarioEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (usuarioEditando) {
      await actualizarUsuario(usuarioEditando._id, datos);
    } else {
      await crearUsuario(datos);
    }
    setDialogAbierto(false);
    cargarUsuarios();
  };

  const handleEliminar = async (usuario) => {
    if (confirm(`¿Eliminar al usuario "${usuario.nombre} ${usuario.apellido}"?`)) {
      await eliminarUsuario(usuario._id);
      cargarUsuarios();
    }
  };

  if (cargando) return <Loading />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* HEADER DE USUARIOS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              bgcolor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)',
            }}
          >
            <PeopleAltRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Usuarios y Control de Acceso
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Administración de cuentas institucionales, delegados de carrera y colegiados arbitrales.
            </Typography>
          </Box>
        </Box>

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
          Nuevo Usuario
        </Button>
      </Box>

      <UsuarioTable usuarios={usuarios} onEditar={handleEditar} onEliminar={handleEliminar} />

      <TablePagination
        component="div"
        count={totalUsuarios}
        page={pagina}
        onPageChange={handleCambiarPagina}
        rowsPerPage={filasPorPagina}
        onRowsPerPageChange={handleCambiarFilasPorPagina}
        rowsPerPageOptions={[5, 10, 25, 50]}
        labelRowsPerPage="Usuarios por página:"
        sx={{ mt: 1 }}
      />

      <UsuarioDialog
        open={dialogAbierto}
        onClose={() => setDialogAbierto(false)}
        onGuardar={handleGuardar}
        usuario={usuarioEditando}
      />
    </Box>
  );
}