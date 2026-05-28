import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Gemini API Client
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in AI Studio Secrets.");
    }
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Coordinate mapping for Kazakhstan major cities to enable real weather integration without API keys (via open-meteo)
interface CityCoords {
  lat: number;
  lon: number;
  nameKz: string;
}

const KAZAKHSTAN_CITIES: Record<string, CityCoords> = {
  Astana: { lat: 51.1694, lon: 71.4491, nameKz: "Астана" },
  Almaty: { lat: 43.2389, lon: 76.8897, nameKz: "Алматы" },
  Shymkent: { lat: 42.3249, lon: 69.5882, nameKz: "Шымкент" },
  Karaganda: { lat: 49.8019, lon: 73.0874, nameKz: "Қарағанды" },
  Aktobe: { lat: 50.2839, lon: 57.1670, nameKz: "Ақтөбе" },
  Atyrau: { lat: 47.0945, lon: 51.9149, nameKz: "Атырау" },
  Oskemen: { lat: 49.9482, lon: 82.6121, nameKz: "Өскемен" },
  Uralsk: { lat: 51.2333, lon: 51.3667, nameKz: "Орал" },
  Pavlodar: { lat: 52.3000, lon: 76.9500, nameKz: "Павлодар" },
  Taraz: { lat: 42.9000, lon: 71.3667, nameKz: "Тараз" }
};

// Weather condition converter
function getWeatherConditionKz(code: number): string {
  if (code === 0) return "Ашық аспан";
  if ([1, 2, 3].includes(code)) return "Бұлтты";
  if ([45, 48].includes(code)) return "Тұманды";
  if ([51, 53, 55].includes(code)) return "Сіркіреген жаңбыр";
  if ([61, 63, 65].includes(code)) return "Жаңбыр";
  if ([71, 73, 75, 77].includes(code)) return "Қар жауып тұр";
  if ([80, 81, 82].includes(code)) return "Нөсер жаңбыр";
  if ([85, 86].includes(code)) return "Қар аралас жаңбыр";
  if ([95, 96, 99].includes(code)) return "Найзағай";
  return "Құбылмалы";
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Weather API endpoint
app.get("/api/weather", async (req, res) => {
  const cityKey = (req.query.city as string) || "Astana";
  const cityData = KAZAKHSTAN_CITIES[cityKey];

  if (!cityData) {
    return res.status(404).json({ error: "City not found in our database" });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${cityData.lat}&longitude=${cityData.lon}&current_weather=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Weather service status code: " + response.status);
    }
    const data = await response.json();
    const current = data.current_weather;
    const temp = Math.round(current.temperature);
    const code = current.weathercode;
    const wind = Math.round(current.windspeed);

    return res.json({
      city: cityKey,
      cityNameKz: cityData.nameKz,
      temp,
      condition: getWeatherConditionKz(code),
      windspeed: wind,
      success: true
    });
  } catch (err: any) {
    console.error("Weather fetching error (using fallback):", err);
    // Graceful fallback weather so it never fails
    return res.json({
      city: cityKey,
      cityNameKz: cityData.nameKz,
      temp: cityKey === "Astana" ? 12 : 18,
      condition: "Ашық мәлімет (Оффлайн режим)",
      windspeed: 15,
      success: false
    });
  }
});

// AI Outfit & Capsule styling generation
app.post("/api/generate-style", async (req, res) => {
  const {
    height,
    weight,
    gender = "female",
    bodyType = "average",
    colorType = "autumn",
    season = "autumn",
    destination = "Оқуға",
    weather = { temp: 15, condition: "Бұлтты", city: "Astana" },
    capsuleItems = []
  } = req.body;

  try {
    const ai = getGeminiClient();

    const capsuleDescription = capsuleItems.length > 0 
      ? `Пайдаланушының гардеробында бар негізгі киімдер (Капсула): ${capsuleItems.join(", ")}.`
      : "Пайдаланушы ешқандай негізгі капсула белгілемеді (оны бос қалдырды, сондықтан негізгі киімдерді де өзіңіз ұсыныңыз).";

    const prompt = `
      Сен - Қазақстанның ең жақсы кәсіби Сән Стилі кеңесшісісің. Сенің міндетің - мына деректер бойынша толыққанды стильді лук, ауа-райына сәйкес ұсыныстар және 10 түрлі үйлесімді стиль (капсула) құрастыру.
      
      МАҢЫЗДЫ ТАЛАПТАР:
      1. СЫРТҚЫ КИІМ ЕРЕЖЕСІ: Әр генерацияда сыртқы киім (Outerwear: куртка, пальто, кардиган, пиджак) бере берудің қажеті мүлдем ЖОҚ! Сыртқы киімді тек қыс (Winter), күз (Autumn) мезгілдерінде немесе температура +15°C-тан ТӨМЕН болғанда ғана ұсын. Егер уақыт жаз немесе көктем болса және температура +15°C-тан ЖОҒАРЫ болса, сыртқы киімді (Outerwear) МҮЛДЕМ ҰСЫНБА, тек футболка/көйлек (Top), шалбар/юбка (Bottom), аяқ киім (Shoes) немесе аксессуарлар ұсын!
      2. Үнемі бір киімді қайталай берме! Әр генерацияда алуан түрлі, өте сәнді, шынайы пішінді және бірегей киімдер ұсын (мысалы, "Классикалық пиджак", "Жылы куртка", "Сәнді пальто", "Трикотаж кардиган", "Худи").
      3. Киімдердің атауларына түрін нақты қосып жаз, өйткені біздің веб-сайттағы 2D Аватар сол атаудағы кілт сөздер аясында сызба пішінін өзгертеді:
         - Сыртқы киім үшін (тек қажет болғанда): "Пиджак", "Блейзер", "Куртка", "Пальто", "Кардиган" сияқты нақты терминдерді қолдан (мысалы, "Ақ стильді пиджак", "Оверсайз былғары куртка", "Ұзын қоңыр пальто").
         - Аксессуарлар үшін: "Көзілдірік" (немесе "Күн көзілдірігі"), "Сөмке" (немесе "Қара сөмке"), "Белдік" кілт сөздерін нақты қос.
      4. Бірыңғай стилі ортақ және түс үйлесімі эстетикалық тұрғыдан жоғары жиынтықтар дайында.
      5. Генерация жылдам болуы үшін барлық сипаттамаларды өте қысқа, нұсқа және нақты 1-2 сөйлеммен ғана жаз (максимум 120 таңба). Шығыс көлемін азайтып, жауап жылдамдығын арттыр.

      Пайдаланушы деректері:
      - Жынысы: ${gender === "male" ? "Ер адам" : gender === "female" ? "Әйел адам" : "Жалпы"}
      - Бойы: ${height} см, Салмағы: ${weight} kg
      - Дене бітімі: ${bodyType} (арық, орташа, атлетикалық, толық денелі)
      - Цветотип: ${colorType} (Жаз, Көктем, Күз, Қыс)
      - Таңдалған маусым (Мезгіл): ${season === 'spring' ? 'Көктем (Spring)' : season === 'summer' ? 'Жаз (Summer)' : season === 'autumn' ? 'Күз (Autumn)' : 'Қыс (Winter)'}
      - Бағыты (Баратын жері): ${destination}
      - Қазіргі қаласы мен ауа-райы: ${weather.city} қаласы, температурасы ${weather.temp}°C, жағдайы: ${weather.condition}
      
      ${capsuleDescription}
      
      Сенен келесі міндеттер күтіледі:
      1. Стильдік сипаттама (styledDescription): Өте қысқа 1-2 ширақ сөйлеммен түс үйлесімділігі мен дене бітіміне сай кеңесті жаз (қазақ тілінде).
      2. Ауа-райы сәйкестігі (weatherAdvice): Өте қысқа 1-2 ширақ сөйлеммен дәл қазіргі температураға сәйкес киінуді талдап бер (қазақ тілінде).
      3. Ұсынылатын киімдер (outfitItems): 
         Пайдаланушыға 3-тен 5-ке дейін киім немесе аксессуар жиынтығын ұсын. Әрбір киімнің астында ҚАЗАҚСТАНДЫҚ брендтердің (немесе Wildberries/Kaspi) дәл сондай киіміне сілтемесін ("brandLink") және бренд атауын ("brandName") көрсет. Мысалы: Qazaq Republic, Adili, Saba, Shoqan Suits, Glassman, Mimioriki, т.б. Бұл біздің жобамыздың монетизация негізі болып табылады! Сондықтан бренд атауын міндетті дозволено.
      4. Пайдаланушы таңдаған немесе ұсынылған киімдерді талдау арқылы 5 түрлі стильді лук (capsule5Looks): Пайдаланушы таңдаған немесе ұсынған киімдер біріктірілімінен қандай стильдер құруға болатынын өзің анықтап, дәл 5 түрлі стильді лук (мысалы, Casual, Smart Casual, Feminine, Sporty Chic, немесе Minimal Elegant) жинақта.
         ҚАТАҢ СТИЛЬДІК СӘЙКЕСТІК ЕРЕЖЕЛЕРІ (ЕШҚАШАН БҰЗБА):
         - Спорттық немесе серуен стиліндегі луктарға ("Sporty / Sporty Chic") КЛАССИКАЛЫҚ РЕСМИ ШАЛБАРЛАРДЫ ("классикалық шалбар", "classic trousers") мүлдем араластырма! Спорттық немесе еркін көше сәнінде тек спорттық, оверсайз, карго немесе джинсы элементтерін қолдан.
         - Егер пайдаланушы таңдаған немесе ұсынылған киімдер арасында спорттық шалбар, карго немесе джинсы болмаса, оны "Sporty" лукке қоспа, немесе оның орнына "Еркін спорттық шалбар" деп нақты санатқа сай қосып көрсет.
         - Іскерлік немесе ресми классикалық стильдерде ("Smart Casual", "Minimal Elegant") спорттық худи немесе спорттық шалбарларды араластырма!
         - Әр лук үшін flat-lay үлгісінде ағылшынша нақты кескін генераторының промтын ("imagePrompt") құрастыр. Промт сол стильдің нақты мазмұнына сәйкес болуы тиіс (мысалы: 'flat lay fashion outfit: hoodie and sporty grey joggers, clean style' немесе 'flat lay luxury outfit: white blouse and black trousers').

      Барлық сипаттамалар кәсіби, сенімді, өте жинақы және қазақ тілінде жазылуы тиіс. JSON пішіміндегі жауапты қатаң түрде мына схема бойынша қайтар:
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            styledDescription: {
              type: Type.STRING,
              description: "Дене бітімі мен цветотипіне сай толық стилистік талдау мен пропорция ережелері."
            },
            weatherAdvice: {
              type: Type.STRING,
              description: "Ауа-райымен үндестік кеңестері және қолайлылық кепілі."
            },
            outfitItems: {
              type: Type.ARRAY,
              description: "Оңтайлы стиль жиынтығы (3-5 киім не аксесуардан)",
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING, description: "Киім санаты: 'Top' (Үстіңгі), 'Bottom' (Астыңғы), 'Outerwear' (Сыртқы), 'Shoes' (Аяқ киім), 'Accessories' (Аксессуар)" },
                  name: { type: Type.STRING, description: "Киімнің немесе аксессуардың толық аты (мысалы, 'Оверсайз зығыр жейде')" },
                  color: { type: Type.STRING, description: "Осы киімнің таңдалған түсінің Нео-Классикалық HEX коды (мысалы, '#2D3748')" },
                  colorName: { type: Type.STRING, description: "Сәнді түс атауы қазақша (мысалы, 'Қанық зүбәржат')" },
                  brandName: { type: Type.STRING, description: "Нақты Қазақстандық бренд немесе Kaspi/WB дүкен атауы" },
                  brandLink: { type: Type.STRING, description: "Тікелей сілтеме (осы дүкенге немесе серіктестік Kaspi сілтеме)" },
                  priceKzt: { type: Type.INTEGER, description: "Теңгедегі болжалды бағасы" }
                },
                required: ["category", "name", "color", "colorName", "brandName", "brandLink", "priceKzt"]
              }
            },
            capsule5Looks: {
              type: Type.ARRAY,
              description: "Пайдаланушы таңдаған киімдерді талдау арқылы ЖИ өзі құрастырған 5 түрлі стильді жаңа лук комбинациялары",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "Лук атауы, мысалы 'Лук #1: Casual Style'" },
                  styleName: { type: Type.STRING, description: "Стиль бағыты, мысалы 'Casual', 'Smart Casual', 'Feminine', 'Sporty Chic', 'Minimal Elegant'" },
                  itemsUsed: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                    description: "Осы лук үшін қолданылатын киімдер тізбегі"
                  },
                  comment: { type: Type.STRING, description: "Неге бұл лук керемет үйлеседі деген стилист кеңесі қазақша." },
                  imagePrompt: { type: Type.STRING, description: "Ағылшын тіліндегі flat-lay кескін генерациясының промты." }
                },
                required: ["title", "styleName", "itemsUsed", "comment", "imagePrompt"]
              }
            }
          },
          required: ["styledDescription", "weatherAdvice", "outfitItems", "capsule5Looks"]
        }
      }
    });

    const parsedData = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsedData
    });

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Генерациялау барысында қате орын алды",
    });
  }
});

// AI Assistant Endpoint supporting both text chat and base64 image scanning
app.post("/api/chat", async (req, res) => {
  const { messages = [], image, latestMessage } = req.body;

  try {
    const ai = getGeminiClient();
    const contents: any[] = [];

    // Map history to Gemini API specification
    for (const msg of messages) {
      if (msg.role && msg.content) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }]
        });
      }
    }

    // Attach latest prompt, option with vision support
    if (image && image.base64 && image.mimeType) {
      const imagePart = {
        inlineData: {
          mimeType: image.mimeType,
          data: image.base64
        }
      };
      contents.push({
        role: "user",
        parts: [
          imagePart,
          { text: `${latestMessage || "Мына суретке сән тұрғысынан сараптама жасап беріңізші"}\n\n[Нұсқаулық: Суретті мұқият қараңыз. Онда бет әлпеті, киім немесе толық лук болуы мүмкін. Қазақ тілінде кәсіби, егжей-тегжейлі сәндік сипаттама беріңіз (цветотипті талдау, киімдердің үйлесімділігі, қолайлы түс палитралары, қай жерге киюге болатыны жөнінде кеңестер).]` }
        ]
      });
    } else if (latestMessage) {
      contents.push({
        role: "user",
        parts: [{ text: latestMessage }]
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction: `Сен - "Boutique AI" виртуалды киім өлшеу және стилист платформасының сән және жеке стиль кеңесшісісің. Сенің есімің - Boutique Стилисі.
Сен пайдаланушыларға қазақ тілінде жауап бересің. Сөйлеу мәнерің өте кішіпейіл, жылы, кәсіби және шабыттандырарлық болуы керек. 
Пайдаланушылар саған киім үйлесімділігі, ауа-райына сай киіну, цветотиптерді анықтау, капсулалық гардероб, отандық Қазақстандық брендтер (мысалы, Qazaq Republic, Shoqan, Adili, Saba, т.б.) жайлы кез келген сұрақ қоя алады. 
Жауаптарыңды әдемі маркдаун форматында реттеп жаз. Жасанды және құрғақ сөйлемдерді азайтып, сән журналының редакторы сияқты сөйле.`
      }
    });

    return res.json({
      success: true,
      text: response.text
    });

  } catch (error: any) {
    console.error("Gemini Assistant route error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "ЖИ Көмекшімен байланысу кезінде техникалық қате шықты. Қайталап көріңіз."
    });
  }
});

// Configure Vite or Static Serve
async function init() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Boutique Server] is running on port ${PORT}`);
  });
}

init();
