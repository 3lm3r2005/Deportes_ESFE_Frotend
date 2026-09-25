import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Paper, Box, Typography, Avatar, Tooltip,
  TableContainer
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

const POSICION_CONFIG = {
  Portero: { label: 'Portero', bg: '#FEF3C7', color: '#92400E' },
  Defensa: { label: 'Defensa', bg: '#E0F2FE', color: '#0369A1' },
  Mediocampista: { label: 'Mediocampista', bg: '#D1FAE5', color: '#065F46' },
  Delantero: { label: 'Delantero', bg: '#FFEDD5', color: '#C2410C' },
};

export default function InscripcionTable({ inscritos, jugadoresCompletos, onQuitar }) {
  const filas = inscritos.map((inscrito) => {
    const jugador = jugadoresCompletos.find((j) => j._id === inscrito.jugador_id);
    return {
      ...inscrito,
      nombre: jugador?.nombre || 'Jugador',
      apellido: jugador?.apellido || '',
      posicion: jugador?.posicion || '—',
      carne: jugador?.carne || '',
    };
  });

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        overflowX: 'auto',
      }}
    >
      <Table sx={{ minWidth: 600 }}>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell align="center" sx={{ fontWeight: 700, width: 70, color: '#475569' }}>Dorsal</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Futbolista</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Posición</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Condición</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748B' }}>
                Aún no has inscrito jugadores en la nómina de tu equipo. Haz clic en "Inscribir Jugador" para comenzar.
              </TableCell>
            </TableRow>
          ) : (
            filas.map((f) => {
              const posInfo = POSICION_CONFIG[f.posicion] || { label: f.posicion, bg: '#F1F5F9', color: '#475569' };

              return (
                <TableRow
                  key={f.jugador_id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Dorsal */}
                  <TableCell align="center">
                    <Chip
                      label={`#${f.dorsal}`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        bgcolor: '#1E293B',
                        color: '#FFFFFF',
                        height: 26,
                      }}
                    />
                  </TableCell>

                  {/* Nombre y carné */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: '#1B5E20',
                          fontWeight: 700,
                          fontSize: '0.85rem',
                        }}
                      >
                        {f.nombre?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                          {f.nombre} {f.apellido}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Carné: {f.carne || '—'}
                        </Typography>
                      </Box>
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

                  {/* Condición (Titular / Suplente) */}
                  <TableCell align="center">
                    <Chip
                      label={f.estado === 'titular' ? 'Titular ⭐' : 'Suplente / Reserva'}
                      size="small"
                      sx={{
                        bgcolor: f.estado === 'titular' ? '#D1FAE5' : '#F1F5F9',
                        color: f.estado === 'titular' ? '#065F46' : '#64748B',
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  {/* Acción Quitar */}
                  <TableCell align="right">
                    <Tooltip title="Quitar de la Nómina">
                      <IconButton
                        size="small"
                        onClick={() => onQuitar(f.jugador_id)}
                        sx={{ color: '#DC2626', '&:hover': { bgcolor: '#FEE2E2' } }}
                      >
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}