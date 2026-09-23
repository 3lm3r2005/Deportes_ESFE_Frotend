import { useState } from 'react';
import { Box, Button, Avatar, CircularProgress, Typography } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { subirImagen } from '../services/cloudinary.service';

export default function ImageUpload({ valor, onCambiar, label = 'Subir imagen', variante = 'avatar' }) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState('');

  const handleSeleccion = async (e) => {
    const archivo = e.target.files[0];
    if (!archivo) return;

    setError('');

    // Validar tipo de archivo
    if (!archivo.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen (JPG, PNG, WEBP)');
      e.target.value = '';
      return;
    }

    // Validar tamaño máximo (5 MB)
    const MAX_MB = 5;
    if (archivo.size > MAX_MB * 1024 * 1024) {
      setError(`La imagen no debe superar los ${MAX_MB} MB de peso`);
      e.target.value = '';
      return;
    }

    setSubiendo(true);
    try {
      const url = await subirImagen(archivo);
      onCambiar(url);
    } catch {
      setError('No se pudo subir la imagen, intenta de nuevo');
    } finally {
      setSubiendo(false);
      e.target.value = '';
    }
  };

  return (
    <Box sx={{ my: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {variante === 'avatar' && (
          <Avatar src={valor} sx={{ width: 64, height: 64 }} />
        )}
        {variante === 'banner' && valor && (
          <Box
            component="img"
            src={valor}
            sx={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 1 }}
          />
        )}

        <Button
          component="label"
          variant="outlined"
          startIcon={subiendo ? <CircularProgress size={16} /> : <CloudUploadIcon />}
          disabled={subiendo}
        >
          {subiendo ? 'Subiendo...' : label}
          <input type="file" accept="image/*" hidden onChange={handleSeleccion} />
        </Button>
      </Box>
      {error && <Typography color="error" variant="caption">{error}</Typography>}
    </Box>
  );
}