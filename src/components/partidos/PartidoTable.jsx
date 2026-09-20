import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

export default function PartidoTable({
  partidos, equipos, torneos,
  onEditar, onEliminar, onRegistrarResultado,
  puedeEditar, puedeEliminar, puedeRegistrar
}) {
  const nombreEquipo = (id) => equipos.find((e) => e._id === id)?.nombre || '—';
  const nombreTorneo = (id) => torneos.find((t) => t._id === id)?.nombre || '—';

  const hayAcciones = puedeEditar || puedeEliminar || puedeRegistrar;

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Torneo</TableCell>
          <TableCell>Local</TableCell>
          <TableCell>Visitante</TableCell>
          <TableCell>Fecha</TableCell>
          <TableCell>Hora</TableCell>
          <TableCell>Resultado</TableCell>
          <TableCell>Estado</TableCell>
          {hayAcciones && <TableCell align="right">Acciones</TableCell>}
        </TableRow>
      </TableHead>
      <TableBody>
        {partidos.map((partido) => (
          <TableRow key={partido._id}>
            <TableCell>{nombreTorneo(partido.torneo_id)}</TableCell>
            <TableCell>{nombreEquipo(partido.equipo_local_id)}</TableCell>
            <TableCell>{nombreEquipo(partido.equipo_visitante_id)}</TableCell>
            <TableCell>{partido.fecha?.slice(0, 10)}</TableCell>
            <TableCell>{partido.hora}</TableCell>
            <TableCell>{partido.goles_local} - {partido.goles_visitante}</TableCell>
            <TableCell><Chip label={partido.estado} size="small" /></TableCell>
            {hayAcciones && (
              <TableCell align="right">
                {puedeRegistrar && (
                  <IconButton onClick={() => onRegistrarResultado(partido)}>
                    <SportsSoccerIcon fontSize="small" />
                  </IconButton>
                )}
                {puedeEditar && (
                  <IconButton onClick={() => onEditar(partido)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                )}
                {puedeEliminar && (
                  <IconButton onClick={() => onEliminar(partido)}>
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