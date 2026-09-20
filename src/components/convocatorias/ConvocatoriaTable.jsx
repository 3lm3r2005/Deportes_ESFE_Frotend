import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function ConvocatoriaTable({ convocatorias, torneos, onEditar, onEliminar, puedeEditar, puedeEliminar }) {
  const nombreTorneo = (id) => torneos.find((t) => t._id === id)?.nombre || '—';
  const hayAcciones = puedeEditar || puedeEliminar;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Torneo</TableCell>
          <TableCell>Título</TableCell>
          <TableCell>Mensaje</TableCell>
          <TableCell>Publicación</TableCell>
          <TableCell>Estado</TableCell>
          {hayAcciones && <TableCell align="right">Acciones</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {convocatorias.map((c) => (
          <TableRow key={c._id}>
            <TableCell>{nombreTorneo(c.torneo_id)}</TableCell>
            <TableCell>{c.titulo}</TableCell>
            <TableCell>{c.mensaje}</TableCell>
            <TableCell>{c.fecha_publicacion?.slice(0, 10)}</TableCell>
            <TableCell><Chip label={c.estado} size="small" /></TableCell>
            {hayAcciones && (
              <TableCell align="right">
                {puedeEditar && (
                  <IconButton onClick={() => onEditar(c)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {puedeEliminar && (
                  <IconButton onClick={() => onEliminar(c)}>
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