import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Chip, Avatar, Paper, Box, Typography, Tooltip,
  TableContainer
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import { getUsuarioActual } from '../../services/auth.service';

const ROL_CONFIG = {
  admin: { label: 'Administrador', bg: '#FEF3C7', color: '#92400E' },
  delegado: { label: 'Delegado de Equipo', bg: '#E0F2FE', color: '#0369A1' },
  arbitro: { label: 'Árbitro Oficial', bg: '#FFEDD5', color: '#C2410C' },
  aficionado: { label: 'Aficionado', bg: '#D1FAE5', color: '#065F46' },
};

export default function UsuarioTable({ usuarios, onEditar, onEliminar }) {
  const usuarioActual = getUsuarioActual();

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
      <Table sx={{ minWidth: 650 }}>
        <TableHead sx={{ bgcolor: '#F8FAFC' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Usuario</TableCell>
            <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Correo Institucional</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Rol Asignado</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Estado</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700, color: '#475569' }}>Acciones</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center" sx={{ py: 4, color: '#64748B' }}>
                No hay usuarios registrados en esta página.
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((usuario) => {
              const esMiPropiaCuenta = usuario._id === usuarioActual?.id;
              const rolInfo = ROL_CONFIG[usuario.rol] || { label: usuario.rol, bg: '#F1F5F9', color: '#475569' };

              return (
                <TableRow
                  key={usuario._id}
                  sx={{
                    '&:hover': { bgcolor: '#F8FAFC' },
                    transition: 'background-color 0.15s ease',
                  }}
                >
                  {/* Foto y Nombre */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        src={usuario.foto_url}
                        sx={{
                          width: 38,
                          height: 38,
                          bgcolor: '#1B5E20',
                          fontWeight: 700,
                          fontSize: '0.9rem',
                        }}
                      >
                        {usuario.nombre?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                            {usuario.nombre} {usuario.apellido}
                          </Typography>
                          {esMiPropiaCuenta && (
                            <Chip label="Tú" size="small" sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800, bgcolor: '#D1FAE5', color: '#065F46' }} />
                          )}
                        </Box>
                        <Typography variant="caption" sx={{ color: '#64748B' }}>
                          ID: {usuario._id?.slice(-6)}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  {/* Correo */}
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6 }}>
                      <EmailRoundedIcon sx={{ fontSize: 15, color: '#64748B' }} />
                      <Typography variant="body2" sx={{ color: '#334155' }}>
                        {usuario.email}
                      </Typography>
                    </Box>
                  </TableCell>

                  {/* Rol */}
                  <TableCell align="center">
                    <Chip
                      label={rolInfo.label}
                      size="small"
                      sx={{
                        bgcolor: rolInfo.bg,
                        color: rolInfo.color,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                      }}
                    />
                  </TableCell>

                  {/* Estado */}
                  <TableCell align="center">
                    <Chip
                      label={usuario.estado === 'activo' ? 'Activo' : 'Inactivo'}
                      size="small"
                      sx={{
                        bgcolor: usuario.estado === 'activo' ? '#D1FAE5' : '#FEE2E2',
                        color: usuario.estado === 'activo' ? '#065F46' : '#991B1B',
                        fontWeight: 800,
                        fontSize: '0.72rem',
                      }}
                    />
                  </TableCell>

                  {/* Acciones */}
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                      <Tooltip title="Editar Usuario">
                        <IconButton size="small" onClick={() => onEditar(usuario)} sx={{ color: '#0284C7' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {!esMiPropiaCuenta && (
                        <Tooltip title="Eliminar Usuario">
                          <IconButton size="small" onClick={() => onEliminar(usuario)} sx={{ color: '#DC2626' }}>
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
    </TableContainer>
  );
}