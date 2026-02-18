import { Language } from "./types";

export const TRANSLATIONS: Record<Language, {
  appTitle: string;
  whitepaperBtn: string;
  closeBtn: string;
  startBtn: string;
  
  categoryTitle: string;
  catCareer: string;
  catWealth: string;
  catLove: string;
  catHealth: string;
  catFamily: string;

  wishTitle: string;
  wishPlaceholder: string;
  wishNote: string;
  
  payTitle: string;
  payDesc: string;
  payBtn: string;
  processing: string;
  
  shakeTitle: string;
  shakeInstruction: (count: number) => string;
  shakeBtn: string;
  
  interpreting: string;
  
  resultTitle: string;
  luckLabel: string;
  poemLabel: string;
  explainLabel: string;
  adviceLabel: string;
  againBtn: string;
  
  footer: string;
  
  whitepaperTitle: string;
  whitepaperContent: string;

  saveImageBtn: string;
  copyLinkBtn: string;
  linkCopied: string;
  shareModalTitle: string;
  shareModalDesc: string;
}> = {
  en: {
    appTitle: "New Year Wish Sticks · Write your prayer on-chain with x402",
    whitepaperBtn: "Whitepaper",
    closeBtn: "Close",
    startBtn: "Enter Shrine",
    
    categoryTitle: "Choose a direction for your wish",
    catCareer: "Career & Growth",
    catWealth: "Wealth & Stability",
    catLove: "Love & Relationships",
    catHealth: "Health & Energy",
    catFamily: "Family & Safety",

    wishTitle: "Write down your New Year wish",
    wishPlaceholder: "For example: I hope to smoothly change my career this year and find work I truly enjoy.",
    wishNote: "This text will not be made public. It will be treated as your personal New Year prayer and used together with the three sticks to generate a more tailored blessing and guidance.",
    
    payTitle: "Offering of Sincerity",
    payDesc: "Offer 0.1 USDC via x402 to seal this wish on-chain.",
    payBtn: "Offer 0.1 USDC",
    processing: "Processing Offering...",
    
    shakeTitle: "Ask the Oracle",
    shakeInstruction: (count) => `Shake for Stick #${count} of 3`,
    shakeBtn: "Shake Cylinder",
    
    interpreting: "The AI Master is consulting the heavens...",
    
    resultTitle: "Oracle's Decree",
    luckLabel: "Fortune Level",
    poemLabel: "The Verse",
    explainLabel: "Interpretation",
    adviceLabel: "Guidance",
    againBtn: "Draw Again",
    
    footer: "© 2024 AI New Year Fortune · x402 Lucky Shrine",
    
    whitepaperTitle: "Whitepaper: AI New Year Fortune Stick · x402 Lucky Shrine",
    whitepaperContent: `
      ## Introduction
      This is an "AI Lucky Fortune" application built for the Lunar New Year. Users select a wish direction (Career, Wealth, Love, Health, Family), draw three lucky sticks, and receive an exclusive New Year blessing and actionable advice interpreted by AI.

      ## Technology & Payment
      Every interpretation uses the Coinbase x402 protocol, requiring a payment of **0.1 USDC**. This ensures a transparent, pay-per-use model without complex account systems, perfect for lightweight AI agent interactions.
      
      ## Development Standards
      - **Coinbase CDP SDK**: Used for secure, standard API Key authentication.
      - **AI Integration**: Powered by Google Gemini for deep cultural interpretation.
    `,

    saveImageBtn: "Save Image",
    copyLinkBtn: "Copy Link",
    linkCopied: "Link Copied!",
    shareModalTitle: "Save Your Fortune",
    shareModalDesc: "Long press the image below to save it to your photos, then share it with friends!",
  },
  'zh-CN': {
    appTitle: "新春心愿签 · 用 x402 为心愿上香",
    whitepaperBtn: "项目白皮书",
    closeBtn: "关闭",
    startBtn: "进入神坛",
    
    categoryTitle: "请选择本次祈愿的方向",
    catCareer: "事业前程",
    catWealth: "财运亨通",
    catLove: "姻缘情感",
    catHealth: "身体健康",
    catFamily: "阖家平安",

    wishTitle: "写下你的新春心愿",
    wishPlaceholder: "例如：希望今年顺利完成职业转型，找到更喜欢的工作。",
    wishNote: "这段话不会公开展示，但会与本次求签一起，被视作你写给这一年的认真祈愿。AI 解签时会结合「方向 + 心愿内容 + 三支签号」给出更贴近你当下状态的祝福与建议。",
    
    payTitle: "香火供奉",
    payDesc: "通过 x402 协议支付 0.1 USDC 香火钱，将这份心愿郑重立为新春祈愿。",
    payBtn: "支付 0.1 USDC",
    processing: "确认香火中...",
    
    shakeTitle: "诚心求籤",
    shakeInstruction: (count) => `摇出第 ${count} 支灵籤 (共3支)`,
    shakeBtn: "摇动籤筒",
    
    interpreting: "AI 大师正在解籤...",
    
    resultTitle: "新春籤文",
    luckLabel: "运势",
    poemLabel: "籤诗",
    explainLabel: "籤文详解",
    adviceLabel: "大师指点",
    againBtn: "再求一籤",
    
    footer: "© 2024 AI 新春福籤 · x402 开运小神坛",
    
    whitepaperTitle: "白皮书：AI 新春福籤 · x402 开运小神坛",
    whitepaperContent: `
      ## 项目简介
      这是一个为农历新年打造的「AI 开运福籤」应用。用户可以选择一个心愿方向（事业、财运、感情、健康、阖家平安），通过摇籤筒抽出三支新年福籤，接着由 AI 为你解籤，送上一份专属的新春祝福与行动建议。

      ## 核心机制
      - **仪式感**：三籤定运，诚心祈福。
      - **支付协议**：每一次解籤都透过 Coinbase x402 协议，以 **0.1 USDC** 完成支付。
      - **安全透明**：按次收费，无需复杂帐号系统，非常适合 AI Agent 以及个人用户轻量使用。
      
      ## 开发规范
      - 严格遵循 Coinbase CDP SDK 标准。
      - 结合 Google Gemini 模型进行深度传统文化解读。
    `,

    saveImageBtn: "生成分享图",
    copyLinkBtn: "复制链接",
    linkCopied: "链接已复制！",
    shareModalTitle: "保存您的福籤",
    shareModalDesc: "长按下方图片保存到相册，分享到朋友圈集赞祈福！",
  },
  'zh-TW': {
    appTitle: "新春心願籤 · 用 x402 為祈願上香",
    whitepaperBtn: "項目白皮書",
    closeBtn: "關閉",
    startBtn: "進入神壇",
    
    categoryTitle: "請選擇本次祈願的方向",
    catCareer: "事業前程",
    catWealth: "財運亨通",
    catLove: "姻緣情感",
    catHealth: "身體健康",
    catFamily: "闔家平安",

    wishTitle: "寫下你的新春心願",
    wishPlaceholder: "例如：希望今年順利完成職涯轉換，找到更喜歡的工作。",
    wishNote: "這段話不會公開展示，但會與本次求籤一起，被視作你寫給這一年的認真祈願。AI 解籤時會結合「方向 + 心願內容 + 三支籤號」給出更貼近你當下狀態的祝福與建議。",
    
    payTitle: "香火供奉",
    payDesc: "透過 x402 協議支付 0.1 USDC 香火錢，將這份心願鄭重立為新春祈願。",
    payBtn: "支付 0.1 USDC",
    processing: "確認香火中...",
    
    shakeTitle: "誠心求籤",
    shakeInstruction: (count) => `搖出第 ${count} 支靈籤 (共3支)`,
    shakeBtn: "搖動籤筒",
    
    interpreting: "AI 大師正在解籤...",
    
    resultTitle: "新春籤文",
    luckLabel: "運勢",
    poemLabel: "籤詩",
    explainLabel: "籤文詳解",
    adviceLabel: "大師指點",
    againBtn: "再求一籤",
    
    footer: "© 2024 AI 新春福籤 · x402 開運小神壇",
    
    whitepaperTitle: "白皮書：AI 新春福籤 · x402 開運小神壇",
    whitepaperContent: `
      ## 專案簡介
      這是一個為農曆新年打造的「AI 開運福籤」應用。用戶可以先選擇一個心願方向（事業、財運、感情、健康、闔家平安），透過搖籤筒抽出三支新年福籤，接著由 AI 為你解籤，送上一份專屬的新春祝福與行動建議，讓新的一年更有儀式感與好運加持。

      ## 技術與支付
      每一次解籤都透過 Coinbase x402 協議，以 **0.1 USDC** 完成支付，安全透明、按次收費，無需複雜帳號系統，非常適合 AI Agent 以及個人用戶輕量使用。
      
      ## 開發規範
      - **Coinbase CDP SDK**：確保支付流程安全合規。
      - **Google Gemini**：結合傳統易經與現代 AI 技術。
    `,

    saveImageBtn: "生成分享圖",
    copyLinkBtn: "複製連結",
    linkCopied: "連結已複製！",
    shareModalTitle: "保存您的福籤",
    shareModalDesc: "長按下方圖片保存到相冊，分享到朋友圈集贊祈福！",
  }
};
