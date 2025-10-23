import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Rocket, Bot, BarChart2, Shield, Database, Zap, TrendingUp, Globe, Cpu, Gem } from 'lucide-react';

const roadmapData = [
  {
    period: 'Prioridad CRÍTICA (0-3 meses) - Base Fundamental',
    items: [
      { title: 'Seguridad de Datos Financieros', features: ['Encriptación end-to-end para keys de API', 'Ambientes aislados para procesamiento de datos sensibles'], icon: Shield, status: 'completed' },
      { title: 'Motor de Cálculo FIFO Hiper-Preciso', features: ['Arquitectura de base de datos optimizada para transacciones', 'Lógica de matching de transacciones'], icon: Database, status: 'in-progress' },
      { title: 'Conectividad de Datos Masiva', features: ['API de exchanges: Binance, Coinbase, Kraken, etc.', 'Parsers de CSVs para imports manuales', 'Conexión directa a wallets'], icon: Zap, status: 'in-progress' },
    ],
  },
  {
    period: 'Prioridad ALTA (3-9 meses) - Diferenciación Competitiva',
    items: [
      { title: 'IA para Análisis de Transacciones', features: ['Detección de patrones de trading', 'Reconciliación inteligente', 'Alertas proactivas de errores'], icon: Bot, status: 'planned' },
      { title: 'Motor de Simulación en Tiempo Real', features: ['"What-if" scenarios para impacto fiscal', 'Proyecciones de tax liability', 'Optimizador fiscal'], icon: TrendingUp, status: 'planned' },
      { title: 'Dashboard Avanzado para Traders', features: ['Visualización de P/L por asset, timeframe', 'Comparativas after-tax vs pre-tax', 'Alertas personalizadas'], icon: BarChart2, status: 'planned' },
    ],
  },
  {
    period: 'Prioridad MEDIA (9-18 meses) - Expansión',
    items: [
      { title: 'Blockchain para Auditoría Transparente', features: ['Hash de transacciones en blockchain', 'Smart contracts para verificación', 'Sistema de reputación'], icon: Globe, status: 'planned' },
      { title: 'APIs para Asesores Fiscales', features: ['Modo "contador" multi-cliente', 'Herramientas de colaboración', 'Reporting profesional'], icon: Rocket, status: 'planned' },
    ],
  },
  {
    period: 'Prioridad BAJA/FUTURO (18+ meses) - Visión',
    items: [
      { title: 'Computación Cuántica Aplicada', features: ['Optimización de carteras multi-activo', 'Simulación de escenarios complejos', 'Cryptografía post-cuántica'], icon: Cpu, status: 'planned' },
      { title: 'Tokenización del Ecosistema', features: ['Token de utilidad para acceso premium', 'Sistema de gobernanza', 'Integración DeFi'], icon: Gem, status: 'planned' },
    ],
  },
];

const Roadmap = () => {
  const getStatusStyles = (status) => {
    switch (status) {
      case 'completed': return { borderColor: 'border-slate-500', bgColor: 'bg-slate-500/10', textColor: 'text-slate-400', glow: 'shadow-slate-500/20' };
      case 'in-progress': return { borderColor: 'border-fintech-blue', bgColor: 'bg-fintech-blue/10', textColor: 'text-fintech-blue-light', glow: 'shadow-fintech-blue/20' };
      case 'planned': default: return { borderColor: 'border-fintech-neutral-gray', bgColor: 'bg-fintech-neutral-gray/10', textColor: 'text-gray-500', glow: 'shadow-fintech-neutral-gray/20' };
    }
  };

  return (
    <motion.section
      id="roadmap"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="container mx-auto max-w-7xl py-24 px-6"
    >
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">Nuestro <span className="text-gradient">Roadmap</span></h2>
      <div className="relative">
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700/50 transform -translate-x-1/2"></div>
        
        {roadmapData.map((periodGroup, groupIndex) => (
          <div key={groupIndex} className="mb-16">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-2xl md:text-3xl font-bold text-center mb-12 text-slate-300"
            >
              {periodGroup.period}
            </motion.h3>
            {periodGroup.items.map((item, itemIndex) => {
              const styles = getStatusStyles(item.status);
              const isLeft = itemIndex % 2 === 0;

              return (
                <div key={itemIndex} className={`relative flex items-center mb-12 ${isLeft ? 'justify-start' : 'justify-end'}`}>
                  <div className={`w-full md:w-5/12 ${isLeft ? 'md:pr-8' : 'md:pl-8'}`}>
                    <motion.div
                      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                      className={`crypto-card p-6 rounded-2xl border-l-4 ${styles.borderColor} ${styles.bgColor} hover:shadow-lg ${styles.glow}`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h4 className={`text-xl font-bold ${styles.textColor}`}>{item.title}</h4>
                        <span className="text-xs font-semibold bg-slate-700/50 px-3 py-1 rounded-full capitalize">{item.status.replace('-', ' ')}</span>
                      </div>
                      <ul className="space-y-2">
                        {item.features.map((feature, fIndex) => (
                          <li key={fIndex} className="flex items-start text-gray-400">
                            <CheckCircle className={`w-4 h-4 mr-2 mt-1 flex-shrink-0 ${styles.textColor}`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  </div>
                  <div className={`absolute left-1/2 top-1/2 w-10 h-10 bg-slate-800 border-2 ${styles.borderColor} rounded-full transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center`}>
                    <item.icon className={`w-5 h-5 ${styles.textColor}`} />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </motion.section>
  );
};

export default Roadmap;