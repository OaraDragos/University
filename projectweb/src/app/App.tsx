import * as React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from './context/AuthContext';
import { GroupProvider } from './context/GroupContext';
import '../styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <GroupProvider>
        <RouterProvider router={router} />
      </GroupProvider>
    </AuthProvider>
  );
}
