import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToRegIcon from '@mui/icons-material/HowToReg';

export default function TorneoTable({ torneos, onEditar, onEliminar, onInscribirEquipo, puedeEditar, puedeEliminar, puedeInscribir }) {
  const hayAcciones = puedeEditar || puedeEliminar || puedeInscribir;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Nombre</TableCell>
          <TableCell>Año</TableCell>
          <TableCell>Fecha inicio</TableCell>
          <TableCell>Fecha fin</TableCell>
          <TableCell>Estado</TableCell>
          {hayAcciones && <TableCell align="right">Acciones</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {torneos.map((torneo) => (
          <TableRow key={torneo._id}>
            <TableCell>{torneo.nombre}</TableCell>
            <TableCell>{torneo.anio}</TableCell>
            <TableCell>{torneo.fecha_inicio?.slice(0, 10)}</TableCell>
            <TableCell>{torneo.fecha_fin?.slice(0, 10)}</TableCell>
            <TableCell><Chip label={torneo.estado} size="small" /></TableCell>
            {hayAcciones && (
              <TableCell align="right">
                {puedeInscribir && (
                  <IconButton onClick={() => onInscribirEquipo(torneo)}>
                    <HowToRegIcon fontSize="small" />
                  </IconButton>
                )}
                {puedeEditar && (
                  <IconButton onClick={() => onEditar(torneo)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {puedeEliminar && (
                  <IconButton onClick={() => onEliminar(torneo)}>
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