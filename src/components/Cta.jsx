import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Mail, Users, Award, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const Cta = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: 'Correo inválido',
        description: 'Por favor, introduce una dirección de correo electrónico válida.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('subscribers')
        .insert([{ email: email }]);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast({
            title: '¡Ya estás suscrito! 😉',
            description: 'Tu correo electrónico ya se encuentra en nuestra lista de espera.',
            variant: 'default',
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: '¡Suscripción completada! 🎉',
          description: '¡Gracias! Te hemos añadido a la lista de espera. Te avisaremos pronto.',
        });
        setEmail('');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      toast({
        title: '¡Oh, no! Algo salió mal.',
        description: 'No pudimos procesar tu suscripción. Por favor, inténtalo de nuevo más tarde.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="crypto-card p-8 md:p-12 rounded-3xl text-center"
    >
      <div className="max-w-2xl mx-auto">
        <div className="inline-block bg-fintech-blue/20 text-fintech-blue-light text-sm font-semibold px-4 py-1 rounded-full mb-4">
          <Users className="inline-block w-4 h-4 mr-2" />
          De traders para traders
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Únete a la revolución fiscal de las criptos
        </h2>
        <p className="text-gray-300 mb-8 text-lg">
          Sé el primero en acceder y obtén <span className="font-bold text-fintech-blue-light">ventajas exclusivas</span> como early adopter. ¡Estamos construyendo la herramienta que siempre quisimos!
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
          <div className="relative flex-grow">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="email"
              placeholder="Tu correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white/5 border-white/20 rounded-xl text-lg focus:ring-fintech-blue"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            size="lg"
            className="bg-gradient-to-r from-fintech-blue to-fintech-blue-dark text-white font-bold text-lg h-14 rounded-xl hover:scale-105 transition-transform"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            ) : (
              <Award className="mr-2 w-5 h-5" />
            )}
            {loading ? 'Enviando...' : 'Quiero ser el primero'}
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default Cta;