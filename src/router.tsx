import { createBrowserRouter, Navigate } from 'react-router-dom';
import { DemoPage } from '@/features/demo/pages/DemoPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/demo" replace />,
  },
  {
    path: '/demo',
    element: <DemoPage />,
  },
]);
