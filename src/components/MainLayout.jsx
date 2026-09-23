import { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Drawer, List, ListItemButton, ListItemText,
  Box, Button, Avatar, Menu, MenuItem, ListItemIcon
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { menuItems } from '../config/menuItems';
import { getUsuarioActual, logout } from '../services/auth.service';

const drawerWidth = 220;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = getUsuarioActual();
  const [anchorEl, setAnchorEl] = useState(null);

  const itemsVisibles = menuItems.filter((item) => item.roles.includes(usuario?.rol));

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
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '0.5px' }}>
            Deportes ESFE
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button color="inherit" onClick={handleAbrirMenu} sx={{ textTransform: 'none' }}>
              <Avatar src={usuario?.foto_url} sx={{ width: 32, height: 32, mr: 1 }} />
              {usuario?.nombre} ({usuario?.rol})
            </Button>
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={handleCerrarMenu}>
              <MenuItem onClick={handleIrAPerfil}>
                <ListItemIcon><AccountCircleIcon fontSize="small" /></ListItemIcon>
                Mi perfil
              </MenuItem>
            </Menu>
            <Button color="inherit" onClick={handleLogout}>
              Cerrar sesión
            </Button>
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
            borderRight: '1px solid #E0E0E0',
          },
        }}
      >
        <Toolbar />
        <List sx={{ px: 1.2, py: 1.5 }}>
          {itemsVisibles.map((item) => {
            const estaActivo = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(item.path)}
                selected={estaActivo}
                sx={{
                  my: 0.6,
                  px: 2,
                  py: 1.1,
                  borderRadius: '10px',
                  transition: 'all 0.22s ease-in-out',
                  color: estaActivo ? '#065F46' : '#2C3E50',
                  backgroundColor: estaActivo ? '#D1FAE5' : 'transparent',
                  borderLeft: estaActivo ? '4px solid #10B981' : '4px solid transparent',
                  '&:hover': {
                    backgroundColor: estaActivo ? '#A7F3D0' : '#E8F5E9',
                    color: '#065F46',
                    transform: 'translateX(3px)',
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
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: '0.96rem',
                    fontWeight: estaActivo ? 700 : 600,
                    letterSpacing: '0.3px',
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}