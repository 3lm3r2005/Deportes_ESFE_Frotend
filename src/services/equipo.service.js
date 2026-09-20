import api from './api';

export const listarEquipos = async () => {
  const { data } = await api.get('/equipos');
  return data;
};

export const crearEquipo = async (equipo) => {
  const { data } = await api.post('/equipos', equipo);
  return data;
};

export const actualizarEquipo = async (id, equipo) => {
  const { data } = await api.put(`/equipos/${id}`, equipo);
  return data;
};

export const eliminarEquipo = async (id) => {
  const { data } = await api.delete(`/equipos/${id}`);
  return data;
};