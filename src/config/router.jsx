import { createHashRouter } from 'react-router-dom';
import Login from '../pages/Login';
import Inicio from '../pages/Inicio';
import MainLayout from '../components/MainLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import Torneos from '../pages/Torneos';
import Equipos from '../pages/Equipos';
import Jugadores from '../pages/Jugadores';
import Usuarios from '../pages/Usuarios';
import Registro from '../pages/Registro';
import Partidos from '../pages/Partidos';
import Posiciones from '../pages/Posiciones';
import Convocatorias from '../pages/Convocatorias';
import Publicaciones from '../pages/Publicaciones';
import Perfil from '../pages/Perfil';

export const router = createHashRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/registro',
    element: <Registro />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: 'inicio',
        element: <Inicio />,
      },
      {
        path: 'torneos',
        element: <Torneos />,
      },
      {
        path: 'equipos',
        element: (
          <ProtectedRoute rolesPermitidos={['admin', 'delegado']}>
            <Equipos />
          </ProtectedRoute>
        ),
      },
      {
        path: 'jugadores',
        element: (
          <ProtectedRoute rolesPermitidos={['admin', 'delegado']}>
            <Jugadores />
          </ProtectedRoute>
        ),
      },
      {
        path: 'usuarios',
        element: (
          <ProtectedRoute rolesPermitidos={['admin']}>
            <Usuarios />
          </ProtectedRoute>
        ),
      },
      {
        path: 'partidos',
        element: <Partidos />,
      },
      {
        path: 'convocatorias',
        element: <Convocatorias />,
      },
      {
        path: 'posiciones',
        element: <Posiciones />,
      },
      {
        path: 'publicaciones',
        element: <Publicaciones />,
      },
      {
        path: 'perfil',
        element: <Perfil />,
      },
    ],
  },
]);