import api from './api';

export const listarJugadores = async () => {
  const { data } = await api.get('/jugadores');
  return data;
};
export const listarJugadoresPaginado = async (pagina, limite) => {
  const { data } = await api.get(`/jugadores?page=${pagina}&limit=${limite}`);
  return data;
};

export const crearJugador = async (jugador) => {
  const { data } = await api.post('/jugadores', jugador);
  return data;
};

export const actualizarJugador = async (id, jugador) => {
  const { data } = await api.put(`/jugadores/${id}`, jugador);
  return data;
};

export const eliminarJugador = async (id) => {
  const { data } = await api.delete(`/jugadores/${id}`);
  return data;
};