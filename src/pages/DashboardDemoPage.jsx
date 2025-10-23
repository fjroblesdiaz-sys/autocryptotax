import React from 'react';
import { Helmet } from 'react-helmet-async';
import Dashboard from '@/components/Dashboard';

const DashboardDemoPage = ({ onLogin }) => {
  const demoUser = {
    email: 'visitante@cryptotax.pro',
    user_metadata: {
      full_name: 'Visitante',
    },
  };

  return (
    <>
      <Helmet>
        <title>Demo del Dashboard - CryptoTax Pro</title>
        <meta name="description" content="Explora el dashboard de CryptoTax Pro en modo demostración. Descubre cómo simplificamos la declaración de impuestos de tus criptomonedas." />
      </Helmet>
      <Dashboard user={demoUser} isDemo={true} onLogin={onLogin} />
    </>
  );
};

export default DashboardDemoPage;