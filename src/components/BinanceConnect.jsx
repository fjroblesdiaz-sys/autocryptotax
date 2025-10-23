import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Key, Eye, EyeOff, Link, HelpCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/customSupabaseClient';

const BinanceConnect = ({ onConnect, user }) => {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey || !apiSecret) {
      toast({
        variant: "destructive",
        title: "Campos requeridos",
        description: "Por favor, introduce tu API Key y API Secret.",
      });
      return;
    }
    
    setIsConnecting(true);

    try {
      if (!user) throw new Error("Usuario no autenticado.");

      const { data: encryptedData, error: encryptionError } = await supabase.functions.invoke('secure-keys-service', {
        body: JSON.stringify({ apiKey, apiSecret }),
      });

      if (encryptionError || encryptedData.error) {
        throw new Error(encryptionError?.message || encryptedData.error || 'Error al encriptar las claves.');
      }

      const { encrypted_api_key, encrypted_api_secret, iv } = encryptedData;

      const { error: dbError } = await supabase
        .from('encrypted_binance_keys')
        .upsert({
          user_id: user.id,
          encrypted_api_key,
          encrypted_api_secret,
          iv,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (dbError) throw dbError;

      toast({
        title: "¡Conexión exitosa!",
        description: "Tus claves de Binance se han guardado de forma segura y encriptada.",
      });
      onConnect();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al guardar las claves",
        description: error.message || "No se pudieron guardar tus claves de API. Inténtalo de nuevo.",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="crypto-card max-w-2xl mx-auto p-8 rounded-2xl"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 binance-gradient rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Link className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Conectar con Binance</h2>
        <p className="text-gray-400 mt-2">
          Introduce tus claves de API para sincronizar tus datos de trading.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">API Key</label>
          <Input
            type="text"
            placeholder="Tu API Key de Binance"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="bg-white/5 border-white/10"
            disabled={isConnecting}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">API Secret</label>
          <div className="relative">
            <Input
              type={showSecret ? 'text' : 'password'}
              placeholder="Tu API Secret de Binance"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="bg-white/5 border-white/10 pr-10"
              disabled={isConnecting}
            />
            <button
              type="button"
              onClick={() => setShowSecret(!showSecret)}
              className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-white"
              disabled={isConnecting}
            >
              {showSecret ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 bg-blue-500/10 p-3 rounded-lg flex items-start space-x-2">
          <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
          <span>
            Tus claves se guardan de forma encriptada y se usan exclusivamente para leer tus datos de trading. Para mayor seguridad, te recomendamos crear claves de API con permisos de solo lectura.
          </span>
        </div>

        <Button type="submit" className="w-full binance-gradient text-white font-semibold py-3 text-lg rounded-xl hover:scale-105 transition-transform" disabled={isConnecting}>
          {isConnecting ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Key className="w-5 h-5 mr-2" />
          )}
          {isConnecting ? 'Conectando...' : 'Conectar y Sincronizar'}
        </Button>
      </form>
    </motion.div>
  );
};

export default BinanceConnect;