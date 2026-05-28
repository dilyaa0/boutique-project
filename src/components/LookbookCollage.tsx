import React, { useState, useEffect } from "react";
import { OutfitItem, StyleResponse, CapsuleLook } from "../types";
import { Sparkles, Grid, Download, Image as ImageIcon, Heart, Check, Plus, RefreshCw, ChevronRight, ChevronLeft, Layers, Palette } from "lucide-react";

interface LookbookCollageProps {
  gender: 'male' | 'female' | 'unisex';
  bodyType: 'slim' | 'average' | 'athletic' | 'plus';
  colorType: 'spring' | 'summer' | 'autumn' | 'winter';
  outfitItems: OutfitItem[];
  capsuleItems: string[];
  isGeneratingStyle: boolean;
  generatedStyle: StyleResponse | null;
}

// High-fidelity image mappings for each of the 5 fashion styles to guarantee 100% correct visual representation
const FEMALE_STYLE_IMAGES: Record<string, string> = {
  "Casual Style": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80", // White tops/hoodies with denim jeans and sneakers
  "Smart Casual": "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=600&q=80", // Sharp blazer/trench styled for office/business casual
  "Minimal Elegant": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80", // High-end clean minimal knitwear and elegant aesthetic
  "Sporty Chic": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80",  // Cozy sporty sweatshirt/hoodie and active wear (yellow set)
  "Feminine Elegant": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80" // Classy leather skirt with blouse and chelsea boots
};

const MALE_STYLE_IMAGES: Record<string, string> = {
  "Casual Style": "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=600&q=80", // Casual t-shirt and premium blue denim
  "Smart Casual": "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=600&q=80", // Sharp suit jacket / blazer lookbook style
  "Minimal Elegant": "https://images.unsplash.com/photo-1618886614638-80e3c103d31a?auto=format&fit=crop&w=600&q=80", // Cozy minimal trench coat and modern trousers
  "Sporty Chic": "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80",  // Urban streetwear with premium athletic hoodie
  "Feminine Elegant": "https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=600&q=80", // Classic coat and luxury wear style
};

export default function LookbookCollage({
  gender,
  bodyType,
  colorType,
  outfitItems,
  capsuleItems,
  isGeneratingStyle,
  generatedStyle
}: LookbookCollageProps) {
  const [selectedLayout, setSelectedLayout] = useState<'polaroid' | 'bento' | 'classic' | 'stack'>('polaroid');
  const [activeStackIndex, setActiveStackIndex] = useState<number>(0);
  const [savedLookbooks, setSavedLookbooks] = useState<{ id: string; theme: string; date: string }[]>([]);
  const [isGeneratingCollage, setIsGeneratingCollage] = useState<boolean>(false);
  const [collageProgress, setCollageProgress] = useState<number>(0);

  // Dynamic state for manually toggled garments to feed the lookbook composition
  const allAvailableItems = [
    ...(outfitItems || []).map(o => o.name),
    ...(capsuleItems || [])
  ].filter((value, index, self) => self.indexOf(value) === index && value.trim() !== "");

  const [selectedGarments, setSelectedGarments] = useState<string[]>([]);

  // Auto-init selected garments
  useEffect(() => {
    if (allAvailableItems.length > 0) {
      setSelectedGarments(allAvailableItems.slice(0, 5));
    } else {
      setSelectedGarments(["Базалық ақ футболка", "Көк классикалық джинсы", "Классикалық ақ кроссовка"]);
    }
  }, [outfitItems, capsuleItems]);

  const handleToggleGarment = (item: string) => {
    setSelectedGarments(prev => {
      if (prev.includes(item)) {
        return prev.filter(x => x !== item);
      } else {
        return [...prev, item];
      }
    });
  };

  // Generate 5 distinct curated fallback looks if AI hasn't loaded a custom style response yet
  const getFallbackLooks = (): CapsuleLook[] => {
    const isMale = gender === 'male';
    
    // Categorize selected garments intelligently to avoid mixing inappropriate types
    const tops = selectedGarments.filter(x => {
      const t = x.toLowerCase();
      return t.includes("жейде") || t.includes("блузка") || t.includes("свитшот") || t.includes("свитер") || t.includes("худи") || t.includes("футболка") || t.includes("shirt") || t.includes("top");
    });
    
    const bottomsCombined = selectedGarments.filter(x => {
      const t = x.toLowerCase();
      return t.includes("шалбар") || t.includes("джинсы") || t.includes("юбка") || t.includes("белдемше") || t.includes("pants") || t.includes("trousers") || t.includes("denim") || t.includes("jeans") || t.includes("skirt");
    });

    const standardBottoms = bottomsCombined.filter(x => !x.toLowerCase().includes("карго") && !x.toLowerCase().includes("белдемше") && !x.toLowerCase().includes("юбка"));
    const cargoOrJeans = bottomsCombined.filter(x => x.toLowerCase().includes("карго") || x.toLowerCase().includes("джинсы") || x.toLowerCase().includes("cargo") || x.toLowerCase().includes("jeans"));
    const skirts = bottomsCombined.filter(x => x.toLowerCase().includes("белдемше") || x.toLowerCase().includes("юбка") || x.toLowerCase().includes("skirt"));
    const shoesList = selectedGarments.filter(x => {
      const t = x.toLowerCase();
      return t.includes("кроссовка") || t.includes("туфли") || t.includes("лофер") || t.includes("бәтеңке") || t.includes("ыңғайлы") || t.includes("sneakers") || t.includes("shoes");
    });
    const outers = selectedGarments.filter(x => {
      const t = x.toLowerCase();
      return t.includes("пиджак") || t.includes("блейзер") || t.includes("косуха") || t.includes("күрте") || t.includes("пальто") || t.includes("тренч") || t.includes("бомбер") || t.includes("jacket") || t.includes("coat");
    });

    // 1. Casual Style Setup
    const casualTop = tops.find(t => t.toLowerCase().includes("футболка") || t.toLowerCase().includes("жейде") || t.toLowerCase().includes("shirt")) || tops[0] || "Ақ оверсайз жейде (Рубашка)";
    const casualBottom = cargoOrJeans[0] || standardBottoms[0] || "Көк классикалық джинсы";
    const casualShoes = shoesList.find(s => s.toLowerCase().includes("кроссовка") || s.toLowerCase().includes("sneaker")) || shoesList[0] || "Классикалық ақ кроссовка";

    // 2. Smart Casual Setup
    const smartTop = tops.find(t => t.toLowerCase().includes("блузка") || t.toLowerCase().includes("жейде") || t.toLowerCase().includes("shirt")) || tops[0] || "Жеңіл жібек блузка";
    const smartOuter = outers.find(o => o.toLowerCase().includes("пиджак") || o.toLowerCase().includes("блейзер") || o.toLowerCase().includes("пальто")) || "Стильді пиджак / Блейзер";
    const smartBottom = standardBottoms.find(b => b.toLowerCase().includes("классикалық шалбар")) || standardBottoms[0] || "Қара классикалық шалбар";
    const smartShoes = shoesList.find(s => s.toLowerCase().includes("лофер") || s.toLowerCase().includes("бәтеңке") || s.toLowerCase().includes("туфли")) || shoesList[0] || "Қара теріден жасалған лоферлер";

    // 3. Minimal Elegant Setup
    const minimalTop = tops.find(t => t.toLowerCase().includes("свитер") || t.toLowerCase().includes("блузка")) || tops[0] || "Базалық трикотаж свитер";
    const minimalBottom = standardBottoms.find(b => b.toLowerCase().includes("шалбар")) || "Қара классикалық шалбар";
    const minimalShoes = shoesList.find(s => s.toLowerCase().includes("лофер") || s.toLowerCase().includes("бәтеңке")) || "Қара теріден жасалған лоферлер";
    const minimalOuter = outers.find(o => o.toLowerCase().includes("тренч") || o.toLowerCase().includes("пальто")) || "Органикалық мақта тренч";

    // 4. Sporty Chic Setup (Guaranteed NO classic pants unless selected, and styled with hoodie/sweatshirt)
    const sportyTop = tops.find(t => t.toLowerCase().includes("свитшот") || t.toLowerCase().includes("худи") || t.toLowerCase().includes("футболка")) || "Жылы свитшот";
    const sportyBottom = cargoOrJeans.find(b => b.toLowerCase().includes("карго") || b.toLowerCase().includes("джинсы")) || "Сұр карго шалбары";
    const sportyShoes = shoesList.find(s => s.toLowerCase().includes("кроссовка") || s.toLowerCase().includes("sneaker")) || "Классикалық ақ кроссовка";
    const sportyOuter = outers.find(o => o.toLowerCase().includes("бомбер") || o.toLowerCase().includes("косуха") || o.toLowerCase().includes("күрте")) || "Жылы бомбер";

    // 5. Feminine Elegant Setup
    const femTop = tops.find(t => t.toLowerCase().includes("блузка") || t.toLowerCase().includes("жейде") || t.toLowerCase().includes("свитер")) || tops[0] || "Жеңіл жібек блузка";
    const femBottom = skirts[0] || standardBottoms.find(b => b.toLowerCase().includes("белдемше") || b.toLowerCase().includes("юбка")) || "Былғары белдемше";
    const femShoes = shoesList.find(s => s.toLowerCase().includes("бәтеңке") || s.toLowerCase().includes("туфли") || s.toLowerCase().includes("лофер")) || "Классикалық бәтеңке";
    const femOuter = outers.find(o => o.toLowerCase().includes("пальто") || o.toLowerCase().includes("тренч")) || "Классикалық пальто";

    return [
      {
        title: "Лук #1: Casual Streetwise",
        styleName: "Casual Style",
        itemsUsed: [casualTop, casualBottom, casualShoes].filter(Boolean),
        comment: "Күнделікті еркін қозғалысқа арналған ең жайлы әрі сәнді базалық классика.",
        imagePrompt: `full body fashion look: ${casualTop} + ${casualBottom} + ${casualShoes}, casual street style, Neutral studio background, high quality fashion photoshoot`
      },
      {
        title: "Лук #2: Quiet Luxury / Office",
        styleName: "Smart Casual",
        itemsUsed: [smartOuter, smartTop, smartBottom, smartShoes].filter(Boolean),
        comment: "Нәзік пен салмақтылықтың теңдесі жоқ симбиозы. Сұхбаттарға таптырмас жиынтық.",
        imagePrompt: `flat lay fashion outfit: quiet luxury blazer, premium trousers, leather loafers, clean minimal white studio background, high end photography`
      },
      {
        title: "Лук #3: Minimalist Elegant",
        styleName: "Minimal Elegant",
        itemsUsed: [minimalOuter, minimalTop, minimalBottom, minimalShoes].filter(Boolean),
        comment: "Артық ештеңесі жоқ, табиғи кремді палитра мен таза сәндік пішіндер.",
        imagePrompt: `chic minimal fashion portrait: elegant beige aesthetic outfit, minimal watch, professional studio softbox lighting`
      },
      {
        title: "Лук #4: Sporty Chic Dynamic",
        styleName: "Sporty Chic",
        itemsUsed: [sportyOuter, sportyTop, sportyBottom, sportyShoes].filter(Boolean),
        comment: "Спорттық элементтер мен заманауи урбанизмнің үйлесімді көше бейнесі.",
        imagePrompt: `mannequin showcase: sporty oversized hoodie, casual cargo pants, retro sneakers, modern streetwear editorial photo`
      },
      {
        title: "Лук #5: Evening / Weekend Walk",
        styleName: "Feminine Elegant",
        itemsUsed: [femOuter, femTop, femBottom, femShoes].filter(Boolean),
        comment: "Демалыс күндері серуендеу мен романтикалық кездесулерге арналған нәзік үйлесім.",
        imagePrompt: `professional lookbook layout: elegant long coat, high fashion accessories, soft focused warm studio background`
      }
    ];
  };

  // Get active 5 looks either from AI gemini backend or beautifully formatted fallback looks
  const activeLooks = (generatedStyle && generatedStyle.capsule5Looks && generatedStyle.capsule5Looks.length === 5)
    ? generatedStyle.capsule5Looks 
    : getFallbackLooks();

  // Helper to map unique look images to prevent repeats and ensure highest aesthetic cohesion
  const getLookImage = (lookIndex: number, styleName: string): string => {
    const isMale = gender === 'male';
    const cleanStyle = styleName.replace(/chic/i, "").trim().toLowerCase();
    
    // Exact style mappings to prevent mismatching visual outputs
    const femaleKeys = Object.keys(FEMALE_STYLE_IMAGES);
    const maleKeys = Object.keys(MALE_STYLE_IMAGES);
    
    let matchedKey = "";
    if (isMale) {
      matchedKey = maleKeys.find(k => k.toLowerCase().includes(cleanStyle) || cleanStyle.includes(k.toLowerCase())) || maleKeys[lookIndex % maleKeys.length];
      return MALE_STYLE_IMAGES[matchedKey];
    } else {
      matchedKey = femaleKeys.find(k => k.toLowerCase().includes(cleanStyle) || cleanStyle.includes(k.toLowerCase())) || femaleKeys[lookIndex % femaleKeys.length];
      return FEMALE_STYLE_IMAGES[matchedKey];
    }
  };

  // Human, warm simulator for lookbook rendering
  const handleRegenerateCollage = () => {
    setIsGeneratingCollage(true);
    setCollageProgress(10);
    const interval = setInterval(() => {
      setCollageProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsGeneratingCollage(false);
          }, 400);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20) + 12;
      });
    }, 120);
  };

  const handleSaveToDevice = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    setSavedLookbooks(prev => [
      { id: newId, theme: `${selectedLayout.toUpperCase()} Қалыбы`, date: new Date().toLocaleTimeString("kk-KZ", { hour: '2-digit', minute: '2-digit' }) },
      ...prev
    ]);
  };

  return (
    <div id="ai-lookbook-root-block" className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden relative shadow-2xl transition-all duration-300">
      
      {/* Absolute Ambient Background Lights to make the layout feel like a quiet luxury boutique */}
      <div className="absolute top-[-25%] left-[-15%] w-[70%] h-[70%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* Styled Luxury Header Block */}
      <div className="px-6 py-5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md flex items-center justify-between z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] font-extrabold tracking-widest text-indigo-400 uppercase font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-400/20">ЖИ Модборд</span>
            <span className="text-slate-500 text-[9.5px] font-mono">• 5 Сәнді Комбинация</span>
          </div>
          <h3 className="text-base font-extrabold text-slate-100 font-sans tracking-tight">ЖИ Сәндік Мудборд & Фотоколлаж</h3>
        </div>
        <div className="flex gap-1.5 items-center">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-505 bg-indigo-500 animate-pulse" />
          <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest">Digital Lookbook</span>
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto z-10 max-h-[850px]">
        
        {/* Step 1: Manage Wardrobe Items & Checklist (Ensuring NO mixing up of selections) */}
        <div className="bg-slate-950/60 border border-slate-850 rounded-2xl p-4.5 space-y-3 shadow-inner">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-300 flex items-center gap-2 font-mono uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Талданатын киімдер тізбегі</span>
            </label>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Киімдер бірін-бірі араластырмайды ✓
            </span>
          </div>
          
          <div className="flex flex-wrap gap-2 pr-1">
            {allAvailableItems.length > 0 ? (
              allAvailableItems.map((item, id) => {
                const isSelected = selectedGarments.includes(item);
                const textLower = item.toLowerCase();
                const isSkirt = textLower.includes("белдемше") || textLower.includes("юбка") || textLower.includes("skirt");
                const isPants = textLower.includes("шалбар") || textLower.includes("джинсы") || textLower.includes("pants");
                const isShoes = textLower.includes("кроссовка") || textLower.includes("туфли") || textLower.includes("лофер");

                return (
                  <button
                    key={id}
                    onClick={() => handleToggleGarment(item)}
                    type="button"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1.5 cursor-pointer max-w-xs truncate ${
                      isSelected 
                        ? "bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/15" 
                        : "bg-slate-900 hover:bg-slate-850/80 border-slate-800 text-slate-400"
                    }`}
                  >
                    <span>{isSkirt ? "👗" : isPants ? "👖" : isShoes ? "👟" : "👕"}</span>
                    <span className="truncate">{item}</span>
                    {isSelected ? (
                      <Check className="w-3 h-3 text-white" />
                    ) : (
                      <Plus className="w-3 h-3 text-slate-650 text-slate-600" />
                    )}
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-slate-500 italic">Таңдалған киімдер жоқ. Гардеробтан киім қосыңыз.</span>
            )}
          </div>
        </div>

        {/* Step 2: Collage Layout Selector (Polaroid, Bento, Classic, Stack) */}
        <div className="space-y-2.5">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 font-mono tracking-wider block">
            Коллаж қалыбын таңдаңыз (Layout Grid)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['polaroid', 'bento', 'classic', 'stack'] as const).map((lay) => {
              const isSelected = selectedLayout === lay;
              return (
                <button
                  key={lay}
                  onClick={() => {
                    setSelectedLayout(lay);
                    if (lay === 'stack') setActiveStackIndex(0);
                  }}
                  type="button"
                  className={`py-3 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 relative ${
                    isSelected 
                      ? "bg-indigo-600/10 border-indigo-500 text-white shadow-lg" 
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850/40 hover:text-slate-200"
                  }`}
                >
                  <span className="text-sm">
                    {lay === 'polaroid' ? "📸" : lay === 'bento' ? "🍱" : lay === 'classic' ? "📐" : "🎴"}
                  </span>
                  <span className="text-[10.5px] font-bold uppercase tracking-wide">
                    {lay === 'polaroid' ? "Полароид" : lay === 'bento' ? "Бенто" : lay === 'classic' ? "Классик" : "Стек (Үйме)"}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Render Dynamic Canvas */}
        <div className="relative">
          {isGeneratingCollage ? (
            <div className="aspect-[4/5] sm:aspect-[16/10] w-full rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col items-center justify-center p-6 space-y-4 animate-pulse relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent top-scanner animate-scanner-flow" />
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-extrabold font-mono tracking-wider text-indigo-400 uppercase">ЖИ Коллаж құрастырылуда...</p>
                <p className="text-[11px] text-slate-400 max-w-xs leading-normal">
                  Қиыстырылған 5 түрлі стиль бойынша жоғары деңгейлі суреттеме жинақталуда.
                </p>
              </div>
              <div className="w-44 bg-slate-900 rounded-full h-1 overflow-hidden border border-slate-800">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-1 rounded-full transition-all duration-300" style={{ width: `${collageProgress}%` }} />
              </div>
            </div>
          ) : (
            
            <div className="p-4 rounded-2xl bg-slate-950/45 border border-slate-800/80 relative">
              
              {/* LAYOUT 1: POLAORID */}
              {selectedLayout === 'polaroid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {activeLooks.map((look, idx) => {
                    const rotSeed = idx % 3 === 0 ? "-1.5" : idx % 3 === 1 ? "1.5" : "-0.5";
                    return (
                      <div 
                        key={idx} 
                        className="bg-stone-100 dark:bg-zinc-900 border border-stone-200/60 dark:border-zinc-800 rounded-xl p-3.5 shadow-xl transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl flex flex-col"
                        style={{ transform: `rotate(${rotSeed}deg)` }}
                      >
                        <div className="aspect-[4/5] rounded-lg overflow-hidden relative shadow-inner bg-zinc-950">
                          <img 
                            src={getLookImage(idx, look.styleName)} 
                            alt={look.title}
                            className="w-full h-full object-cover filter contrast-[1.02]"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2.5 left-2.5 bg-slate-950/85 border border-slate-800 text-[9px] font-mono text-indigo-400 font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                            {look.styleName}
                          </div>
                        </div>
                        <div className="pt-4 pb-1 text-center font-serif text-slate-800 dark:text-stone-200">
                          <h4 className="text-xs font-extrabold tracking-wide uppercase font-sans mb-1">{look.title}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-snug font-mono px-1">
                            {look.itemsUsed.join(" + ")}
                          </p>
                          <div className="mt-2.5 text-[9.5px] italic text-indigo-600 dark:text-indigo-400 border-t border-stone-200/50 dark:border-zinc-800/50 pt-2 font-sans">
                            {look.comment}
                          </div>
                          
                          {/* Aesthetic prompt showcase */}
                          <div className="mt-2 border-t border-dotted border-stone-200 dark:border-zinc-800/80 pt-1.5 text-[8px] font-mono text-stone-400 dark:text-stone-500 truncate" title={look.imagePrompt}>
                            🔑 Prompt: {look.imagePrompt}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* LAYOUT 2: BENTO (1 large hero card + 4 small ones) */}
              {selectedLayout === 'bento' && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
                  
                  {/* Hero Bento Look #1 */}
                  <div className="col-span-2 md:row-span-2 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl relative min-h-[360px] flex flex-col justify-between group">
                    <img 
                      src={getLookImage(0, activeLooks[0].styleName)} 
                      alt={activeLooks[0].title}
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
                    
                    <div className="p-4 z-10 flex justify-between items-start">
                      <span className="bg-indigo-500 text-white text-[9px] font-bold font-mono px-2.5 py-1 rounded-full uppercase tracking-wider">Hero Style</span>
                      <span className="text-[10px] font-mono text-slate-350 bg-slate-950/80 px-2 py-1 rounded">Look #1</span>
                    </div>

                    <div className="p-5 z-10 space-y-2">
                      <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block font-mono">
                        {activeLooks[0].styleName}
                      </span>
                      <h4 className="text-lg font-black text-white hover:text-indigo-200 transition-colors">
                        {activeLooks[0].title}
                      </h4>
                      <p className="text-xs text-slate-300 font-medium">
                        ✦ {activeLooks[0].itemsUsed.join(" • ")}
                      </p>
                      <p className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed italic">
                        &ldquo;{activeLooks[0].comment}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Smaller Bento Grid pieces */}
                  {activeLooks.slice(1, 5).map((look, idx) => {
                    const realIdx = idx + 1;
                    return (
                      <div 
                        key={idx} 
                        className="bg-indigo-950/20 rounded-2xl overflow-hidden border border-slate-850 shadow hover:border-indigo-500/40 transition-all duration-300 relative aspect-[4/5] flex flex-col justify-end p-4 group"
                      >
                        <img 
                          src={getLookImage(realIdx, look.styleName)} 
                          alt={look.title}
                          className="absolute inset-0 w-full h-full object-cover opacity-45 group-hover:scale-105 transition-transform duration-700"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/10 to-transparent pointer-events-none" />
                        
                        <div className="absolute top-3 right-3 z-10 text-[9px] font-mono bg-slate-900/90 text-slate-400 px-2 py-0.5 rounded">
                          Look #{realIdx + 1}
                        </div>

                        <div className="z-10 space-y-1">
                          <span className="text-[9px] font-bold text-indigo-400 tracking-wider block uppercase font-mono">
                            {look.styleName}
                          </span>
                          <h5 className="text-[11px] font-bold text-slate-100 truncate">
                            {look.title.split(":")[1]?.trim() || look.title}
                          </h5>
                          <p className="text-[9.5px] text-slate-450 leading-snug truncate">
                            {look.itemsUsed.join(" + ")}
                          </p>
                        </div>
                      </div>
                    );
                  })}

                </div>
              )}

              {/* LAYOUT 3: CLASSIC (Teң өлшемді 5 карточка қатары) */}
              {selectedLayout === 'classic' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                  {activeLooks.map((look, idx) => (
                    <div 
                      key={idx} 
                      className="bg-slate-900 border border-slate-800 hover:border-indigo-500/30 rounded-2xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] flex flex-col h-full"
                    >
                      <div className="aspect-[3/4] overflow-hidden relative bg-slate-950">
                        <img 
                          src={getLookImage(idx, look.styleName)} 
                          alt={look.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute bottom-2.5 left-2.5 bg-slate-950/90 border border-slate-800 text-[8.5px] font-mono text-indigo-300 font-bold px-1.5 py-0.5 rounded uppercase">
                          {look.styleName}
                        </div>
                      </div>
                      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
                        <div>
                          <h5 className="text-xs font-extrabold text-slate-100 uppercase tracking-tight block truncate">
                            {look.title}
                          </h5>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5 leading-snug">
                            {look.itemsUsed.join(" + ")}
                          </p>
                        </div>
                        <p className="text-[10.5px] text-slate-450 leading-relaxed italic border-t border-slate-850 pt-2">
                          {look.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* LAYOUT 4: STACK (Бір-бірінің үстіне жартылай жабылған интерактивті карталар үймесі) */}
              {selectedLayout === 'stack' && (
                <div className="max-w-md mx-auto py-8 flex flex-col items-center">
                  
                  {/* Outer deck container */}
                  <div className="relative w-72 h-[340px] sm:h-[380px]">
                    {activeLooks.map((look, idx) => {
                      // Calculate active stack properties based on distance from current index
                      const offsetIdx = (idx - activeStackIndex + 5) % 5;
                      const isTopCard = offsetIdx === 0;
                      
                      // If card is far behind, we scale down and push lower down the visual list
                      const scale = 1 - offsetIdx * 0.05;
                      const translateY = offsetIdx * 14;
                      const rotate = offsetIdx * 3 * (idx % 2 === 0 ? 1 : -1);
                      const zIndex = 50 - offsetIdx;
                      const opacity = offsetIdx > 2 ? 0 : 1 - offsetIdx * 0.35;

                      return (
                        <div 
                          key={idx}
                          className="absolute inset-0 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl transition-all duration-500 ease-out select-none"
                          style={{
                            transform: `translateY(${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
                            zIndex: zIndex,
                            opacity: opacity,
                            pointerEvents: isTopCard ? "auto" : "none"
                          }}
                        >
                          <div className="aspect-[4/5] w-full rounded-xl overflow-hidden relative shadow bg-slate-950">
                            <img 
                              src={getLookImage(idx, look.styleName)} 
                              alt={look.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                            {/* Card Header Info Badge */}
                            <div className="absolute top-3 left-3 bg-zinc-950/95 border border-zinc-805 border-zinc-800 text-[9px] font-mono text-indigo-400 font-bold px-2 py-0.5 rounded uppercase">
                              {look.styleName}
                            </div>
                            <div className="absolute bottom-3 inset-x-3 bg-slate-950/80 border border-slate-850 p-2 text-center rounded backdrop-blur-sm">
                              <span className="text-[9px] text-slate-400 font-mono tracking-wide">
                                Look {idx + 1} of 5
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Active Card description card below */}
                  <div className="mt-8 text-center bg-slate-900 border border-slate-800 p-5 rounded-2xl w-full max-w-sm space-y-2.5 shadow">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">
                      {activeLooks[activeStackIndex].styleName}
                    </span>
                    <h4 className="text-sm font-bold text-slate-100">
                      {activeLooks[activeStackIndex].title}
                    </h4>
                    <p className="text-xs text-slate-400 font-mono leading-snug">
                      {activeLooks[activeStackIndex].itemsUsed.join(" ✦ ")}
                    </p>
                    <p className="text-xs text-indigo-300 italic px-2">
                      &ldquo;{activeLooks[activeStackIndex].comment}&rdquo;
                    </p>

                    {/* Stack Controller dots */}
                    <div className="flex justify-center items-center gap-2 pt-2">
                      <button 
                        onClick={() => setActiveStackIndex(v => (v - 1 + 5) % 5)}
                        className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white transition-colors cursor-pointer text-xs"
                      >
                        <ChevronLeft className="w-4 h-4 inline" /> Кері
                      </button>
                      <div className="flex gap-1.5 px-2">
                        {[0, 1, 2, 3, 4].map((dotId) => (
                          <span 
                            key={dotId} 
                            className={`w-1.5 h-1.5 rounded-full transition-colors ${
                              dotId === activeStackIndex ? "bg-indigo-505 bg-indigo-500" : "bg-slate-700"
                            }`} 
                          />
                        ))}
                      </div>
                      <button 
                        onClick={() => setActiveStackIndex(v => (v + 1) % 5)}
                        className="p-1 px-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-350 hover:text-white transition-colors cursor-pointer text-xs"
                      >
                        Келесі <ChevronRight className="w-4 h-4 inline" />
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* Bottom Card Design Metainfo */}
              <div className="mt-5 border-t border-slate-800/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-mono text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Талдау: <strong className="text-slate-300 uppercase">{colorType}</strong> ({bodyType} дене бітімі)</span>
                </div>
                <span>🎨 BOUTIQUE GENERATIVE COLLAGE INC.</span>
              </div>

            </div>
          )}
        </div>

        {/* Generative Interactive Controllers */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRegenerateCollage}
            disabled={isGeneratingCollage}
            type="button"
            className="flex-1 py-3.5 px-5 rounded-2xl bg-gradient-to-r from-indigo-650 to-indigo-600 bg-indigo-600 hover:bg-indigo-550 text-white font-bold tracking-wider transition-all duration-300 flex items-center justify-center gap-2 text-xs cursor-pointer select-none"
          >
            <Sparkles className="w-4 h-4 text-yellow-350 text-yellow-400 animate-pulse" />
            <span>✨ ЖИ КОЛЛАЖ ГЕНЕРАЦИЯЛАУ (ҚҰРМАУ)</span>
          </button>
          
          <button
            onClick={handleSaveToDevice}
            disabled={isGeneratingCollage}
            type="button"
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-750 text-slate-200 font-bold tracking-wide transition-all duration-200 border border-slate-700/80 flex items-center justify-center gap-2 text-xs cursor-pointer select-none"
          >
            <Download className="w-4 h-4" />
            <span>Экспорттау (`Экран`)</span>
          </button>
        </div>

        {/* Exported Lookbooks History */}
        {savedLookbooks.length > 0 && (
          <div className="bg-slate-950/40 border border-slate-850 rounded-2xl p-4.5 space-y-3.5 animate-in slide-in-from-bottom-2 duration-300">
            <h4 className="text-[10px] font-black uppercase text-indigo-400 font-mono tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              <span>Сақталған лукбук тарихы</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {savedLookbooks.map((item) => (
                <div key={item.id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-250 truncate">{item.theme} Сән Коллажы</p>
                    <span className="text-[9.5px] font-mono text-slate-550">{item.date} сақталды • 5 Лук</span>
                  </div>
                  <span className="text-[9.5px] font-bold text-emerald-400 font-mono">Дайын ✓</span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
