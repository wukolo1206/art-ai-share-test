const CATS = {
  visual:  {name:"視覺藝術", c:"var(--visual)",  cs:"var(--visual-soft)",
            intro:"用 AI 探索色彩、構圖與風格，再加入自己的觀察與修改，完成一件屬於你的視覺作品。",
            ideas:["情緒色彩海報","對比色實驗","我的心情自畫像","校園風景再想像","AI 草圖 + 手繪完稿"],
            accept:"image/*,video/*"},
  music:   {name:"音樂藝術", c:"var(--music)",   cs:"var(--music-soft)",
            intro:"用 AI 發想旋律、節奏與歌詞，聆聽、比較並調整，說出這段音樂表達了什麼。",
            ideas:["一分鐘心情配樂","為畫作配上音樂","校歌風格改編","節奏實驗","歌詞共創"],
            accept:"audio/*,video/*"},
  perform: {name:"表演藝術", c:"var(--perform)", cs:"var(--perform-soft)",
            intro:"用 AI 協助劇本、分鏡、影像或配音，結合肢體與聲音表演，完成一段演出紀錄。",
            ideas:["AI 分鏡短劇","動作偵測舞蹈","角色配音","情緒默劇","故事接龍劇本"],
            accept:"video/*,image/*,audio/*"}
};

const PROJECTS = [
  {cat:"visual", icon:"🐱", title:"對比色貓咪彩繪玻璃", url:"",
   ai:["Claude"], grade:"國中八年級",
   idea:"以彩繪玻璃貓咪為主題，讓學生在塗色遊戲中觀察與運用對比色（互補色），體驗色彩並置時產生的強烈視覺效果。",
   use:"先講解色相環與互補色，再讓學生用遊戲完成配色，最後分享自己選色的理由。"},
  {cat:"visual", icon:"🔴", title:"點點心情小卡", url:"",
   ai:["Claude"], grade:"國中八年級",
   idea:"結合草間彌生的圓點語彙與 SEL 自我覺察，學生選一個代表心情的顏色，依心情強弱選擇點點大小貼滿點點牆，並寫下心情紀錄。",
   use:"課堂開始時進行情緒暖身，下載的心情小卡可上傳到 Padlet 分享。"},
  {cat:"music", icon:"🎵", title:"（範例）情緒配樂實驗室", url:"",
   ai:["Suno"], grade:"國中",
   idea:"請在這裡寫下設計理念：想讓學生學到什麼？為什麼用 AI？",
   use:"請在這裡寫下課堂使用方式。"},
  {cat:"perform", icon:"🎭", title:"（範例）動作偵測舞蹈遊戲", url:"",
   ai:["Teachable Machine"], grade:"國中",
   idea:"請在這裡寫下設計理念：想讓學生學到什麼？為什麼用 AI？",
   use:"請在這裡寫下課堂使用方式。"}
];

const TOOLS = [
  {cat:"visual", name:"Adobe Firefly", url:"https://firefly.adobe.com/", desc:"Adobe 的生成式 AI，可用文字產生圖像、擴展畫面或替換局部。", use:"用提示詞產生主視覺，再以生成填色修改局部。"},
  {cat:"visual", name:"Canva 魔法工作室", url:"https://www.canva.com/", desc:"Canva 內建的 AI 功能，可生成圖像並直接排版成海報或簡報。", use:"製作情緒海報、展覽文宣。"},
  {cat:"visual", name:"Google Gemini", url:"https://gemini.google.com/", desc:"Google 的 AI 助理，可對話生成與修改圖像，也能協助發想創作概念。", use:"以對話方式逐步修改作品構圖與色彩。"},
  {cat:"visual", name:"ChatGPT", url:"https://chatgpt.com/", desc:"OpenAI 的 AI 助理，可生成圖像、修改圖片並協助撰寫創作說明。", use:"把草圖變成不同風格的版本做比較。"},
  {cat:"visual", name:"Google Arts & Culture", url:"https://artsandculture.google.com/", desc:"Google 的藝術文化平台，收錄大量館藏與 AI 互動實驗。", use:"鑑賞名作、探索藝術風格與色彩。"},

  {cat:"music", name:"Suno", url:"https://suno.com/", desc:"以文字描述產生含人聲的完整歌曲，可指定曲風與歌詞。", use:"輸入自己寫的歌詞，比較不同曲風的效果。"},
  {cat:"music", name:"Google 音樂 AI（Lyria / Labs）", url:"https://labs.google/", desc:"Google 的音樂生成模型與實驗工具，可用文字產生樂段與配樂。", use:"為畫作或影片產生情境配樂。"},
  {cat:"music", name:"AIVA", url:"https://www.aiva.ai/", desc:"偏向器樂與配樂的 AI 作曲工具，可選擇風格並編輯樂譜。", use:"創作古典、電影風格的純音樂。"},
  {cat:"music", name:"BandLab", url:"https://www.bandlab.com/", desc:"線上錄音與編曲平台，提供 AI 起始樂段等輔助功能。", use:"以 AI 樂段為起點，自己加入錄音與編曲。"},
  {cat:"music", name:"Udio", url:"https://www.udio.com/", desc:"AI 歌曲生成平台，近年因與唱片公司的授權合作，下載與匯出功能有限制。", use:"聆聽、比較 AI 歌曲的編曲與音色（使用前確認匯出規定）。"},

  {cat:"perform", name:"Teachable Machine", url:"https://teachablemachine.withgoogle.com/", desc:"Google 的免費網頁工具，不寫程式就能訓練辨識圖像、聲音與姿勢的模型。", use:"訓練辨識舞蹈動作或表情，做成互動表演。"},
  {cat:"perform", name:"Runway", url:"https://runwayml.com/", desc:"AI 影片生成與剪輯平台，可用文字或圖片產生動態影像。", use:"製作表演的背景影像或舞台視覺。"},
  {cat:"perform", name:"Google Flow / Veo", url:"https://labs.google/", desc:"Google 的 AI 影片生成工具，可從文字或分鏡產生短片。", use:"將劇本分鏡轉成預覽影片。"},
  {cat:"perform", name:"ElevenLabs", url:"https://elevenlabs.io/", desc:"AI 語音與音效工具，可做旁白、角色配音與音效。", use:"為短劇角色配音或製作音效（勿模仿真人聲音）。"},
  {cat:"perform", name:"Canva 影片", url:"https://www.canva.com/", desc:"線上影片編輯，含 AI 剪輯與字幕等輔助功能。", use:"剪輯演出紀錄並加上字幕。"}
];
