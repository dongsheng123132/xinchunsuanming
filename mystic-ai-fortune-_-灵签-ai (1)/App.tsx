import React, { useState, useEffect } from 'react';
import { AppState, FortuneResult, Language, WishCategory } from './types';
import { TRANSLATIONS } from './translations';
import { StickCylinder } from './components/StickCylinder';
import { ResultCard } from './components/ResultCard';
import { WhitepaperModal } from './components/WhitepaperModal';
import { interpretFortune } from './services/geminiService';
import { createPaymentSession } from './services/paymentService';

const TREASURY = '0x4eCf92bAb524039Fc4027994b9D88C2DB2Ee05E6';
const API_URL = 'https://xinchunsuanming.vercel.app';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [category, setCategory] = useState<WishCategory | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [language, setLanguage] = useState<Language>('zh-CN');
  const [stickCount, setStickCount] = useState(0);
  const [collectedSticks, setCollectedSticks] = useState<number[]>([]);
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
  const [wishText, setWishText] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareData = params.get('share');
    if (shareData) {
        try {
            const jsonString = decodeURIComponent(atob(shareData));
            const decoded = JSON.parse(jsonString);
            if (decoded && decoded.result) {
                setFortune(decoded.result);
                if (decoded.language) setLanguage(decoded.language);
                setAppState(AppState.RESULT);
            }
        } catch (e) {
            console.error("Failed to parse share link", e);
        }
    }
  }, []);

  const t = TRANSLATIONS[language];

  const handleStart = () => setAppState(AppState.CATEGORY_SELECT);

  const selectCategory = (cat: WishCategory) => {
    setCategory(cat);
    setWishText('');
    setAppState(AppState.PAYMENT);
  };

  // Generate Awal CLI command
  const getAwalCommand = () => {
    const body = JSON.stringify({
      stickNumbers: [Math.floor(Math.random()*100)+1, Math.floor(Math.random()*100)+1, Math.floor(Math.random()*100)+1],
      category: category || 'career',
      language,
      wishText: wishText || undefined,
    });
    return `npx awal x402 pay ${API_URL}/api/fortune/interpret -X POST -H "Content-Type: application/json" -d '${body}'`;
  };

  const handleCopyAwal = () => {
    navigator.clipboard.writeText(getAwalCommand());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Try wallet connect
  const handleWalletConnect = async () => {
    setPaymentLoading(true);
    try {
      await createPaymentSession();
      setWalletConnected(true);
      setShowPayModal(false);
      setAppState(AppState.SHAKING);
      setStickCount(0);
      setCollectedSticks([]);
    } catch (e: any) {
      alert(e.message || 'Wallet connection failed');
    } finally {
      setPaymentLoading(false);
    }
  };

  // Skip payment — use free endpoint
  const handleSkipPayment = () => {
    setShowPayModal(false);
    setWalletConnected(false);
    setAppState(AppState.SHAKING);
    setStickCount(0);
    setCollectedSticks([]);
  };

  const handlePayment = () => {
    setShowPayModal(true);
  };

  const handleShake = () => {
    if (appState !== AppState.SHAKING) return;
    const duration = 2000;
    const shakeElement = document.getElementById('shaker-container');
    if(shakeElement) shakeElement.classList.add('animate-shake');

    setTimeout(async () => {
        if(shakeElement) shakeElement.classList.remove('animate-shake');
        const newStick = Math.floor(Math.random() * 100) + 1;
        const newCollection = [...collectedSticks, newStick];
        setCollectedSticks(newCollection);
        const nextCount = stickCount + 1;
        setStickCount(nextCount);

        if (nextCount >= 3) {
            setAppState(AppState.INTERPRETING);
            try {
                const result = await interpretFortune(newCollection, category!, language, wishText);
                setFortune(result);
                setAppState(AppState.RESULT);
            } catch (e) {
                console.error(e);
                setAppState(AppState.SHAKING);
                setStickCount(0);
                setCollectedSticks([]);
            }
        }
    }, duration);
  };

  const handleReset = () => {
    window.history.pushState({}, '', window.location.pathname);
    setFortune(null);
    setCategory(null);
    setAppState(AppState.IDLE);
    setStickCount(0);
    setCollectedSticks([]);
    setWalletConnected(false);
  };

  const hasWallet = typeof window !== 'undefined' && !!(window as any).ethereum;

  return (
    <div className="min-h-screen flex flex-col items-center py-6 px-4 font-serif text-temple-paper relative overflow-x-hidden">

      {/* Top Bar */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-6 z-50">
          <button
            onClick={() => setIsWhitepaperOpen(true)}
            className="text-xs md:text-sm text-temple-gold border border-temple-gold/50 px-3 py-1 rounded hover:bg-temple-gold hover:text-temple-dark transition-colors"
          >
            {t.whitepaperBtn}
          </button>
          <div className="flex space-x-1 bg-black/30 rounded p-1 backdrop-blur-sm">
            {(['zh-CN', 'zh-TW', 'en'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 rounded text-xs transition-colors ${language === lang ? 'bg-temple-gold text-temple-dark font-bold' : 'text-gray-300 hover:text-white'}`}
                >
                  {lang === 'zh-CN' ? '简' : lang === 'zh-TW' ? '繁' : 'EN'}
                </button>
            ))}
          </div>
      </div>

      <WhitepaperModal isOpen={isWhitepaperOpen} onClose={() => setIsWhitepaperOpen(false)} language={language} />

      <header className="mb-8 text-center relative w-full max-w-md">
        <div className="absolute -top-4 left-4 w-8 h-10 bg-red-600 rounded-lg shadow-lg animate-glow hidden md:block border border-temple-gold"></div>
        <div className="absolute -top-4 right-4 w-8 h-10 bg-red-600 rounded-lg shadow-lg animate-glow hidden md:block border border-temple-gold"></div>
        <h1 className="text-5xl md:text-7xl font-calligraphy text-temple-gold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] tracking-wide">
            {t.appTitle}
        </h1>
        <div className="h-1 w-24 bg-temple-gold mx-auto my-4 rounded-full shadow-[0_0_10px_#FFD700]"></div>
      </header>

      <main className="flex-1 w-full max-w-4xl flex flex-col items-center justify-center min-h-[500px] relative z-10">

        {/* IDLE */}
        {appState === AppState.IDLE && (
          <div className="text-center animate-fade-in flex flex-col items-center">
            <div className="w-64 h-64 mb-8 bg-temple-red/20 rounded-full border-4 border-temple-gold/30 flex items-center justify-center backdrop-blur-sm shadow-[0_0_50px_rgba(139,0,0,0.5)]">
                <span className="text-9xl font-calligraphy text-temple-gold opacity-80 select-none">福</span>
            </div>
            <button onClick={handleStart} className="group relative px-12 py-5 bg-transparent overflow-hidden rounded-full transition-all hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-b from-temple-gold to-yellow-600 border-2 border-white/20"></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 bg-white transition-opacity"></div>
                <span className="relative text-red-900 font-bold text-2xl font-serif tracking-widest flex items-center gap-2">{t.startBtn}</span>
            </button>
          </div>
        )}

        {/* CATEGORY SELECT */}
        {appState === AppState.CATEGORY_SELECT && (
             <div className="w-full max-w-lg bg-temple-paper/10 backdrop-blur-md border border-temple-gold/30 p-8 rounded-xl animate-fade-in">
                <h2 className="text-center text-2xl text-temple-gold font-serif mb-8 border-b border-temple-gold/20 pb-4">{t.categoryTitle}</h2>
                <div className="grid grid-cols-1 gap-4">
                    {(['career', 'wealth', 'love', 'health', 'family'] as WishCategory[]).map((cat) => (
                        <button key={cat} onClick={() => selectCategory(cat)} className="p-4 border border-temple-gold/40 rounded-lg hover:bg-temple-gold hover:text-temple-red transition-all text-lg font-serif tracking-widest text-left flex justify-between items-center group bg-black/20">
                            <span>{cat === 'career' ? t.catCareer : cat === 'wealth' ? t.catWealth : cat === 'love' ? t.catLove : cat === 'health' ? t.catHealth : t.catFamily}</span>
                            <span className="opacity-0 group-hover:opacity-100 transition-opacity">➜</span>
                        </button>
                    ))}
                </div>
             </div>
        )}

        {/* PAYMENT */}
        {appState === AppState.PAYMENT && (
            <div className="w-full max-w-md bg-temple-paper rounded-xl shadow-2xl overflow-hidden animate-fade-in border-4 border-temple-gold">
                <div className="bg-temple-red p-6 text-center border-b-4 border-yellow-600">
                    <h3 className="text-temple-gold font-bold text-xl font-serif tracking-widest">{t.payTitle}</h3>
                </div>
                <div className="p-8 text-temple-dark">
                    <div className="mb-6">
                      <h4 className="text-lg font-serif mb-2 text-temple-red">{t.wishTitle}</h4>
                      <textarea
                        value={wishText}
                        onChange={(e) => setWishText(e.target.value)}
                        className="w-full h-24 p-3 border border-temple-gold/40 rounded-lg bg-temple-paper/60 focus:outline-none focus:border-temple-red text-sm resize-none"
                        placeholder={t.wishPlaceholder}
                      />
                      <p className="mt-2 text-xs text-gray-500 leading-relaxed">{t.wishNote}</p>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg">C</div>
                      <p className="mb-6 text-gray-600 font-serif">{t.payDesc}</p>
                      <div className="text-4xl font-bold mb-8 text-temple-red font-mono text-center">0.1 USDC</div>
                      <button
                          onClick={handlePayment}
                          className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all flex justify-center items-center gap-2"
                      >
                          {t.payBtn}
                      </button>
                    </div>
                </div>
            </div>
        )}

        {/* PAYMENT MODAL */}
        {showPayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-temple-paper w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border-4 border-temple-gold">
              <div className="bg-temple-red p-4 flex justify-between items-center">
                <h3 className="text-white font-bold text-lg">
                  {language === 'zh-CN' ? '选择支付方式' : language === 'zh-TW' ? '選擇支付方式' : 'Choose Payment Method'}
                </h3>
                <button onClick={() => setShowPayModal(false)} className="text-white text-2xl leading-none hover:text-temple-gold">&times;</button>
              </div>

              <div className="p-6 space-y-4">
                {/* Option 1: Wallet Connect */}
                {hasWallet && (
                  <button
                    onClick={handleWalletConnect}
                    disabled={paymentLoading}
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-3"
                  >
                    <span className="text-2xl">🦊</span>
                    <div className="text-left flex-1">
                      <div>{language === 'zh-CN' ? '连接钱包支付' : language === 'zh-TW' ? '連接錢包支付' : 'Connect Wallet & Pay'}</div>
                      <div className="text-xs opacity-70">MetaMask / Coinbase Wallet</div>
                    </div>
                    {paymentLoading && (
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                  </button>
                )}

                {/* Option 2: Awal CLI for AI Agents */}
                <div className="border-2 border-temple-gold/40 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-bold text-temple-dark">
                        {language === 'zh-CN' ? 'AI Agent 命令' : language === 'zh-TW' ? 'AI Agent 指令' : 'AI Agent Command'}
                      </div>
                      <div className="text-xs text-gray-500">Awal x402 CLI</div>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                    {getAwalCommand()}
                  </div>
                  <button
                    onClick={handleCopyAwal}
                    className="mt-3 w-full py-2 bg-temple-dark text-temple-gold font-bold rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? (
                      <>{language === 'zh-CN' ? '已复制!' : language === 'zh-TW' ? '已複製!' : 'Copied!'}</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        {language === 'zh-CN' ? '一键复制命令' : language === 'zh-TW' ? '一鍵複製指令' : 'Copy Command'}
                      </>
                    )}
                  </button>
                </div>

                {/* Treasury info */}
                <div className="border border-gray-200 rounded-lg p-3 bg-white/50">
                  <div className="text-xs text-gray-500 mb-1">
                    {language === 'zh-CN' ? '收款地址 (Base 主网)' : language === 'zh-TW' ? '收款地址 (Base 主網)' : 'Treasury (Base Mainnet)'}
                  </div>
                  <div className="font-mono text-xs text-temple-dark break-all">{TREASURY}</div>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span>{language === 'zh-CN' ? '或者' : language === 'zh-TW' ? '或者' : 'or'}</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Skip — free version */}
                <button
                  onClick={handleSkipPayment}
                  className="w-full py-3 text-gray-500 hover:text-temple-red text-sm underline transition-colors"
                >
                  {language === 'zh-CN' ? '跳过支付，使用免费版本 (基础签文)' : language === 'zh-TW' ? '跳過支付，使用免費版本 (基礎籤文)' : 'Skip payment, use free version (basic fortune)'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SHAKING */}
        {appState === AppState.SHAKING && (
            <div className="flex flex-col items-center space-y-8 animate-fade-in w-full">
                <div id="shaker-container" className="transition-transform">
                     <StickCylinder isShaking={document.getElementById('shaker-container')?.classList.contains('animate-shake') || false} />
                </div>
                <div className="text-center z-20">
                    <h3 className="text-2xl text-temple-gold font-serif mb-2">{t.shakeTitle}</h3>
                    <p className="text-temple-paper/70 mb-6">{t.shakeInstruction(stickCount + 1)}</p>
                    <div className="flex gap-2 justify-center mb-6">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`w-3 h-3 rounded-full ${i < stickCount ? 'bg-temple-gold' : 'bg-gray-600'}`}></div>
                        ))}
                    </div>
                    <button onClick={handleShake} className="px-10 py-4 bg-temple-red border-2 border-temple-gold text-temple-gold font-bold text-xl rounded-full shadow-[0_0_20px_rgba(218,165,32,0.4)] hover:bg-red-900 hover:scale-105 transition-all active:scale-95">
                        {t.shakeBtn}
                    </button>
                </div>
            </div>
        )}

        {/* INTERPRETING */}
        {appState === AppState.INTERPRETING && (
            <div className="text-center animate-fade-in bg-black/40 p-10 rounded-xl backdrop-blur-sm border border-temple-gold/30">
                <div className="w-20 h-20 border-4 border-temple-gold border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <h2 className="text-3xl text-temple-gold font-calligraphy mb-4 tracking-widest">{t.interpreting}</h2>
                <div className="flex justify-center gap-4 mt-4 opacity-70">
                    {collectedSticks.map((num) => (
                        <span key={num} className="text-temple-paper font-mono">#{num}</span>
                    ))}
                </div>
            </div>
        )}

        {/* RESULT */}
        {appState === AppState.RESULT && fortune && (
            <ResultCard result={fortune} language={language} onReset={handleReset} />
        )}

      </main>

      <footer className="mt-12 text-temple-gold/40 text-xs font-serif text-center w-full border-t border-temple-gold/10 pt-4">
        <p>{t.footer}</p>
      </footer>
    </div>
  );
};

export default App;
