import { Navigate } from 'react-router-dom';
import { estaAutenticado, getUsuarioActual } from '../services/auth.service';

export default function ProtectedRoute({ children, rolesPermitidos }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos) {
    const usuario = getUsuarioActual();
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
      return <Navigate to="/inicio" replace />;
    }
  }

  return children;
}