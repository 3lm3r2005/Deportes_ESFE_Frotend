import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Avatar, Chip, Paper, Box, Typography, Button, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

export default function EquipoTable({ equipos, onEditar, onEliminar, onVerPlantilla, puedeEliminar = true }) {
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
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Equipo</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Carrera Técnica</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Año</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Plantilla Registrada</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {equipos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748B' }}>
                No hay equipos registrados para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            equipos.map((equipo) => {
              const inscritos = equipo.jugadores_inscritos?.length || 0;

              return (
                <TableRow
                  key={equipo._id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Escudo y Nombre */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.8 }}>
                      <Avatar
                        src={equipo.logo_url}
                        sx={{
                          width: 42,
                          height: 42,
                          bgcolor: '#1B5E20',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        }}
                      >
                        {equipo.nombre?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B' }}>
                          {equipo.nombre}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          Selección Oficial ESFE
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Carrera */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                      <SchoolRoundedIcon sx={{ fontSize: 16, color: '#0284C7' }} />
                      <Typography variant="body2" sx={{ color: '#334155', fontWeight: 500 }}>
                        {equipo.carrera}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Año */}
                  <TableCell align="center">
                    <Chip
                      label={equipo.anio}
                      size="small"
                      sx={{ fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }}
                    />
                  </TableCell>

                  {/* Plantilla */}
                  <TableCell align="center">
                    <Chip
                      icon={<GroupsRoundedIcon sx={{ fontSize: 16 }} />}
                      label={`${inscritos} futbolistas`}
                      size="small"
                      sx={{
                        bgcolor: inscritos >= 5 ? '#D1FAE5' : '#FEF3C7',
                        color: inscritos >= 5 ? '#065F46' : '#92400E',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<GroupsRoundedIcon sx={{ fontSize: 16 }} />}
                        onClick={() => onVerPlantilla(equipo)}
                        sx={{
                          borderColor: '#CBD5E1',
                          color: '#0284C7',
                          fontWeight: 700,
                          fontSize: '0.75rem',
                          borderRadius: 2,
                          py: 0.5,
                          '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0284C7' },
                        }}
                      >
                        Ver Roster
                      </Button>
                      <Tooltip title="Editar Equipo">
                        <IconButton size="small" onClick={() => onEditar(equipo)} sx={{ color: '#0284C7' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {puedeEliminar && (
                        <Tooltip title="Eliminar Equipo">
                          <IconButton size="small" onClick={() => onEliminar(equipo)} sx={{ color: '#DC2626' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </Paper>
  );
}