import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { publicacionSchema } from '../../schemas/publicacion.schema';
import ImageUpload from '../ImageUpload';

const valoresPorDefecto = { titulo: '', mensaje: '' };

export default function PublicacionDialog({ open, onClose, onGuardar, publicacion }) {
  const [imagenUrl, setImagenUrl] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(publicacionSchema),
    defaultValues: valoresPorDefecto,
  });

  useEffect(() => {
    if (publicacion) {
      reset({ titulo: publicacion.titulo, mensaje: publicacion.mensaje });
      setImagenUrl(publicacion.imagen_url || '');
    } else {
      reset(valoresPorDefecto);
      setImagenUrl('');
    }
  }, [publicacion, open, reset]);

  const handleGuardarInterno = (datos) => {
    onGuardar({ ...datos, imagen_url: imagenUrl });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{publicacion ? 'Editar publicación' : 'Nueva publicación'}</DialogTitle>
      <DialogContent>
        <ImageUpload
          valor={imagenUrl}
          onCambiar={setImagenUrl}
          label="Subir imagen (opcional)"
          variante="banner"
        />
        <TextField
          label="Título" fullWidth margin="normal"
          {...register('titulo')}
          error={!!errors.titulo} helperText={errors.titulo?.message}
        />
        <TextField
          label="Mensaje" fullWidth margin="normal" multiline rows={4}
          {...register('mensaje')}
          error={!!errors.mensaje} helperText={errors.mensaje?.message}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSubmit(handleGuardarInterno)}>Guardar</Button>
      </DialogActions>
    </Dialog>
  );
}