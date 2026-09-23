import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Paper, Box, Typography, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

export default function ConvocatoriaTable({ convocatorias, torneos, onEditar, onEliminar, puedeEditar, puedeEliminar }) {
  const nombreTorneo = (id) => torneos.find((t) => t._id === id)?.nombre || 'Torneo General';
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
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Torneo Asociado</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Convocatoria</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Fechas Clave</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
            {hayAcciones && <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {convocatorias.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hayAcciones ? 5 : 4} align="center" sx={{ py: 4, color: '#64748B' }}>
                No hay convocatorias publicadas en este momento.
              </TableCell>
            </TableRow>
          ) : (
            convocatorias.map((c) => {
              const estaAbierta = c.estado === 'activa' || c.estado === 'abierta';

              return (
                <TableRow
                  key={c._id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Torneo */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <EmojiEventsRoundedIcon sx={{ fontSize: 18, color: '#F59E0B' }} />
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                        {nombreTorneo(c.torneo_id)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Título y Mensaje */}
                  <TableCell sx={{ maxWidth: 400 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
                      {c.titulo}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        fontSize: '0.85rem',
                      }}
                    >
                      {c.mensaje || c.descripcion}
                    </Typography>
                  </TableCell>

                  {/* Fechas */}
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CalendarMonthRoundedIcon sx={{ fontSize: 14, color: '#64748B' }} />
                        <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                          Pub: {c.fecha_publicacion?.slice(0, 10)}
                        </Typography>
                      </Box>
                      {c.fecha_limite && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Chip
                            label={`Límite: ${c.fecha_limite?.slice(0, 10)}`}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              bgcolor: '#FEF3C7',
                              color: '#92400E',
                            }}
                          />
                        </Box>
                      )}
                    </Box>
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      label={estaAbierta ? 'Vigente' : 'Cerrada'}
                      size="small"
                      sx={{
                        bgcolor: estaAbierta ? '#D1FAE5' : '#F1F5F9',
                        color: estaAbierta ? '#065F46' : '#64748B',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  {hayAcciones && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {puedeEditar && (
                          <Tooltip title="Editar Convocatoria">
                            <IconButton size="small" onClick={() => onEditar(c)} sx={{ color: '#0284C7' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {puedeEliminar && (
                          <Tooltip title="Eliminar Convocatoria">
                            <IconButton size="small" onClick={() => onEliminar(c)} sx={{ color: '#DC2626' }}>
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