import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Scroll, Coins, RefreshCcw, ArrowRight } from 'lucide-react';

type AppState = 'welcome' | 'drawing' | 'interpreting' | 'result';
type Lang = 'zh-CN' | 'en' | 'zh-TW';

type Translation = {
  appTitle: string;
  subtitleLine1: string;
  subtitleLine2: string;
  costLabel: string;
  poweredBy: string;
  startButton: string;
  drawingTitle: (current: number, total: number) => string;
  shakingHintIdle: string;
  shakingHintActive: string;
  lotLabel: string;
  interpretingTitle: string;
  interpretingDescription: string;
  feeLabel: string;
  revealButton: string;
  consultingLabel: string;
  resultTitle: string;
  resetButton: string;
  interpretText: (lots: number[]) => string;
};

const translations: Record<Lang, Translation> = {
  'zh-CN': {
    appTitle: 'AI 新春福签',
    subtitleLine1: '连结一点数字世界的神秘感，',
    subtitleLine2: '用三支新春福签为你开个好头。',
    costLabel: '每次解签费用',
    poweredBy: '由 Agent Verse AI 驱动',
    startButton: '开始新春仪式',
    drawingTitle: (current, total) => `第 ${current} / ${total} 支福签`,
    shakingHintIdle: '点击签筒摇签，抽出属于你的福签',
    shakingHintActive: '灵签正在浮动，请稍候……',
    lotLabel: '签',
    interpretingTitle: '福签已定，开始解签',
    interpretingDescription:
      '这三支福签记录了你此刻的新年气运。支付后，AI 会结合签号与愿望方向，为你生成一份新春开运指引。',
    feeLabel: '费用',
    revealButton: '支付并解签（0.1 USDC）',
    consultingLabel: '正在请示 AI 神官……',
    resultTitle: 'AI 新春解签',
    resetButton: '再来一签，开启新的运势',
    interpretText: lots =>
      [
        `你抽到的福签为：${lots.map(l => `第 ${l} 号`).join('，')}。`,
        '第一支福签，象征新的开端与未知的机会，新的一年适合尝试之前不敢尝试的事情。',
        '第二支福签，提醒你在金钱与承诺上保持克制，不要因为一时冲动做出重要决定。',
        '第三支福签，预示贵人运与合作机缘，适合多与可信赖的人交流、共事。',
        '整体来看，这是「稳中有升」的一卦：守好当下的节奏，同时为未来预留空间，你的新一年将更顺利、更有惊喜。'
      ].join('\n\n')
  },
  en: {
    appTitle: 'AI Lunar New Year Fortune',
    subtitleLine1: 'Connect with a touch of digital magic,',
    subtitleLine2: 'let three New Year lots bless your year ahead.',
    costLabel: 'Cost per session',
    poweredBy: 'Powered by Agent Verse AI',
    startButton: 'Start New Year Ritual',
    drawingTitle: (current, total) => `Draw ${current} of ${total}`,
    shakingHintIdle: 'Tap the container to shake and reveal your fortune lot',
    shakingHintActive: 'Channeling your fortune...',
    lotLabel: 'Lot',
    interpretingTitle: 'The lots are cast',
    interpretingDescription:
      'These three lots reflect your current New Year energy. After payment, the AI oracle will interpret them and craft a personal blessing for you.',
    feeLabel: 'Fee',
    revealButton: 'Pay & Reveal (0.1 USDC)',
    consultingLabel: 'Consulting the oracle...',
    resultTitle: "Oracle's Decree",
    resetButton: 'Start a new session',
    interpretText: lots =>
      [
        `Based on your draw of lots #${lots.join(', #')}:`,
        'The first lot suggests a beginning emerging from mist, inviting you to step toward a future that is not yet fully defined.',
        'The second lot indicates caution around money and quick commitments; slow down before you sign or spend.',
        'The third lot hints at support from allies and strangers alike, reminding you to stay open to new connections.',
        'Taken together, these lots speak of steady growth: protect your foundation, welcome authentic opportunities, and your year will unfold with quiet but meaningful blessings.'
      ].join('\n\n')
  },
  'zh-TW': {
    appTitle: 'AI 新春福籤',
    subtitleLine1: '連結一點數位世界的神秘感，',
    subtitleLine2: '讓三支新春福籤替你開個好頭。',
    costLabel: '每次解籤費用',
    poweredBy: '由 Agent Verse AI 驅動',
    startButton: '開始新春儀式',
    drawingTitle: (current, total) => `第 ${current} / ${total} 支福籤`,
    shakingHintIdle: '點擊籤筒搖籤，抽出屬於你的福籤',
    shakingHintActive: '靈籤正在浮動，請稍候……',
    lotLabel: '籤',
    interpretingTitle: '福籤已定，開始解籤',
    interpretingDescription:
      '這三支福籤映照出你此刻的新年氣運。支付後，AI 會依照籤號與心願方向，為你生成一份新春開運指引。',
    feeLabel: '費用',
    revealButton: '支付並解籤（0.1 USDC）',
    consultingLabel: '正在請示 AI 神官……',
    resultTitle: 'AI 新春解籤',
    resetButton: '再來一籤，開啟新的運勢',
    interpretText: lots =>
      [
        `你抽到的福籤為：${lots.map(l => `第 ${l} 號`).join('，')}。`,
        '第一支福籤象徵新的起點與未知契機，新的一年適合嘗試先前不敢開始的計畫。',
        '第二支福籤提醒你在金錢與承諾上保持節制，不要因為一時衝動做出關鍵決定。',
        '第三支福籤預示貴人緣與合作機會，適合多與值得信賴的人交流、共事。',
        '整體來看，這是一卦「穩中漸旺」的籤象：守好腳步、預留彈性，你的新一年將更順遂，也更有驚喜。'
      ].join('\n\n')
  }
};

function App() {
  const [state, setState] = useState<AppState>('welcome');
  const [lang, setLang] = useState<Lang>('zh-CN');
  const [drawnFortunes, setDrawnFortunes] = useState<number[]>([]);
  const [isShaking, setIsShaking] = useState(false);
  const [interpretation, setInterpretation] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const REQUIRED_DRAWS = 3;
  const t = translations[lang];

  const handleStart = () => {
    setState('drawing');
    setDrawnFortunes([]);
  };

  const handleShake = () => {
    if (isShaking || state !== 'drawing') return;

    setIsShaking(true);
    setTimeout(() => {
      setIsShaking(false);
      setDrawnFortunes(prevLots => {
        const nextLots = [...prevLots, Math.floor(Math.random() * 100) + 1];
        if (nextLots.length >= 3) {
          setTimeout(() => setState('interpreting'), 1000);
        }
        return nextLots;
      });
    }, 500);
  };

  const handleInterpret = async () => {
    setLoading(true);
    setTimeout(() => {
      setInterpretation(t.interpretText(drawnFortunes));
      setLoading(false);
      setState('result');
    }, 2000);
  };

  const handleReset = () => {
    setState('welcome');
    setDrawnFortunes([]);
    setInterpretation('');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 font-sans overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-64 h-64 bg-purple-600 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-600 rounded-full blur-[100px]" />
      </div>

      <div className="absolute top-4 right-4 z-20 flex gap-2 text-xs">
        <button
          onClick={() => setLang('zh-CN')}
          className={`px-2 py-1 rounded-full border ${
            lang === 'zh-CN' ? 'bg-white text-gray-900 border-white' : 'border-gray-600 text-gray-300'
          }`}
        >
          简
        </button>
        <button
          onClick={() => setLang('en')}
          className={`px-2 py-1 rounded-full border ${
            lang === 'en' ? 'bg-white text-gray-900 border-white' : 'border-gray-600 text-gray-300'
          }`}
        >
          EN
        </button>
        <button
          onClick={() => setLang('zh-TW')}
          className={`px-2 py-1 rounded-full border ${
            lang === 'zh-TW' ? 'bg-white text-gray-900 border-white' : 'border-gray-600 text-gray-300'
          }`}
        >
          繁
        </button>
      </div>

      <div className="z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          {state === 'welcome' && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="mb-8 relative inline-block">
                <Sparkles className="w-16 h-16 text-yellow-400 mx-auto animate-pulse" />
                <div className="absolute inset-0 bg-yellow-400 blur-xl opacity-30" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-200 to-amber-500 bg-clip-text text-transparent">
                {t.appTitle}
              </h1>
              <p className="text-gray-400 text-lg">
                {t.subtitleLine1}
                <br />
                {t.subtitleLine2}
              </p>

              <div className="bg-gray-800/50 p-4 rounded-xl border border-gray-700 backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm text-gray-300 mb-2">
                  <span>{t.costLabel}</span>
                  <span className="flex items-center text-yellow-400 font-bold">
                    <Coins className="w-4 h-4 mr-1" /> 0.1 USDC
                  </span>
                </div>
                <p className="text-xs text-gray-500 text-left">{t.poweredBy}</p>
              </div>

              <button
                onClick={handleStart}
                className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full font-bold text-lg shadow-lg hover:shadow-purple-500/30 transition-all active:scale-95 w-full"
              >
                <span className="flex items-center justify-center">
                  {t.startButton}{' '}
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </button>
            </motion.div>
          )}

          {state === 'drawing' && (
            <motion.div
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
          <h2 className="text-2xl font-bold mb-8 text-purple-200">
            {t.drawingTitle(drawnFortunes.length + 1, REQUIRED_DRAWS)}
          </h2>

              <div className="h-64 flex items-center justify-center mb-8 relative">
                {/* Cylinder */}
                <motion.div
                  animate={isShaking ? {
                    x: [-5, 5, -5, 5, 0],
                    rotate: [-5, 5, -5, 5, 0],
                  } : {}}
                  transition={{ duration: 0.5 }}
                  onClick={handleShake}
                  className="w-32 h-48 bg-gradient-to-b from-red-900 to-red-950 rounded-b-xl rounded-t-lg border-2 border-yellow-600/50 flex items-center justify-center cursor-pointer shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-2 w-24 h-1 bg-black/30 rounded-full" />
                  <span className="text-4xl select-none">🀄</span>
                  
                  {/* Falling stick animation */}
                  <AnimatePresence>
                     {/* Visual cue for sticks inside */}
                  </AnimatePresence>
                </motion.div>
              </div>

              <p className="text-gray-400 mb-8 animate-pulse">
                {isShaking ? t.shakingHintActive : t.shakingHintIdle}
              </p>

              <div className="flex justify-center gap-4">
                {drawnFortunes.map((lot, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-12 h-24 bg-yellow-100 text-red-900 border border-yellow-600 flex flex-col items-center justify-center rounded shadow-lg"
                  >
                    <span className="text-xs font-bold">{t.lotLabel}</span>
                    <span className="text-xl font-bold">{lot}</span>
                  </motion.div>
                ))}
                {Array.from({ length: REQUIRED_DRAWS - drawnFortunes.length }).map((_, idx) => (
                  <div key={`placeholder-${idx}`} className="w-12 h-24 border-2 border-dashed border-gray-700 rounded opacity-50" />
                ))}
              </div>
            </motion.div>
          )}

          {state === 'interpreting' && (
            <motion.div
              key="interpreting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center max-w-md w-full"
            >
              <h2 className="text-2xl font-bold mb-6 text-purple-200">{t.interpretingTitle}</h2>

              <div className="flex justify-center gap-6 mb-8">
                {drawnFortunes.map((lot, idx) => (
                  <div
                    key={idx}
                    className="w-16 h-32 bg-yellow-100 text-red-900 border-2 border-yellow-600 flex flex-col items-center justify-center rounded shadow-lg"
                  >
                    <span className="text-xs font-bold uppercase mb-2">{t.lotLabel}</span>
                    <span className="text-3xl font-bold">{lot}</span>
                  </div>
                ))}
              </div>

              <div className="bg-gray-800/80 p-6 rounded-xl border border-gray-700 mb-6">
                <p className="text-gray-300 mb-4">{t.interpretingDescription}</p>
                <div className="flex justify-between items-center text-sm border-t border-gray-700 pt-4">
                  <span className="text-gray-400">{t.feeLabel}</span>
                  <span className="text-yellow-400 font-bold">0.1 USDC</span>
                </div>
              </div>

              <button
                onClick={handleInterpret}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <RefreshCcw className="w-5 h-5 mr-2 animate-spin" />
                    {t.consultingLabel}
                  </>
                ) : (
                  <>
                    <Scroll className="w-5 h-5 mr-2" />
                    {t.revealButton}
                  </>
                )}
              </button>
            </motion.div>
          )}

          {state === 'result' && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-lg bg-gray-800/90 p-8 rounded-2xl border border-purple-500/30 shadow-2xl backdrop-blur-md"
            >
              <div className="flex items-center justify-center mb-6">
                <Sparkles className="w-8 h-8 text-yellow-400 mr-2" />
                <h2 className="text-2xl font-bold text-white">{t.resultTitle}</h2>
                <Sparkles className="w-8 h-8 text-yellow-400 ml-2" />
              </div>

              <div className="prose prose-invert max-w-none mb-8 text-left">
                {interpretation.split('\n').map((line, i) => (
                  <p key={i} className="mb-2 text-gray-300 leading-relaxed">
                    {line}
                  </p>
                ))}
              </div>

              <button
                onClick={handleReset}
                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                {t.resetButton}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default App;
