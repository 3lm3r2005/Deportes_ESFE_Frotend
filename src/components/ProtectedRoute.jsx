import { Navigate } from 'react-router-dom';
import { estaAutenticado, getUsuarioActual } from '../services/auth.service';

export default function ProtectedRoute({ children, rolesPermitidos }) {
  if (!estaAutenticado()) {
    return <Navigate to="/login" replace />;
  }

  if (rolesPermitidos) {
    const usuario = getUsuarioActual();
    if (!rolesPermitidos.includes(usuario.rol)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}