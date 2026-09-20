import { useEffect, useState } from 'react';
import {
  Box, Typography, TextField, MenuItem,
  Table, TableHead, TableRow, TableCell, TableBody, Paper, Chip
} from '@mui/material';
import Loading from '../components/Loading';
import {
  listarTorneos, obtenerTablaPosiciones, obtenerTablaGoleadores, obtenerTablaTarjetas
} from '../services/torneo.service';

export default function Posiciones() {
  const [torneos, setTorneos] = useState([]);
  const [torneoId, setTorneoId] = useState('');
  const [posiciones, setPosiciones] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [tarjetas, setTarjetas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarTorneos().then((data) => {
      setTorneos(data);
      if (data.length > 0) setTorneoId(data[0]._id);
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
      setPosiciones(p);
      setGoleadores(g);
      setTarjetas(t);
    });
  }, [torneoId]);

  if (cargando) return <Loading />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 2 }}>Tabla de posiciones</Typography>

      <TextField
        select label="Torneo" value={torneoId}
        onChange={(e) => setTorneoId(e.target.value)}
        sx={{ width: 300, mb: 3 }}
      >
        {torneos.map((t) => (
          <MenuItem key={t._id} value={t._id}>{t.nombre}</MenuItem>
        ))}
      </TextField>

      {torneos.length === 0 && (
        <Typography color="text.secondary">Todavía no hay torneos creados.</Typography>
      )}

      {torneoId && (
        <>
          <Paper sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Equipo</TableCell>
                  <TableCell align="center">PJ</TableCell>
                  <TableCell align="center">G</TableCell>
                  <TableCell align="center">E</TableCell>
                  <TableCell align="center">P</TableCell>
                  <TableCell align="center">GF</TableCell>
                  <TableCell align="center">GC</TableCell>
                  <TableCell align="center">DIF</TableCell>
                  <TableCell align="center">PTS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {posiciones.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      Todavía no hay partidos finalizados en este torneo.
                    </TableCell>
                  </TableRow>
                ) : (
                  posiciones.map((p) => (
                    <TableRow key={p.equipo_id}>
                      <TableCell>{p.nombre_equipo}</TableCell>
                      <TableCell align="center">{p.partidos_jugados}</TableCell>
                      <TableCell align="center">{p.ganados}</TableCell>
                      <TableCell align="center">{p.empatados}</TableCell>
                      <TableCell align="center">{p.perdidos}</TableCell>
                      <TableCell align="center">{p.goles_favor}</TableCell>
                      <TableCell align="center">{p.goles_contra}</TableCell>
                      <TableCell align="center">{p.diferencia_goles}</TableCell>
                      <TableCell align="center"><b>{p.puntos}</b></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography variant="h5" sx={{ mb: 2 }}>Tabla de goleadores</Typography>
          <Paper sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jugador</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell align="center">Goles</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {goleadores.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} align="center">
                      Todavía no hay goles registrados en este torneo.
                    </TableCell>
                  </TableRow>
                ) : (
                  goleadores.map((g) => (
                    <TableRow key={g.jugador_id}>
                      <TableCell>{g.nombre_jugador}</TableCell>
                      <TableCell>{g.nombre_equipo}</TableCell>
                      <TableCell align="center"><b>{g.goles}</b></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          <Typography variant="h5" sx={{ mb: 2 }}>Tarjetas</Typography>
          <Paper>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jugador</TableCell>
                  <TableCell>Equipo</TableCell>
                  <TableCell align="center">Amarillas</TableCell>
                  <TableCell align="center">Rojas</TableCell>
                  <TableCell align="center">Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tarjetas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Todavía no hay tarjetas registradas en este torneo.
                    </TableCell>
                  </TableRow>
                ) : (
                  tarjetas.map((t) => {
                    const expulsado = t.tarjetas_rojas > 0 || t.tarjetas_amarillas >= 2;
                    return (
                      <TableRow key={t.jugador_id}>
                        <TableCell>{t.nombre_jugador}</TableCell>
                        <TableCell>{t.nombre_equipo}</TableCell>
                        <TableCell align="center">
                          {t.tarjetas_amarillas > 0 && (
                            <Chip label={t.tarjetas_amarillas} size="small" sx={{ bgcolor: '#fbc02d' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {t.tarjetas_rojas > 0 && (
                            <Chip label={t.tarjetas_rojas} size="small" sx={{ bgcolor: '#e53935', color: 'white' }} />
                          )}
                        </TableCell>
                        <TableCell align="center">
                          {expulsado && (
                            <Chip label="Expulsado" size="small" color="error" variant="outlined" />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Paper>
        </>
      )}
    </Box>
  );
}