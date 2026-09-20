import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  const { token, usuario } = response.data;

  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));

  return usuario;
};

export const registrar = async (datos) => {
  const { data } = await api.post('/auth/registro', datos);
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
};

export const getUsuarioActual = () => {
  const usuario = localStorage.getItem('usuario');
  return usuario ? JSON.parse(usuario) : null;
};

export const estaAutenticado = () => {
  return !!localStorage.getItem('token');
};
export const actualizarUsuarioLocal = (datosNuevos) => {
  const usuarioActual = getUsuarioActual();
  const usuarioActualizado = { ...usuarioActual, ...datosNuevos };
  localStorage.setItem('usuario', JSON.stringify(usuarioActualizado));
  return usuarioActualizado;
};