import api from './api';

export const listarTorneos = async () => {
  const { data } = await api.get('/torneos');
  return data;
};

export const crearTorneo = async (torneo) => {
  const { data } = await api.post('/torneos', torneo);
  return data;
};

export const actualizarTorneo = async (id, torneo) => {
  const { data } = await api.put(`/torneos/${id}`, torneo);
  return data;
};

export const eliminarTorneo = async (id) => {
  const { data } = await api.delete(`/torneos/${id}`);
  return data;
};

export const obtenerTablaPosiciones = async (id) => {
  const { data } = await api.get(`/torneos/${id}/posiciones`);
  return data;
};

export const obtenerTablaGoleadores = async (id) => {
  const { data } = await api.get(`/torneos/${id}/goleadores`);
  return data;
};

export const obtenerTablaTarjetas = async (id) => {
  const { data } = await api.get(`/torneos/${id}/tarjetas`);
  return data;
};
export const inscribirEquipoEnTorneo = async (torneoId, datos) => {
  const { data } = await api.put(`/torneos/${torneoId}/inscribir-equipo`, datos);
  return data;
};