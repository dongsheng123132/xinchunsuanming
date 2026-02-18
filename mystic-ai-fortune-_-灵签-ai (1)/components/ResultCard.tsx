import React, { useRef, useState } from 'react';
import html2canvas from 'https://esm.sh/html2canvas@1.4.1';
import { FortuneResult, Language } from '../types';
import { TRANSLATIONS } from '../translations';

interface ResultCardProps {
  result: FortuneResult;
  language: Language;
  onReset: () => void;
  shareUrl?: string; // Optional URL if this result is from a shared link
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, language, onReset, shareUrl }) => {
  const t = TRANSLATIONS[language];
  const cardRef = useRef<HTMLDivElement>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate Image Logic
  const handleSaveImage = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // Use html2canvas to capture the card
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#FFF8E7', // Match temple-paper
        scale: 2, // Retina quality
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL('image/png');
      setGeneratedImage(dataUrl);
      setShowShareModal(true);
    } catch (err) {
      console.error("Failed to generate image", err);
    } finally {
      setIsGenerating(false);
    }
  };

  // Copy Link Logic
  const handleCopyLink = () => {
    // If we already have a shareUrl (from parent), use it. Otherwise, generate one.
    let urlToShare = shareUrl;
    
    if (!urlToShare) {
        const shareData = {
            result: result,
            language: language
        };
        // Encode JSON -> URI Component -> Base64
        // Note: btoa doesn't handle UTF-8 well, so we encodeURIComponent first
        const b64 = btoa(encodeURIComponent(JSON.stringify(shareData)));
        urlToShare = `${window.location.origin}${window.location.pathname}?share=${b64}`;
    }

    navigator.clipboard.writeText(urlToShare || window.location.href).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  return (
    <>
      <div 
        ref={cardRef}
        className="w-full max-w-3xl bg-temple-paper rounded-lg shadow-2xl border-8 border-double border-temple-gold p-6 md:p-10 animate-fade-in relative overflow-hidden"
      >
          {/* Decorative Corners */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-4 border-l-4 border-temple-red rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-4 border-r-4 border-temple-red rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-4 border-l-4 border-temple-red rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-4 border-r-4 border-temple-red rounded-br-lg"></div>

          {/* Watermark */}
          <div className="absolute top-10 right-10 opacity-5 pointer-events-none rotate-12">
              <span className="text-[12rem] font-calligraphy text-temple-red">福</span>
          </div>

        <div className="text-center mb-8 border-b-2 border-temple-red/20 pb-6 relative z-10">
          <h2 className="text-2xl text-temple-red font-bold uppercase tracking-[0.2em] mb-4">{t.resultTitle}</h2>
          
          <div className="flex justify-center gap-4 mb-4">
              {result.stickNumbers.map((num, i) => (
                  <div key={i} className="w-12 h-24 bg-temple-gold/20 border-2 border-temple-red flex items-center justify-center rounded-full text-temple-red font-bold font-serif text-xl shadow-inner">
                      {num}
                  </div>
              ))}
          </div>
          
          <div className="inline-block px-6 py-2 bg-temple-red text-temple-gold font-calligraphy text-2xl rounded-full shadow-lg border-2 border-temple-gold">
              {result.overallLuck}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-temple-red flex items-center gap-2">
              <span className="w-2 h-2 bg-temple-red rotate-45"></span>
              {t.poemLabel}
            </h3>
            <div className="bg-white/60 p-6 rounded-lg border border-temple-gold/30 italic font-serif text-temple-dark leading-loose text-lg text-center shadow-sm">
              {result.mainPoem.map((line, idx) => (
                <p key={idx}>{line}</p>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-temple-red flex items-center gap-2">
              <span className="w-2 h-2 bg-temple-red rotate-45"></span>
              {t.explainLabel}
            </h3>
            <p className="text-temple-dark leading-relaxed text-justify">
              {result.explanation}
            </p>
            
            <div className="bg-temple-yellow/10 p-4 rounded border-l-4 border-temple-red mt-6">
              <h4 className="font-bold text-temple-red text-sm mb-2 uppercase tracking-wide">{t.adviceLabel}</h4>
              <p className="text-temple-dark italic font-medium">{result.advice}</p>
            </div>
          </div>
        </div>

        {/* Footer for Screenshot context (Optional) */}
        <div className="mt-8 pt-4 border-t border-temple-gold/20 text-center opacity-60 text-xs font-serif text-temple-red">
             x402 AI Lucky Shrine • {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Action Buttons (Outside the screenshot capture area) */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 w-full max-w-md justify-center z-20">
        <button 
            onClick={handleSaveImage}
            disabled={isGenerating}
            className="flex-1 px-6 py-3 bg-temple-gold text-temple-red font-bold rounded shadow-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
        >
            {isGenerating ? (
                <span className="animate-spin h-4 w-4 border-2 border-temple-red rounded-full border-t-transparent"></span>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            )}
            {t.saveImageBtn}
        </button>

        <button 
            onClick={handleCopyLink}
            className="flex-1 px-6 py-3 bg-white/10 border border-temple-gold text-temple-gold font-bold rounded shadow-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
        >
            {copyFeedback ? (
                <span className="text-green-400">{t.linkCopied}</span>
            ) : (
                <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                {t.copyLinkBtn}
                </>
            )}
        </button>
      </div>

      <div className="mt-4">
        <button 
            onClick={onReset}
            className="text-temple-paper/60 hover:text-temple-gold underline text-sm"
        >
            {t.againBtn}
        </button>
      </div>

      {/* Share/Save Modal */}
      {showShareModal && generatedImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
             <div className="bg-temple-paper w-full max-w-md rounded-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-4 bg-temple-red flex justify-between items-center">
                    <h3 className="text-white font-bold">{t.shareModalTitle}</h3>
                    <button onClick={() => setShowShareModal(false)} className="text-white text-2xl">&times;</button>
                </div>
                <div className="p-4 flex-1 overflow-y-auto flex flex-col items-center">
                    <p className="text-sm text-center text-temple-dark mb-4">{t.shareModalDesc}</p>
                    <img src={generatedImage} alt="Fortune Result" className="w-full h-auto rounded shadow-lg border-2 border-temple-gold" />
                </div>
             </div>
        </div>
      )}
    </>
  );
};