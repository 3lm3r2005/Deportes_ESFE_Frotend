import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Alert, Button, Stack, Avatar, Card, CardContent, Divider
} from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import StadiumRoundedIcon from '@mui/icons-material/StadiumRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import HowToRegRoundedIcon from '@mui/icons-material/HowToRegRounded';

import Loading from '../components/Loading';
import { getUsuarioActual } from '../services/auth.service';
import { listarTorneos, obtenerTablaPosiciones } from '../services/torneo.service';
import { listarPartidos } from '../services/partido.service';
import { listarEquipos } from '../services/equipo.service';
import { listarJugadores } from '../services/jugador.service';
import { listarConvocatorias } from '../services/convocatoria.service';

const ROL_LABELS = {
  admin: { titulo: 'Administrador General', chip: 'Admin', color: '#92400E', bg: '#FEF3C7' },
  delegado: { titulo: 'Delegado de Equipo', chip: 'Delegado', color: '#0369A1', bg: '#E0F2FE' },
  arbitro: { titulo: 'Colegiado / Árbitro', chip: 'Árbitro', color: '#C2410C', bg: '#FFEDD5' },
  aficionado: { titulo: 'Comunidad ESFE / Aficionado', chip: 'Aficionado', color: '#065F46', bg: '#D1FAE5' },
};

// Revisa en qué torneos (no finalizados) falta inscribir el equipo del delegado
const calcularAvisosDelegado = (torneos, equipos) => {
  const miEquipo = equipos[0];

  if (!miEquipo) {
    return [{
      texto: 'Todavía no has registrado tu equipo. Regístralo para poder participar en los torneos.',
      boton: 'Registrar Equipo',
      ruta: '/equipos',
    }];
  }

  return torneos
    .filter((torneo) => torneo.estado !== 'finalizado')
    .filter((torneo) => !(torneo.equipos_inscritos || []).some(
      (inscripcion) => String(inscripcion.equipo_id) === miEquipo._id && inscripcion.estado === 'inscrito'
    ))
    .map((torneo) => ({
      texto: `Tu equipo "${miEquipo.nombre}" aún no está inscrito en "${torneo.nombre}". ¡Inscríbelo para asegurar su cupo!`,
      boton: 'Inscribir en Torneo',
      ruta: '/torneos',
    }));
};

export default function Inicio() {
  const usuario = getUsuarioActual();
  const rol = usuario?.rol || 'aficionado';
  const esDelegado = rol === 'delegado';
  const navigate = useNavigate();

  const [lider, setLider] = useState(null);
  const [torneoPrincipal, setTorneoPrincipal] = useState(null);
  const [proximosPartidos, setProximosPartidos] = useState([]);
  const [convocatorias, setConvocatorias] = useState([]);
  const [avisos, setAvisos] = useState([]);
  const [metricas, setMetricas] = useState({
    totalTorneos: 0,
    torneosActivos: 0,
    totalEquipos: 0,
    totalPartidos: 0,
    partidosProgramados: 0,
    totalJugadores: 0,
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [torneosData, partidosData, equiposData, jugadoresData, convocatoriasData] = await Promise.all([
          listarTorneos().catch(() => []),
          listarPartidos().catch(() => []),
          listarEquipos().catch(() => []),
          listarJugadores().catch(() => []),
          listarConvocatorias().catch(() => []),
        ]);

        const torneos = Array.isArray(torneosData) ? torneosData : [];
        const partidos = Array.isArray(partidosData) ? partidosData : [];
        const equipos = Array.isArray(equiposData) ? equiposData : [];
        const jugadores = Array.isArray(jugadoresData) ? jugadoresData : (jugadoresData?.jugadores || []);
        const convocatoriasList = Array.isArray(convocatoriasData) ? convocatoriasData : [];

        // Calcular métricas
        const torneosActivos = torneos.filter((t) => t.estado === 'activo').length;
        const partidosProg = partidos.filter((p) => p.estado === 'programado').length;

        setMetricas({
          totalTorneos: torneos.length,
          torneosActivos,
          totalEquipos: equipos.length,
          totalPartidos: partidos.length,
          partidosProgramados: partidosProg,
          totalJugadores: jugadores.length,
        });

        if (esDelegado) {
          setAvisos(calcularAvisosDelegado(torneos, equipos));
        }

        // Torneo activo o primero disponible
        const torneoSeleccionado = torneos.find((t) => t.estado === 'activo') || torneos[0];
        if (torneoSeleccionado) {
          setTorneoPrincipal(torneoSeleccionado);
          try {
            const posiciones = await obtenerTablaPosiciones(torneoSeleccionado._id);
            if (posiciones && posiciones.length > 0) {
              setLider(posiciones[0]);
            }
          } catch {
            // Posiciones aún no disponibles
          }
        }

        // Próximos partidos
        const nombreEquipo = (id) => equipos.find((e) => e._id === id)?.nombre || 'Equipo';

        const proximos = partidos
          .filter((p) => p.estado === 'programado')
          .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
          .slice(0, 4)
          .map((p) => ({
            ...p,
            nombreLocal: nombreEquipo(p.equipo_local_id),
            nombreVisitante: nombreEquipo(p.equipo_visitante_id),
          }));

        setProximosPartidos(proximos);
        setConvocatorias(convocatoriasList.slice(0, 3));
      } catch (err) {
        console.error('Error cargando dashboard', err);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, [esDelegado]);

  if (cargando) return <Loading />;

  const rolInfo = ROL_LABELS[rol] || ROL_LABELS.aficionado;

  const fechaHoy = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <Box sx={{ maxWidth: 1280, mx: 'auto', pb: 4 }}>
      {/* 1. HERO BANNER DEPORTIVO */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, md: 4 },
          mb: 3.5,
          borderRadius: 3,
          background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 55%, #065F46 100%)',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(27, 94, 32, 0.25)',
        }}
      >
        {/* Marca de agua decorativa */}
        <Box
          sx={{
            position: 'absolute',
            right: -25,
            bottom: -35,
            opacity: 0.08,
            pointerEvents: 'none',
          }}
        >
          <SportsSoccerRoundedIcon sx={{ fontSize: 260, color: '#FFFFFF' }} />
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <Chip
              label={rolInfo.titulo}
              size="small"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                fontWeight: 700,
                backdropFilter: 'blur(4px)',
                letterSpacing: '0.3px',
              }}
            />
            <Chip
              icon={<CalendarMonthRoundedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.85) !important' }} />}
              label={fechaHoy.charAt(0).toUpperCase() + fechaHoy.slice(1)}
              size="small"
              sx={{
                bgcolor: 'rgba(0, 0, 0, 0.15)',
                color: 'rgba(255, 255, 255, 0.95)',
                fontSize: '0.78rem',
              }}
            />
          </Box>

          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.65rem', md: '2.2rem' },
              mb: 1,
              letterSpacing: '-0.5px',
            }}
          >
            ¡Hola, {usuario?.nombre}! 👋
          </Typography>

          <Typography
            variant="body1"
            sx={{
              maxWidth: 720,
              color: 'rgba(255, 255, 255, 0.9)',
              fontSize: { xs: '0.95rem', md: '1.05rem' },
              lineHeight: 1.5,
            }}
          >
            Bienvenido al portal deportivo de <b>ESFE</b>. Consulta el fixture de encuentros, posiciones de los torneos intercarreras y mantente al día con las convocatorias oficiales.
          </Typography>
        </Box>
      </Paper>

      {/* AVISOS IMPORTANTES PARA DELEGADO */}
      {avisos.length > 0 && (
        <Stack spacing={1.5} sx={{ mb: 3.5 }}>
          {avisos.map((aviso, indice) => (
            <Alert
              key={indice}
              severity="warning"
              variant="filled"
              sx={{
                borderRadius: 2.5,
                bgcolor: '#FFFBEB',
                color: '#92400E',
                border: '1px solid #FCD34D',
                '& .MuiAlert-icon': { color: '#D97706' },
                alignItems: 'center',
              }}
              action={
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate(aviso.ruta)}
                  sx={{
                    bgcolor: '#D97706',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    '&:hover': { bgcolor: '#B45309' },
                  }}
                >
                  {aviso.boton}
                </Button>
              }
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {aviso.texto}
              </Typography>
            </Alert>
          ))}
        </Stack>
      )}

      {/* 2. TARJETAS DE MÉTRICAS (KPIs DEPORTIVOS) */}
      <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
        {/* Card 1: Torneos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => navigate('/torneos')}
            sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -8px rgba(16, 185, 129, 0.2)',
                borderColor: '#10B981',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                Torneos
              </Typography>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#ECFDF5',
                  color: '#059669',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <EmojiEventsRoundedIcon />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              {metricas.totalTorneos}
            </Typography>
            <Chip
              label={`${metricas.torneosActivos} activo${metricas.torneosActivos === 1 ? '' : 's'}`}
              size="small"
              sx={{ bgcolor: '#D1FAE5', color: '#065F46', fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Card>
        </Grid>

        {/* Card 2: Equipos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => navigate(rol === 'aficionado' || rol === 'arbitro' ? '/posiciones' : '/equipos')}
            sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -8px rgba(2, 132, 199, 0.2)',
                borderColor: '#0284C7',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                Equipos
              </Typography>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#F0F9FF',
                  color: '#0284C7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <GroupsRoundedIcon />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              {metricas.totalEquipos}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Intercarreras ESFE
            </Typography>
          </Card>
        </Grid>

        {/* Card 3: Partidos */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => navigate('/partidos')}
            sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -8px rgba(245, 158, 11, 0.2)',
                borderColor: '#F59E0B',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                Partidos
              </Typography>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#FFFBEB',
                  color: '#D97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SportsSoccerRoundedIcon />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              {metricas.totalPartidos}
            </Typography>
            <Chip
              label={`${metricas.partidosProgramados} por disputar`}
              size="small"
              sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.72rem' }}
            />
          </Card>
        </Grid>

        {/* Card 4: Jugadores */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            elevation={0}
            onClick={() => navigate(rol === 'aficionado' || rol === 'arbitro' ? '/posiciones' : '/jugadores')}
            sx={{
              p: 2.2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 24px -8px rgba(139, 92, 246, 0.2)',
                borderColor: '#8B5CF6',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                Futbolistas
              </Typography>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '12px',
                  bgcolor: '#F5F3FF',
                  color: '#7C3AED',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <PersonRoundedIcon />
              </Box>
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', mb: 0.5 }}>
              {metricas.totalJugadores}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 500 }}>
              Carné institucional activo
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* 3. ACCESOS RÁPIDOS SEGÚN EL ROL */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3.5,
          borderRadius: 3,
          bgcolor: '#FFFFFF',
          border: '1px solid #E2E8F0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <FlashOnRoundedIcon sx={{ color: '#F59E0B', fontSize: 22 }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1E293B' }}>
            Accesos Rápidos para {rolInfo.titulo}
          </Typography>
        </Box>

        <Grid container spacing={1.5}>
          {rol === 'admin' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SportsSoccerRoundedIcon sx={{ color: '#1B5E20' }} />}
                  onClick={() => navigate('/partidos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0FDF4', borderColor: '#10B981', color: '#065F46' },
                  }}
                >
                  Programar Partido
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmojiEventsRoundedIcon sx={{ color: '#F59E0B' }} />}
                  onClick={() => navigate('/torneos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFFBEB', borderColor: '#F59E0B', color: '#92400E' },
                  }}
                >
                  Gestionar Torneos
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CampaignRoundedIcon sx={{ color: '#0284C7' }} />}
                  onClick={() => navigate('/convocatorias')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0284C7', color: '#0369A1' },
                  }}
                >
                  Nueva Convocatoria
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleAltRoundedIcon sx={{ color: '#7C3AED' }} />}
                  onClick={() => navigate('/usuarios')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F5F3FF', borderColor: '#7C3AED', color: '#5B21B6' },
                  }}
                >
                  Usuarios y Roles
                </Button>
              </Grid>
            </>
          )}

          {rol === 'delegado' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<GroupsRoundedIcon sx={{ color: '#0284C7' }} />}
                  onClick={() => navigate('/equipos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0284C7', color: '#0369A1' },
                  }}
                >
                  Mi Equipo y Roster
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HowToRegRoundedIcon sx={{ color: '#1B5E20' }} />}
                  onClick={() => navigate('/jugadores')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0FDF4', borderColor: '#10B981', color: '#065F46' },
                  }}
                >
                  Inscribir Jugadores
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmojiEventsRoundedIcon sx={{ color: '#F59E0B' }} />}
                  onClick={() => navigate('/torneos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFFBEB', borderColor: '#F59E0B', color: '#92400E' },
                  }}
                >
                  Inscribir en Torneo
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarMonthRoundedIcon sx={{ color: '#D97706' }} />}
                  onClick={() => navigate('/partidos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFFBEB', borderColor: '#D97706', color: '#92400E' },
                  }}
                >
                  Fixture de Partidos
                </Button>
              </Grid>
            </>
          )}

          {rol === 'arbitro' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SportsSoccerRoundedIcon sx={{ color: '#D97706' }} />}
                  onClick={() => navigate('/partidos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFFBEB', borderColor: '#D97706', color: '#92400E' },
                  }}
                >
                  Registrar Resultados
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LeaderboardRoundedIcon sx={{ color: '#1B5E20' }} />}
                  onClick={() => navigate('/posiciones')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0FDF4', borderColor: '#10B981', color: '#065F46' },
                  }}
                >
                  Tabla y Tarjetas
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CampaignRoundedIcon sx={{ color: '#0284C7' }} />}
                  onClick={() => navigate('/convocatorias')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0284C7', color: '#0369A1' },
                  }}
                >
                  Bases de Convocatorias
                </Button>
              </Grid>
            </>
          )}

          {rol === 'aficionado' && (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<CalendarMonthRoundedIcon sx={{ color: '#1B5E20' }} />}
                  onClick={() => navigate('/partidos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0FDF4', borderColor: '#10B981', color: '#065F46' },
                  }}
                >
                  Calendario de Partidos
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<LeaderboardRoundedIcon sx={{ color: '#F59E0B' }} />}
                  onClick={() => navigate('/posiciones')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#FFFBEB', borderColor: '#F59E0B', color: '#92400E' },
                  }}
                >
                  Tabla y Goleadores
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FeedRoundedIcon sx={{ color: '#0284C7' }} />}
                  onClick={() => navigate('/publicaciones')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F0F9FF', borderColor: '#0284C7', color: '#0369A1' },
                  }}
                >
                  Noticias y Comentarios
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<EmojiEventsRoundedIcon sx={{ color: '#7C3AED' }} />}
                  onClick={() => navigate('/torneos')}
                  sx={{
                    justifyContent: 'flex-start',
                    py: 1.2,
                    borderRadius: 2,
                    borderColor: '#CBD5E1',
                    color: '#1E293B',
                    fontWeight: 600,
                    '&:hover': { bgcolor: '#F5F3FF', borderColor: '#7C3AED', color: '#5B21B6' },
                  }}
                >
                  Torneos Oficiales
                </Button>
              </Grid>
            </>
          )}
        </Grid>
      </Paper>

      {/* 4. CUERPO PRINCIPAL: 2 COLUMNAS */}
      <Grid container spacing={3}>
        {/* COLUMNA IZQUIERDA: LÍDER + FIXTURE */}
        <Grid size={{ xs: 12, lg: 7 }}>
          {/* TARJETA PODIO: LÍDER DEL TORNEO */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#FEF3C7',
                    color: '#D97706',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <EmojiEventsRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                    Líder del Torneo
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {torneoPrincipal ? torneoPrincipal.nombre : 'Torneo ESFE'}
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/posiciones')}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#059669' }}
              >
                Ver tabla
              </Button>
            </Box>

            {lider ? (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 2.5,
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '1px solid #FCD34D',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 52,
                        height: 52,
                        bgcolor: '#1B5E20',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        boxShadow: '0 4px 10px rgba(27,94,32,0.3)',
                      }}
                    >
                      {lider.nombre_equipo?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#92400E' }}>
                          {lider.nombre_equipo}
                        </Typography>
                        <Chip
                          label="1° Lugar"
                          size="small"
                          sx={{ bgcolor: '#F59E0B', color: '#FFFFFF', fontWeight: 800, fontSize: '0.7rem' }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ color: '#78350F', fontWeight: 600 }}>
                        {lider.puntos} puntos en la tabla
                      </Typography>
                    </Box>
                  </Box>

                  {/* Estadísticas rápidas del líder */}
                  <Stack direction="row" spacing={1.5}>
                    <Box sx={{ textAlign: 'center', px: 1.5, py: 0.8, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#78350F', fontWeight: 700 }}>PJ</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>{lider.partidos_jugados}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', px: 1.5, py: 0.8, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#78350F', fontWeight: 700 }}>GF</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>{lider.goles_favor}</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center', px: 1.5, py: 0.8, bgcolor: 'rgba(255,255,255,0.7)', borderRadius: 2 }}>
                      <Typography variant="caption" sx={{ color: '#78350F', fontWeight: 700 }}>DIF</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>{lider.diferencia_goles > 0 ? `+${lider.diferencia_goles}` : lider.diferencia_goles}</Typography>
                    </Box>
                  </Stack>
                </Box>
              </Box>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  borderRadius: 2.5,
                  border: '1px dashed #CBD5E1',
                }}
              >
                <SportsSoccerRoundedIcon sx={{ fontSize: 40, color: '#94A3B8', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                  Aún no hay resultados de partidos finalizados.
                </Typography>
                <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                  La tabla de clasificación se generará automáticamente con el primer partido concluido.
                </Typography>
              </Box>
            )}
          </Paper>

          {/* TARJETA PRÓXIMOS ENCUENTROS */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#ECFDF5',
                    color: '#059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CalendarMonthRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                    Próximos Encuentros
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Calendario oficial de juegos
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/partidos')}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#059669' }}
              >
                Ver fixture
              </Button>
            </Box>

            {proximosPartidos.length === 0 ? (
              <Box
                sx={{
                  p: 4,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  borderRadius: 2.5,
                  border: '1px dashed #CBD5E1',
                }}
              >
                <StadiumRoundedIcon sx={{ fontSize: 44, color: '#94A3B8', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                  No hay partidos programados próximamente.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {proximosPartidos.map((partido) => (
                  <Box
                    key={partido._id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#FFFFFF',
                        borderColor: '#10B981',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.08)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.2 }}>
                      <Chip
                        icon={<AccessTimeRoundedIcon sx={{ fontSize: 14 }} />}
                        label={`${partido.fecha?.slice(0, 10)} · ${partido.hora}`}
                        size="small"
                        sx={{ bgcolor: '#ECFDF5', color: '#065F46', fontWeight: 700, fontSize: '0.72rem' }}
                      />
                      <Chip
                        icon={<StadiumRoundedIcon sx={{ fontSize: 14 }} />}
                        label={partido.cancha || 'Cancha Principal ESFE'}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: '#CBD5E1', color: '#64748B', fontSize: '0.72rem' }}
                      />
                    </Box>

                    {/* Enfrentamiento visual */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1 }}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#1B5E20', fontSize: '0.8rem', fontWeight: 700 }}>
                          {partido.nombreLocal?.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                          {partido.nombreLocal}
                        </Typography>
                      </Box>

                      <Chip
                        label="VS"
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          bgcolor: '#E2E8F0',
                          color: '#475569',
                          mx: 1,
                        }}
                      />

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, flex: 1, justifyContent: 'flex-end' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1E293B', textAlign: 'right' }}>
                          {partido.nombreVisitante}
                        </Typography>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: '#0284C7', fontSize: '0.8rem', fontWeight: 700 }}>
                          {partido.nombreVisitante?.charAt(0)}
                        </Avatar>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>
        </Grid>

        {/* COLUMNA DERECHA: CONVOCATORIAS + RESUMEN ROL */}
        <Grid size={{ xs: 12, lg: 5 }}>
          {/* CONVOCATORIAS OFICIALES */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: '#EFF6FF',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CampaignRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>
                    Convocatorias
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    Inscripciones y bases
                  </Typography>
                </Box>
              </Box>

              <Button
                size="small"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/convocatorias')}
                sx={{ textTransform: 'none', fontWeight: 700, color: '#2563EB' }}
              >
                Ver todas
              </Button>
            </Box>

            {convocatorias.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                  bgcolor: '#F8FAFC',
                  borderRadius: 2.5,
                  border: '1px dashed #CBD5E1',
                }}
              >
                <CampaignRoundedIcon sx={{ fontSize: 36, color: '#94A3B8', mb: 1 }} />
                <Typography variant="body2" sx={{ color: '#64748B', fontWeight: 600 }}>
                  No hay convocatorias activas en este momento.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {convocatorias.map((conv) => (
                  <Box
                    key={conv._id}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1E293B', mb: 0.5 }}>
                      {conv.titulo}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#64748B',
                        fontSize: '0.85rem',
                        mb: 1.2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {conv.descripcion}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        label={`Límite: ${conv.fecha_limite?.slice(0, 10)}`}
                        size="small"
                        sx={{ bgcolor: '#FEF3C7', color: '#92400E', fontWeight: 700, fontSize: '0.72rem' }}
                      />
                      <Chip
                        label={conv.estado === 'activa' ? 'Vigente' : 'Cerrada'}
                        size="small"
                        sx={{
                          bgcolor: conv.estado === 'activa' ? '#D1FAE5' : '#F1F5F9',
                          color: conv.estado === 'activa' ? '#065F46' : '#64748B',
                          fontWeight: 700,
                          fontSize: '0.72rem',
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Stack>
            )}
          </Paper>

          {/* INFORMACIÓN Y ROLES EN EL SISTEMA */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', mb: 1 }}>
              Guía de tu Perfil Deportivo
            </Typography>
            <Typography variant="body2" sx={{ color: '#475569', mb: 2, lineHeight: 1.6 }}>
              {rol === 'admin' && (
                'Como Administrador General, dispones de permisos completos para organizar torneos, autorizar plantillas de delegados, programar partidos, asignar colegiados y gestionar las cuentas de usuario.'
              )}
              {rol === 'delegado' && (
                'Como Delegado de Carrera, tu función principal es registrar y mantener actualizada la nómina de futbolistas de tu equipo con sus dorsales y carnés, e inscribir a tu equipo en los torneos habilitados.'
              )}
              {rol === 'arbitro' && (
                'Como Árbitro Oficial, tienes la responsabilidad de certificar los marcadores oficiales, registrar los anotadores y asentar las tarjetas amarillas y rojas al culminar cada encuentro.'
              )}
              {rol === 'aficionado' && (
                'Como Miembro de la Comunidad ESFE, puedes consultar la tabla general de posiciones, la tabla de goleadores, el fixture semanal y participar activamente comentando las publicaciones deportivas.'
              )}
            </Typography>

            <Divider sx={{ my: 1.5 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Sistema Deportivo ESFE • Versión 2.0
              </Typography>
              <Chip
                label="En línea"
                size="small"
                sx={{
                  bgcolor: '#D1FAE5',
                  color: '#065F46',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                  height: 22,
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}