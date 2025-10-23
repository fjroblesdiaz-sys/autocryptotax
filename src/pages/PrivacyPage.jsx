import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const LegalContent = ({ title, children }) => (
  <div className="pt-32 pb-20 px-6">
    <Helmet>
      <title>{title} - CryptoTax Pro</title>
    </Helmet>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto max-w-4xl"
    >
      <div className="crypto-card p-8 md:p-12 rounded-3xl">
        <h1 className="text-4xl font-bold mb-8 flex items-center text-gradient">
          <Shield className="w-8 h-8 mr-4" />
          {title}
        </h1>
        <div className="prose prose-invert max-w-none text-gray-300">
          {children}
        </div>
      </div>
    </motion.div>
  </div>
);

const PrivacyPage = () => {
  return (
    <LegalContent title="Política de Privacidad">
      <p className="text-lg mb-4">Última actualización: 22 de septiembre de 2025</p>
      <p>CryptoTax Pro ("nosotros", "nuestro") se compromete a proteger tu privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos tu información cuando visitas nuestro sitio web.</p>
      
      <h2 className="text-2xl font-bold mt-6 mb-3">1. Información que Recopilamos</h2>
      <p>Podemos recopilar información sobre ti de varias maneras. La información que podemos recopilar en el Sitio incluye:</p>
      <ul>
        <li><strong>Datos de la API:</strong> Recopilamos el historial de transacciones de tu cuenta de Binance a través de una conexión API de solo lectura para proporcionar nuestros servicios. No almacenamos tus claves API.</li>
        <li><strong>Datos de Uso:</strong> Recopilamos información que tu navegador envía cada vez que visitas nuestro Servicio ("Datos de Uso").</li>
        <li><strong>Datos de Suscripción:</strong> Si te suscribes a nuestra lista de correo, recopilamos tu dirección de correo electrónico.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-3">2. Uso de tu Información</h2>
      <p>Tener información precisa sobre ti nos permite ofrecerte una experiencia fluida, eficiente y personalizada. Específicamente, podemos usar la información recopilada sobre ti a través del Sitio para:</p>
      <ul>
        <li>Generar informes fiscales de criptomonedas.</li>
        <li>Mejorar y personalizar el servicio.</li>
        <li>Enviar correos electrónicos sobre tu cuenta o el servicio.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-3">3. Seguridad de tu Información</h2>
      <p>Utilizamos medidas de seguridad administrativas, técnicas y físicas para ayudar a proteger tu información personal. Si bien hemos tomado medidas razonables para asegurar la información personal que nos proporcionas, ten en cuenta que a pesar de nuestros esfuerzos, ninguna medida de seguridad es perfecta o impenetrable.</p>
      
      <p className="mt-8">**Nota Importante:** Este es un documento de ejemplo. Para que sea legalmente válido, debes reemplazar "CryptoTax Pro" con el nombre legal de tu empresa (o tu nombre completo si eres autónomo), incluir tu DNI/CIF, dirección fiscal y demás datos requeridos por la legislación vigente. Te recomendamos encarecidamente consultar a un profesional legal para redactar tu política de privacidad completa y adaptada a tu situación.</p>
    </LegalContent>
  );
};

export default PrivacyPage;