import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Checkbox, Alert
} from '@mui/material';

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
      return { jugador_id: inscrito.jugador_id, nombre: j?.nombre || '—', apellido: j?.apellido || '' };
    });

  useEffect(() => {
    if (!partido) return;
    setGolesLocal(partido.goles_local || 0);
    setGolesVisitante(partido.goles_visitante || 0);
    setErrorValidacion('');

    const statsIniciales = {};
    (partido.estadisticas_jugadores || []).forEach((s) => {
      statsIniciales[s.jugador_id] = {
        goles: s.goles, tarjetas_amarillas: s.tarjetas_amarillas, tarjetas_rojas: s.tarjetas_rojas,
      };
    });
    setStats(statsIniciales);
  }, [partido, open]);

  const actualizarStat = (jugadorId, campo, valor) => {
    setStats((prev) => ({
      ...prev,
      [jugadorId]: { goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0, ...prev[jugadorId], [campo]: valor },
    }));
  };

  const handleGuardar = () => {
    setErrorValidacion('');

    if (Number(golesLocal) < 0 || Number(golesVisitante) < 0) {
      setErrorValidacion('Los goles no pueden ser un número negativo');
      return;
    }

    const hayGolesNegativos = Object.values(stats).some((s) => Number(s.goles) < 0);
    if (hayGolesNegativos) {
      setErrorValidacion('Ningún jugador puede tener goles negativos');
      return;
    }

    const totalGolesLocal = jugadoresDe(equipoLocal).reduce(
      (suma, j) => suma + Number(stats[j.jugador_id]?.goles || 0), 0
    );
    const totalGolesVisitante = jugadoresDe(equipoVisitante).reduce(
      (suma, j) => suma + Number(stats[j.jugador_id]?.goles || 0), 0
    );

    if (totalGolesLocal > Number(golesLocal)) {
      setErrorValidacion(
        `Los goles individuales de ${equipoLocal?.nombre} (${totalGolesLocal}) no pueden superar el marcador del equipo (${golesLocal})`
      );
      return;
    }
    if (totalGolesVisitante > Number(golesVisitante)) {
      setErrorValidacion(
        `Los goles individuales de ${equipoVisitante?.nombre} (${totalGolesVisitante}) no pueden superar el marcador del equipo (${golesVisitante})`
      );
      return;
    }

    const estadisticas_jugadores = [];

    jugadoresDe(equipoLocal).forEach((j) => {
      const s = stats[j.jugador_id];
      if (s) estadisticas_jugadores.push({ jugador_id: j.jugador_id, equipo_id: equipoLocal._id, titular: true, ...s });
    });
    jugadoresDe(equipoVisitante).forEach((j) => {
      const s = stats[j.jugador_id];
      if (s) estadisticas_jugadores.push({ jugador_id: j.jugador_id, equipo_id: equipoVisitante._id, titular: true, ...s });
    });

    onGuardar({
      estado: 'finalizado',
      goles_local: Number(golesLocal),
      goles_visitante: Number(golesVisitante),
      estadisticas_jugadores,
    });
  };

  if (!partido) return null;

  const renderFilaJugador = (j) => {
    const s = stats[j.jugador_id] || { goles: 0, tarjetas_amarillas: 0, tarjetas_rojas: 0 };
    return (
      <TableRow key={j.jugador_id}>
        <TableCell>{j.nombre} {j.apellido}</TableCell>
        <TableCell>
          <TextField
            type="number" size="small" sx={{ width: 70 }}
            slotProps={{ htmlInput: { min: 0 } }}
            value={s.goles}
            onChange={(e) => actualizarStat(j.jugador_id, 'goles', Math.max(0, Number(e.target.value) || 0))}
          />
        </TableCell>
        <TableCell>
          <Checkbox
            checked={s.tarjetas_amarillas > 0}
            onChange={(e) => actualizarStat(j.jugador_id, 'tarjetas_amarillas', e.target.checked ? 1 : 0)}
          />
        </TableCell>
        <TableCell>
          <Checkbox
            checked={s.tarjetas_rojas > 0}
            onChange={(e) => actualizarStat(j.jugador_id, 'tarjetas_rojas', e.target.checked ? 1 : 0)}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Registrar resultado: {equipoLocal?.nombre} vs {equipoVisitante?.nombre}
      </DialogTitle>
      <DialogContent>
        {errorValidacion && (
          <Alert severity="error" sx={{ mb: 2 }}>{errorValidacion}</Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
          <TextField
            label={equipoLocal?.nombre} type="number" sx={{ width: 120 }}
            slotProps={{ htmlInput: { min: 0 } }}
            value={golesLocal}
            onChange={(e) => setGolesLocal(Math.max(0, Number(e.target.value) || 0))}
          />
          <Typography variant="h6">-</Typography>
          <TextField
            label={equipoVisitante?.nombre} type="number" sx={{ width: 120 }}
            slotProps={{ htmlInput: { min: 0 } }}
            value={golesVisitante}
            onChange={(e) => setGolesVisitante(Math.max(0, Number(e.target.value) || 0))}
          />
        </Box>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>{equipoLocal?.nombre}</Typography>
        <Table size="small" sx={{ mb: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell>Jugador</TableCell><TableCell>Goles</TableCell>
              <TableCell>Amarilla</TableCell><TableCell>Roja</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{jugadoresDe(equipoLocal).map(renderFilaJugador)}</TableBody>
        </Table>

        <Typography variant="subtitle1" sx={{ mb: 1 }}>{equipoVisitante?.nombre}</Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Jugador</TableCell><TableCell>Goles</TableCell>
              <TableCell>Amarilla</TableCell><TableCell>Roja</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{jugadoresDe(equipoVisitante).map(renderFilaJugador)}</TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleGuardar}>Guardar resultado</Button>
      </DialogActions>
    </Dialog>
  );
}