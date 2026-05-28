import React, { useState, useRef } from "react";
import { Send, Image, X, Sparkles, MessageSquare, ArrowRight, Loader } from "lucide-react";

interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  image?: string; // base64 representation for display
}

interface AssistantSectionProps {
  gender: 'male' | 'female' | 'unisex';
}

const QUICK_SUGGESTIONS = [
  {
    id: "s-1",
    title: "🎨 Цветотип анықтау",
    text: "Қандай түстер менің цветотипіме сәйкес келеді және оны қалай анықтаймын?"
  },
  {
    id: "s-2",
    title: "🧥 Капсула ережесі",
    text: "Капсулалық гардеробтың басты құпиялары қандай және оны қалай жинайды?"
  },
  {
    id: "s-3",
    title: "🌟 Жиі кездесетін қателер",
    text: "Киім таңдау кезіндегі ең жиі жіберілетін 5 қателікті тізіп берші."
  },
  {
    id: "s-4",
    title: "🇰🇿 Отандық брендтер",
    text: "Қазақстандағы қандай заманауи сәнді отандық брендтерді білесің?"
  }
];

export default function AssistantSection({ gender }: AssistantSectionProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        role: "model",
        content: "Сәлеметсіз бе! Мен - Boutique AI жеке стиль кеңесшісімін. Сізге ыңғайлы және трендті киімдер таңдауға, цветотип немесе дене бітіміне қарай капсула құруға душ жүректен көмектесемін. \n\nТөмендегі ұсыныстардың бірін таңдаңыз немесе өз сұрағыңызды жазыңыз. Сондай-ақ, киіміңіздің немесе бет-әлпетіңіздің суретін жүктеп, оған стильдік талдау жасата аласыз!"
      }
    ];
  });

  const [inputText, setInputText] = useState("");
  const [selectedImage, setSelectedImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isSending, setIsSending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Read upload image as base64 and extract mimeType
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Тек сурет файлдарын жүктей аласыз.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        setSelectedImage({
          base64: event.target.result.split(",")[1],
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Тек сурет файлдарын жүктей аласыз.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result && typeof event.target.result === "string") {
        setSelectedImage({
          base64: event.target.result.split(",")[1],
          mimeType: file.type
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const removePendingImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Submit trigger
  const handleSendMessage = async (customText?: string) => {
    const queryText = customText || inputText;
    if (!queryText.trim() && !selectedImage) return;

    // Prevent mid-transit collisions
    setIsSending(true);
    setInputText("");

    // Create prompt structure
    const updatedUserM: ChatMessage = {
      role: "user",
      content: queryText,
      image: selectedImage ? `data:${selectedImage.mimeType};base64,${selectedImage.base64}` : undefined
    };

    const newHistory = [...messages, updatedUserM];
    setMessages(newHistory);
    setSelectedImage(null);

    // Scroll down dynamically
    setTimeout(() => {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      // API payload to secure server side proxy
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: messages.map(m => ({ role: m.role, content: m.content })),
          latestMessage: queryText,
          image: selectedImage ? { base64: selectedImage.base64, mimeType: selectedImage.mimeType } : null
        })
      });

      const result = await response.json();

      if (result.success && result.text) {
        setMessages(prev => [...prev, {
          role: "model",
          content: result.text
        }]);
      } else {
        setMessages(prev => [...prev, {
          role: "model",
          content: "Кешіріңіз, сұранысқа жауап алу мүмкін болмады. Ішкі серверлік бағдарлама бұғатталды немесе кілт қате. Қайталап орындап көріңіз."
        }]);
      }

    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "model",
        content: "Желілік байланыс үзілді немесе сервер жауап бермеді. Сұранысты сәлден соң қайталаңыз."
      }]);
    } finally {
      setIsSending(false);
      setTimeout(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Pre-formatted text highlighting
  const renderMessageContent = (text: string) => {
    const paragraphs = text.split("\n\n");
    return paragraphs.map((part, pIdx) => {
      const lines = part.split("\n");
      return (
        <p key={pIdx} className="leading-relaxed mb-2.5 text-xs text-slate-200">
          {lines.map((line, lIdx) => {
            let processedLine: React.ReactNode = line;
            
            // Clean markdown list item indentation
            if (line.startsWith("- ") || line.startsWith("* ")) {
              const textContent = line.slice(2);
              processedLine = (
                <span className="flex items-start gap-1 pb-1">
                  <span className="text-indigo-400 mt-1 select-none font-sans">•</span>
                  <span>{parseBoldText(textContent)}</span>
                </span>
              );
            } else if (/^\d+\.\s/.test(line)) {
              // Capture list numbers eg "1. "
              const match = line.match(/^(\d+\.\s)(.*)/);
              if (match) {
                processedLine = (
                  <span className="flex items-start gap-1 pb-1">
                    <span className="text-indigo-400 font-mono font-bold select-none">{match[1]}</span>
                    <span>{parseBoldText(match[2])}</span>
                  </span>
                );
              }
            } else {
              processedLine = parseBoldText(line);
            }

            return (
              <span key={lIdx} className="block">
                {processedLine}
              </span>
            );
          })}
        </p>
      );
    });
  };

  // Helper parser for markdown strong tags
  const parseBoldText = (rawStr: string) => {
    const parts = rawStr.split(/(\*\*.*?\*\*)/);
    return parts.map((part, idx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={idx} className="font-extrabold text-white text-xs">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-[650px] bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl" id="ai-assistant-wrapper">
      
      {/* Dynamic Sub-header */}
      <div className="bg-slate-950/60 p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Boutique AI Маман-стилисі</h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ЖИ Кеңесші белсенді
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 font-mono px-2 py-1 rounded-md border border-indigo-900/40 uppercase">
          Gemini 3.5
        </span>
      </div>

      {/* Messages area viewport */}
      <div 
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-800"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`flex flex-col max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto items-end' : 'items-start'
            }`}
          >
            {/* Display message image before bubble */}
            {msg.image && (
              <div className="mb-2 rounded-xl border border-slate-800 overflow-hidden max-w-[180px] shadow-lg">
                <img src={msg.image} alt="User attached" className="w-full h-auto object-cover max-h-40" />
              </div>
            )}

            {/* Content text bubble */}
            <div 
              className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.role === 'user' 
                  ? 'bg-indigo-600/90 text-white rounded-tr-none' 
                  : 'bg-slate-950 border border-slate-800/80 rounded-tl-none'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap text-xs font-medium">{msg.content}</p>
              ) : (
                <div className="space-y-1">
                  {renderMessageContent(msg.content)}
                </div>
              )}
            </div>

            {/* Footnote timestamp */}
            <span className="text-[9px] text-slate-500 font-mono font-semibold uppercase mt-1 select-none px-1">
              {msg.role === 'user' ? 'Сіз' : 'Boutique стилист'}
            </span>
          </div>
        ))}

        {/* Loading placeholder */}
        {isSending && (
          <div className="flex flex-col items-start max-w-[70%] space-y-1">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
              <Loader className="w-4 h-4 text-indigo-400 animate-spin shrink-0" />
              <span className="text-xs text-slate-400 tracking-wide font-sans">ЖИ стилист суретті қарап, жауап әзірлеп жатыр...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Quick suggest chips drawer (only show when not loading or typing) */}
      {messages.length < 5 && !isSending && (
        <div className="p-3 bg-slate-950/40 border-t border-slate-800/60">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest font-mono mb-2">Жылдам сұрақтар</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_SUGGESTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSendMessage(s.text)}
                type="button"
                className="p-2 rounded-xl bg-slate-950/85 border border-slate-800 hover:border-indigo-500/40 text-left hover:bg-slate-900 transition-all text-[11px] text-slate-300 flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-1.5 overflow-hidden">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-550 shrink-0 group-hover:text-indigo-400 transition-colors" />
                  <span className="truncate font-semibold text-slate-300 group-hover:text-slate-100">{s.title}</span>
                </div>
                <ArrowRight className="w-3 h-3 text-slate-650 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-1" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Upload Preview row above input */}
      {selectedImage && (
        <div className="p-2.5 bg-indigo-950/20 border-t border-slate-800 flex items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded border border-indigo-500/30 overflow-hidden bg-slate-950 relative">
              <img 
                src={`data:${selectedImage.mimeType};base64,${selectedImage.base64}`} 
                alt="Selected preview" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div>
              <span className="text-[10px] text-indigo-300 font-bold block">Жүктелген сурет</span>
              <span className="text-[9px] text-slate-450 font-mono">Жіберуге дайын</span>
            </div>
          </div>
          <button
            onClick={removePendingImage}
            type="button"
            className="w-6 h-6 rounded-full bg-slate-950 hover:bg-slate-800 flex items-center justify-center border border-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Input panel bottom area */}
      <form 
        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
        className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {/* Paperclip attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          type="button"
          disabled={isSending}
          className="w-10.5 h-10.5 rounded-xl border border-slate-800 bg-slate-900 text-slate-400 hover:text-indigo-400 hover:border-slate-700/80 hover:bg-slate-950 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50 shrink-0"
          title="Киім немесе цветотип суратін жүктеу"
        >
          <Image className="w-4.5 h-4.5" />
        </button>

        {/* Text query input */}
        <input 
          type="text"
          placeholder={isSending ? "Күте тұрыңыз..." : "Стиль, трендтер немесе киім таңдау жайлы сұраңыз..."}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isSending}
          className="flex-1 px-4 py-2.5 rounded-xl text-xs border border-slate-800 bg-slate-900 text-slate-200 placeholder-slate-550 focus:outline-none focus:border-indigo-500 disabled:opacity-50 transition-colors h-10.5"
        />

        {/* Submit query button */}
        <button
          type="submit"
          disabled={isSending || (!inputText.trim() && !selectedImage)}
          className="w-10.5 h-10.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:hover:bg-indigo-600 shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

    </div>
  );
}
