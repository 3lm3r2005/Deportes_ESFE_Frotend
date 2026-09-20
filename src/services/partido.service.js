import api from './api';

export const listarPartidos = async () => {
  const { data } = await api.get('/partidos');
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