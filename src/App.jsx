import { RouterProvider } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { router } from './config/router';

function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
      <RouterProvider router={router} />
    </LocalizationProvider>
  );
}

export default App;