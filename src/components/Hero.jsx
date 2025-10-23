import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Calculator, FileText, Zap, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = ({ onLogin }) => {
  const navigate = useNavigate();

  const features = [
    { icon: Shield, title: "Conexión Segura", description: "API de solo lectura y OAuth 2.0" },
    { icon: Calculator, title: "Cálculo Automático", description: "Ganancias y pérdidas precisas" },
    { icon: FileText, title: "Informes Fiscales", description: "Listos para Hacienda" },
    { icon: Zap, title: "Proceso Rápido", description: "Resultados en segundos" }
  ];

  const text = "Simplifica tu Declaración Crypto".split(" ");

  return (
    <section className="relative pt-40 pb-24 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Removed the solid bg-slate-950 to allow ParticleBackground to show through */}
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-slate-950 to-transparent"></div>
      </div>
      
      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.08 } },
              hidden: {},
            }}
          >
            {text.map((word, index) => (
              <motion.span 
                key={index} 
                className={`inline-block ${index > 1 ? 'text-gradient' : ''}`}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { type: 'spring', damping: 12, stiffness: 100 } },
                }}
              >
                {word}{'\u00A0'}
              </motion.span>
            ))}
          </motion.h1>
          <motion.p 
            className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Conecta tu cuenta de Binance y genera automáticamente informes fiscales 
            precisos para tu declaración de Hacienda.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24"
        >
          <Button 
            onClick={onLogin}
            size="lg"
            className="bg-fintech-blue hover:bg-fintech-blue-dark text-white font-bold px-8 py-4 text-lg rounded-xl w-full sm:w-auto"
          >
            Comenzar Ahora
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            onClick={() => navigate('/dashboard')}
            size="lg"
            variant="outline"
            className="glass-effect border-fintech-blue/30 text-fintech-blue-light hover:bg-fintech-blue/20 hover:text-fintech-blue-light font-bold px-8 py-4 text-lg rounded-xl hover:scale-105 transition-all duration-300 w-full sm:w-auto"
          >
            <Eye className="mr-2 w-5 h-5" />
            Ver Demo
          </Button>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-24">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="crypto-card p-6 rounded-2xl text-center group"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div 
                className="group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-300"
                style={{ transform: 'translateZ(20px)' }}
              >
                <div className="w-16 h-16 bg-slate-800/50 border border-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-fintech-blue/20 group-hover:border-fintech-blue transition-colors duration-300">
                  <feature.icon className="w-8 h-8 text-fintech-blue-light group-hover:text-fintech-blue-light transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-200">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="relative"
        >
          <div className="crypto-card p-8 rounded-3xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">¿Cómo funciona?</h2>
              <p className="text-gray-300">Proceso simple en 3 pasos</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Conecta", desc: "Autoriza el acceso a tu cuenta de forma segura" },
                { step: "2", title: "Analiza", desc: "Procesamos tus transacciones automáticamente" },
                { step: "3", title: "Descarga", desc: "Obtén tu informe fiscal listo para Hacienda" }
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-fintech-blue to-fintech-blue-dark rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold text-lg shadow-lg shadow-fintech-blue/20">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;