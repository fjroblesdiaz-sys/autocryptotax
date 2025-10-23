import React, { useState } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LogOut, User, Menu, X, TrendingUp } from 'lucide-react';

const Header = ({ isAuthenticated, user, onLogout, onLogin }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const handleHomeClick = (e) => {
    if (location.pathname === '/') {
      e.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
    handleLinkClick();
  };

  const navLinks = [
    { to: "/pricing", text: "Precios" },
    { to: "/#roadmap", text: "Roadmap" },
    { to: "/#faq", text: "FAQ" },
  ];

  const NavLink = ({ to, children }) => {
    return (
      <RouterLink
        to={to}
        onClick={handleLinkClick}
        className="text-gray-300 hover:text-white transition-colors relative group"
      >
        {children}
        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fintech-blue transition-all duration-300 group-hover:w-full"></span>
      </RouterLink>
    );
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/50"
    >
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <RouterLink to="/" className="flex items-center space-x-3 group" onClick={handleHomeClick}>
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 group-hover:bg-fintech-blue transition-colors">
            <TrendingUp className="w-5 h-5 text-fintech-blue group-hover:text-white transition-colors" />
          </div>
          <span className="text-xl font-bold text-white">CryptoTax Pro</span>
        </RouterLink>

        <nav className="hidden md:flex items-center space-x-8">
          <RouterLink
            to="/"
            onClick={handleHomeClick}
            className="text-gray-300 hover:text-white transition-colors relative group"
          >
            Inicio
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-fintech-blue transition-all duration-300 group-hover:w-full"></span>
          </RouterLink>
          {navLinks.map(link => (
            <NavLink key={link.to} to={link.to}>{link.text}</NavLink>
          ))}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Button asChild variant="ghost" className="text-gray-300 hover:text-white hover:bg-slate-800">
                <RouterLink to="/dashboard" onClick={handleLinkClick}>
                  <User className="w-4 h-4 mr-2" />
                  {user?.user_metadata?.full_name?.split(' ')[0] || 'Dashboard'}
                </RouterLink>
              </Button>
              <Button onClick={onLogout} variant="outline" className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300" size="sm">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </>
          ) : (
            <Button onClick={onLogin} className="bg-fintech-blue hover:bg-fintech-blue-dark text-white font-bold">
              <User className="w-4 h-4 mr-2" />
              Acceder
            </Button>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="hover:bg-slate-800">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 py-4"
        >
          <nav className="flex flex-col items-center space-y-6">
             <RouterLink
                to="/"
                onClick={handleHomeClick}
                className="text-gray-300 hover:text-white transition-colors relative group"
              >
                Inicio
              </RouterLink>
            {navLinks.map(link => (
              <NavLink key={link.to} to={link.to}>{link.text}</NavLink>
            ))}
            <div className="w-full px-6 pt-6 border-t border-slate-800 flex flex-col space-y-3">
              {isAuthenticated ? (
                <>
                  <Button asChild className="w-full bg-fintech-blue hover:bg-fintech-blue-dark">
                    <RouterLink to="/dashboard" onClick={handleLinkClick}>
                      <User className="w-4 h-4 mr-2" />
                      Dashboard
                    </RouterLink>
                  </Button>
                  <Button onClick={() => { onLogout(); toggleMobileMenu(); }} variant="destructive" className="w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                  </Button>
                </>
              ) : (
                <Button onClick={() => { onLogin(); toggleMobileMenu(); }} className="w-full bg-fintech-blue hover:bg-fintech-blue-dark text-white font-bold">
                  <User className="w-4 h-4 mr-2" />
                  Acceder
                </Button>
              )}
            </div>
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;