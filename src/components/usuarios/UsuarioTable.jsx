import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { getUsuarioActual } from '../../services/auth.service';

export default function UsuarioTable({ usuarios, onEditar, onEliminar }) {
  const usuarioActual = getUsuarioActual();

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Foto</TableCell>
          <TableCell>Nombre</TableCell>
          <TableCell>Apellido</TableCell>
          <TableCell>Correo</TableCell>
          <TableCell>Rol</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell align="right">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {usuarios.map((usuario) => {
          const esMiPropiaCuenta = usuario._id === usuarioActual?.id;
          return (
            <TableRow key={usuario._id}>
              <TableCell><Avatar src={usuario.foto_url} /></TableCell>
              <TableCell>{usuario.nombre}</TableCell>
              <TableCell>{usuario.apellido}</TableCell>
              <TableCell>{usuario.email}</TableCell>
              <TableCell><Chip label={usuario.rol} size="small" /></TableCell>
              <TableCell>
                <Chip
                  label={usuario.estado}
                  size="small"
                  color={usuario.estado === 'activo' ? 'success' : 'default'}
                />
              </TableCell>
              <TableCell align="right">
                <IconButton onClick={() => onEditar(usuario)}>
                  <EditIcon fontSize="small" />
                </IconButton>
                {!esMiPropiaCuenta && (
                  <IconButton onClick={() => onEliminar(usuario)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}