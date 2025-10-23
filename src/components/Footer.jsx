import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, Twitter, Github, Linkedin } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const Footer = () => {
  const { toast } = useToast();

  const handleSocialClick = (e) => {
    e.preventDefault();
    toast({
      title: "🚧 ¡Próximamente!",
      description: "Nuestras redes sociales estarán activas muy pronto. ¡Síguenos! 🚀",
    });
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-slate-950/50 border-t border-slate-800/50 mt-auto"
    >
      <div className="container mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <Link to="/" className="flex items-center space-x-3 justify-center md:justify-start group">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 group-hover:bg-fintech-blue transition-colors">
              <TrendingUp className="w-6 h-6 text-fintech-blue group-hover:text-white transition-colors" />
            </div>
            <span className="text-2xl font-bold text-gradient">CryptoTax Pro</span>
          </Link>
          
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-gray-400 justify-center">
            <Link to="/terms" className="hover:text-fintech-blue-light transition-colors">Términos</Link>
            <Link to="/privacy" className="hover:text-fintech-blue-light transition-colors">Privacidad</Link>
            <Link to="/cookies" className="hover:text-fintech-blue-light transition-colors">Cookies</Link>
            <a href="mailto:info@autocryptotax.com" className="hover:text-fintech-blue-light transition-colors">Contacto</a>
          </div>

          <div className="flex space-x-6 justify-center md:justify-end">
            <a href="#" onClick={handleSocialClick} className="text-gray-400 hover:text-fintech-blue-light transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="#" onClick={handleSocialClick} className="text-gray-400 hover:text-fintech-blue-light transition-colors">
              <Github className="w-6 h-6" />
            </a>
            <a href="#" onClick={handleSocialClick} className="text-gray-400 hover:text-fintech-blue-light transition-colors">
              <Linkedin className="w-6 h-6" />
            </a>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800/50 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} CryptoTax Pro. Todos los derechos reservados.</p>
          <p className="mt-2">Este servicio es una herramienta de ayuda y no constituye asesoramiento fiscal profesional.</p>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;