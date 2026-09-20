import { Table, TableHead, TableRow, TableCell, TableBody, IconButton, Avatar } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsIcon from '@mui/icons-material/Groups';

export default function EquipoTable({ equipos, onEditar, onEliminar, onVerPlantilla }) {
  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Logo</TableCell>
          <TableCell>Nombre</TableCell>
          <TableCell>Carrera</TableCell>
          <TableCell>Año</TableCell>
          <TableCell>Jugadores inscritos</TableCell>
          <TableCell align="right">Acciones</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {equipos.map((equipo) => (
          <TableRow key={equipo._id}>
            <TableCell><Avatar src={equipo.logo_url} /></TableCell>
            <TableCell>{equipo.nombre}</TableCell>
            <TableCell>{equipo.carrera}</TableCell>
            <TableCell>{equipo.anio}</TableCell>
            <TableCell>{equipo.jugadores_inscritos?.length || 0}</TableCell>
            <TableCell align="right">
              <IconButton onClick={() => onVerPlantilla(equipo)}>
                <GroupsIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => onEditar(equipo)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => onEliminar(equipo)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}