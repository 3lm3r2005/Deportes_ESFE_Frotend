import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Paper, Box, Typography, Button, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';

const ESTADO_TORNEO = {
  activo: { label: 'En Competencia', color: '#065F46', bg: '#D1FAE5' },
  planificado: { label: 'Inscripciones Abiertas', color: '#0369A1', bg: '#E0F2FE' },
  finalizado: { label: 'Finalizado', color: '#475569', bg: '#F1F5F9' },
};

export default function TorneoTable({ torneos, onEditar, onEliminar, onInscribirEquipo, puedeEditar, puedeEliminar, puedeInscribir }) {
  const hayAcciones = puedeEditar || puedeEliminar || puedeInscribir;

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
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Torneo</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Temporada</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Período Oficial</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Equipos</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
            {hayAcciones && <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {torneos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={hayAcciones ? 6 : 5} align="center" sx={{ py: 4, color: '#64748B' }}>
                No hay torneos registrados actualmente.
              </TableCell>
            </TableRow>
          ) : (
            torneos.map((torneo) => {
              const estadoInfo = ESTADO_TORNEO[torneo.estado] || { label: torneo.estado, color: '#475569', bg: '#F1F5F9' };
              const totalEquipos = torneo.equipos_inscritos?.length || 0;

              return (
                <TableRow
                  key={torneo._id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Nombre del torneo */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Box
                        sx={{
                          width: 38,
                          height: 38,
                          borderRadius: '10px',
                          bgcolor: '#ECFDF5',
                          color: '#059669',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <EmojiEventsRoundedIcon fontSize="small" />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                          {torneo.nombre}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Canchas ESFE
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Año */}
                  <TableCell align="center">
                    <Chip
                      label={torneo.anio}
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }}
                    />
                  </TableCell>

                  {/* Fechas */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <CalendarMonthRoundedIcon sx={{ fontSize: 16, color: '#64748B' }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {torneo.fecha_inicio?.slice(0, 10)} al {torneo.fecha_fin?.slice(0, 10)}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Equipos */}
                  <TableCell align="center">
                    <Chip
                      icon={<GroupsRoundedIcon sx={{ fontSize: 16 }} />}
                      label={`${totalEquipos} equipo${totalEquipos === 1 ? '' : 's'}`}
                      size="small"
                      sx={{
                        bgcolor: '#F0FDF4',
                        color: '#166534',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      label={estadoInfo.label}
                      size="small"
                      sx={{
                        bgcolor: estadoInfo.bg,
                        color: estadoInfo.color,
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  {hayAcciones && (
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                        {puedeInscribir && torneo.estado !== 'finalizado' && (
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<HowToRegRoundedIcon sx={{ fontSize: 16 }} />}
                            onClick={() => onInscribirEquipo(torneo)}
                            sx={{
                              borderColor: '#10B981',
                              color: '#065F46',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                              borderRadius: 2,
                              py: 0.5,
                              '&:hover': { bgcolor: '#ECFDF5', borderColor: '#059669' },
                            }}
                          >
                            Inscribir
                          </Button>
                        )}
                        {puedeEditar && (
                          <Tooltip title="Editar Torneo">
                            <IconButton size="small" onClick={() => onEditar(torneo)} sx={{ color: '#0284C7' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {puedeEliminar && (
                          <Tooltip title="Eliminar Torneo">
                            <IconButton size="small" onClick={() => onEliminar(torneo)} sx={{ color: '#DC2626' }}>
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