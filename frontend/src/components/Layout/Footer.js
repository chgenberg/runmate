import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: 'Integritetspolicy', path: '/privacy' },
    { name: 'Q&A', path: '/faq' },
    { name: 'Kontakt', path: '/contact' }
  ];

  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="RunMate" className="w-8 h-8" />
            <span className="text-sm text-gray-600">
              © {currentYear} RunMate. Alla rättigheter förbehållna.
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center space-x-6">
            {footerLinks.map((link, index) => (
              <motion.div
                key={link.path}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={link.path}
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  {link.name}
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Status Indicator */}
          <motion.div 
            className="flex items-center space-x-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-gray-500">Alla system fungerar</span>
          </motion.div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 