import React, { useState } from "react";
import { OutfitItem } from "../types";
import { Search, Heart, SlidersHorizontal, Check, RefreshCw, ExternalLink } from "lucide-react";

interface CatalogSectionProps {
  activeOutfit: OutfitItem[];
  gender: 'male' | 'female' | 'unisex';
}

interface CatalogClothItem {
  id: string;
  category: 'Top' | 'Bottom' | 'Outerwear' | 'Shoes' | 'Accessories';
  name: string;
  color: string;
  colorName: string;
  brandName: string;
  brandLink: string;
  priceKzt: number;
  seasons: ('spring' | 'summer' | 'autumn' | 'winter')[];
  styles: ('Классикалық' | 'Күнделікті (Casual)' | 'Спорттық' | 'Сәнді (Trendy)')[];
  gender: 'male' | 'female' | 'unisex';
  image: string;
}

const CATALOG_DATABASE: CatalogClothItem[] = [
  // Tops
  {
    id: "top-1",
    category: "Top",
    name: "Ақ базалық оверсайз футболка",
    color: "#F9FAFB",
    colorName: "Ақшыл база",
    brandName: "Qazaq Republic",
    brandLink: "https://qazaqrepublic.com",
    priceKzt: 8900,
    seasons: ["spring", "summer"],
    styles: ["Күнделікті (Casual)", "Спорттық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-2",
    category: "Top",
    name: "Қара классикалық зығыр жейде (рубашка)",
    color: "#111827",
    colorName: "Қара түсті мақта",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 18900,
    seasons: ["spring", "summer", "autumn"],
    styles: ["Классикалық", "Күнделікті (Casual)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-3",
    category: "Top",
    name: "Көк жібек асыл блузка",
    color: "#1E3A8A",
    colorName: "Океан көк",
    brandName: "Adili",
    brandLink: "https://adili.kz",
    priceKzt: 22000,
    seasons: ["spring", "autumn"],
    styles: ["Классикалық", "Сәнді (Trendy)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1607345366448-cf99b42900a1?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-4",
    category: "Top",
    name: "Қоңыр мақта премиум свитшот",
    color: "#451A03",
    colorName: "Какао қоңыр",
    brandName: "Qazaq Republic",
    brandLink: "https://qazaqrepublic.com",
    priceKzt: 16900,
    seasons: ["autumn", "winter", "spring"],
    styles: ["Күнделікті (Casual)", "Спорттық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-5",
    category: "Top",
    name: "Сұр тоқылған жылы свитер",
    color: "#4B5563",
    colorName: "Ұялы сұр",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 21900,
    seasons: ["autumn", "winter"],
    styles: ["Күнделікті (Casual)", "Сәнді (Trendy)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1614975058789-41316d0e2e9c?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-6",
    category: "Top",
    name: "Стильді қазақстандық 'Nomade' сұр худиі",
    color: "#4B5563",
    colorName: "Оюлы сұр",
    brandName: "Global Nomads",
    brandLink: "https://globalnomads.pro",
    priceKzt: 19900,
    seasons: ["spring", "autumn", "winter"],
    styles: ["Күнделікті (Casual)", "Спорттық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-7",
    category: "Top",
    name: "Сұр түсті күнделікті мақта свитшот",
    color: "#4B5563",
    colorName: "Меланж сұр",
    brandName: "LC Waikiki",
    brandLink: "https://www.lcwaikiki.kz",
    priceKzt: 12900,
    seasons: ["spring", "autumn", "winter"],
    styles: ["Күнделікті (Casual)", "Спорттық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "top-8",
    category: "Top",
    name: "Классикалық жібек кеңірек блузка жейде",
    color: "#F9FAFB",
    colorName: "Жұмсақ кремді ақ",
    brandName: "Koton",
    brandLink: "https://www.koton.com",
    priceKzt: 14500,
    seasons: ["spring", "summer", "autumn"],
    styles: ["Классикалық", "Күнделікті (Casual)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1548624149-f8b17d04bc03?auto=format&fit=crop&w=600&q=80"
  },
  // Bottoms
  {
    id: "bottom-1",
    category: "Bottom",
    name: "Қара кең классикалық шалбар",
    color: "#111827",
    colorName: "Терең қара",
    brandName: "Shoqan Suits",
    brandLink: "https://kaspi.kz",
    priceKzt: 28000,
    seasons: ["autumn", "winter", "spring"],
    styles: ["Классикалық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bottom-2",
    category: "Bottom",
    name: "Көк тік пішінді джинсы шалбар",
    color: "#1E3A8A",
    colorName: "Джинс көк",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 19500,
    seasons: ["spring", "summer", "autumn", "winter"],
    styles: ["Күнделікті (Casual)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bottom-3",
    category: "Bottom",
    name: "Сарғыш кең жаздық шалбар",
    color: "#F5F5DC",
    colorName: "Құм түстес беж",
    brandName: "Qazaq Republic",
    brandLink: "https://qazaqrepublic.com",
    priceKzt: 14900,
    seasons: ["spring", "summer"],
    styles: ["Күнделікті (Casual)", "Сәнді (Trendy)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bottom-4",
    category: "Bottom",
    name: "Күлгін баллон сәнді юбка (белдемше)",
    color: "#7C3AED",
    colorName: "Неон күлгін",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 16500,
    seasons: ["spring", "summer"],
    styles: ["Сәнді (Trendy)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bottom-5",
    category: "Bottom",
    name: "Сыртқы спорттық карго шалбар",
    color: "#4B5563",
    colorName: "Әскери сұр",
    brandName: "Global Nomads",
    brandLink: "https://globalnomads.pro",
    priceKzt: 21500,
    seasons: ["spring", "autumn", "winter"],
    styles: ["Күнделікті (Casual)", "Спорттық", "Сәнді (Trendy)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1517423568366-8b83523034fd?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bottom-6",
    category: "Bottom",
    name: "Көк классикалық деним джинсы шалбары",
    color: "#1E3A8A",
    colorName: "Базалық көк",
    brandName: "LC Waikiki",
    brandLink: "https://www.lcwaikiki.kz",
    priceKzt: 13900,
    seasons: ["spring", "summer", "autumn", "winter"],
    styles: ["Күнделікті (Casual)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "bottom-7",
    category: "Bottom",
    name: "Сәнді былғары қара белдемше (юбка)",
    color: "#111827",
    colorName: "Тері қара",
    brandName: "Koton",
    brandLink: "https://www.koton.com",
    priceKzt: 15900,
    seasons: ["spring", "autumn"],
    styles: ["Сәнді (Trendy)", "Күнделікті (Casual)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80"
  },
  // Outerwear
  {
    id: "outer-1",
    category: "Outerwear",
    name: "Ақ стильді классикалық пиджак",
    color: "#F9FAFB",
    colorName: "Ақ меруерт",
    brandName: "Shoqan Suits",
    brandLink: "https://shoqansuits.com",
    priceKzt: 55000,
    seasons: ["spring", "autumn"],
    styles: ["Классикалық", "Сәнді (Trendy)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "outer-2",
    category: "Outerwear",
    name: "Қара былғары күрте (косуха)",
    color: "#111827",
    colorName: "Жылтыр қара",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 49000,
    seasons: ["spring", "autumn"],
    styles: ["Күнделікті (Casual)", "Сәнді (Trendy)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "outer-3",
    category: "Outerwear",
    name: "Ұзын қоңыр классикалық пальто",
    color: "#451A03",
    colorName: "Терең қоңыр",
    brandName: "Shoqan Suits",
    brandLink: "https://shoqansuits.com",
    priceKzt: 85000,
    seasons: ["autumn", "winter"],
    styles: ["Классикалық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "outer-4",
    category: "Outerwear",
    name: "Сарғыш (бежевый) тренч плащы",
    color: "#F5F5DC",
    colorName: "Жылы беж",
    brandName: "Adili",
    brandLink: "https://adili.kz",
    priceKzt: 48005,
    seasons: ["spring", "autumn"],
    styles: ["Классикалық", "Күнделікті (Casual)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "outer-5",
    category: "Outerwear",
    name: "Сұр оверсайз жайлы кардиган",
    color: "#4B5563",
    colorName: "Меланж сұр",
    brandName: "Qazaq Republic",
    brandLink: "https://qazaqrepublic.com",
    priceKzt: 28900,
    seasons: ["spring", "autumn", "winter"],
    styles: ["Күнделікті (Casual)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "outer-6",
    category: "Outerwear",
    name: "Күздік жеңіл желден қорғайтын бомбер желқағаз",
    color: "#1E3A8A",
    colorName: "Көк шторм",
    brandName: "LC Waikiki",
    brandLink: "https://www.lcwaikiki.kz",
    priceKzt: 22900,
    seasons: ["spring", "autumn"],
    styles: ["Күнделікті (Casual)", "Спорттық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "outer-7",
    category: "Outerwear",
    name: "Сәнді твид блейзер жакет",
    color: "#EA580C",
    colorName: "Сәнді қызғылт",
    brandName: "Koton",
    brandLink: "https://www.koton.com",
    priceKzt: 24900,
    seasons: ["spring", "autumn"],
    styles: ["Классикалық", "Сәнді (Trendy)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=600&q=80"
  },
  // Shoes
  {
    id: "shoes-1",
    category: "Shoes",
    name: "Классикалық ақ эко-жасанды кроссовка",
    color: "#F9FAFB",
    colorName: "Ақ қар",
    brandName: "Qazaq Republic",
    brandLink: "https://qazaqrepublic.com",
    priceKzt: 29900,
    seasons: ["spring", "summer", "autumn"],
    styles: ["Күнделікті (Casual)", "Спорттық"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "shoes-2",
    category: "Shoes",
    name: "Қара сәнді күдері лоферлер",
    color: "#111827",
    colorName: "Қара барқыт",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 35000,
    seasons: ["spring", "summer", "autumn"],
    styles: ["Классикалық", "Күнделікті (Casual)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "shoes-3",
    category: "Shoes",
    name: "Қоңыр су өткізбейтін былғары бәтеңке",
    color: "#451A03",
    colorName: "Қою шоко",
    brandName: "Shoqan Suits",
    brandLink: "https://shoqansuits.com",
    priceKzt: 42000,
    seasons: ["autumn", "winter"],
    styles: ["Классикалық", "Күнделікті (Casual)"],
    gender: "male",
    image: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=600&q=80"
  },
  // Accessories
  {
    id: "acc-1",
    category: "Accessories",
    name: "Сарғыш жібек сәнді шарф",
    color: "#FDBA74",
    colorName: "Алтын сарғыш",
    brandName: "Adili",
    brandLink: "https://adili.kz",
    priceKzt: 12500,
    seasons: ["spring", "autumn", "winter"],
    styles: ["Классикалық", "Сәнді (Trendy)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1615397349754-cfa2066a298e?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "acc-2",
    category: "Accessories",
    name: "Қара күннен қорғайтын көзілдірік",
    color: "#111827",
    colorName: "Көмір қара",
    brandName: "Saba",
    brandLink: "https://kaspi.kz",
    priceKzt: 8900,
    seasons: ["spring", "summer"],
    styles: ["Күнделікті (Casual)", "Сәнді (Trendy)"],
    gender: "unisex",
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80"
  },
  {
    id: "acc-3",
    category: "Accessories",
    name: "Сары алтын жұқа алқа",
    color: "#EA580C",
    colorName: "Оранж алтын",
    brandName: "Adili",
    brandLink: "https://adili.kz",
    priceKzt: 18500,
    seasons: ["spring", "summer", "autumn", "winter"],
    styles: ["Классикалық", "Сәнді (Trendy)"],
    gender: "female",
    image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80"
  }
];

export default function CatalogSection({ activeOutfit, gender }: CatalogSectionProps) {
  // Input states (before clicking search button)
  const [searchTermInput, setSearchTermInput] = useState("");
  const [catFilterInput, setCatFilterInput] = useState<string>("all");
  const [seasonFilterInput, setSeasonFilterInput] = useState<string>("all");
  const [colorFilterInput, setColorFilterInput] = useState<string>("all");
  const [styleFilterInput, setStyleFilterInput] = useState<string>("all");

  // Applied states (used to perform actual catalog filtering)
  const [searchTerm, setSearchTerm] = useState("");
  const [catFilter, setCatFilter] = useState("all");
  const [seasonFilter, setSeasonFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  
  // Searching/processing state simulator
  const [isSearching, setIsSearching] = useState(false);

  // Favorites list local persistence using IDs
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("boutique_favorites");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (favorites.includes(id)) {
      updated = favorites.filter(favId => favId !== id);
    } else {
      updated = [...favorites, id];
    }
    setFavorites(updated);
    localStorage.setItem("boutique_favorites", JSON.stringify(updated));
  };

  // Perform search & filter update with beautiful simulation response
  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setSearchTerm(searchTermInput);
      setCatFilter(catFilterInput);
      setSeasonFilter(seasonFilterInput);
      setColorFilter(colorFilterInput);
      setStyleFilter(styleFilterInput);
      setIsSearching(false);
    }, 450); // 450ms premium search feel with custom skeleton effects
  };

  // Filter application
  const filteredItems = CATALOG_DATABASE.filter(item => {
    // 1. Gender filtering (hide items strictly meant for other genders to keep look visually pristine)
    if (gender !== "unisex" && item.gender !== "unisex" && item.gender !== gender) {
      return false;
    }
    
    // 2. Search query match
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchName = item.name.toLowerCase().includes(query);
      const matchBrand = item.brandName.toLowerCase().includes(query);
      const matchColor = item.colorName.toLowerCase().includes(query);
      if (!matchName && !matchBrand && !matchColor) return false;
    }

    // 3. Category match
    if (catFilter !== "all" && item.category !== catFilter) {
      return false;
    }

    // 4. Season match
    if (seasonFilter !== "all" && !item.seasons.includes(seasonFilter as any)) {
      return false;
    }

    // 5. Hardcoded basic color match
    if (colorFilter !== "all") {
      const col = item.color.toLowerCase();
      if (colorFilter === "black" && !["#111827", "#1e293b"].includes(col)) return false;
      if (colorFilter === "white" && !["#f9fafb", "#ffffff"].includes(col)) return false;
      if (colorFilter === "blue" && !col.includes("1e3a8a")) return false;
      if (colorFilter === "beige" && !["#f5f5dc", "#fdba74"].includes(col)) return false;
    }

    // 6. Style match
    if (styleFilter !== "all" && !item.styles.includes(styleFilter as any)) {
      return false;
    }

    // 7. Only favorites
    if (onlyFavorites && !favorites.includes(item.id)) {
      return false;
    }

    return true;
  });

  // Check if item is tried on is currently being worn on the avatar right hand panel
  const isItemWorn = (catalogItem: CatalogClothItem) => {
    return activeOutfit.some(worn => 
      worn.name.toLowerCase() === catalogItem.name.toLowerCase() ||
      (worn.category.toLowerCase() === catalogItem.category.toLowerCase() && worn.brandName === "Өз капсулаңыз")
    );
  };

  // Reset filtering tags easily
  const resetFilters = () => {
    setSearchTermInput("");
    setCatFilterInput("all");
    setSeasonFilterInput("all");
    setColorFilterInput("all");
    setStyleFilterInput("all");

    setSearchTerm("");
    setCatFilter("all");
    setSeasonFilter("all");
    setColorFilter("all");
    setStyleFilter("all");
    setOnlyFavorites(false);
  };

  return (
    <div className="space-y-6" id="catalog-section-container">
      
      {/* Search and Filters Header Form */}
      <form 
        onSubmit={handleSearch}
        className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4"
      >
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Main search input field with explicit Search button */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input 
                type="text"
                placeholder="Киім атауын, брендті немесе түсті жазыңыз..."
                value={searchTermInput}
                onChange={(e) => setSearchTermInput(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-slate-200 focus:outline-none focus:border-indigo-500 placeholder-slate-600 transition-colors"
              />
            </div>
            
            {/* Direct Search input submit button */}
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 hover:indigo-500/80 transition-all cursor-pointer shadow-lg shadow-indigo-600/15 shrink-0"
              title="Іздеу пернесін іске қосу"
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Іздеу</span>
            </button>
          </div>

          {/* Toggle only favorites option selector */}
          <button
            onClick={() => setOnlyFavorites(prev => !prev)}
            type="button"
            className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shrink-0 ${
              onlyFavorites 
                ? "border-pink-500 bg-pink-500/10 text-pink-400" 
                : "border-slate-800 bg-slate-950 text-slate-400 hover:text-slate-200"
            }`}
          >
            <Heart className={`w-4 h-4 ${onlyFavorites ? "fill-pink-500 stroke-pink-500" : ""}`} />
            <span>Таңдаулылар ({favorites.length})</span>
          </button>
        </div>

        {/* Multi filter drawers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          
          {/* Category SELECT dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Санат</span>
            <select
              value={catFilterInput}
              onChange={(e) => setCatFilterInput(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 h-9"
            >
              <option value="all">Барлық киімдер</option>
              <option value="Top">Үстіңгі (Tops)</option>
              <option value="Bottom">Астыңғы (Bottoms)</option>
              <option value="Outerwear">Сыртқы киім (Outer)</option>
              <option value="Shoes">Аяқ киім (Shoes)</option>
              <option value="Accessories">Аксессуарлар</option>
            </select>
          </div>

          {/* Season SELECT dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Мезгіл (Сезон)</span>
            <select
              value={seasonFilterInput}
              onChange={(e) => setSeasonFilterInput(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 h-9"
            >
              <option value="all">Барлық мезгілдер</option>
              <option value="summer">☀️ Жаз (Summer)</option>
              <option value="autumn">🍁 Күз (Autumn)</option>
              <option value="winter">❄️ Қыс (Winter)</option>
              <option value="spring">🌸 Көктем (Spring)</option>
            </select>
          </div>

          {/* Color SELECT filter dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Түс аясы</span>
            <select
              value={colorFilterInput}
              onChange={(e) => setColorFilterInput(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 h-9"
            >
              <option value="all">Барлық түстер</option>
              <option value="black">Қаралау / Көмір</option>
              <option value="white">Ақшыл / База</option>
              <option value="blue">Көктеу тондар</option>
              <option value="beige">Сарғыш / Бежевый</option>
            </select>
          </div>

          {/* Style SELECT dropdown */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono">Стиль бағыты</span>
            <select
              value={styleFilterInput}
              onChange={(e) => setStyleFilterInput(e.target.value)}
              className="w-full text-xs py-2 px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 focus:outline-none focus:border-indigo-500 h-9"
            >
              <option value="all">Барлық стильдер</option>
              <option value="Классикалық">Классикалық</option>
              <option value="Күнделікті (Casual)">Күнделікті (Casual)</option>
              <option value="Спорттық">Спорттық</option>
              <option value="Сәнді (Trendy)">Сәнді (Trendy)</option>
            </select>
          </div>

        </div>

        {/* Dynamic Action Buttons / Active Criteria Info */}
        <div className="flex flex-col sm:flex-row gap-3 pt-3 justify-between items-center border-t border-slate-800/60">
          <div className="text-xs text-slate-400 self-start sm:self-center">
            {isSearching ? (
              <span className="flex items-center gap-2 text-indigo-400 font-medium">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Деректерді сүзу барысы...
              </span>
            ) : (
              <span>Табылған сәйкес өнімдер: <strong className="text-slate-100">{filteredItems.length}</strong></span>
            )}
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {(searchTerm || catFilter !== "all" || seasonFilter !== "all" || colorFilter !== "all" || styleFilter !== "all" || onlyFavorites) && (
              <button
                onClick={resetFilters}
                type="button"
                className="text-slate-400 hover:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer px-4 py-2 border border-slate-800 bg-slate-950/40 hover:bg-slate-950 rounded-xl flex-1 sm:flex-none"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Сүзгіні тазарту
              </button>
            )}
            
            {/* The physical requested Search button to apply all custom filters */}
            <button
              type="submit"
              disabled={isSearching}
              className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:from-slate-850 disabled:to-slate-800 text-white font-sans font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 flex items-center justify-center gap-2 cursor-pointer flex-1 sm:flex-none"
            >
              {isSearching ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <SlidersHorizontal className="w-4 h-4" />
              )}
              <span>Іздеу және сүзуді қолдану</span>
            </button>
          </div>
        </div>

      </form>

      {/* Catalog Grid */}
      {isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4.5 space-y-3.5 animate-pulse min-h-[340px] flex flex-col justify-between">
              <div className="h-48 rounded-xl bg-slate-950 border border-slate-800" />
              <div className="space-y-2 flex-1 pt-2">
                <div className="h-3 bg-slate-800 rounded w-1/3" />
                <div className="h-4 bg-slate-800 rounded w-2/3" />
                <div className="h-3 bg-slate-800 rounded w-1/2 pt-1" />
              </div>
              <div className="h-9 bg-slate-800 rounded-xl w-full mt-3" />
            </div>
          ))}
        </div>
      ) : filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const isWorn = isItemWorn(item);
            const isFav = favorites.includes(item.id);
            return (
              <div 
                key={item.id}
                className={`bg-slate-900 border rounded-2xl p-4.5 space-y-3.5 shadow-md flex flex-col justify-between transition-all group overflow-hidden ${
                  isWorn 
                    ? "border-emerald-500/50 shadow-emerald-950/20" 
                    : "border-slate-800/80 hover:border-slate-700/80"
                }`}
              >
                {/* Original Garment Photo instead of Color box based on Kazakh Boutique specifications */}
                <div className="h-48 rounded-xl relative flex items-center justify-center border border-slate-800 bg-slate-950 overflow-hidden shadow-inner">
                  
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                  />
                  
                  {/* Outer gradient overlay across the image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />
                  
                  {/* Category icon overlay badge */}
                  <span className="absolute top-2.5 left-2.5 bg-slate-950/80 text-slate-300 px-2 py-0.5 rounded-md text-[10px] font-mono tracking-wider font-bold uppercase border border-slate-800/80 select-none">
                    {item.category === 'Top' ? '👕 ' : item.category === 'Bottom' ? '👖 ' : item.category === 'Outerwear' ? '🧥 ' : item.category === 'Shoes' ? '👟 ' : '🎗️ '}{item.category}
                  </span>

                  {/* Toggle favorite heart toggle indicator */}
                  <button
                    onClick={(e) => toggleFavorite(item.id, e)}
                    type="button"
                    className={`absolute top-2.5 right-2.5 w-7.5 h-7.5 rounded-full bg-slate-950/80 backdrop-blur-md flex items-center justify-center border transition-all cursor-pointer ${
                      isFav 
                        ? "border-pink-500 text-pink-500 scale-105" 
                        : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-pink-400"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? "fill-pink-500 stroke-pink-500" : ""}`} />
                  </button>

                  <div className="absolute bottom-2.5 left-2.5 z-10 font-sans pointer-events-none select-none">
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900/90 text-slate-200 border border-slate-800 backdrop-blur-sm shadow-sm"
                    >
                      Түсі: {item.colorName}
                    </span>
                  </div>
                </div>

                {/* Detail text */}
                <div className="space-y-1.5 flex-1 select-none">
                  <div className="flex justify-between items-baseline gap-2">
                    <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-widest">{item.brandName}</span>
                    <span className="text-[10px] text-slate-500 font-bold">{item.seasons.map(s => s === 'spring' ? 'Көктем' : s === 'summer' ? 'Жаз' : s === 'autumn' ? 'Күз' : 'Қыс').join(', ')}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors leading-tight h-10 line-clamp-2">
                    {item.name}
                  </h4>
                  <div className="flex flex-wrap gap-1 pt-1.5">
                    {item.styles.map((style, idx) => (
                      <span key={idx} className="text-[9.5px] font-medium bg-slate-950 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-md">
                        {style}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Trigger controls */}
                <div className="pt-3 border-t border-slate-800/40 flex items-center justify-between gap-3.5">
                  <span className="font-mono font-black text-base text-slate-100">{item.priceKzt.toLocaleString()} ₸</span>
                  
                  <a 
                    href={item.brandLink}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-sans font-bold text-xs transition-all flex items-center gap-1.5 leading-none shadow-md shadow-emerald-500/10 cursor-pointer"
                    title="Брендтің ресми дүкенінен сатып алу"
                  >
                    Сатып алу <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center space-y-3.5 shadow-xl">
          <p className="text-sm font-bold text-slate-300">Пайдаланушыға сәйкес келетін киімдер табылмады</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Сүзгі өлшемдерін өзгертіңіз немесе басқа іздеу кілт сөздерін енгізіңіз.
          </p>
          <button 
            onClick={resetFilters} 
            type="button" 
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Барлық киімдерді көрсету
          </button>
        </div>
      )}

    </div>
  );
}
