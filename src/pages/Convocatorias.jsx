import { useEffect, useState } from 'react';
import { Box, Button, Typography, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import ConvocatoriaTable from '../components/convocatorias/ConvocatoriaTable';
import ConvocatoriaDialog from '../components/convocatorias/ConvocatoriaDialog';
import Loading from '../components/Loading';
import {
  listarConvocatorias, crearConvocatoria, actualizarConvocatoria, eliminarConvocatoria
} from '../services/convocatoria.service';
import { listarTorneos } from '../services/torneo.service';
import { getUsuarioActual } from '../services/auth.service';

export default function Convocatorias() {
  const usuario = getUsuarioActual();
  const esAdmin = usuario?.rol === 'admin';

  const [convocatorias, setConvocatorias] = useState([]);
  const [torneos, setTorneos] = useState([]);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [convocatoriaEditando, setConvocatoriaEditando] = useState(null);
  const [cargando, setCargando] = useState(true);

  const cargarTodo = async () => {
    const [c, t] = await Promise.all([listarConvocatorias(), listarTorneos()]);
    setConvocatorias(Array.isArray(c) ? c : []);
    setTorneos(Array.isArray(t) ? t : []);
  };

  useEffect(() => {
    cargarTodo().finally(() => setCargando(false));
  }, []);

  const handleNuevo = () => {
    setConvocatoriaEditando(null);
    setDialogAbierto(true);
  };

  const handleEditar = (convocatoria) => {
    setConvocatoriaEditando(convocatoria);
    setDialogAbierto(true);
  };

  const handleGuardar = async (datos) => {
    if (convocatoriaEditando) {
      await actualizarConvocatoria(convocatoriaEditando._id, datos);
    } else {
      await crearConvocatoria(datos);
    }
    setDialogAbierto(false);
    cargarTodo();
  };

  const handleEliminar = async (convocatoria) => {
    if (confirm(`¿Eliminar la convocatoria "${convocatoria.titulo}"?`)) {
      await eliminarConvocatoria(convocatoria._id);
      cargarTodo();
    }
  };

  if (cargando) return <Loading />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', pb: 4 }}>
      {/* HEADER DE CONVOCATORIAS */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, flexWrap: 'wrap', gap: 2, mb: 3.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: { xs: 42, sm: 48 },
              height: { xs: 42, sm: 48 },
              borderRadius: '12px',
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)',
              flexShrink: 0,
            }}
          >
            <CampaignRoundedIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.5px', fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.125rem' } }}>
              Convocatorias y Bases Oficiales
            </Typography>
            <Typography variant="body2" sx={{ color: '#64748B', fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
              Avisos y requisitos de participación para los torneos intercarreras y eventos deportivos.
            </Typography>
          </Box>
        </Box>

        {esAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleNuevo}
            sx={{
              bgcolor: '#1B5E20',
              fontWeight: 700,
              px: 2.5,
              py: 1,
              borderRadius: 2,
              boxShadow: '0 4px 12px rgba(27, 94, 32, 0.25)',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { bgcolor: '#14532D' },
            }}
          >
            Nueva Convocatoria
          </Button>
        )}
      </Box>

      {/* TABLA DE CONVOCATORIAS */}
      <ConvocatoriaTable
        convocatorias={convocatorias}
        torneos={torneos}
        onEditar={handleEditar}
        onEliminar={handleEliminar}
        puedeEditar={esAdmin}
        puedeEliminar={esAdmin}
      />

      {esAdmin && (
        <ConvocatoriaDialog
          open={dialogAbierto}
          onClose={() => setDialogAbierto(false)}
          onGuardar={handleGuardar}
          convocatoria={convocatoriaEditando}
          torneos={torneos}
        />
      )}
    </Box>
  );
}