import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText,
  Box, Button, Avatar, Menu, MenuItem, ListItemIcon, Chip
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SportsSoccerRoundedIcon from '@mui/icons-material/SportsSoccerRounded';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import CampaignRoundedIcon from '@mui/icons-material/CampaignRounded';
import FeedRoundedIcon from '@mui/icons-material/FeedRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import SportsScoreRoundedIcon from '@mui/icons-material/SportsScoreRounded';
import { menuItems } from '../config/menuItems';
import { getUsuarioActual, logout } from '../services/auth.service';

const drawerWidth = 240;

const renderIcono = (path, activo) => {
  const iconProps = {
    sx: {
      color: activo ? '#065F46' : '#64748B',
      transition: 'all 0.2s',
      fontSize: 22,
    },
  };

  switch (path) {
    case '/inicio': return <HomeRoundedIcon {...iconProps} />;
    case '/torneos': return <EmojiEventsRoundedIcon {...iconProps} />;
    case '/equipos': return <GroupsRoundedIcon {...iconProps} />;
    case '/jugadores': return <SportsSoccerRoundedIcon {...iconProps} />;
    case '/partidos': return <EventNoteRoundedIcon {...iconProps} />;
    case '/posiciones': return <LeaderboardRoundedIcon {...iconProps} />;
    case '/convocatorias': return <CampaignRoundedIcon {...iconProps} />;
    case '/publicaciones': return <FeedRoundedIcon {...iconProps} />;
    case '/usuarios': return <PeopleAltRoundedIcon {...iconProps} />;
    default: return <SportsScoreRoundedIcon {...iconProps} />;
  }
};

const ROL_CONFIG = {
  admin: { label: 'Admin', color: '#92400E', bg: '#FEF3C7' },
  delegado: { label: 'Delegado', color: '#0369A1', bg: '#E0F2FE' },
  arbitro: { label: 'Árbitro', color: '#C2410C', bg: '#FFEDD5' },
  aficionado: { label: 'Aficionado', color: '#065F46', bg: '#D1FAE5' },
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = getUsuarioActual();
  const [anchorEl, setAnchorEl] = useState(null);

  const itemsVisibles = menuItems.filter((item) => item.roles.includes(usuario?.rol));
  const rolInfo = ROL_CONFIG[usuario?.rol] || { label: usuario?.rol, color: '#334155', bg: '#F1F5F9' };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAbrirMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCerrarMenu = () => setAnchorEl(null);
  const handleIrAPerfil = () => {
    handleCerrarMenu();
    navigate('/perfil');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          background: 'linear-gradient(90deg, #1B5E20 0%, #2E7D32 60%, #15803D 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.25)',
              }}
            >
              <SportsSoccerRoundedIcon sx={{ color: '#FFFFFF', fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: '0.4px', lineHeight: 1.2 }}>
                Deportes ESFE
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.72rem', letterSpacing: '0.5px' }}>
                Torneos y Convivencia Deportiva
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Chip
              label={rolInfo.label}
              size="small"
              sx={{
                bgcolor: rolInfo.bg,
                color: rolInfo.color,
                fontWeight: 700,
                fontSize: '0.75rem',
                border: '1px solid rgba(0,0,0,0.06)',
                display: { xs: 'none', sm: 'inline-flex' },
              }}
            />

            <Button
              color="inherit"
              onClick={handleAbrirMenu}
              sx={{
                textTransform: 'none',
                borderRadius: '8px',
                px: 1.5,
                py: 0.5,
                bgcolor: 'rgba(255,255,255,0.08)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
              }}
            >
              <Avatar
                src={usuario?.foto_url}
                sx={{
                  width: 32,
                  height: 32,
                  mr: 1,
                  bgcolor: '#388E3C',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                {usuario?.nombre?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={{ fontWeight: 600, display: { xs: 'none', md: 'inline' } }}>
                {usuario?.nombre}
              </Typography>
            </Button>

            <Menu
              anchorEl={anchorEl}
              open={!!anchorEl}
              onClose={handleCerrarMenu}
              PaperProps={{
                elevation: 4,
                sx: { borderRadius: '12px', minWidth: 170, mt: 1 },
              }}
            >
              <MenuItem onClick={handleIrAPerfil} sx={{ py: 1.2 }}>
                <ListItemIcon><AccountCircleIcon fontSize="small" sx={{ color: '#1B5E20' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Mi perfil</Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: '#DC2626' }}>
                <ListItemIcon><LogoutRoundedIcon fontSize="small" sx={{ color: '#DC2626' }} /></ListItemIcon>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>Cerrar sesión</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#FAFAFA',
            borderRight: '1px solid #E2E8F0',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ px: 2, pt: 2, pb: 1 }}>
          <Typography variant="caption" sx={{ color: '#94A3B8', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Navegación
          </Typography>
        </Box>
        <List sx={{ px: 1.2, py: 0.5 }}>
          {itemsVisibles.map((item) => {
            const estaActivo = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={estaActivo}
                sx={{
                  my: 0.4,
                  px: 1.8,
                  py: 1,
                  borderRadius: '10px',
                  transition: 'all 0.2s ease-in-out',
                  color: estaActivo ? '#065F46' : '#475569',
                  backgroundColor: estaActivo ? '#D1FAE5' : 'transparent',
                  borderLeft: estaActivo ? '4px solid #10B981' : '4px solid transparent',
                  '&:hover': {
                    backgroundColor: estaActivo ? '#A7F3D0' : '#E8F5E9',
                    color: '#065F46',
                    transform: 'translateX(4px)',
                    '& .MuiListItemIcon-root svg': {
                      color: '#065F46',
                    },
                    '& .MuiListItemText-primary': {
                      color: '#065F46',
                      fontWeight: 700,
                    },
                  },
                  '&.Mui-selected': {
                    backgroundColor: '#D1FAE5',
                    '&:hover': {
                      backgroundColor: '#A7F3D0',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 38 }}>
                  {renderIcono(item.path, estaActivo)}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.93rem',
                    fontWeight: estaActivo ? 700 : 500,
                    letterSpacing: '0.2px',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}