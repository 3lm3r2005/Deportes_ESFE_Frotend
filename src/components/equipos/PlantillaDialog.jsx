import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Table, TableHead, TableRow, TableCell, TableBody, Chip, Typography
} from '@mui/material';

export default function PlantillaDialog({ open, onClose, equipo, jugadoresCompletos }) {
  const plantilla = (equipo?.jugadores_inscritos || []).map((inscrito) => {
    const jugador = jugadoresCompletos.find((j) => j._id === inscrito.jugador_id);
    return {
      ...inscrito,
      nombre: jugador?.nombre || 'Jugador no encontrado',
      apellido: jugador?.apellido || '',
      posicion: jugador?.posicion || '',
    };
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Plantilla de {equipo?.nombre}</DialogTitle>
      <DialogContent>
        {plantilla.length === 0 ? (
          <Typography color="text.secondary">
            Este equipo todavía no tiene jugadores inscritos.
          </Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Posición</TableCell>
                <TableCell>Dorsal</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plantilla.map((j, i) => (
                <TableRow key={i}>
                  <TableCell>{j.nombre} {j.apellido}</TableCell>
                  <TableCell>{j.posicion}</TableCell>
                  <TableCell>{j.dorsal}</TableCell>
                  <TableCell><Chip label={j.estado} size="small" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}