import { useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
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
          <Typography variant="h6">Deportes ESFE</Typography>
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
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {itemsVisibles.map((item) => (
            <ListItemButton key={item.path} onClick={() => navigate(item.path)}>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}