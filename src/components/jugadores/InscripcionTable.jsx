import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

export default function InscripcionTable({ inscritos, jugadoresCompletos, onQuitar }) {
  const filas = inscritos.map((inscrito) => {
    const jugador = jugadoresCompletos.find((j) => j._id === inscrito.jugador_id);
    return {
      ...inscrito,
      nombre: jugador?.nombre || 'Jugador no encontrado',
      apellido: jugador?.apellido || '',
      posicion: jugador?.posicion || '',
    };
  });

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Posición</TableCell>
          <TableCell>Dorsal</TableCell>
          <TableCell>Estado</TableCell>
          <TableCell align="right">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filas.map((f) => (
          <TableRow key={f.jugador_id}>
            <TableCell>{f.nombre} {f.apellido}</TableCell>
            <TableCell>{f.posicion}</TableCell>
            <TableCell>{f.dorsal}</TableCell>
            <TableCell><Chip label={f.estado} size="small" /></TableCell>
            <TableCell align="right">
              <IconButton onClick={() => onQuitar(f.jugador_id)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}