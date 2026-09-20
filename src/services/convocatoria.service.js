import api from './api';

export const listarConvocatorias = async () => {
  const { data } = await api.get('/convocatorias');
  return data;
};

export const crearConvocatoria = async (convocatoria) => {
  const { data } = await api.post('/convocatorias', convocatoria);
  return data;
};

export const actualizarConvocatoria = async (id, convocatoria) => {
  const { data } = await api.put(`/convocatorias/${id}`, convocatoria);
  return data;
};

export const eliminarConvocatoria = async (id) => {
  const { data } = await api.delete(`/convocatorias/${id}`);
  return data;
};