import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Avatar, Chip, Paper, Box, Typography, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import BadgeRoundedIcon from '@mui/icons-material/BadgeRounded';

const POSICION_CONFIG = {
  Portero: { label: 'Portero', bg: '#FEF3C7', color: '#92400E' },
  Defensa: { label: 'Defensa', bg: '#E0F2FE', color: '#0369A1' },
  Mediocampista: { label: 'Mediocampista', bg: '#D1FAE5', color: '#065F46' },
  Delantero: { label: 'Delantero', bg: '#FFEDD5', color: '#C2410C' },
};

export default function JugadorTable({ jugadores, onEditar, onEliminar, puedeEditar, puedeEliminar }) {
  const hayAcciones = puedeEditar || puedeEliminar;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Futbolista</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Carné Estudiantil</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Contacto</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Posición (Fútbol 5)</TableCell>
            {hayAcciones && <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {jugadores.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hayAcciones ? 5 : 4} align="center" sx={{ py: 4, color: '#64748B' }}>
                No hay futbolistas registrados en esta página.
              </TableCell>
            </TableRow>
          ) : (
            jugadores.map((jugador) => {
              const posInfo = POSICION_CONFIG[jugador.posicion] || { label: jugador.posicion, bg: '#F1F5F9', color: '#475569' };

              return (
                <TableRow
                  key={jugador._id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Avatar y Nombre */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={jugador.foto_url}
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: '#1B5E20',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {jugador.nombre?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                          {jugador.nombre} {jugador.apellido}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Alumno ESFE
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Carné */}
                  <TableCell>
                    <Chip
                      icon={<BadgeRoundedIcon sx={{ fontSize: 14 }} />}
                      label={jugador.carne}
                      size="small"
                      sx={{ fontWeight: 800, bgcolor: '#F1F5F9', color: '#1E293B' }}
                    />
                  </TableCell>

                  {/* Teléfono */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <PhoneRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {jugador.telefono || '—'}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Posición */}
                  <TableCell align="center">
                    <Chip
                      label={posInfo.label}
                      size="small"
                      sx={{
                        bgcolor: posInfo.bg,
                        color: posInfo.color,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  {hayAcciones && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {puedeEditar && (
                          <Tooltip title="Editar Datos">
                            <IconButton size="small" onClick={() => onEditar(jugador)} sx={{ color: '#0284C7' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {puedeEliminar && (
                          <Tooltip title="Eliminar Jugador">
                            <IconButton size="small" onClick={() => onEliminar(jugador)} sx={{ color: '#DC2626' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  )}
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}