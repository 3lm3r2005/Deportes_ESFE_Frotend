import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Paper, Box, Typography, Avatar, Button, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const ESTADO_CONFIG = {
  programado: { label: 'Programado', color: '#92400E', bg: '#FEF3C7' },
  en_juego: { label: 'En Juego ⏱️', color: '#065F46', bg: '#D1FAE5' },
  finalizado: { label: 'Finalizado', color: '#1E293B', bg: '#F1F5F9' },
};

export default function PartidoTable({
  partidos, equipos, torneos,
  onEditar, onEliminar, onRegistrarResultado,
  puedeEditar, puedeEliminar, puedeRegistrar
}) {
  const nombreEquipo = (id) => equipos.find((e) => e._id === id)?.nombre || '—';
  const nombreTorneo = (id) => torneos.find((t) => t._id === id)?.nombre || '—';

  const hayAcciones = puedeEditar || puedeEliminar || puedeRegistrar;

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid #E2E8F0',
        overflow: 'hidden',
        mb: 2,
      }}
    >
      <Table>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Torneo</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Encuentro (Local vs Visitante)</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fecha y Hora</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Marcador</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
            {hayAcciones && <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {partidos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hayAcciones ? 6 : 5} align="center" sx={{ py: 4, color: '#64748B' }}>
                No hay partidos para mostrar con el filtro seleccionado.
              </TableCell>
            </TableRow>
          ) : (
            partidos.map((partido) => {
              const local = nombreEquipo(partido.equipo_local_id);
              const visitante = nombreEquipo(partido.equipo_visitante_id);
              const estadoInfo = ESTADO_CONFIG[partido.estado] || { label: partido.estado, color: '#475569', bg: '#F1F5F9' };

              return (
                <TableRow
                  key={partido._id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Torneo */}
                  <TableCell sx={{ fontWeight: 600, color: '#0F172A' }}>
                    {nombreTorneo(partido.torneo_id)}
                  </TableCell>

                  {/* Enfrentamiento */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: '#1B5E20', fontSize: '0.75rem', fontWeight: 700 }}>
                        {local.charAt(0)}
                      </Avatar>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {local}
                      </Typography>
                      <Chip label="vs" size="small" sx={{ height: 20, fontSize: '0.68rem', bgcolor: '#F1F5F9', color: '#64748B', fontWeight: 700, mx: 0.5 }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {visitante}
                      </Typography>
                      <Avatar sx={{ width: 26, height: 26, bgcolor: '#0284C7', fontSize: '0.75rem', fontWeight: 700 }}>
                        {visitante.charAt(0)}
                      </Avatar>
                    </Box>
                  </TableCell>

                  {/* Fecha y Hora */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                          {partido.fecha?.slice(0, 10)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AccessTimeRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                          {partido.hora}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Marcador */}
                  <TableCell align="center">
                    {partido.estado === 'programado' ? (
                      <Chip label="Por jugar" size="small" variant="outlined" sx={{ borderColor: '#CBD5E1', color: '#64748B' }} />
                    ) : (
                      <Chip
                        label={`${partido.goles_local} - ${partido.goles_visitante}`}
                        size="small"
                        sx={{
                          bgcolor: '#1E293B',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          fontSize: '0.85rem',
                          px: 0.5,
                        }}
                      />
                    )}
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      label={estadoInfo.label}
                      size="small"
                      sx={{
                        bgcolor: estadoInfo.bg,
                        color: estadoInfo.color,
                        fontWeight: 700,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  {hayAcciones && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {puedeRegistrar && (
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<SportsSoccerRoundedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onRegistrarResultado(partido)}
                            sx={{
                              bgcolor: '#1B5E20',
                              color: '#FFFFFF',
                              fontWeight: 700,
                              textTransform: 'none',
                              fontSize: '0.75rem',
                              py: 0.5,
                              px: 1.5,
                              borderRadius: 2,
                              '&:hover': { bgcolor: '#14532D' },
                            }}
                          >
                            Registrar Acta
                          </Button>
                        )}
                        {puedeEditar && (
                          <Tooltip title="Editar Partido">
                            <IconButton size="small" onClick={() => onEditar(partido)} sx={{ color: '#0284C7' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {puedeEliminar && (
                          <Tooltip title="Eliminar Partido">
                            <IconButton size="small" onClick={() => onEliminar(partido)} sx={{ color: '#DC2626' }}>
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