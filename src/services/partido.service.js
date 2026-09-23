import api from './api';

export const listarPartidos = async () => {
  const { data } = await api.get('/partidos');
  return data;
};

export const listarPartidosPaginado = async (pagina, limite, estado) => {
  const filtroEstado = estado && estado !== 'todos' ? `&estado=${estado}` : '';
  const { data } = await api.get(`/partidos?page=${pagina}&limit=${limite}${filtroEstado}`);
  return data;
};

export const crearPartido = async (partido) => {
  const { data } = await api.post('/partidos', partido);
  return data;
};

export const actualizarPartido = async (id, partido) => {
  const { data } = await api.put(`/partidos/${id}`, partido);
  return data;
};

export const eliminarPartido = async (id) => {
  const { data } = await api.delete(`/partidos/${id}`);
  return data;
};