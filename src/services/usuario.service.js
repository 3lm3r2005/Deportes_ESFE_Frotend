import api from './api';

export const listarUsuarios = async () => {
  const { data } = await api.get('/usuarios');
  return data;
};

export const listarUsuariosPaginado = async (pagina, limite) => {
  const { data } = await api.get(`/usuarios?page=${pagina}&limit=${limite}`);
  return data;
};

export const crearUsuario = async (usuario) => {
  const { data } = await api.post('/usuarios', usuario);
  return data;
};

export const actualizarUsuario = async (id, usuario) => {
  const { data } = await api.put(`/usuarios/${id}`, usuario);
  return data;
};

export const eliminarUsuario = async (id) => {
  const { data } = await api.delete(`/usuarios/${id}`);
  return data;
};
export const actualizarMiPerfil = async (datos) => {
  const { data } = await api.put('/usuarios/mi-perfil', datos);
  return data;
};