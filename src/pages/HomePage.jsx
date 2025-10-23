import React from 'react';
import { Helmet } from 'react-helmet';
import Hero from '@/components/Hero';
import Roadmap from '@/components/Roadmap';
import Faq from '@/components/Faq';
import Cta from '@/components/Cta';

const HomePage = ({ onLogin }) => {
  return (
    <>
      <Helmet>
        <title>CryptoTax Pro - Simplifica tus Impuestos de Criptomonedas</title>
        <meta name="description" content="Calcula y declara tus impuestos de criptomonedas de forma fácil y segura. Conecta tu exchange, genera informes fiscales y mantente al día con la normativa." />
      </Helmet>
      <div className="pt-20">
        <Hero onLogin={onLogin} />
        <Cta onLogin={onLogin} /> {/* Moved CTA here */}
        <Roadmap />
        <Faq />
      </div>
    </>
  );
};

export default HomePage;