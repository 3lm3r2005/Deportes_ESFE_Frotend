import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function JugadorTable({ jugadores, onEditar, onEliminar, puedeEditar, puedeEliminar }) {
  const hayAcciones = puedeEditar || puedeEliminar;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Foto</TableCell>
          <TableCell>Nombre</TableCell>
          <TableCell>Apellido</TableCell>
          <TableCell>Carné</TableCell>
          <TableCell>Teléfono</TableCell>
          <TableCell>Posición</TableCell>
          {hayAcciones && <TableCell align="right">Acciones</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {jugadores.map((jugador) => (
          <TableRow key={jugador._id}>
            <TableCell><Avatar src={jugador.foto_url} /></TableCell>
            <TableCell>{jugador.nombre}</TableCell>
            <TableCell>{jugador.apellido}</TableCell>
            <TableCell>{jugador.carne}</TableCell>
            <TableCell>{jugador.telefono}</TableCell>
            <TableCell>{jugador.posicion}</TableCell>
            {hayAcciones && (
              <TableCell align="right">
                {puedeEditar && (
                  <IconButton onClick={() => onEditar(jugador)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {puedeEliminar && (
                  <IconButton onClick={() => onEliminar(jugador)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}