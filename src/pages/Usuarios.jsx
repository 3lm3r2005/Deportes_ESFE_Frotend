import { useEffect, useState } from 'react';
import { Box, Button, Typography, TablePagination } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
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
    setUsuarios(data.usuarios);
    setTotalUsuarios(data.total);
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
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">Usuarios</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleNuevo}>
          Nuevo usuario
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
        labelRowsPerPage="Filas por página:"
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