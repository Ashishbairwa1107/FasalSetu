import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PageHeaderNav } from '../../components/common/PageHeaderNav';
import {
  Bot,
  Send,
  Mic,
  Image as ImageIcon,
  Trash2,
  Sparkles,
  AlertCircle,
  HelpCircle,
  X,
  Volume2,
  VolumeX,
  CheckCircle2
} from 'lucide-react';

export const AiMitraPage: React.FC = () => {
  const { chatMessages, sendUserChatMessage, clearChat, language, profile } = useApp();
  const isHindi = language === 'hi' || language === 'cg';

  const [inputMessage, setInputMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    'धान के पत्ते पीले क्यों हो रहे हैं?',
    'मेरी फसल में कौन-सा रोग हो सकता है?',
    'अगले सप्ताह खेत में क्या काम करना चाहिए?',
    'बारिश से पहले क्या सावधानी रखनी चाहिए?',
    'यूरिया और डीएपी का सही अनुपात क्या है?'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() && !selectedImage) return;

    const currentText = inputMessage.trim() || 'फसल की तस्वीर का AI परीक्षण करें';
    const currentImg = selectedImage || undefined;

    setInputMessage('');
    setSelectedImage(null);
    setIsAiTyping(true);

    try {
      await sendUserChatMessage(currentText, currentImg);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSuggestedClick = async (q: string) => {
    setInputMessage('');
    setSelectedImage(null);
    setIsAiTyping(true);

    try {
      await sendUserChatMessage(q);
    } catch (err) {
      console.error('Error sending suggested message:', err);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFormattedMessage = (text: string, isUser: boolean) => {
    return text.split('\n').map((line, idx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className={isUser ? 'font-bold text-white' : 'font-bold text-gray-950'}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 my-0.5 pl-1">
            <span className={isUser ? 'text-emerald-200 font-bold' : 'text-[#087A43] font-bold select-none'}>•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      if (/^\d+\./.test(line.trim())) {
        return (
          <div key={idx} className="my-1 pl-1 font-medium">
            {renderedParts}
          </div>
        );
      }

      return (
        <div key={idx} className={line.trim() === '' ? 'h-2' : 'my-0.5'}>
          {renderedParts}
        </div>
      );
    });
  };

  const recognitionRef = useRef<any>(null);

  const handleToggleVoice = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (_) {}
      }
      setIsRecording(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = isHindi ? 'hi-IN' : 'en-IN';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          const speechResult = event.results[0][0].transcript;
          setInputMessage(speechResult);
          setIsRecording(false);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error in AiMitra:', event.error);
          setIsRecording(false);
          if (event.error === 'not-allowed') {
            alert(isHindi ? 'माइक्रोफोन की अनुमति नहीं मिली।' : 'Microphone permission denied.');
          }
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (err) {
        console.warn('Speech recognition start failed:', err);
        setIsRecording(false);
      }
    } else {
      // Graceful fallback for non-WebSpeech browsers
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        setInputMessage('धान में बालियां निकलने के समय क्या सावधानियां रखें?');
      }, 1500);
    }
  };

  const speakText = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      if (isSpeaking === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = isHindi ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(null);
      utterance.onerror = () => setIsSpeaking(null);
      setIsSpeaking(msgId);
      window.speechSynthesis.speak(utterance);
    } else {
      alert(isHindi ? 'आपके ब्राउज़र में आवाज़ वाचन समर्थित नहीं है' : 'Speech synthesis not supported');
    }
  };

  return (
    <div className="space-y-3 animate-in fade-in duration-200">
      {/* Global Back Navigation & Dashboard Shortcut */}
      <PageHeaderNav fallbackPath="/" />

      <div className="h-[calc(100vh-180px)] md:h-[calc(100vh-150px)] flex flex-col bg-white rounded-3xl border border-[#E5EBE1] shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-4 bg-gradient-to-r from-[#087A43] to-[#075B35] text-white flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white text-[#087A43] flex items-center justify-center font-bold shadow">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight">
                {isHindi ? 'AI किसान मित्र' : 'AI Farmer Assistant'}
              </h2>
              <span className="text-[10px] bg-amber-400 text-emerald-950 font-bold px-2 py-0.5 rounded-full">
                AI Demo
              </span>
            </div>
            <p className="text-[11px] text-emerald-100">
              {isHindi ? 'कृषि वैज्ञानिक ज्ञान पर आधारित डिजिटल साथी' : 'Agronomy AI Assistant • Hindi & English'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearChat}
            className="p-2 text-emerald-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            title="Clear Chat History"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="bg-amber-50 px-4 py-2 border-b border-amber-200 flex items-center gap-2 text-[11px] text-amber-900 shrink-0">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
        <p className="truncate">
          <strong>{isHindi ? 'अस्वीकरण:' : 'Disclaimer:'}</strong>{' '}
          {isHindi
            ? 'AI सलाह केवल सूचनार्थ है। गंभीर फसल रोग व सटीक रासायनिक खुराक के लिए KVK अथवा कृषि अधिकारी से पुष्टि करें।'
            : 'AI advice is for information only. Confirm critical pest diagnosis with your local KVK or agricultural officer.'}
        </p>
      </div>

      {/* Chat Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFBF7]">
        {chatMessages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] sm:max-w-[75%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isUser
                    ? 'bg-emerald-700 text-white'
                    : 'bg-[#087A43] text-white shadow-xs'
                }`}
              >
                {isUser ? (
                  <img
                    src={profile.avatarUrl}
                    alt="User"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-3xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  isUser
                    ? 'bg-[#087A43] text-white rounded-tr-xs'
                    : 'bg-white text-gray-800 border border-[#E5EBE1] rounded-tl-xs'
                }`}
              >
                {/* Uploaded Image Preview in Chat */}
                {msg.imageUrl && (
                  <div className="mb-2 rounded-xl overflow-hidden max-h-48 border border-white/20">
                    <img
                      src={msg.imageUrl}
                      alt="Crop Issue"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="leading-relaxed">
                  {renderFormattedMessage(msg.text, isUser)}
                </div>

                {/* Suggestions chips if any */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-1.5">
                    {msg.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedClick(s)}
                        className="text-[11px] font-medium bg-[#EAF6E9] hover:bg-emerald-200 text-[#075B35] px-2.5 py-1 rounded-full transition-colors text-left"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}

                {/* Bubble Footer: Timestamp & Audio Speak */}
                <div
                  className={`mt-2 flex items-center justify-between text-[10px] ${
                    isUser ? 'text-emerald-200' : 'text-gray-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <button
                      onClick={() => speakText(msg.text, msg.id)}
                      className="hover:text-emerald-700 flex items-center gap-1 transition-colors p-1"
                      title="आवाज़ में सुनें"
                    >
                      {isSpeaking === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5 text-gray-500" />
                      )}
                      <span>{isSpeaking === msg.id ? 'रोकें' : 'बोलकर सुनें'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {isAiTyping && (
          <div className="flex gap-3 items-center mr-auto">
            <div className="w-8 h-8 rounded-full bg-[#087A43] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 animate-bounce" />
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#087A43] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#087A43] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#087A43] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-gray-400 ml-1 font-medium">फसलसेतु सलाह तैयार कर रहा है...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Question Chips Bar */}
      <div className="px-3 py-2 bg-white border-t border-gray-100 flex items-center gap-2 overflow-x-auto shrink-0">
        <span className="text-[11px] font-bold text-gray-400 shrink-0">सुझाव:</span>
        {suggestedQuestions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleSuggestedClick(q)}
            className="text-[11px] font-medium bg-gray-100 hover:bg-emerald-50 hover:text-[#087A43] text-gray-700 px-3 py-1 rounded-full whitespace-nowrap transition-colors border border-gray-200 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Selected Image Preview Floating Pill */}
      {selectedImage && (
        <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <img
              src={selectedImage}
              alt="Uploaded Preview"
              className="w-10 h-10 rounded-lg object-cover border border-emerald-300"
            />
            <span className="text-xs font-semibold text-emerald-900">
              फसल तस्वीर संलग्न है (AI विश्लेषण के लिए तैयार)
            </span>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="text-gray-400 hover:text-gray-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Voice Recording Simulation Indicator */}
      {isRecording && (
        <div className="px-4 py-2 bg-rose-50 border-t border-rose-200 flex items-center justify-between shrink-0 animate-pulse">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
            <Mic className="w-4 h-4 text-rose-600 animate-ping" />
            <span>सुन रहे हैं... कृपया अपनी समस्या बोलें</span>
          </div>
          <button
            onClick={handleToggleVoice}
            className="text-xs font-bold text-rose-800 bg-rose-200 px-2 py-0.5 rounded-md"
          >
            समाप्त करें
          </button>
        </div>
      )}

      {/* Input Box Bar */}
      <div className="p-3 bg-white border-t border-gray-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Image upload button */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl text-gray-500 hover:text-[#087A43] hover:bg-emerald-50 transition-colors border border-gray-200 cursor-pointer"
            title={isHindi ? 'फसल की फोटो अपलोड करें' : 'Upload Crop Photo'}
            aria-label={isHindi ? 'फसल की फोटो अपलोड करें' : 'Upload Crop Photo'}
          >
            <ImageIcon className="w-5 h-5" />
          </button>

          {/* Voice recording button */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className={`p-2.5 rounded-2xl transition-colors border cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white border-rose-700'
                : 'text-gray-500 hover:text-[#087A43] hover:bg-emerald-50 border-gray-200'
            }`}
            title={isHindi ? 'बोलकर पूछें' : 'Voice Input'}
            aria-label={isHindi ? 'बोलकर पूछें' : 'Voice Input'}
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={isHindi ? 'अपनी फसल या कीट समस्या के बारे में पूछें...' : 'Ask about your crop disease, weather, schemes...'}
            className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-gray-50 rounded-2xl border border-gray-200 focus:bg-white focus:outline-hidden focus:border-[#087A43] focus:ring-2 focus:ring-[#087A43]/20"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputMessage.trim() && !selectedImage}
            className="p-2.5 bg-[#087A43] hover:bg-[#075B35] disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
    </div>
  );
};
