import React from 'react';
import { motion } from 'framer-motion';
import AiAssistant from '@/components/AiAssistant';
import { HelpCircle, Shield, Zap } from 'lucide-react';

const knowledgeBase = [
  {
    keywords: ['seguridad', 'api', 'claves', 'protegido'],
    answer: 'Tu seguridad es nuestra máxima prioridad. Usamos claves de API de solo lectura y cifrado de extremo a extremo para proteger tus datos. Nunca tenemos acceso para mover tus fondos.',
  },
  {
    keywords: ['informe', 'hacienda', 'impuestos', 'declaración'],
    answer: 'Generamos un informe fiscal detallado que calcula tus ganancias y pérdidas de capital siguiendo el método FIFO, listo para que lo presentes en tu declaración a Hacienda.',
  },
  {
    keywords: ['binance', 'conectar', 'exchange'],
    answer: 'Puedes conectar tu cuenta de Binance de forma segura desde el dashboard. Solo necesitas crear una clave de API con permisos de "solo lectura" en tu cuenta de Binance y pegarla en nuestra plataforma.',
  },
  {
    keywords: ['precio', 'coste', 'planes', 'gratis'],
    answer: 'Ofrecemos varios planes, incluyendo una opción gratuita para empezar. Puedes consultar todos los detalles y precios en nuestra página de "Precios".',
  },
  {
    keywords: ['funciona', 'cómo', 'pasos'],
    answer: 'Es muy simple: 1. Conecta tu cuenta de exchange. 2. Analizamos tus transacciones automáticamente. 3. Descargas tu informe fiscal listo para presentar.',
  },
];

const Faq = () => {
  const faqs = [
    {
      q: '¿Es seguro conectar mi cuenta de Binance?',
      a: 'Sí. Utilizamos una conexión segura a través de la API de Binance y solo solicitamos permisos de "solo lectura". Esto significa que podemos ver tus transacciones, pero no podemos realizar operaciones ni mover tus fondos.',
      icon: Shield,
    },
    {
      q: '¿Qué método de cálculo utilizan?',
      a: 'Utilizamos el método FIFO (First-In, First-Out), que es el método estándar y más aceptado por las agencias tributarias para calcular las ganancias y pérdidas de capital en criptomonedas.',
      icon: Zap,
    },
    {
      q: '¿Qué necesito para generar el informe?',
      a: 'Solo necesitas crear una clave API en tu cuenta de Binance y pegarla en nuestro dashboard. Nuestro sistema se encargará del resto, analizando tu historial de transacciones para generar el informe.',
      icon: HelpCircle,
    },
  ];

  return (
    <section id="faq" className="py-20 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Preguntas Frecuentes y Asistente IA
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            ¿Tienes dudas? Encuentra respuestas aquí o pregunta a nuestro asistente inteligente.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="crypto-card p-6 rounded-2xl">
                  <h3 className="text-xl font-semibold mb-3 flex items-center">
                    <faq.icon className="w-6 h-6 mr-3 text-fintech-blue-light" />
                    {faq.q}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="sticky top-24"
          >
            <AiAssistant knowledgeBase={knowledgeBase} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Faq;