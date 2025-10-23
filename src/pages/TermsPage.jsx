import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';

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
          <FileText className="w-8 h-8 mr-4" />
          {title}
        </h1>
        <div className="prose prose-invert max-w-none text-gray-300">
          {children}
        </div>
      </div>
    </motion.div>
  </div>
);

const TermsPage = () => {
  return (
    <LegalContent title="Términos y Condiciones">
      <p className="text-lg mb-4">Última actualización: 22 de septiembre de 2025</p>
      <p>Bienvenido a CryptoTax Pro. Estos términos y condiciones describen las reglas y regulaciones para el uso del sitio web de CryptoTax Pro, ubicado en autocryptotax.com.</p>
      
      <h2 className="text-2xl font-bold mt-6 mb-3">1. Aceptación de los términos</h2>
      <p>Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando CryptoTax Pro si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.</p>

      <h2 className="text-2xl font-bold mt-6 mb-3">2. Descripción del Servicio</h2>
      <p>CryptoTax Pro es una herramienta de software diseñada para ayudar a los usuarios a calcular las ganancias y pérdidas de capital de sus transacciones de criptomonedas para fines informativos y de declaración de impuestos. El servicio se conecta a través de la API de Binance para recuperar el historial de transacciones del usuario.</p>
      <p><strong>Importante:</strong> CryptoTax Pro no proporciona asesoramiento fiscal. La información generada es para fines informativos y debe ser revisada por un profesional de impuestos calificado.</p>

      <h2 className="text-2xl font-bold mt-6 mb-3">3. Cuentas de Usuario</h2>
      <p>Para utilizar nuestro servicio, debes conectar tu cuenta de Binance. Eres responsable de mantener la seguridad de tu conexión y de todas las actividades que ocurran bajo tu cuenta.</p>

      <h2 className="text-2xl font-bold mt-6 mb-3">4. Limitación de Responsabilidad</h2>
      <p>En la máxima medida permitida por la ley aplicable, en ningún caso CryptoTax Pro o sus proveedores serán responsables de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluyendo, entre otros, la pérdida de beneficios, datos, uso, buena voluntad u otras pérdidas intangibles, resultantes de (i) tu acceso o uso o incapacidad para acceder o usar el servicio; (ii) cualquier conducta o contenido de terceros en el servicio.</p>
      
      <p className="mt-8">**Nota Importante:** Este es un documento de ejemplo. Para que sea legalmente válido, debes reemplazar "CryptoTax Pro" con el nombre legal de tu empresa (o tu nombre completo si eres autónomo), incluir tu DNI/CIF, dirección fiscal y demás datos requeridos por la legislación vigente. Te recomendamos encarecidamente consultar a un profesional legal para redactar tus términos y condiciones completos y adaptados a tu situación.</p>
    </LegalContent>
  );
};

export default TermsPage;