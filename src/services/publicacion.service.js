import api from './api';

export const listarPublicaciones = async () => {
  const { data } = await api.get('/publicaciones');
  return data;
};

export const crearPublicacion = async (publicacion) => {
  const { data } = await api.post('/publicaciones', publicacion);
  return data;
};

export const actualizarPublicacion = async (id, publicacion) => {
  const { data } = await api.put(`/publicaciones/${id}`, publicacion);
  return data;
};

export const eliminarPublicacion = async (id) => {
  const { data } = await api.delete(`/publicaciones/${id}`);
  return data;
};
export const agregarComentario = async (publicacionId, mensaje) => {
  const { data } = await api.post(`/publicaciones/${publicacionId}/comentarios`, { mensaje });
  return data;
};

export const eliminarComentario = async (publicacionId, comentarioId) => {
  const { data } = await api.delete(`/publicaciones/${publicacionId}/comentarios/${comentarioId}`);
  return data;
};
export const editarComentario = async (publicacionId, comentarioId, mensaje) => {
  const { data } = await api.put(`/publicaciones/${publicacionId}/comentarios/${comentarioId}`, { mensaje });
  return data;
};