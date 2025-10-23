import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentGateway from '@/components/PaymentGateway';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    name: 'Gratis',
    price: 0,
    description: 'Para empezar a explorar',
    features: [
      'Conexión con 1 exchange',
      'Hasta 100 transacciones',
      'Cálculo FIFO básico',
      'Soporte por comunidad',
    ],
    cta: 'Comenzar Gratis',
  },
  {
    name: 'Avanzado',
    price: 49,
    description: 'Para el inversor activo',
    features: [
      'Todo en Gratis, y además:',
      'Hasta 5 exchanges',
      'Hasta 5,000 transacciones',
      'Soporte para Staking y Airdrops',
      'Soporte prioritario por email',
    ],
    cta: 'Elegir Avanzado',
    isPopular: true,
  },
  {
    name: 'Pro',
    price: 99,
    description: 'Para el trader profesional',
    features: [
      'Todo en Avanzado, y además:',
      'Exchanges y transacciones ilimitadas',
      'Soporte para DeFi y NFTs',
      'Generación de informe fiscal oficial',
      'Soporte premium 24/7',
    ],
    cta: 'Elegir Pro',
  },
];

const PricingCard = ({ plan, onSelect }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className={`crypto-card p-8 rounded-3xl relative overflow-hidden flex flex-col ${plan.isPopular ? 'border-2 border-fintech-blue' : ''}`}
  >
    {plan.isPopular && (
      <div className="absolute top-0 right-0 bg-fintech-blue text-white text-xs font-bold px-4 py-1 rounded-bl-lg">
        MÁS POPULAR
      </div>
    )}
    <h3 className="text-2xl font-bold text-center mb-2">{plan.name}</h3>
    <p className="text-center text-gray-400 mb-6 h-10">{plan.description}</p>
    <p className="text-5xl font-bold text-center mb-6">
      €{plan.price}
      {plan.price > 0 && <span className="text-lg font-normal text-gray-400">/año</span>}
    </p>
    <ul className="space-y-4 mb-8 flex-grow">
      {plan.features.map((feature, index) => (
        <li key={index} className="flex items-start">
          <Check className="w-5 h-5 text-fintech-blue-light mr-3 mt-1 flex-shrink-0" />
          <span className="text-gray-300">{feature}</span>
        </li>
      ))}
    </ul>
    <Button
      onClick={() => onSelect(plan)}
      className={`w-full font-bold text-lg py-6 ${plan.isPopular ? 'bg-gradient-to-r from-fintech-blue to-fintech-blue-dark text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
    >
      {plan.price > 0 && <Star className="w-5 h-5 mr-2" />}
      {plan.cta}
    </Button>
  </motion.div>
);

const PricingPage = ({ onLogin }) => {
  const { toast } = useToast();
  const { session } = useAuth();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = (plan) => {
    if (!session) {
      onLogin();
      return;
    }

    if (plan.price === 0) {
      toast({
        title: "¡Plan Gratuito Activado!",
        description: "Ya puedes usar las funcionalidades del plan gratuito en tu dashboard.",
      });
      navigate('/dashboard');
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <>
      <Helmet>
        <title>Planes y Precios - CryptoTax Pro</title>
        <meta name="description" content="Elige el plan de CryptoTax Pro que mejor se adapte a tus necesidades y comienza a simplificar tu declaración de criptomonedas." />
      </Helmet>
      <div className="py-20 px-6">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Planes flexibles para cada inversor
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Desde el principiante hasta el trader profesional, tenemos un plan para ti.
            </p>
          </motion.div>

          {!selectedPlan ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan, index) => (
                <PricingCard key={index} plan={plan} onSelect={handleSelectPlan} />
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <PaymentGateway plan={selectedPlan} />
              <Button
                variant="link"
                onClick={() => setSelectedPlan(null)}
                className="mt-8 mx-auto block"
              >
                &larr; Volver a los planes
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default PricingPage;