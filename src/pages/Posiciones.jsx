import { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip, Avatar, Stack,
  TableContainer
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import Loading from '../components/Loading';
import {
  listarTorneos, obtenerTablaPosiciones, obtenerTablaGoleadores, obtenerTablaTarjetas
} from '../services/torneo.service';

const renderMedalla = (posicion) => {
  if (posicion === 0) return <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🥇</span>;
  if (posicion === 1) return <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🥈</span>;
  if (posicion === 2) return <span style={{ fontSize: '1.2rem', marginRight: 6 }}>🥉</span>;
  return <span style={{ color: '#94A3B8', fontWeight: 700, width: 20, display: 'inline-block', textAlign: 'center', marginRight: 6 }}>{posicion + 1}</span>;
};

export default function Posiciones() {
  const [torneos, setTorneos] = useState([]);
  const [torneoId, setTorneoId] = useState('');
  const [posiciones, setPosiciones] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarTorneos().then((data) => {
      const lista = Array.isArray(data) ? data : [];
      setTorneos(lista);
      if (lista.length > 0) setTorneoId(lista[0]._id);
      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (!torneoId) return;
    Promise.all([
      obtenerTablaPosiciones(torneoId),
      obtenerTablaGoleadores(torneoId),
      obtenerTablaTarjetas(torneoId),
    ]).then(([p, g, t]) => {
      setPosiciones(Array.isArray(p) ? p : []);
      setGoleadores(Array.isArray(g) ? g : []);
      setTarjetas(Array.isArray(t) ? t : []);
    });
  }, [torneoId]);

  if (cargando) return <Loading />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
            Estadísticas y Clasificación
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748B', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
            Consulta la tabla de posiciones oficial, goleadores y control disciplinario.
          </Typography>
        </Box>

        <TextField
          select
          label="Seleccionar Torneo"
          size="small"
          value={torneoId}
          onChange={(e) => setTorneoId(e.target.value)}
          sx={{ minWidth: { xs: '100%', sm: 260 }, width: { xs: '100%', sm: 'auto' }, bgcolor: '#FFFFFF', borderRadius: 2 }}
        >
          {torneos.map((t) => (
            <MenuItem key={t._id} value={t._id}>
              {t.nombre} ({t.estado})
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {torneos.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography color="text.secondary">Todavía no hay torneos creados en el sistema.</Typography>
        </Paper>
      )}

      {torneoId && (
        <>
          {/* TABLA DE POSICIONES */}
          <Paper
            elevation={0}
            sx={{
              mb: 4,
              borderRadius: 3,
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ p: 2.5, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FEF3C7', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <EmojiEventsRoundedIcon fontSize="small" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                Tabla General de Posiciones
              </Typography>
            </Box>

            <TableContainer sx={{ overflowX: 'auto' }}>
              <Table sx={{ minWidth: 620 }}>
                <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Pos / Equipo</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>PJ</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>G</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>E</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>P</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>GF</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>GC</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>DIF</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 800, color: '#065F46', bgcolor: '#ECFDF5' }}>PTS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posiciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: '#64748B' }}>
                      Todavía no hay partidos finalizados en este torneo.
                    </TableCell>
                  </TableRow>
                ) : (
                  posiciones.map((p, index) => (
                    <TableRow
                      key={p.equipo_id}
                      sx={{
                        '&:hover': { bgcolor: '#F8FAFC' },
                        bgcolor: index === 0 ? 'rgba(254, 243, 199, 0.2)' : 'inherit',
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          {renderMedalla(index)}
                          <Avatar sx={{ width: 26, height: 26, fontSize: '0.75rem', mr: 1.2, bgcolor: '#1B5E20' }}>
                            {p.nombre_equipo?.charAt(0)}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: index === 0 ? 800 : 600 }}>
                            {p.nombre_equipo}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">{p.partidos_jugados}</TableCell>
                      <TableCell align="center">{p.ganados}</TableCell>
                      <TableCell align="center">{p.empatados}</TableCell>
                      <TableCell align="center">{p.perdidos}</TableCell>
                      <TableCell align="center">{p.goles_favor}</TableCell>
                      <TableCell align="center">{p.goles_contra}</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        {p.diferencia_goles > 0 ? `+${p.diferencia_goles}` : p.diferencia_goles}
                      </TableCell>
                      <TableCell align="center" sx={{ bgcolor: '#F0FDF4' }}>
                        <Chip
                          label={p.puntos}
                          size="small"
                          sx={{ fontWeight: 800, bgcolor: '#D1FAE5', color: '#065F46' }}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </TableContainer>
          </Paper>

          {/* GOLEADORES Y TARJETAS EN 2 COLUMNAS */}
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            {/* GOLEADORES */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2.2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#ECFDF5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <SportsSoccerRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                  Tabla de Goleadores
                </Typography>
              </Box>

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 320 }}>
                  <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Jugador</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Equipo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Goles</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {goleadores.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} align="center" sx={{ py: 3, color: '#64748B' }}>
                          Todavía no hay goles registrados en este torneo.
                        </TableCell>
                      </TableRow>
                    ) : (
                      goleadores.map((g, idx) => (
                        <TableRow key={g.jugador_id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                          <TableCell sx={{ fontWeight: 600 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {idx === 0 && <span>⚽</span>}
                              {g.nombre_jugador}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: '#64748B' }}>{g.nombre_equipo}</TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${g.goles} gol${g.goles === 1 ? '' : 'es'}`}
                              size="small"
                              sx={{ fontWeight: 800, bgcolor: '#ECFDF5', color: '#065F46' }}
                            />
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>

            {/* TARJETAS */}
            <Paper
              elevation={0}
              sx={{
                flex: 1,
                borderRadius: 3,
                border: '1px solid #E2E8F0',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: 2.2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box sx={{ width: 34, height: 34, borderRadius: '8px', bgcolor: '#FFFBEB', color: '#D97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <StyleRoundedIcon fontSize="small" />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B' }}>
                  Control Disciplinario
                </Typography>
              </Box>

              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 320 }}>
                  <TableHead sx={{ bgcolor: '#F1F5F9' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, color: '#475569' }}>Jugador / Equipo</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>🟨</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>🟥</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 700, color: '#475569' }}>Sanción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tarjetas.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center" sx={{ py: 3, color: '#64748B' }}>
                          Limpio. Sin amonestaciones registradas.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tarjetas.map((t) => {
                        const expulsado = t.tarjetas_rojas > 0 || t.tarjetas_amarillas >= 2;
                        return (
                          <TableRow key={t.jugador_id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{t.nombre_jugador}</Typography>
                              <Typography variant="caption" sx={{ color: '#64748B' }}>{t.nombre_equipo}</Typography>
                            </TableCell>
                            <TableCell align="center">
                              {t.tarjetas_amarillas > 0 ? (
                                <Chip label={t.tarjetas_amarillas} size="small" sx={{ bgcolor: '#FEF08A', color: '#854D0E', fontWeight: 800 }} />
                              ) : '0'}
                            </TableCell>
                            <TableCell align="center">
                              {t.tarjetas_rojas > 0 ? (
                                <Chip label={t.tarjetas_rojas} size="small" sx={{ bgcolor: '#FEE2E2', color: '#991B1B', fontWeight: 800 }} />
                              ) : '0'}
                            </TableCell>
                            <TableCell align="center">
                              {expulsado ? (
                                <Chip label="Suspendido" size="small" sx={{ bgcolor: '#FEE2E2', color: '#DC2626', fontWeight: 700 }} />
                              ) : (
                                <Chip label="Habilitado" size="small" sx={{ bgcolor: '#F0FDF4', color: '#16A34A', fontWeight: 600 }} />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Stack>
        </>
      )}
    </Box>
  );
}