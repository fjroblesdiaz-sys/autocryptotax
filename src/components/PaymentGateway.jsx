import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.jsx";
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { CreditCard, Copy, Check, RefreshCw } from 'lucide-react';

const cryptoOptions = [
  { id: 'btc', name: 'Bitcoin', icon: 'https://img.icons8.com/fluency/48/bitcoin.png', address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
  { id: 'eth', name: 'Ethereum', icon: 'https://img.icons8.com/fluency/48/ethereum.png', address: '0x32Be343B94f860124dC4fEe278FDCBD38C102D88' },
  { id: 'bnb', name: 'BNB', icon: 'https://img.icons8.com/fluency/48/binance-coin.png', address: 'bnb1grpf0955h0ykzq3ar50fkrp23t7n38p4aenr9x' },
  { id: 'sol', name: 'Solana', icon: 'https://img.icons8.com/fluency/48/solana.png', address: 'So11111111111111111111111111111111111111112' },
];

const CryptoPayment = ({ crypto, amount, price }) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const cryptoAmount = price > 0 ? (amount / price).toFixed(8) : 0;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({ title: '¡Copiado!', description: `${text} copiado al portapapeles.` });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="text-center">
      <h3 className="text-xl font-semibold mb-2">Pagar con {crypto.name}</h3>
      <div className="my-4 p-4 bg-slate-900/50 rounded-lg">
        <p className="text-gray-400">Cantidad a enviar:</p>
        <div className="flex items-center justify-center gap-2 my-2">
          <p className="text-2xl font-bold text-fintech-blue-light">{cryptoAmount}</p>
          <Button size="icon" variant="ghost" onClick={() => handleCopy(cryptoAmount.toString())}>
            {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
          </Button>
        </div>
        <p className="text-sm text-gray-500">(1 {crypto.id.toUpperCase()} ≈ €{price.toLocaleString('es-ES')})</p>
      </div>
      <div className="my-4 p-4 bg-slate-900/50 rounded-lg">
        <p className="text-gray-400 mb-2">A la dirección:</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-sm break-all font-mono">{crypto.address}</p>
          <Button size="icon" variant="ghost" onClick={() => handleCopy(crypto.address)}>
            <Copy className="w-5 h-5" />
          </Button>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-4">
        Por favor, envía la cantidad exacta. Las transacciones pueden tardar en confirmarse.
      </p>
    </div>
  );
};

const PaymentGateway = ({ plan }) => {
  const { toast } = useToast();
  const [prices, setPrices] = useState({ btc: 60000, eth: 3000, bnb: 600, sol: 150 });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPrices = useCallback(() => {
    setIsUpdating(true);
    // Simulación de llamada a API
    setTimeout(() => {
      setPrices({
        btc: 60000 + (Math.random() - 0.5) * 2000,
        eth: 3000 + (Math.random() - 0.5) * 200,
        bnb: 600 + (Math.random() - 0.5) * 50,
        sol: 150 + (Math.random() - 0.5) * 20,
      });
      setLastUpdated(new Date());
      setIsUpdating(false);
      toast({ title: 'Precios actualizados', description: 'Los tipos de cambio de criptomonedas han sido actualizados.' });
    }, 1000);
  }, [toast]);

  useEffect(() => {
    const interval = setInterval(fetchPrices, 300000); // 5 minutos
    return () => clearInterval(interval);
  }, [fetchPrices]);

  const handleCardPayment = () => {
    toast({
      title: '🚧 Pasarela de pago con tarjeta',
      description: (
        <div>
          <p className="mb-2">Esta función aún no está implementada. Para vender con tarjeta, te recomendamos usar Stripe.</p>
          <p>Puedes seguir <a href="https://www.hostinger.com/support/hostinger-horizons-how-to-sell-subscriptions-with-stripe/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">esta guía</a> para aprender a configurarlo.</p>
        </div>
      ),
      duration: 10000,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="crypto-card p-8 rounded-3xl"
    >
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold">Completa tu pago</h2>
        <p className="text-gray-400">Has seleccionado el plan <span className="font-bold text-fintech-blue-light">{plan.name}</span> por <span className="font-bold text-fintech-blue-light">€{plan.price}/año</span>.</p>
      </div>

      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4">
          <TabsTrigger value="card"><CreditCard className="w-5 h-5" /></TabsTrigger>
          {cryptoOptions.map(crypto => (
            <TabsTrigger key={crypto.id} value={crypto.id}>
              <img src={crypto.icon} alt={crypto.name} className="w-6 h-6" />
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="card">
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">Pagar con Tarjeta de Crédito</h3>
            <p className="text-gray-400 mb-6">Serás redirigido a una pasarela de pago segura.</p>
            <Button onClick={handleCardPayment} className="bg-gradient-to-r from-fintech-blue to-fintech-blue-dark text-white font-bold text-lg px-8 py-6">
              <CreditCard className="mr-2 w-5 h-5" />
              Pagar €{plan.price} con Tarjeta
            </Button>
          </div>
        </TabsContent>

        {cryptoOptions.map(crypto => (
          <TabsContent key={crypto.id} value={crypto.id}>
            <CryptoPayment crypto={crypto} amount={plan.price} price={prices[crypto.id]} />
          </TabsContent>
        ))}
      </Tabs>
      
      <div className="text-center mt-6 text-sm text-gray-500 flex items-center justify-center gap-2">
        <p>Precios actualizados por última vez: {lastUpdated.toLocaleTimeString('es-ES')}</p>
        <Button variant="ghost" size="icon" onClick={fetchPrices} disabled={isUpdating}>
          <RefreshCw className={`w-4 h-4 ${isUpdating ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    </motion.div>
  );
};

export default PaymentGateway;