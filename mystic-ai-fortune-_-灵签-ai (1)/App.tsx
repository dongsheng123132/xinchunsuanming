import React, { useState, useEffect } from 'react';
import { AppState, FortuneResult, Language, WishCategory } from './types';
import { TRANSLATIONS } from './translations';
import { ResultCard } from './components/ResultCard';
import { WhitepaperModal } from './components/WhitepaperModal';

const API_URL = 'https://xinchunsuanming.vercel.app';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [category, setCategory] = useState<WishCategory | null>(null);
  const [language, setLanguage] = useState<Language>('zh-CN');
  const [isWhitepaperOpen, setIsWhitepaperOpen] = useState(false);
  const [wishText, setWishText] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [copied, setCopied] = useState('');
  const [commerceOpened, setCommerceOpened] = useState(false);
  const [interpreting, setInterpreting] = useState(false);
  const [chargeId, setChargeId] = useState<string | null>(null);
  const [creatingCharge, setCreatingCharge] = useState(false);

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
    const cat = params.get('category') as WishCategory | null;
    if (cat && ['career','wealth','love','health','family'].includes(cat)) {
      setCategory(cat);
      const lang = params.get('lang') as Language | null;
      if (lang) setLanguage(lang);
      setAppState(AppState.PAYMENT);
    }
  }, []);

  const t = TRANSLATIONS[language];

  const handleStart = () => setAppState(AppState.CATEGORY_SELECT);

  const selectCategory = (cat: WishCategory) => {
    setCategory(cat);
    setWishText('');
    setAppState(AppState.PAYMENT);
  };

  // Generate the raw Awal CLI command
  const getAwalCommand = () => {
    const bodyObj: Record<string, string> = { category: category || 'career', language };
    if (wishText) bodyObj.wishText = wishText;
    return `npx awal x402 pay ${API_URL}/api/fortune/interpret -X POST -H "Content-Type: application/json" -d '${JSON.stringify(bodyObj)}'`;
  };

  // Generate full AI prompt with context (for copying to AI agents)
  const getAIPrompt = () => {
    const cat = category || 'career';
    const catLabel = cat === 'career' ? '事业前程' : cat === 'wealth' ? '财运亨通' : cat === 'love' ? '姻缘情感' : cat === 'health' ? '身体健康' : '阖家平安';
    const bodyObj: Record<string, string> = { category: cat, language };
    if (wishText) bodyObj.wishText = wishText;
    const cmd = `npx awal x402 pay ${API_URL}/api/fortune/interpret -X POST -H "Content-Type: application/json" -d '${JSON.stringify(bodyObj)}'`;

    return `# 🔮 AI Fortune Oracle — 请帮我求签

## 任务
请帮我使用 x402 协议支付 0.01 USDC，调用 AI 算命 API 求一支「${catLabel}」签。${wishText ? `\n\n我的心愿：${wishText}` : ''}

## 前提条件
你需要先安装 Awal CLI 并配置钱包：
\`\`\`bash
npm install -g awal
npx awal auth login your-email@example.com   # 用你的邮箱注册/登录
npx awal auth verify <FLOW_ID> <6_DIGIT_CODE> # 验证邮箱验证码
npx awal address   # 查看你的钱包地址
npx awal balance   # 查看余额（需要 Base 链上的 USDC）
\`\`\`

钱包需要有至少 0.01 USDC（Base 链）。可从交易所购买 USDC 转到 Base 链。

## 执行命令
\`\`\`bash
${cmd}
\`\`\`

## 返回结果说明
支付成功后，API 返回 JSON：
- \`stickNumbers\`: 三支签号（由支付凭证自动生成，每次唯一）
- \`mainPoem\`: 四句签诗
- \`overallLuck\`: 运势评级（如 "中上 · 穩中有升"）
- \`explanation\`: 运势详解
- \`advice\`: 大师建议

## API 完整文档
${API_URL}/skill.md

请在收到结果后，用中文为我解读签文内容。`;
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  // Create dynamic Commerce charge and open payment page
  const handleCommercePay = async () => {
    if (chargeId) {
      // Already created a charge, just reopen
      window.open(`https://commerce.coinbase.com/charges/${chargeId}`, '_blank');
      setCommerceOpened(true);
      return;
    }
    setCreatingCharge(true);
    try {
      const res = await fetch(`${API_URL}/api/create-charge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, language }),
      });
      if (!res.ok) throw new Error(`Failed to create charge: ${res.status}`);
      const data = await res.json();
      setChargeId(data.charge_id);
      window.open(data.hosted_url, '_blank');
      setCommerceOpened(true);
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to create payment');
    } finally {
      setCreatingCharge(false);
    }
  };

  // After Commerce payment confirmed by user, verify and fetch fortune
  const handleCommerceConfirm = async () => {
    if (!chargeId) {
      alert(language === 'zh-CN' ? '请先完成支付' : language === 'zh-TW' ? '請先完成支付' : 'Please complete payment first');
      return;
    }
    setShowPayModal(false);
    setCommerceOpened(false);
    setAppState(AppState.INTERPRETING);
    setInterpreting(true);
    try {
      const res = await fetch(`${API_URL}/api/fortune/interpret-commerce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ charge_id: chargeId, category, language, wishText }),
      });
      const result = await res.json();
      if (!res.ok) {
        // Payment not verified
        if (res.status === 402) {
          alert(result.message || (language === 'zh-CN' ? '未检测到支付，请先完成支付' : 'Payment not detected'));
          setAppState(AppState.PAYMENT);
          setShowPayModal(true);
          setCommerceOpened(true);
          return;
        }
        throw new Error(result.error || `Server error: ${res.status}`);
      }
      setFortune(result);
      setAppState(AppState.RESULT);
      setChargeId(null); // Reset for next use
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Interpretation failed');
      setAppState(AppState.PAYMENT);
    } finally {
      setInterpreting(false);
    }
  };

  const handlePayment = () => {
    setShowPayModal(true);
    setCommerceOpened(false);
  };

  const handleReset = () => {
    window.history.pushState({}, '', window.location.pathname);
    setFortune(null);
    setCategory(null);
    setAppState(AppState.IDLE);
    setCommerceOpened(false);
    setChargeId(null);
  };

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
                      <div className="text-4xl font-bold mb-4 text-temple-red font-mono text-center">0.01 USDC</div>
                      <p className="text-xs text-gray-500 mb-6">
                        {language === 'zh-CN' ? '签号由支付凭证自动生成，每次支付对应唯一签文' : language === 'zh-TW' ? '簽號由支付憑證自動生成，每次支付對應唯一簽文' : 'Stick numbers derived from payment — each payment generates a unique fortune'}
                      </p>
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
            <div className="bg-temple-paper w-full max-w-lg rounded-xl overflow-hidden shadow-2xl border-4 border-temple-gold max-h-[90vh] overflow-y-auto">
              <div className="bg-temple-red p-4 flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-white font-bold text-lg">
                  {language === 'zh-CN' ? '选择支付方式' : language === 'zh-TW' ? '選擇支付方式' : 'Choose Payment Method'}
                </h3>
                <button onClick={() => setShowPayModal(false)} className="text-white text-2xl leading-none hover:text-temple-gold">&times;</button>
              </div>

              <div className="p-6 space-y-4">

                {/* Option 1: Coinbase Commerce */}
                {!commerceOpened ? (
                  <button
                    onClick={handleCommercePay}
                    disabled={creatingCharge}
                    className="w-full p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all flex items-center gap-3 disabled:opacity-50"
                  >
                    {creatingCharge ? (
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <span className="text-2xl">💳</span>
                    )}
                    <div className="text-left flex-1">
                      <div>{creatingCharge
                        ? (language === 'zh-CN' ? '创建支付订单...' : language === 'zh-TW' ? '建立支付訂單...' : 'Creating payment...')
                        : (language === 'zh-CN' ? 'Coinbase Commerce 支付' : language === 'zh-TW' ? 'Coinbase Commerce 支付' : 'Pay with Coinbase Commerce')
                      }</div>
                      <div className="text-xs opacity-70">{language === 'zh-CN' ? '支持多种加密货币，由 Coinbase 处理' : language === 'zh-TW' ? '支援多種加密貨幣，由 Coinbase 處理' : 'Multiple cryptocurrencies, powered by Coinbase'}</div>
                    </div>
                  </button>
                ) : (
                  <div className="border-2 border-green-500/60 rounded-lg p-4 bg-green-50 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">✅</span>
                      <div>
                        <div className="font-bold text-green-800">
                          {language === 'zh-CN' ? 'Coinbase Commerce 已打开' : language === 'zh-TW' ? 'Coinbase Commerce 已開啟' : 'Coinbase Commerce opened'}
                        </div>
                        <div className="text-xs text-green-600">
                          {language === 'zh-CN' ? '请在新窗口中完成支付' : language === 'zh-TW' ? '請在新視窗中完成支付' : 'Please complete payment in the new window'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCommerceConfirm}
                      disabled={interpreting}
                      className="w-full py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-bold rounded-lg shadow hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {interpreting ? (
                        <>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {language === 'zh-CN' ? '解签中...' : language === 'zh-TW' ? '解籤中...' : 'Interpreting...'}
                        </>
                      ) : (
                        <>
                          🔮 {language === 'zh-CN' ? '我已支付完成，开始解签' : language === 'zh-TW' ? '我已支付完成，開始解籤' : "I've paid — get my fortune"}
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCommercePay}
                      className="w-full py-2 text-blue-600 text-sm underline hover:text-blue-800"
                    >
                      {language === 'zh-CN' ? '重新打开支付页面' : language === 'zh-TW' ? '重新開啟支付頁面' : 'Reopen payment page'}
                    </button>
                  </div>
                )}

                {/* Divider */}
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <div className="flex-1 h-px bg-gray-300"></div>
                  <span>AI Agent x402</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>

                {/* Option 2: Awal CLI for AI Agents (x402) */}
                <div className="border-2 border-temple-gold/40 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-bold text-temple-dark">
                        {language === 'zh-CN' ? '让 AI 帮你求签 (x402)' : language === 'zh-TW' ? '讓 AI 幫你求籤 (x402)' : 'Let AI Get Your Fortune (x402)'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {language === 'zh-CN' ? '复制完整提示词，粘贴给你的 AI（Claude/ChatGPT 等）' : language === 'zh-TW' ? '複製完整提示詞，貼給你的 AI（Claude/ChatGPT 等）' : 'Copy full prompt, paste to your AI (Claude/ChatGPT etc.)'}
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                    {getAwalCommand()}
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <a href={`${API_URL}/skill.md`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">
                      {language === 'zh-CN' ? '查看完整 AI 文档 (skill.md)' : language === 'zh-TW' ? '查看完整 AI 文檔 (skill.md)' : 'View full AI docs (skill.md)'}
                    </a>
                  </div>
                  <button
                    onClick={() => handleCopy(getAIPrompt(), 'awal')}
                    className="mt-3 w-full py-2 bg-temple-dark text-temple-gold font-bold rounded-lg hover:bg-black transition-colors flex items-center justify-center gap-2"
                  >
                    {copied === 'awal' ? (
                      <>{language === 'zh-CN' ? '已复制完整提示词!' : language === 'zh-TW' ? '已複製完整提示詞!' : 'Full prompt copied!'}</>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012-2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                        {language === 'zh-CN' ? '一键复制 AI 提示词' : language === 'zh-TW' ? '一鍵複製 AI 提示詞' : 'Copy AI Prompt'}
                      </>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* INTERPRETING */}
        {appState === AppState.INTERPRETING && (
            <div className="text-center animate-fade-in bg-black/40 p-10 rounded-xl backdrop-blur-sm border border-temple-gold/30">
                <div className="w-20 h-20 border-4 border-temple-gold border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
                <h2 className="text-3xl text-temple-gold font-calligraphy mb-4 tracking-widest">{t.interpreting}</h2>
                <p className="text-temple-paper/60 text-sm">
                  {language === 'zh-CN' ? '支付已确认，大师正在为您抽签解签...' : language === 'zh-TW' ? '支付已確認，大師正在為您抽籤解籤...' : 'Payment confirmed, the master is drawing your fortune sticks...'}
                </p>
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
