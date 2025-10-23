import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { 
  Download, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  FileText,
  BarChart3,
  Star,
  Layers,
  LogIn,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, isDemo = false, onLogin, isSyncing = false, data: realData }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const generateReport = () => {
    if (isDemo) {
      toast({
        title: "📄 Informe de Demostración Generado",
        description: "En la versión completa, se descargaría un informe PDF detallado con todas tus transacciones, ganancias, pérdidas y el cálculo fiscal FIFO.",
        duration: 8000,
      });
    } else {
      toast({
        title: "🚧 ¡Función en desarrollo!",
        description: "La generación de informes estará disponible muy pronto. ¡Puedes solicitarla en tu próximo mensaje! 🚀",
      });
    }
  };

  const demoData = {
    totalBalance: 12543.78,
    gains: 4350.15,
    losses: -1230.40,
    assets: 15,
    netGain: 3119.75,
    estimatedTax: 717.54,
    acquisitionCost: 21480.50,
    totalProceeds: 24600.25,
  };

  const syncingData = {
    totalBalance: "Sincronizando...",
    gains: "Sincronizando...",
    losses: "Sincronizando...",
    assets: "Sincronizando...",
    netGain: "Sincronizando...",
    estimatedTax: "Sincronizando...",
    acquisitionCost: "Sincronizando...",
    totalProceeds: "Sincronizando...",
  };

  const data = isDemo ? demoData : (isSyncing || !realData ? syncingData : realData);

  const formatCurrency = (value) => {
    if (typeof value !== 'number') return value;
    return `€${value.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const stats = [
    { title: "Balance Total (Stablecoins)", value: formatCurrency(data.totalBalance), icon: DollarSign, color: "text-fintech-blue-light", bgColor: "bg-fintech-blue/10" },
    { title: "Ganancias (2024)", value: formatCurrency(data.gains), icon: TrendingUp, color: "text-green-400", bgColor: "bg-green-500/10" },
    { title: "Pérdidas (2024)", value: formatCurrency(data.losses), icon: TrendingDown, color: "text-red-400", bgColor: "bg-red-500/10" },
    { title: "Activos Diferentes", value: data.assets, icon: BarChart3, color: "text-fintech-blue-light", bgColor: "bg-fintech-blue/10" }
  ];

  return (
    <div className="py-12 mt-12 px-6">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard <span className="text-gradient">Fiscal</span></h1>
              <p className="text-gray-400">
                {isDemo ? "Bienvenido a la demostración de CryptoTax Pro." : `Bienvenido, ${user?.user_metadata?.full_name || user?.email}.`}
                {isDemo && <span className="text-fintech-blue-light font-semibold"> (Modo Demostración)</span>}
              </p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              {isDemo && (
                <Button 
                  onClick={onLogin}
                  className="bg-fintech-blue hover:bg-fintech-blue-dark text-white font-semibold"
                >
                  <LogIn className="w-4 h-4 mr-2" />
                  Acceder o Registrarse
                </Button>
              )}
              {!isDemo && (
                <Button 
                  onClick={() => navigate('/pricing')}
                  variant="outline"
                  className="glass-effect border-fintech-blue/30 text-fintech-blue-light hover:bg-fintech-blue/20"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              )}
              <Button 
                onClick={generateReport}
                className="bg-gradient-to-r from-fintech-blue to-fintech-blue-dark text-white font-bold"
                disabled={isSyncing}
              >
                <Download className="w-4 h-4 mr-2" />
                Generar Informe
              </Button>
            </div>
          </div>
        </motion.div>

        {isSyncing && !isDemo && !realData ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="crypto-card p-8 rounded-2xl text-center"
          >
            <Clock className="w-12 h-12 text-fintech-blue-light mx-auto mb-4 animate-pulse" />
            <h2 className="text-2xl font-bold mb-2">Sincronizando tus datos</h2>
            <p className="text-gray-400">
              Estamos importando y procesando tus transacciones de Binance. Esto puede tardar unos minutos.
            </p>
            <p className="text-gray-400 mt-2">
              Puedes navegar por otras partes del sitio, te notificaremos cuando esté listo.
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="crypto-card p-6 rounded-2xl"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center border border-white/10`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <h3 className="text-sm text-gray-400 mb-1">{stat.title}</h3>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </motion.div>
              ))}
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="crypto-card p-6 rounded-2xl lg:col-span-1"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <FileText className="w-6 h-6 mr-3 text-fintech-blue-light" />
                  Resumen Fiscal 2024
                </h2>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">Ganancia Neta</span>
                    <span className="font-semibold text-green-400">
                      {formatCurrency(data.netGain)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">Impuesto Estimado</span>
                    <span className="font-semibold text-red-400">
                      {formatCurrency(data.estimatedTax)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg">
                    <span className="text-gray-300">Período Fiscal</span>
                    <span className="text-fintech-blue-light font-semibold">01/01/2024 - 31/12/2024</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="crypto-card p-6 rounded-2xl lg:col-span-2"
              >
                <h2 className="text-2xl font-bold mb-6 flex items-center">
                  <Layers className="w-6 h-6 mr-3 text-green-400" />
                  Análisis FIFO
                </h2>
                <p className="text-sm text-gray-400 mb-6 -mt-4">El método FIFO (First-In, First-Out) calcula las ganancias asumiendo que los primeros activos que compraste son los primeros que vendes.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                    <h3 className="text-gray-300 mb-2">Coste de Adquisición</h3>
                    <p className="font-semibold text-lg text-fintech-blue-light">{formatCurrency(data.acquisitionCost)}</p>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg text-center">
                    <h3 className="text-gray-300 mb-2">Ingresos Totales</h3>
                    <p className="font-semibold text-lg text-fintech-blue-light">{formatCurrency(data.totalProceeds)}</p>
                  </div>
                  <div className="p-4 bg-green-500/10 rounded-lg text-center border border-green-500/20">
                    <h3 className="text-green-300 mb-2">Ganancia/Pérdida Neta</h3>
                    <p className="font-semibold text-lg text-green-400">{formatCurrency(data.netGain)}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;