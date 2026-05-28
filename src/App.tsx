import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Plus, 
  Trash2, 
  ShoppingBag, 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  Calendar, 
  CloudRain, 
  CloudSun, 
  RotateCw, 
  TrendingUp, 
  DollarSign, 
  ExternalLink,
  ChevronRight,
  Shirt,
  Scissors
} from "lucide-react";
import { UserParams, WeatherInfo, StyleResponse, OutfitItem, CapsuleLook } from "./types";
import LookbookCollage from "./components/LookbookCollage";
import CatalogSection from "./components/CatalogSection";
import AssistantSection from "./components/AssistantSection";

// Preset capsule wardrobe items for quick selection
const DEFAULT_CAPSULE_PRESETS = [
  "Қара классикалық шалбар",
  "Ақ оверсайз жейде (рубашка)",
  "Көк классикалық джинсы",
  "Сарғыш (бежевый) тренч немесе пальто",
  "Қара пиджак (блейзер)",
  "Ақ базалық футболка",
  "Сұр тоқылған свитер",
  "Қара былғары күрте (косуха)",
  "Классикалық ақ кроссовка",
  "Қара лоферлер немесе туфли",
  "Спорттық худи (свитшот)",
  "Классикалық қара белдемше (юбка)",
  "Трикотаж көйлек",
  "Көк джинс күрте"
];

// Kazakhstan Cities for API
const CITIES_LIST = [
  { id: "Astana", name: "Астана" },
  { id: "Almaty", name: "Алматы" },
  { id: "Shymkent", name: "Шымкент" },
  { id: "Karaganda", name: "Қарағанды" },
  { id: "Aktobe", name: "Ақтөбе" },
  { id: "Atyrau", name: "Атырау" },
  { id: "Oskemen", name: "Өскемен" },
  { id: "Uralsk", name: "Орал" },
  { id: "Pavlodar", name: "Павлодар" },
  { id: "Taraz", name: "Тараз" }
];

export default function App() {
  // Navigation & Landing views
  const [showLanding, setShowLanding] = useState(true);
  const [activeSection, setActiveSection] = useState<'generate' | 'catalog' | 'assistant'>('generate');

  // 1. Core State
  const [params, setParams] = useState<UserParams>({
    height: 170,
    weight: 65,
    gender: 'female',
    bodyType: 'average',
    colorType: 'autumn',
    season: 'autumn',
    destination: 'Оқуға / Күнделікті',
    city: 'Astana',
    customWeather: false,
    manualTemp: 18,
    manualCondition: 'Бұлтты',
    capsuleItems: ["Қара классикалық шалбар", "Ақ оверсайз жейде (рубашка)", "Көк классикалық джинсы", "Классикалық ақ кроссовка"]
  });

  const [customItemInput, setCustomItemInput] = useState("");
  const [weather, setWeather] = useState<WeatherInfo | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedStyle, setGeneratedStyle] = useState<StyleResponse | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  
  // Tab control for capsule combinations vs current outfit
  const [activeTab, setActiveTab] = useState<'outfit' | 'capsule'>('outfit');
  const [activeOutfitOverride, setActiveOutfitOverride] = useState<OutfitItem[] | null>(null);
  const [selectedCapsuleIndex, setSelectedCapsuleIndex] = useState<number | null>(null);

  // Callback to wear an outfit from the custom catalog
  const handleTryOnFromCatalog = (item: OutfitItem) => {
    setActiveOutfitOverride(prev => {
      const currentBase = prev || generatedStyle?.outfit || [];
      const filtered = currentBase.filter(x => x.category.toLowerCase() !== item.category.toLowerCase());
      return [...filtered, item];
    });
    setActiveTab('outfit');
    setSelectedCapsuleIndex(null);
  };

  // 2. Load weather automatically when city changes or manually toggle changes
  const fetchWeather = async (cityName: string) => {
    setWeatherLoading(true);
    try {
      const response = await fetch(`/api/weather?city=${cityName}`);
      if (!response.ok) throw new Error("Ауа райын алу мүмкін болмады");
      const data = await response.json();
      setWeather(data);
      if (data && !params.customWeather) {
        setParams(prev => ({
          ...prev,
          manualTemp: data.temp,
          manualCondition: data.condition
        }));
      }
    } catch (err) {
      console.error(err);
      // Fail-safe manual simulation
      setWeather({
        city: cityName,
        cityNameKz: CITIES_LIST.find(c => c.id === cityName)?.name || cityName,
        temp: cityName === 'Astana' ? 12 : 18,
        condition: "Бұлтты (Базалық мәлімет)",
        windspeed: 12,
        success: false
      });
    } finally {
      setWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather(params.city);
  }, [params.city]);

  // Handle preset selection
  const togglePresetItem = (item: string) => {
    setParams(prev => {
      const exists = prev.capsuleItems.includes(item);
      const updated = exists 
        ? prev.capsuleItems.filter(i => i !== item)
        : [...prev.capsuleItems, item];
      return { ...prev, capsuleItems: updated };
    });
  };

  const parseCapsuleItemToOutfitItem = (itemText: string): OutfitItem => {
    const text = itemText.toLowerCase();
    
    // 1. Determine Category
    let category: OutfitItem["category"] = "top";
    if (text.includes("шалбар") || text.includes("джинсы") || text.includes("белдемше") || text.includes("юбка") || text.includes("юбкі") || text.includes("шорт") || text.includes("карго") || text.includes("леггинс")) {
      category = "bottom";
    } else if (text.includes("күрте") || text.includes("пальто") || text.includes("плащ") || text.includes("жакет") || text.includes("пиджак") || text.includes("куртка") || text.includes("блейзер") || text.includes("ветровка") || text.includes("тренч") || text.includes("косуха")) {
      category = "outerwear";
    } else if (text.includes("етік") || text.includes("кроссовки") || text.includes("туфли") || text.includes("кеды") || text.includes("бәтеңке") || text.includes("лофер") || text.includes("shoes") || text.includes("аяқ киім") || text.includes("сандал")) {
      category = "shoes";
    } else if (text.includes("сөмке") || text.includes("шарф") || text.includes("көзілдірік") || text.includes("белдік") || text.includes("бас киім") || text.includes("кепка") || text.includes("бөрік") || text.includes("аксессуар")) {
      category = "accessories";
    } else {
      category = "top";
    }

    // 2. Extract Color
    let color = "көк"; // default fallback color
    if (text.includes("қара") || text.includes("черный") || text.includes("black")) color = "қара";
    else if (text.includes("ақ") || text.includes("белый") || text.includes("white")) color = "ақ";
    else if (text.includes("қызыл") || text.includes("красный") || text.includes("red")) color = "қызыл";
    else if (text.includes("көк") || text.includes("синий") || text.includes("blue")) color = "көк";
    else if (text.includes("жасыл") || text.includes("зеленый") || text.includes("green")) color = "жасыл";
    else if (text.includes("сары") || text.includes("желтый") || text.includes("yellow") || text.includes("алтын")) color = "сары";
    else if (text.includes("қоңыр") || text.includes("коричневый") || text.includes("brown")) color = "қоңыр";
    else if (text.includes("сұр") || text.includes("серый") || text.includes("grey") || text.includes("gray")) color = "сұр";
    else if (text.includes("қызғылт") || text.includes("розовый") || text.includes("pink")) color = "қызғылт";
    else if (text.includes("көгілдір") || text.includes("голубой") || text.includes("lightblue")) color = "көгілдір";
    else if (text.includes("бежевый") || text.includes("беж") || text.includes("сарғыш")) color = "бежевый";
    else if (text.includes("күлгін") || text.includes("фиолетовый") || text.includes("purple")) color = "күлгін";
    else if (text.includes("хаки") || text.includes("khaki")) color = "жасыл";

    return {
      category,
      name: itemText,
      color: color,
      colorName: color,
      brandName: "Өз капсулаңыз",
      brandLink: "https://kaspi.kz",
      priceKzt: 0
    };
  };

  // Add custom manual item to capsule
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemInput.trim()) return;
    if (params.capsuleItems.includes(customItemInput.trim())) {
      setCustomItemInput("");
      return;
    }
    setParams(prev => ({
      ...prev,
      capsuleItems: [...prev.capsuleItems, customItemInput.trim()]
    }));
    setCustomItemInput("");
  };

  const handleRemoveItem = (itemToRemove: string) => {
    setParams(prev => ({
      ...prev,
      capsuleItems: prev.capsuleItems.filter(item => item !== itemToRemove)
    }));
  };

  // 3. Style Generation Handler
  const handleGenerateStyle = async () => {
    setIsGenerating(true);
    setErrorText(null);

    const payload = {
      height: params.height,
      weight: params.weight,
      gender: params.gender,
      bodyType: params.bodyType,
      colorType: params.colorType,
      season: params.season,
      destination: params.destination,
      weather: {
        temp: params.customWeather ? params.manualTemp : (weather?.temp ?? 15),
        condition: params.customWeather ? params.manualCondition : (weather?.condition ?? "Құбылмалы"),
        city: CITIES_LIST.find(c => c.id === params.city)?.name || params.city
      },
      capsuleItems: params.capsuleItems
    };

    try {
      const response = await fetch("/api/generate-style", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Стильді қалыптастыру мүмкін болмады. API Кілтті тексеріңіз.");
      }

      setGeneratedStyle(resData.data);
      setActiveOutfitOverride(null);
      setSelectedCapsuleIndex(null);
      // Auto switch tab to output
      setActiveTab('outfit');
    } catch (err: any) {
      console.error(err);
      setErrorText(err.message || "Генерация барысында техникалық қате шықты. Сұратуды қайталап көріңіз.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (showLanding) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
        {/* Decorative Ambient Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-25%] right-[-10%] w-[60%] h-[60%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[30%] right-[20%] w-[350px] h-[350px] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

        {/* Top Header */}
        <header className="max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between border-b border-slate-900 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2 font-mono">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-sm text-white shadow-lg shadow-indigo-500/30">
                B
              </span>
              BOUTIQUE AI
            </span>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center z-10 space-y-12">
          {/* Logo Brand Animation */}
          <div className="space-y-4">
            <div className="inline-flex py-1.5 px-3.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wider uppercase font-mono animate-pulse">
              ✨ Тұңғыш Отандық ЖИ-Стилист
            </div>
            
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight max-w-3xl">
              Жеке стиліңізді <br /> 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Boutique AI
              </span>
              -мен қалыптастырыңыз
            </h1>

            <p className="text-sm sm:text-base text-slate-450 max-w-xl mx-auto leading-relaxed">
              Ауа райына, дене бітіміңіз бен бой-салмағыңызға сәйкес келетін премиум луктарды дәл тауып, отандық брендтердің киім каталогтарымен үйлестіріңіз.
            </p>
          </div>

          {/* Interactive Button CTA */}
          <div className="space-y-3">
            <button
              onClick={() => setShowLanding(false)}
              className="px-10 py-4.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-655 to-indigo-600 text-sm font-bold tracking-wider text-white hover:from-indigo-505 hover:to-indigo-505 transition-all duration-300 shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transform hover:scale-[1.03] cursor-pointer flex items-center justify-center gap-3.5 mx-auto w-full sm:w-auto"
            >
              <span>Бастау</span>
              <ArrowRight className="w-4 h-4 text-slate-200" />
            </button>
            <p className="text-[10.5px] text-slate-500 font-mono tracking-wide">
              Қосымшаға өту тегін • Кезексіз аналитика
            </p>
          </div>

          {/* Core Feature bullet grids */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 w-full pt-8 text-left">
            <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-2.5 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-sm">
                🧥
              </div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Капсулалық үйлесім</h3>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                Шығынды азайту үшін қолыңызда бар киімдерден 10 түрлі жаңа лук жинап, импульсивті сатып алудан сақтаныңыз.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-2.5 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-sm">
                🌤️
              </div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Ауа райы деTracker</h3>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                Қазақстанның аймақтық қалаларының нақты метеорологиялық мәліметтерімен нақты уақытта жылдам байланысу.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-850 p-5 rounded-2xl space-y-2.5 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-sm">
                🇰🇿
              </div>
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Отандық Брендтер</h3>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                Qazaq Republic, Saba, Adili, Shoqan Suits брендтерінің шынайы каталогы мен ресми дүкен сілтемелеріне толық қол жеткізу.
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-900 text-center text-[10.5px] text-slate-600 font-mono z-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>© 2026 Boutique AI. Барлық құқықтар қорғалған.</span>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-indigo-500 selection:text-white pb-16">
      
      {/* Absolute Header with modern glassmorphism and creative logo */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-900 px-4 py-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            {/* Highly creative customized fashion logo */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-indigo-600 to-emerald-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>
              <div className="relative w-11 h-11 rounded-xl bg-slate-950 flex items-center justify-center border border-slate-800 shadow-xl">
                <svg viewBox="0 0 100 100" className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M 50 18 Q 50 10, 44 12 Q 38 14, 42 20 Q 46 26, 50 20" stroke="url(#logo-grad-header)" strokeWidth="3.5" />
                  <path d="M 18 45 L 82 45 L 50 20 Z" stroke="url(#logo-grad-header)" strokeWidth="3" fill="none" />
                  <path d="M 50 32 L 60 45 L 50 58 L 40 45 Z" stroke="#10B981" strokeWidth="1.5" fill="#10B981" fillOpacity="0.25" />
                  <circle cx="28" cy="24" r="2.5" fill="#FBBF24" />
                  <circle cx="72" cy="24" r="2.5" fill="#EC4899" />
                  <defs>
                    <linearGradient id="logo-grad-header" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#ec4899" />
                      <stop offset="50%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white font-sans flex items-center gap-2">
                Boutique <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20 font-mono">AI</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 hidden sm:inline-block">Сәнді Түстер мен Базалық Гардероб</span>
          </div>
        </div>
      </header>

      {/* Main Multi-grid Workspace */}
      <main className="max-w-7xl mx-auto px-4 mt-8 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NAVIGATION & INTERACTIVE SECTIONS (7 cols defaults, moves to 12 when Catalog is open to hide mannequin as requested) */}
        <section className={`${activeSection === 'catalog' ? 'lg:col-span-12' : 'lg:col-span-7'} space-y-6`}>
          
          {/* Main Navigation Tab Panel */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-2 flex gap-1 shadow-xl">
            <button
              onClick={() => setActiveSection('generate')}
              type="button"
              className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                activeSection === 'generate'
                  ? 'bg-gradient-to-r from-indigo-650 to-purple-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
              }`}
            >
              <span>⚙️</span>
              <span>Жүйелеу</span>
            </button>
            <button
              onClick={() => setActiveSection('catalog')}
              type="button"
              className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                activeSection === 'catalog'
                  ? 'bg-gradient-to-r from-indigo-650 to-purple-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
              }`}
            >
              <span>🛍️</span>
              <span>Каталог</span>
            </button>
            <button
              onClick={() => setActiveSection('assistant')}
              type="button"
              className={`flex-1 py-3 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                activeSection === 'assistant'
                  ? 'bg-gradient-to-r from-indigo-650 to-purple-650 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40'
              }`}
            >
              <span>✨</span>
              <span>ЖИ Көмекші</span>
            </button>
          </div>

          {activeSection === 'generate' ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-4">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Scissors className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-100">1. Жеке Мәліметтер мен Параметрлер</h2>
                    <p className="text-xs text-slate-400">Өлшемдер мен дене бітімі арқылы аватарыңызды бейімдеңіз</p>
                  </div>
                </div>

                {/* Input fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Gender pick */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Жынысы</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setParams(prev => ({...prev, gender: 'female'}))}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                          params.gender === 'female' 
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md shadow-indigo-500/5' 
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900/40'
                        }`}
                      >
                        🚺 Әйел адам
                      </button>
                      <button
                        type="button"
                        onClick={() => setParams(prev => ({...prev, gender: 'male'}))}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold tracking-wide transition-all ${
                          params.gender === 'male' 
                            ? 'border-indigo-500 bg-indigo-500/15 text-indigo-300 shadow-md shadow-indigo-500/5' 
                            : 'border-slate-800 bg-slate-950 text-slate-400 hover:bg-slate-900/40'
                        }`}
                      >
                        🚹 Ер адам
                      </button>
                    </div>
                  </div>

                  {/* Body Type selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Дене бітімі</label>
                    <select 
                      value={params.bodyType}
                      onChange={(e) => setParams(prev => ({...prev, bodyType: e.target.value as any}))}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="slim">Арық / Жіңішке (Slim)</option>
                      <option value="average">Орташа денелі (Average)</option>
                      <option value="athletic">Атлетикалық / Спорттық (Athletic)</option>
                      <option value="plus">Толықша келген (Plus Size)</option>
                    </select>
                  </div>

                  {/* Height Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-405">Бойы (см)</label>
                      <span className="text-xs font-mono font-bold text-indigo-400">{params.height} см</span>
                    </div>
                    <input 
                      type="range" 
                      min="140" 
                      max="220"
                      value={params.height}
                      onChange={(e) => setParams(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                      className="w-full accent-indigo-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>140 см</span>
                      <span>180 см</span>
                      <span>220 см</span>
                    </div>
                  </div>

                  {/* Weight Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-405">Салмағы (кг)</label>
                      <span className="text-xs font-mono font-bold text-blue-400">{params.weight} кг</span>
                    </div>
                    <input 
                      type="range" 
                      min="40" 
                      max="150"
                      value={params.weight}
                      onChange={(e) => setParams(prev => ({ ...prev, weight: parseInt(e.target.value) }))}
                      className="w-full accent-blue-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                      <span>40 кг</span>
                      <span>95 кг</span>
                      <span>150 кг</span>
                    </div>
                  </div>

                    {/* Personal Color Type was removed from here as requested to simplify setup */}

                  {/* Selected Season (Мезгілді Таңдау) */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Қазіргі Мезгіл (Сезон)</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => setParams(prev => ({...prev, season: 'spring'}))}
                        className={`py-2 px-3 rounded-xl text-left border flex items-center gap-2 ${
                          params.season === 'spring' ? 'border-amber-550 bg-amber-500/10 text-slate-100' : 'border-slate-800 bg-slate-950 text-slate-400 font-medium'
                        }`}
                      >
                        <span>🌸 Көктем</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setParams(prev => ({...prev, season: 'summer'}))}
                        className={`py-2 px-3 rounded-xl text-left border flex items-center gap-2 ${
                          params.season === 'summer' ? 'border-pink-550 bg-pink-500/10 text-slate-100' : 'border-slate-800 bg-slate-950 text-slate-400 font-medium'
                        }`}
                      >
                        <span>☀️ Жаз</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setParams(prev => ({...prev, season: 'autumn'}))}
                        className={`py-2 px-3 rounded-xl text-left border flex items-center gap-2 ${
                          params.season === 'autumn' ? 'border-orange-550 bg-orange-500/10 text-slate-100' : 'border-slate-800 bg-slate-950 text-slate-400 font-medium'
                        }`}
                      >
                        <span>🍁 Күз</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setParams(prev => ({...prev, season: 'winter'}))}
                        className={`py-2 px-3 rounded-xl text-left border flex items-center gap-2 ${
                          params.season === 'winter' ? 'border-cyan-550 bg-cyan-500/10 text-slate-100' : 'border-slate-800 bg-slate-950 text-slate-400 font-medium'
                        }`}
                      >
                        <span>❄️ Қыс</span>
                      </button>
                    </div>
                  </div>

                  {/* Destination/Event */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Баратын орныңыз</label>
                    <select 
                      value={params.destination}
                      onChange={(e) => setParams(prev => ({...prev, destination: e.target.value}))}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500 h-[64px]"
                    >
                      <option value="Оқуға (Университет/мектеп)">🎓 Оқуға (Университет / мектеп)</option>
                      <option value="Жұмысқа немесе Бизнес кездесуге">💼 Жұмысқа немесе Бизнес кездесуге</option>
                      <option value="Спорт немесе Белсенді демалыс">🏃‍♂️ Спорт немесе Белсенді демалыс</option>
                      <option value="Той-томалақ, кешкі Салтанатты іс-шара">✨ Той-томалақ, кешкі салтанатты іс-шара</option>
                      <option value="Күнделікті серуен (Кездесу, кафе)">☕ Күнделікті серуен (Кездесу, кафе)</option>
                    </select>
                  </div>

                </div>
              </div>

              {/* CAPSULE WARDROBE COMPONENT */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                      <Shirt className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">2. Менің Капсулалық Гардеробым</h2>
                      <p className="text-xs text-slate-400">Қосымша сатып алуды азайту үшін қолыңызда бар киімдерді белгілеңіз</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-semibold bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/20 self-start sm:self-center">
                    Таңдалды: {params.capsuleItems.length} киім
                  </span>
                </div>

                {/* Instruction on budget saving / reducing impulse buying */}
                <div className="text-xs text-indigo-300 bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-3.5 leading-relaxed">
                  💡 <strong>Гардеробты Оңтайландыру (Үнемділік):</strong> Төмендегі тізімнен сізде бар базалық киімдерді белгілеңіз. 
                  Жасанды Интеллект осы заттарға сәйкес келетін ауа-райы мен оқиғаға арналған 10 түрлі жаңа лук комбинациясын тегін жоспарлап береді.
                </div>

                {/* Quick check selections Grid */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Базалық жиынтықтан таңдау</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DEFAULT_CAPSULE_PRESETS.map((item, id) => {
                      const isChecked = params.capsuleItems.includes(item);
                      return (
                        <button
                          type="button"
                          key={id}
                          onClick={() => togglePresetItem(item)}
                          className={`text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                            isChecked 
                              ? 'border-emerald-500/80 bg-emerald-500/5 text-slate-100 shadow-sm' 
                              : 'border-slate-850 bg-slate-950/50 text-slate-400 hover:border-slate-800 hover:bg-slate-900/10'
                          }`}
                        >
                          <span className="truncate pr-1">{item}</span>
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isChecked ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'}`}>
                            {isChecked && "✓"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add Custom Clothing Items */}
                <div className="pt-2">
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Басқа жеке киіміңізді қосу</span>
                  <form onSubmit={handleAddCustomItem} className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="Мысалы: Жасыл вельвет пиджагы, қызыл кроссовка..."
                      value={customItemInput}
                      onChange={(e) => setCustomItemInput(e.target.value)}
                      className="flex-1 text-xs py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                    />
                    <button
                      type="submit"
                      className="px-4 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-xs font-bold border border-slate-700 transition-colors flex items-center gap-1 shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Қосу
                    </button>
                  </form>
                </div>

                {/* Selected items chip list (gives control to delete dynamically added items) */}
                {params.capsuleItems.length > 0 && (
                  <div>
                    <span className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Гардеробыңыздың дайын тізімі:</span>
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pr-1">
                      {params.capsuleItems.map((item, idx) => (
                        <span 
                          key={idx} 
                          className="text-[11px] font-medium bg-slate-950/80 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-300 flex items-center gap-1.5"
                        >
                          {item}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveItem(item)}
                            className="text-slate-500 hover:text-red-400 font-bold ml-0.5"
                            title="Клиенттік өшіру"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* SYNCHRONIZATION WITH KAZAKHSTAN WEATHER */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-100">3. Ауа-райымен Синхронизация</h2>
                      <p className="text-xs text-slate-400">Қай қаланың ауа-райына бейімдеп киінгіңіз келеді?</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20 animate-pulse">
                    Синхрондалды
                  </span>
                </div>

                {/* Selection of city */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Қазақстанның аймақтық қалалары</label>
                    <select 
                      value={params.city}
                      onChange={(e) => setParams(prev => ({...prev, city: e.target.value}))}
                      disabled={weatherLoading}
                      className="w-full py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-950 text-xs font-medium text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      {CITIES_LIST.map((city) => (
                        <option key={city.id} value={city.id}>{city.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Weather Status Visual Card */}
                  <div className="bg-slate-950 border border-slate-850 rounded-xl p-3.5 flex items-center justify-between relative overflow-hidden min-h-[58px]">
                    {weatherLoading ? (
                      <div className="w-full text-center py-2 flex items-center justify-center gap-2 text-xs text-slate-400 font-mono">
                        <RotateCw className="w-4 h-4 animate-spin text-blue-400" />
                        Детектер жаңартылуда...
                      </div>
                    ) : weather ? (
                      <>
                        <div className="space-y-0.5">
                          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">{weather.cityNameKz} қаласы</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-xl font-bold font-sans text-slate-100">{weather.temp > 0 ? `+${weather.temp}` : weather.temp}°C</span>
                            <span className="text-xs text-slate-300 font-medium">({weather.condition})</span>
                          </div>
                        </div>
                        {/* Icon or state badge */}
                        <div className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 flex flex-col items-center">
                          {weather.temp < 10 ? <CloudRain className="w-5 h-5 text-blue-400" /> : <CloudSun className="w-5 h-5 text-amber-400" />}
                          <span className="text-[9px] font-mono text-slate-500 mt-1">{weather.windspeed} км/сағ</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-500">Қаланы таңдаңыз</div>
                    )}
                  </div>
                </div>

                {/* Custom Manual Weather Overwrite (for sandbox testing or extreme scenarios check) */}
                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-400 select-none">
                    <input 
                      type="checkbox"
                      checked={params.customWeather}
                      onChange={(e) => setParams(prev => ({...prev, customWeather: e.target.checked}))}
                      className="rounded border-slate-800 bg-slate-950 text-indigo-500 focus:ring-0 w-4 h-4"
                    />
                    Ауа-райын қолмен өзгерту (Сценарий тестілеу)
                  </label>

                  {params.customWeather && (
                    <div className="mt-3 grid grid-cols-2 gap-3.5 bg-slate-950 p-3.5 rounded-xl border border-slate-850 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Температура (°C)</label>
                        <input 
                          type="number"
                          value={params.manualTemp}
                          onChange={(e) => setParams(prev => ({...prev, manualTemp: parseInt(e.target.value) || 0}))}
                          className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">Ауа-райы жағдайы</label>
                        <input 
                          type="text"
                          value={params.manualCondition}
                          onChange={(e) => setParams(prev => ({...prev, manualCondition: e.target.value}))}
                          placeholder="Қатты жел, қар, жаңбыр..."
                          className="w-full py-1.5 px-2.5 text-xs rounded-lg border border-slate-800 bg-slate-900 text-slate-300 focus:outline-none placeholder-slate-600"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* GENERATE SUBMIT ACTION */}
              <div>
                <button
                  onClick={handleGenerateStyle}
                  disabled={isGenerating}
                  type="button"
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-505 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-3.5 shadow-xl shadow-indigo-600/20 hover:scale-[1.01] hover:shadow-indigo-500/30 disabled:opacity-50 disabled:pointer-events-none text-sm cursor-pointer"
                  id="style-generate-trigger"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>ЖАСАНДЫ ИНТЕЛЛЕКТ ТАЛДАП ЖАТЫР...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
                      <span>ЖИ СТИЛЬ ЖӘНЕ 10 ЛУК ГЕНЕРАЦИЯЛАУ</span>
                    </>
                  )}
                </button>
                {errorText && (
                  <div className="mt-3.5 text-xs text-red-400 bg-red-950/20 border border-red-500/20 rounded-xl p-3 leading-relaxed">
                    ⚠️ <strong>Генерация қатесі:</strong> {errorText}
                  </div>
                )}
              </div>

            </div>
          ) : activeSection === 'catalog' ? (
            <CatalogSection 
              activeOutfit={activeOutfitOverride !== null ? activeOutfitOverride : (generatedStyle?.outfitItems || [])}
              gender={params.gender}
            />
          ) : (
            <AssistantSection gender={params.gender} />
          )}

        </section>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL VORTEX (5 cols) - completely hidden in catalog section as requested */}
        <section className={`${activeSection === 'catalog' ? 'hidden' : 'lg:col-span-12 xl:col-span-5'} lg:sticky lg:top-24 space-y-8`}>
          
          {/* AI Lookbook Collage Rendering Section */}
          <LookbookCollage 
            gender={params.gender}
            bodyType={params.bodyType}
            colorType={params.colorType}
            outfitItems={generatedStyle?.outfitItems || []}
            capsuleItems={params.capsuleItems}
            isGeneratingStyle={isGenerating}
            generatedStyle={generatedStyle}
          />

          {/* AI Style Output Container */}
          {generatedStyle ? (
            <div className="bg-slate-900 border border-indigo-950/50 rounded-2xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-6 duration-400">
              
              {/* Output Tab switcher */}
              <div className="flex border-b border-slate-800 bg-slate-950/45 text-xs font-bold leading-none">
                <button
                  onClick={() => setActiveTab('outfit')}
                  className={`flex-1 py-4 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'outfit' 
                      ? 'border-indigo-500 text-indigo-400 bg-slate-900/40' 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                  }`}
                >
                  <Shirt className="w-4 h-4" /> Шыққан Лук & Түстер
                </button>
                <button
                  onClick={() => setActiveTab('capsule')}
                  className={`flex-1 py-4 text-center border-b-2 transition-colors flex items-center justify-center gap-2 ${
                    activeTab === 'capsule' 
                      ? 'border-emerald-500 text-emerald-400 bg-slate-900/40' 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/10'
                  }`}
                >
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Капсуладан 5 ЛУК</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Жаңа</span>
                </button>
              </div>

              {/* TAB 1 CONTENT: Current generated layout outfits & Advice analysis */}
              {activeTab === 'outfit' && (
                <div className="p-6 space-y-6">
                  
                  {/* Detailed Description */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold text-indigo-400 uppercase tracking-wider font-mono">Стилист Кеңесі</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                      {generatedStyle.styledDescription}
                    </p>
                  </div>

                  {/* Weather description advice */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-extrabold text-blue-400 uppercase tracking-wider font-mono">Ауа-райы сәйкестігі</h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-xl border border-slate-850">
                      {generatedStyle.weatherAdvice}
                    </p>
                  </div>

                  {/* Outfit list (Kazakh Brands lists without buy triggers here) */}
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">Шығарылған Киімдер жинағы</h4>
                      <span className="text-[10px] font-mono text-emerald-400">Каталогтан соңғы бағалары 🏷️</span>
                    </div>

                    <div className="space-y-2.5">
                      {generatedStyle.outfitItems.map((item, idx) => (
                        <div 
                          key={idx}
                          className="bg-slate-950 p-3 rounded-xl border border-slate-850 flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Color preview circle */}
                            <span 
                              className="w-7 h-7 rounded-lg shrink-0 border border-white/10 shadow-sm flex items-center justify-center font-mono text-[9px] text-[#000000]/0" 
                              style={{ backgroundColor: item.color }}
                              title={item.colorName}
                            />
                            <div className="min-w-0">
                              <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase tracking-wider">{item.category}</span>
                              <p className="font-bold text-slate-200 truncate">{item.name}</p>
                              <span className="text-[11px] text-slate-400 inline-block font-mono">Бренд: <span className="text-indigo-300 underline font-sans font-semibold">{item.brandName}</span></span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 flex flex-col items-end justify-center">
                            <span className="font-mono font-extrabold text-slate-100">{item.priceKzt.toLocaleString()} ₸</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Passive income explanation banner (Crucial for Jury pitch) */}
                    <div className="p-3 bg-indigo-950/20 border border-slate-800 rounded-xl flex items-center gap-2.5 mt-2">
                      <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                      <p className="text-[10.5px] text-slate-400 leading-snug">
                        <strong>Бизнес-Модель:</strong> Киімдерді сатып алу үшін жоғарыдағы <strong>📖 КАТАЛОГ</strong> бөліміне өтіп, брендтердің ресми сайтына ауысу батырмасын басыңыз.
                      </p>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2 CONTENT: CAPSULE 5 OUTFITS COMBINATIONS */}
              {activeTab === 'capsule' && (
                <div className="p-6 space-y-6">
                  
                  {/* Explanatory subtitle */}
                  <div className="bg-slate-950 rounded-xl p-3.5 border border-slate-850 text-xs text-slate-300">
                    <p className="font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-4 h-4" /> 5 Капсулалық стильдік лук жинақталды!
                    </p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      ЖИ сіздің гардеробыңызда бар негізгі киімдерді талдап, 5 түрлі стиль бағытында бірегей комбинация құрастырды.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {generatedStyle.capsule5Looks.map((look, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-850 space-y-2.5 relative hover:border-emerald-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-[10px] font-bold shrink-0 border border-emerald-500/20">
                              {index + 1}
                            </span>
                            <h5 className="text-xs font-bold text-slate-100">{look.title}</h5>
                          </div>
                          <span className="text-[10px] font-bold text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                            {look.styleName}
                          </span>
                        </div>

                        {/* Items listed */}
                        <div className="flex flex-wrap gap-1">
                          {look.itemsUsed.map((used, uid) => (
                            <span 
                              key={uid}
                              className="text-[10px] font-semibold bg-indigo-950/30 text-indigo-300 border border-slate-800 rounded px-1.5 py-0.5"
                            >
                              👕 {used}
                            </span>
                          ))}
                        </div>

                        {/* Comment advice */}
                        <p className="text-[11px] text-slate-400 italic font-medium leading-normal pt-1 pl-1 border-l border-emerald-500/40">
                          {look.comment}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Conclusion recommendation stats */}
                  <div className="p-4 bg-slate-950 border border-slate-850 rounded-xl text-center space-y-2">
                    <span className="font-mono text-xs text-indigo-400 tracking-wider uppercase block">Гардеробты Оңтайландыру коэфициенті</span>
                    <div className="text-2xl font-black text-slate-100 font-mono">92% ҮНЕМДІЛІК</div>
                    <p className="text-[10px] text-slate-500 max-w-xs mx-auto">
                      Пайдаланушы жаңа 5 лук алу үшін өз гардеробында бар базаны пайдаланды, жаңадан тек аксессуарлар ғана сатып алынды.
                    </p>
                  </div>

                </div>
              )}

            </div>
          ) : (
            /* Placeholder before first generation */
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-200">Таңдауларды орнатып ЖИ Стильді іске қосыңыз</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Бойыңыз, салмағыңыз және гардероб капсулаңызды сол жақтағы панельде көрсетіп, «Бүгін не киемін?» сұрағына 10 түрлі жауап алыңыз!
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-left pt-3 max-w-md mx-auto">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Үлесім ерекшелігі</span>
                  <p className="text-[11px] font-bold text-slate-300">ҚР Отандық брендтермен синхрондау</p>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 space-y-1">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Экологиялық әсер</span>
                  <p className="text-[11px] font-bold text-slate-300">Гардеробты шексіз комбинациялау</p>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 mt-16 sm:px-8 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-550 font-mono">
        <div>
          <span>© 2026 Boutique AI. | Барлық құқықтар қорғалған.</span>
        </div>
      </footer>

    </div>
  );
}
