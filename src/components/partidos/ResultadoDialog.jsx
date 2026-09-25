import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody,
  Checkbox, Alert, Paper, Grid, Avatar, Chip, Stack, Divider, Tooltip,
  TableContainer
} from '@mui/material';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

export default function ResultadoDialog({ open, onClose, onGuardar, partido, equipos, jugadores }) {
  const [golesLocal, setGolesLocal] = useState(0);
  const [golesVisitante, setGolesVisitante] = useState(0);
  const [stats, setStats] = useState({});
  const [errorValidacion, setErrorValidacion] = useState('');

  const equipoLocal = equipos.find((e) => e._id === partido?.equipo_local_id);
  const equipoVisitante = equipos.find((e) => e._id === partido?.equipo_visitante_id);

  const jugadoresDe = (equipo) =>
    (equipo?.jugadores_inscritos || []).map((inscrito) => {
      const j = jugadores.find((jug) => jug._id === inscrito.jugador_id);
      return {
        jugador_id: inscrito.jugador_id,
        nombre: j?.nombre || '—',
        apellido: j?.apellido || '',
        posicion: j?.posicion || 'Jugador',
        carne: j?.carne || '',
        dorsal: inscrito.dorsal || '—',
      };
    });

  useEffect(() => {
    if (!partido) return;
    setGolesLocal(partido.goles_local || 0);
    setGolesVisitante(partido.goles_visitante || 0);
    setErrorValidacion('');

    const statsIniciales = {};
    (partido.estadisticas_jugadores || []).forEach((s) => {
      statsIniciales[s.jugador_id] = {
        goles: s.goles || 0,
        tarjetas_amarillas: s.tarjetas_amarillas || 0,
        tarjetas_rojas: s.tarjetas_rojas || 0,
      };
    });
    setStats(statsIniciales);
  }, [partido, open]);

  const actualizarStat = (jugadorId, campo, valor) => {
    setStats((prev) => ({
      ...prev,
      [jugadorId]: {
        goles: 0,
        tarjetas_amarillas: 0,
        tarjetas_rojas: 0,
        ...prev[jugadorId],
        [campo]: valor,
      },
    }));
  };

  const listaLocal = jugadoresDe(equipoLocal);
  const listaVisitante = jugadoresDe(equipoVisitante);

  const totalGolesLocal = listaLocal.reduce(
    (suma, j) => suma + Number(stats[j.jugador_id]?.goles || 0), 0
  );
  const totalGolesVisitante = listaVisitante.reduce(
    (suma, j) => suma + Number(stats[j.jugador_id]?.goles || 0), 0
  );

  const golesLocalNum = Number(golesLocal) || 0;
  const golesVisitanteNum = Number(golesVisitante) || 0;

  const handleGuardar = () => {
    setErrorValidacion('');

    if (golesLocalNum < 0 || golesVisitanteNum < 0) {
      setErrorValidacion('Los goles del marcador general no pueden ser números negativos.');
      return;
    }

    const hayGolesNegativos = Object.values(stats).some((s) => Number(s.goles) < 0);
    if (hayGolesNegativos) {
      setErrorValidacion('Ningún jugador puede tener una cantidad negativa de goles.');
      return;
    }

    if (totalGolesLocal > golesLocalNum) {
      setErrorValidacion(
        `Error en ${equipoLocal?.nombre}: Los goles asignados a los jugadores (${totalGolesLocal}) superan el marcador final del equipo (${golesLocalNum}).`
      );
      return;
    }
    if (totalGolesVisitante > golesVisitanteNum) {
      setErrorValidacion(
        `Error en ${equipoVisitante?.nombre}: Los goles asignados a los jugadores (${totalGolesVisitante}) superan el marcador final del equipo (${golesVisitanteNum}).`
      );
      return;
    }

    const estadisticas_jugadores = [];

    listaLocal.forEach((j) => {
      const s = stats[j.jugador_id];
      if (s) {
        estadisticas_jugadores.push({
          jugador_id: j.jugador_id,
          equipo_id: equipoLocal._id,
          titular: true,
          goles: Number(s.goles) || 0,
          tarjetas_amarillas: Number(s.tarjetas_amarillas) || 0,
          tarjetas_rojas: Number(s.tarjetas_rojas) || 0,
        });
      }
    });

    listaVisitante.forEach((j) => {
      const s = stats[j.jugador_id];
      if (s) {
        estadisticas_jugadores.push({
          jugador_id: j.jugador_id,
          equipo_id: equipoVisitante._id,
          titular: true,
          goles: Number(s.goles) || 0,
          tarjetas_amarillas: Number(s.tarjetas_amarillas) || 0,
          tarjetas_rojas: Number(s.tarjetas_rojas) || 0,
        });
      }
    });

    onGuardar({
      estado: 'finalizado',
      goles_local: golesLocalNum,
      goles_visitante: golesVisitanteNum,
      estadisticas_jugadores,
    });
  };

  if (!partido) return null;

  const renderTablaEquipo = (equipo, lista, golesEquipo, golesSumados, colorPrimario) => {
    const faltaGoles = golesEquipo > golesSumados;
    const excesoGoles = golesSumados > golesEquipo;

    return (
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          border: '1px solid #E2E8F0',
          overflow: 'hidden',
        }}
      >
        {/* Cabecera del equipo */}
        <Box
          sx={{
            p: 2,
            bgcolor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: colorPrimario, fontWeight: 800, fontSize: '0.85rem' }}>
              {equipo?.nombre?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                {equipo?.nombre}
              </Typography>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                {equipo?.carrera || 'Plantilla oficial'}
              </Typography>
            </Box>
          </Box>

          {/* Estado de balance de goles */}
          <Chip
            icon={excesoGoles ? <WarningAmberRoundedIcon /> : <CheckCircleRoundedIcon />}
            label={`Goles asignados: ${golesSumados} de ${golesEquipo}`}
            size="small"
            sx={{
              bgcolor: excesoGoles ? '#FEE2E2' : faltaGoles ? '#FEF3C7' : '#D1FAE5',
              color: excesoGoles ? '#991B1B' : faltaGoles ? '#92400E' : '#065F46',
              fontWeight: 700,
            }}
          />
        </Box>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 480 }}>
            <TableHead sx={{ bgcolor: '#F1F5F9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, width: 60, textAlign: 'center' }}>Dorsal</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Jugador / Posición</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 110, textAlign: 'center' }}>Goles</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90, textAlign: 'center' }}>Amarilla 🟨</TableCell>
                <TableCell sx={{ fontWeight: 700, width: 90, textAlign: 'center' }}>Roja 🟥</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lista.map((j) => {
                const s = stats[j.jugador_id] || { goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0 };
                return (
                  <TableRow key={j.jugador_id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    {/* Dorsal */}
                    <TableCell align="center">
                      <Chip
                        label={`#${j.dorsal}`}
                        size="small"
                        sx={{ fontWeight: 800, bgcolor: '#E2E8F0', color: '#334155', height: 24 }}
                      />
                    </TableCell>

                    {/* Nombre y posición */}
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1E293B' }}>
                        {j.nombre} {j.apellido}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B' }}>
                        {j.posicion} • {j.carne}
                      </Typography>
                    </TableCell>

                    {/* Goles */}
                    <TableCell align="center">
                      <TextField
                        type="number"
                        size="small"
                        value={s.goles}
                        slotProps={{
                          htmlInput: {
                            min: 0,
                            max: golesEquipo,
                            style: { textAlign: 'center', fontWeight: 700 },
                          },
                        }}
                        sx={{ width: 75 }}
                        onChange={(e) =>
                          actualizarStat(j.jugador_id, 'goles', Math.max(0, Number(e.target.value) || 0))
                        }
                      />
                    </TableCell>

                    {/* Tarjeta Amarilla */}
                    <TableCell align="center">
                      <Tooltip title="Tarjeta Amarilla">
                        <Checkbox
                          size="small"
                          checked={s.tarjetas_amarillas > 0}
                          sx={{
                            color: '#FBBF24',
                            '&.Mui-checked': { color: '#F59E0B' },
                          }}
                          onChange={(e) =>
                            actualizarStat(j.jugador_id, 'tarjetas_amarillas', e.target.checked ? 1 : 0)
                          }
                        />
                      </Tooltip>
                    </TableCell>

                    {/* Tarjeta Roja */}
                    <TableCell align="center">
                      <Tooltip title="Tarjeta Roja (Expulsión)">
                        <Checkbox
                          size="small"
                          checked={s.tarjetas_rojas > 0}
                          sx={{
                            color: '#F87171',
                            '&.Mui-checked': { color: '#EF4444' },
                          }}
                          onChange={(e) =>
                            actualizarStat(j.jugador_id, 'tarjetas_rojas', e.target.checked ? 1 : 0)
                          }
                        />
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ p: 2.5, bgcolor: '#1B5E20', color: '#FFFFFF' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <SportsSoccerRoundedIcon />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              Registrar Acta Oficial del Encuentro
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.85)' }}>
              Colegiado Arbitral • Cierre de Marcador y Estadísticas Disciplinarias
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
        {errorValidacion && (
          <Alert severity="error" sx={{ mt: 2, mb: 2.5, borderRadius: 2 }}>
            {errorValidacion}
          </Alert>
        )}

        {/* 1. MARCADOR VISUAL DEPORTIVO (SCOREBOARD) */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            mt: 2,
            mb: 3.5,
            borderRadius: 3,
            background: 'linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)',
            border: '1px solid #E2E8F0',
          }}
        >
          <Grid container spacing={2} alignItems="center" justifyContent="center">
            {/* EQUIPO LOCAL */}
            <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#1B5E20', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(27,94,32,0.2)' }}>
                  {equipoLocal?.nombre?.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', maxWidth: 220 }}>
                  {equipoLocal?.nombre}
                </Typography>
                <Chip label="Equipo Local" size="small" sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700 }} />

                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontWeight: 700, mb: 0.5 }}>
                    GOLES LOCAL
                  </Typography>
                  <TextField
                    type="number"
                    value={golesLocal}
                    onChange={(e) => setGolesLocal(Math.max(0, Number(e.target.value) || 0))}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        style: {
                          textAlign: 'center',
                          fontSize: '1.8rem',
                          fontWeight: 900,
                          color: '#1B5E20',
                          padding: '8px',
                        },
                      },
                    }}
                    sx={{ width: 100, bgcolor: '#FFFFFF', borderRadius: 2 }}
                  />
                </Box>
              </Box>
            </Grid>

            {/* SEPARADOR VS */}
            <Grid size={{ xs: 12, sm: 2 }} sx={{ textAlign: 'center' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#94A3B8', letterSpacing: '1px' }}>
                VS
              </Typography>
              <Chip label="Marcador Final" size="small" variant="outlined" sx={{ borderColor: '#CBD5E1', color: '#64748B', fontWeight: 600, mt: 0.5 }} />
            </Grid>

            {/* EQUIPO VISITANTE */}
            <Grid size={{ xs: 12, sm: 5 }} sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                <Avatar sx={{ width: 56, height: 56, bgcolor: '#0284C7', fontWeight: 800, fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(2,132,199,0.2)' }}>
                  {equipoVisitante?.nombre?.charAt(0)}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', maxWidth: 220 }}>
                  {equipoVisitante?.nombre}
                </Typography>
                <Chip label="Equipo Visitante" size="small" sx={{ bgcolor: '#F0F9FF', color: '#0369A1', fontWeight: 700 }} />

                <Box sx={{ mt: 1.5 }}>
                  <Typography variant="caption" sx={{ display: 'block', color: '#64748B', fontWeight: 700, mb: 0.5 }}>
                    GOLES VISITANTE
                  </Typography>
                  <TextField
                    type="number"
                    value={golesVisitante}
                    onChange={(e) => setGolesVisitante(Math.max(0, Number(e.target.value) || 0))}
                    slotProps={{
                      htmlInput: {
                        min: 0,
                        style: {
                          textAlign: 'center',
                          fontSize: '1.8rem',
                          fontWeight: 900,
                          color: '#0284C7',
                          padding: '8px',
                        },
                      },
                    }}
                    sx={{ width: 100, bgcolor: '#FFFFFF', borderRadius: 2 }}
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* 2. TABLAS DE JUGADORES */}
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#475569', mb: 1.5, letterSpacing: '0.4px', textTransform: 'uppercase' }}>
          Desglose Individual de Goles y Tarjetas
        </Typography>

        {renderTablaEquipo(equipoLocal, listaLocal, golesLocalNum, totalGolesLocal, '#1B5E20')}
        {renderTablaEquipo(equipoVisitante, listaVisitante, golesVisitanteNum, totalGolesVisitante, '#0284C7')}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', justifyContent: 'space-between' }}>
        <Button onClick={onClose} sx={{ color: '#64748B', fontWeight: 600 }}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleGuardar}
          sx={{
            bgcolor: '#1B5E20',
            fontWeight: 700,
            px: 3,
            py: 1,
            borderRadius: 2,
            '&:hover': { bgcolor: '#14532D' },
          }}
        >
          Guardar y Certificar Acta
        </Button>
      </DialogActions>
    </Dialog>
  );
}