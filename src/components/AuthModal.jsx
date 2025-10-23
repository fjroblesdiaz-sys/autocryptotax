import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/components/ui/use-toast';

const AuthModal = ({ isOpen, onClose }) => {
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
      toast({ title: "¡Bienvenido de nuevo!", description: "Has iniciado sesión correctamente." });
      onClose();
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, { data: { full_name: fullName } });
    if (!error) {
      toast({ title: "¡Cuenta creada!", description: "Revisa tu correo para confirmar tu cuenta." });
      onClose();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800/60 backdrop-blur-sm border border-slate-700 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Accede a tu cuenta</DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Gestiona tus impuestos de criptomonedas con facilidad.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="signin" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="signup">Registrarse</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <form onSubmit={handleSignIn} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input id="email-signin" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Contraseña</Label>
                <Input id="password-signin" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-slate-800 border-slate-700" />
              </div>
              <Button type="submit" className="w-full binance-gradient" disabled={loading}>
                {loading ? 'Iniciando...' : 'Iniciar Sesión'}
              </Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={handleSignUp} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="fullname-signup">Nombre Completo</Label>
                <Input id="fullname-signup" placeholder="John Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input id="email-signup" type="email" placeholder="tu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-slate-800 border-slate-700" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Contraseña</Label>
                <Input id="password-signup" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-slate-800 border-slate-700" />
              </div>
              <Button type="submit" className="w-full crypto-gradient" disabled={loading}>
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;