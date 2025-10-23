import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Cookie } from 'lucide-react';

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
          <Cookie className="w-8 h-8 mr-4" />
          {title}
        </h1>
        <div className="prose prose-invert max-w-none text-gray-300">
          {children}
        </div>
      </div>
    </motion.div>
  </div>
);

const CookiesPage = () => {
  return (
    <LegalContent title="Política de Cookies">
      <p className="text-lg mb-4">Última actualización: 22 de septiembre de 2025</p>
      <p>Este sitio web utiliza cookies para mejorar la experiencia del usuario. Esta política explica qué son las cookies, cómo las usamos y cómo puedes gestionarlas.</p>
      
      <h2 className="text-2xl font-bold mt-6 mb-3">1. ¿Qué son las cookies?</h2>
      <p>Las cookies son pequeños archivos de texto que se almacenan en tu ordenador o dispositivo móvil cuando visitas un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen, o funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.</p>

      <h2 className="text-2xl font-bold mt-6 mb-3">2. ¿Cómo usamos las cookies?</h2>
      <p>Utilizamos cookies para los siguientes propósitos:</p>
      <ul>
        <li><strong>Cookies Esenciales:</strong> Estas cookies son necesarias para que el sitio web funcione y no se pueden desactivar en nuestros sistemas. Se suelen establecer solo en respuesta a acciones realizadas por ti que equivalen a una solicitud de servicios, como iniciar sesión o rellenar formularios.</li>
        <li><strong>Cookies de Rendimiento:</strong> Estas cookies nos permiten contar las visitas y las fuentes de tráfico para que podamos medir y mejorar el rendimiento de nuestro sitio.</li>
        <li><strong>Cookies de Funcionalidad:</strong> Estas cookies permiten que el sitio web proporcione una funcionalidad y personalización mejoradas.</li>
      </ul>

      <h2 className="text-2xl font-bold mt-6 mb-3">3. Gestión de Cookies</h2>
      <p>Puedes controlar y/o eliminar las cookies como desees. Para más detalles, consulta aboutcookies.org. Puedes eliminar todas las cookies que ya están en tu ordenador y puedes configurar la mayoría de los navegadores para evitar que se coloquen.</p>
      
      <p className="mt-8">**Nota Importante:** Este es un documento de ejemplo. Para que sea legalmente válido, debes reemplazar "CryptoTax Pro" con el nombre legal de tu empresa (o tu nombre completo si eres autónomo), incluir tu DNI/CIF, dirección fiscal y demás datos requeridos por la legislación vigente. Te recomendamos encarecidamente consultar a un profesional legal para redactar tu política de cookies completa y adaptada a tu situación.</p>
    </LegalContent>
  );
};

export default CookiesPage;