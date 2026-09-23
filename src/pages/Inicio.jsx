import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Grid, Chip, Alert, Button, Stack } from '@mui/material';
import Loading from '../components/Loading';
import { getUsuarioActual } from '../services/auth.service';
import { listarTorneos, obtenerTablaPosiciones } from '../services/torneo.service';
import { listarPartidos } from '../services/partido.service';
import { listarEquipos } from '../services/equipo.service';

// Revisa en qué torneos (no finalizados) falta inscribir el equipo del delegado
const calcularAvisosDelegado = (torneos, equipos) => {
  // Para un delegado, el backend solo devuelve SU equipo
  const miEquipo = equipos[0];

  if (!miEquipo) {
    return [{
      texto: 'Todavía no has registrado tu equipo. Regístralo para poder participar en los torneos.',
      boton: 'Ir a Equipos',
      ruta: '/equipos',
    }];
  }

  return torneos
    .filter((torneo) => torneo.estado !== 'finalizado')
    .filter((torneo) => !(torneo.equipos_inscritos || []).some(
      (inscripcion) => String(inscripcion.equipo_id) === miEquipo._id && inscripcion.estado === 'inscrito'
    ))
    .map((torneo) => ({
      texto: `Tu equipo "${miEquipo.nombre}" no está inscrito en el torneo "${torneo.nombre}". Inscríbelo para poder jugar.`,
      boton: 'Inscribirme',
      ruta: '/torneos',
    }));
};

export default function Inicio() {
  const usuario = getUsuarioActual();
  const esDelegado = usuario?.rol === 'delegado';
  const navigate = useNavigate();

  const [lider, setLider] = useState(null);
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      const [torneos, partidos, equipos] = await Promise.all([
        listarTorneos(), listarPartidos(), listarEquipos(),
      ]);

      if (esDelegado) {
        setAvisos(calcularAvisosDelegado(torneos, equipos));
      }

      if (torneos.length > 0) {
        const posiciones = await obtenerTablaPosiciones(torneos[0]._id);
        if (posiciones.length > 0) setLider(posiciones[0]);
      }

      const nombreEquipo = (id) => equipos.find((e) => e._id === id)?.nombre || '—';

      const proximos = partidos
        .filter((p) => p.estado === 'programado')
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .slice(0, 3)
        .map((p) => ({
          ...p,
          nombreLocal: nombreEquipo(p.equipo_local_id),
          nombreVisitante: nombreEquipo(p.equipo_visitante_id),
        }));

      setProximosPartidos(proximos);
      setCargando(false);
    };
    cargar();
  }, []);

  if (cargando) return <Loading />;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Bienvenido, {usuario?.nombre} ({usuario?.rol})
      </Typography>

      {avisos.length > 0 && (
        <Stack spacing={2} sx={{ mb: 3 }}>
          {avisos.map((aviso, indice) => (
            <Alert
              key={indice}
              severity="warning"
              action={
                <Button color="inherit" size="small" onClick={() => navigate(aviso.ruta)}>
                  {aviso.boton}
                </Button>
              }
            >
              {aviso.texto}
            </Alert>
          ))}
        </Stack>
      )}

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>🏆 Líder actual</Typography>
            {lider ? (
              <>
                <Typography variant="h5">{lider.nombre_equipo}</Typography>
                <Typography color="text.secondary">{lider.puntos} puntos</Typography>
              </>
            ) : (
              <Typography color="text.secondary">Todavía no hay partidos finalizados.</Typography>
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>📅 Próximos partidos</Typography>
            {proximosPartidos.length === 0 ? (
              <Typography color="text.secondary">No hay partidos programados.</Typography>
            ) : (
              proximosPartidos.map((p) => (
                <Box key={p._id} sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    {p.nombreLocal} vs {p.nombreVisitante}
                  </Typography>
                  <Chip label={`${p.fecha?.slice(0, 10)} · ${p.hora}`} size="small" />
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}