import React from 'react';
import ReactMarkdown from 'https://esm.sh/react-markdown@9';
import { Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface WhitepaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const WhitepaperModal: React.FC<WhitepaperModalProps> = ({ isOpen, onClose, language }) => {
  if (!isOpen) return null;

  const t = TRANSLATIONS[language];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-temple-paper w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-lg shadow-2xl border-4 border-temple-gold relative">
        <div className="sticky top-0 bg-temple-red p-4 flex justify-between items-center border-b-4 border-temple-gold">
          <h2 className="text-white font-bold text-lg font-serif">{t.whitepaperTitle}</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-temple-gold transition-colors font-bold text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        
        <div className="p-8 text-temple-dark font-serif prose prose-red max-w-none">
             <ReactMarkdown>{t.whitepaperContent}</ReactMarkdown>
        </div>

        <div className="p-4 bg-gray-100 text-center border-t border-gray-300">
             <button onClick={onClose} className="px-6 py-2 bg-temple-red text-white rounded hover:bg-temple-dark transition-colors">
                {t.closeBtn}
             </button>
        </div>
      </div>
    </div>
  );
};