import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LandRecord, LandAreaUnit, RecommendedCrop } from '../../types';
import { RECOMMENDED_CROPS } from '../../data/mockData';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  ArrowLeft,
  CheckCircle2,
  X,
  Sparkles,
  Layers,
  Droplets,
  Calendar,
  Receipt,
  Activity,
  Landmark,
  TrendingUp,
  User,
  MapPin,
  Bot,
  HelpCircle,
  Check
} from 'lucide-react';

interface FarmerVoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'register_land' | 'voice_nav';
}

type StepKey = 
  | 'farmer_name'
  | 'village_district'
  | 'land_name'
  | 'area_unit'
  | 'irrigation_source'
  | 'previous_crop'
  | 'target_crop'
  | 'budget'
  | 'soil_report'
  | 'confirm_save';

export const FarmerVoiceAssistantModal: React.FC<FarmerVoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register_land'
}) => {
  const navigate = useNavigate();
  const { profile, lands, tasks, expenses, addLand, showToast, language } = useApp();

  const [activeTab, setActiveTab] = useState<'register_land' | 'voice_nav'>(initialMode);
  const [selectedVoiceLang, setSelectedVoiceLang] = useState<'hi' | 'cg' | 'en'>(
    language === 'cg' ? 'cg' : language === 'en' ? 'en' : 'hi'
  );
  const isHindi = language === 'hi' || language === 'cg';

  // Speech Recognition state
  const [isListening, setIsListening] = useState(false);
  const [recognizedText, setRecognizedText] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechMuted, setSpeechMuted] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  // Voice Land Registration Form State
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState({
    farmerName: profile.name || 'राम कुमार वर्मा',
    village: profile.village || 'आरंग',
    district: profile.district || 'रायपुर',
    landName: '',
    areaAmount: 2.5,
    areaUnit: 'acre' as LandAreaUnit,
    irrigationSource: 'नलकूप / बोरवेल',
    previousCrop: 'धान',
    targetCrop: 'गेहूं',
    budget: 40000,
    hasSoilReport: 'नहीं'
  });

  const [isSavingLand, setIsSavingLand] = useState(false);
  const [savedSuccessLandId, setSavedSuccessLandId] = useState<string | null>(null);

  // General Voice Command State
  const [lastCommandAnswer, setLastCommandAnswer] = useState<string>('');

  const recognitionRef = useRef<any>(null);

  const steps: {
    key: StepKey;
    titleHi: string;
    titleCg: string;
    titleEn: string;
    questionHi: string;
    questionCg: string;
    questionEn: string;
    quickChips: string[];
  }[] = [
    {
      key: 'farmer_name',
      titleHi: '1. किसान का नाम',
      titleCg: '1. किसान के नांव',
      titleEn: '1. Farmer Name',
      questionHi: 'नमस्ते! आपका शुभ नाम क्या है? बोलकर बताएं।',
      questionCg: 'जय जोहार! अपन सुग्घर नांव बताओ संगी?',
      questionEn: 'Hello! What is your name? Please speak.',
      quickChips: [profile.name || 'राम कुमार वर्मा', 'श्याम लाल', 'दिलीप कुमार']
    },
    {
      key: 'village_district',
      titleHi: '2. गांव और जिला',
      titleCg: '2. गांव अउ जिला',
      titleEn: '2. Village & District',
      questionHi: 'आप किस गांव और जिले से हैं? जैसे: आरंग, रायपुर',
      questionCg: 'तोर गांव अउ जिला के का नांव हे? जैसे आरंग, रायपुर',
      questionEn: 'Which village and district are you from? (e.g. Arang, Raipur)',
      quickChips: ['आरंग, रायपुर', 'अभनपुर, रायपुर', 'तिल्दा, रायपुर', 'पाटन, दुर्ग']
    },
    {
      key: 'land_name',
      titleHi: '3. खेत की पहचान/नाम',
      titleCg: '3. खेत के नांव / चिन्हारी',
      titleEn: '3. Land Identifier Name',
      questionHi: 'इस खेत का क्या नाम रखना चाहते हैं? जैसे: नहर वाला खेत, या बड़ा खेत।',
      questionCg: 'ये खेत ला का नांव देबे? जैसे: नहर वाला खेत, या बड़े खेत।',
      questionEn: 'What name would you like to give this land? (e.g. Canal Field or Big Field)',
      quickChips: ['नहर वाला खेत', 'बड़ा खेत', 'बोरवेल वाला खेत', 'घर के पीछे वाला खेत']
    },
    {
      key: 'area_unit',
      titleHi: '4. जमीन का रकबा',
      titleCg: '4. भुइयां के रकबा',
      titleEn: '4. Land Area & Unit',
      questionHi: 'आपकी यह जमीन कितनी है और किस इकाई में है? जैसे: 2.5 एकड़ या 5 बीघा।',
      questionCg: 'ये भुइयां कतेक बड़े हे? जैसे: 2 एकड़ या 4 बीघा।',
      questionEn: 'How much land is this, and in which unit? (e.g. 2.5 Acres or 5 Bigha)',
      quickChips: ['1 एकड़', '2 एकड़', '2.5 एकड़', '3 एकड़', '5 एकड़', '4 बीघा']
    },
    {
      key: 'irrigation_source',
      titleHi: '5. सिंचाई का साधन',
      titleCg: '5. पानी/सिंचाई के साधन',
      titleEn: '5. Irrigation Source',
      questionHi: 'सिंचाई का क्या साधन है? नलकूप बोरवेल, नहर, ड्रिप या वर्षा आधारित?',
      questionCg: 'खेत म पानी देहे के का साधन हे? बोरवेल, नहर, कि अगास के पानी?',
      questionEn: 'What is your irrigation source? Tube well, Canal, Drip, or Rainfed?',
      quickChips: ['नलकूप / बोरवेल', 'नहर', 'ड्रिप सिंचाई', 'वर्षा आधारित']
    },
    {
      key: 'previous_crop',
      titleHi: '6. पिछली फसल',
      titleCg: '6. पाछू के फसल',
      titleEn: '6. Previous Crop',
      questionHi: 'इस खेत में आपने पिछली बार कौन सी फसल ली थी? जैसे: धान, मक्का या चना।',
      questionCg: 'पाछू घंव ये खेत म का फसल बोए रहेव? धान, मक्का कि चना?',
      questionEn: 'Which crop did you grow previously on this land? (e.g. Paddy, Wheat, Gram)',
      quickChips: ['धान', 'सोयाबीन', 'मक्का', 'उड़द', 'सब्जी']
    },
    {
      key: 'target_crop',
      titleHi: '7. आगामी फसल',
      titleCg: '7. ये घंव के फसल',
      titleEn: '7. Planned Crop',
      questionHi: 'अब आप कौन सी फसल लगाने की योजना बना रहे हैं? जैसे: गेहूं, चना, या सरसों।',
      questionCg: 'ये घंव का फसल बोए के विचार हे संगी? गेहूं, चना, कि सरसों?',
      questionEn: 'Which crop are you planning to grow next? (e.g. Wheat, Gram, Mustard)',
      quickChips: ['गेहूं', 'चना', 'सरसों', 'मक्का', 'सब्जियां']
    },
    {
      key: 'budget',
      titleHi: '8. अनुमानित खेती बजट',
      titleCg: '8. खरचा के बजट',
      titleEn: '8. Farming Budget',
      questionHi: 'इस फसल के लिए आपका अनुमानित बजट कितना है? जैसे: 30,000 या 50,000 रुपये।',
      questionCg: 'ये फसल बर कतेक खरचा के बजट रखे हव? 30 हजार, 40 हजार?',
      questionEn: 'What is your approximate farming budget? (e.g. 30000 or 50000 Rupees)',
      quickChips: ['25,000 रुपये', '35,000 रुपये', '40,000 रुपये', '50,000 रुपये', '75,000 रुपये']
    },
    {
      key: 'soil_report',
      titleHi: '9. मिट्टी की जांच रिपोर्ट',
      titleCg: '9. माटी जांच रिपोर्ट',
      titleEn: '9. Soil Health Report',
      questionHi: 'क्या आपके पास मिट्टी परीक्षण कार्ड या रिपोर्ट है? हां या नहीं बोलें।',
      questionCg: 'का तोर तीर माटी जांच के कार्ड हे संगी? हव या नइ कहव।',
      questionEn: 'Do you have a soil health card or report? Say Yes or No.',
      quickChips: ['हां (उपलब्ध है)', 'नहीं (अभी नहीं)']
    },
    {
      key: 'confirm_save',
      titleHi: '10. पुष्टि एवं सुरक्षित करें',
      titleCg: '10. पुष्टि अउ सेव करव',
      titleEn: '10. Confirm & Save',
      questionHi: 'सभी विवरण तैयार हैं। कृपया सुनकर पुष्टि करें और "हां" बोलें या "सुरक्षित करें" बटन दबाएं।',
      questionCg: 'सबो जानकारी तैयार हे। सुन के बताव अउ हव कहव या सेव बटन दबावत हव।',
      questionEn: 'All details are ready. Please verify and say Yes or click Save.',
      quickChips: ['हाँ, बिल्कुल सही है', 'सुरक्षित करें']
    }
  ];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = selectedVoiceLang === 'en' ? 'en-IN' : 'hi-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setRecognizedText(transcript);
        handleRecognizedInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setPermissionError('माइक्रोफोन अनुमति अस्वीकार हुई। कृपया ब्राउज़र सेटिंग्स में माइक अनुमति दें।');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    } catch (e) {
      console.warn('Speech recognition setup failed:', e);
      setSpeechSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceLang]);

  // Read current question when step changes (if not muted)
  useEffect(() => {
    if (isOpen && activeTab === 'register_land' && !savedSuccessLandId) {
      const currentStep = steps[currentStepIndex];
      if (currentStep) {
        const qText = selectedVoiceLang === 'cg' 
          ? currentStep.questionCg 
          : selectedVoiceLang === 'en' 
          ? currentStep.questionEn 
          : currentStep.questionHi;

        // If on confirm step, generate dynamic summary speech
        if (currentStep.key === 'confirm_save') {
          const summarySpeech = selectedVoiceLang === 'cg'
            ? `${formData.farmerName} संगी, तोर भुइयां "${formData.landName || 'खेत'}", रकबा ${formData.areaAmount} एकड़, सिंचाई साधन ${formData.irrigationSource}, पिछली फसल ${formData.previousCrop}, अउ ये घंव ${formData.targetCrop} हे। बजट ${formData.budget} रुपिया हे। का ये सब सही हे? हव कहव या सेव बटन दबावत हव।`
            : selectedVoiceLang === 'en'
            ? `${formData.farmerName}, please confirm: Land "${formData.landName || 'My Land'}", area ${formData.areaAmount} ${formData.areaUnit}, irrigation ${formData.irrigationSource}, target crop ${formData.targetCrop}, budget ${formData.budget} Rupees. Is this correct? Say Yes or tap Save.`
            : `${formData.farmerName} जी, विवरण की पुष्टि करें: खेत "${formData.landName || 'खेत'}", रकबा ${formData.areaAmount} एकड़, सिंचाई साधन ${formData.irrigationSource}, पिछली फसल ${formData.previousCrop}, और आगामी फसल ${formData.targetCrop}। बजट ${formData.budget.toLocaleString('en-IN')} रुपये। क्या यह सही है? 'हाँ' बोलें या सेव बटन दबाएं।`;
          speak(summarySpeech);
        } else {
          speak(qText);
        }
      }
    }
  }, [currentStepIndex, isOpen, activeTab, selectedVoiceLang, savedSuccessLandId]);

  const speak = (text: string) => {
    if (speechMuted || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedVoiceLang === 'en' ? 'en-IN' : 'hi-IN';
    utterance.rate = 0.95; // Steady, calm pace for farmers
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    if (isListening) {
      try { recognitionRef.current?.stop(); } catch (_) {}
      setIsListening(false);
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
      setRecognizedText('');
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Start recognition failed:', e);
        try {
          recognitionRef.current?.abort();
          recognitionRef.current?.start();
        } catch (_) {}
      }
    }
  };

  // Interpretation of spoken input
  const handleRecognizedInput = (speech: string) => {
    const clean = speech.trim();
    if (!clean) return;

    if (activeTab === 'voice_nav') {
      processGeneralVoiceCommand(clean);
      return;
    }

    // Voice Land Registration Step Processing
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;

    const lower = clean.toLowerCase();

    // Check for global voice controls: repeat, back, skip, save
    if (lower.includes('दोहरा') || lower.includes('फिर से') || lower.includes('repeat')) {
      speakCurrentQuestion();
      return;
    }
    if (lower.includes('पीछे') || lower.includes('पिछला') || lower.includes('back')) {
      handleStepBack();
      return;
    }
    if (lower.includes('छोड़') || lower.includes('skip') || lower.includes('आगे')) {
      handleStepNext();
      return;
    }

    switch (currentStep.key) {
      case 'farmer_name':
        setFormData(prev => ({ ...prev, farmerName: clean }));
        speak(`${clean} जी, नाम दर्ज हो गया।`);
        setTimeout(() => handleStepNext(), 1200);
        break;

      case 'village_district':
        setFormData(prev => ({ ...prev, village: clean }));
        speak(`${clean} दर्ज हो गया।`);
        setTimeout(() => handleStepNext(), 1200);
        break;

      case 'land_name':
        setFormData(prev => ({ ...prev, landName: clean }));
        speak(`खेत का नाम "${clean}" दर्ज हुआ।`);
        setTimeout(() => handleStepNext(), 1200);
        break;

      case 'area_unit': {
        // Extract numbers from spoken text
        const matches = clean.match(/(\d+(\.\d+)?)/);
        const num = matches ? parseFloat(matches[1]) : 2.5;
        let unit: LandAreaUnit = 'acre';
        if (clean.includes('बीघा') || clean.includes('bigha')) unit = 'bigha';
        else if (clean.includes('हेक्टेयर') || clean.includes('hectare')) unit = 'hectare';

        setFormData(prev => ({ ...prev, areaAmount: num, areaUnit: unit }));
        speak(`${num} ${unit === 'acre' ? 'एकड़' : unit} दर्ज किया गया।`);
        setTimeout(() => handleStepNext(), 1200);
        break;
      }

      case 'irrigation_source': {
        let source = 'नलकूप / बोरवेल';
        if (clean.includes('नहर') || clean.includes('canal')) source = 'नहर';
        else if (clean.includes('ड्रिप') || clean.includes('drip')) source = 'ड्रिप सिंचाई';
        else if (clean.includes('वर्षा') || clean.includes('बारिश') || clean.includes('rain')) source = 'वर्षा आधारित';
        else if (clean.includes('बोर') || clean.includes('नलकूप') || clean.includes('वेल')) source = 'नलकूप / बोरवेल';

        setFormData(prev => ({ ...prev, irrigationSource: source }));
        speak(`सिंचाई साधन: ${source}`);
        setTimeout(() => handleStepNext(), 1200);
        break;
      }

      case 'previous_crop':
        setFormData(prev => ({ ...prev, previousCrop: clean }));
        speak(`पिछली फसल ${clean} दर्ज हुई।`);
        setTimeout(() => handleStepNext(), 1200);
        break;

      case 'target_crop':
        setFormData(prev => ({ ...prev, targetCrop: clean }));
        speak(`आगामी फसल ${clean} दर्ज हुई।`);
        setTimeout(() => handleStepNext(), 1200);
        break;

      case 'budget': {
        const numMatches = clean.match(/(\d+)/g);
        let budgetVal = 40000;
        if (numMatches) {
          const combined = numMatches.join('');
          budgetVal = parseInt(combined, 10);
          if (budgetVal < 1000) budgetVal = budgetVal * 1000; // e.g. "40 हजार" -> 40 * 1000
        }
        setFormData(prev => ({ ...prev, budget: budgetVal }));
        speak(`बजट ₹${budgetVal.toLocaleString('en-IN')} दर्ज हुआ।`);
        setTimeout(() => handleStepNext(), 1200);
        break;
      }

      case 'soil_report': {
        const has = clean.includes('हां') || clean.includes('हव') || clean.includes('yes') || clean.includes('है');
        setFormData(prev => ({ ...prev, hasSoilReport: has ? 'हां' : 'नहीं' }));
        speak(has ? 'मृदा कार्ड चिन्हित किया गया।' : 'कोई बात नहीं, मिट्टी विश्लेषण बाद में भी जोड़ा जा सकता है।');
        setTimeout(() => handleStepNext(), 1200);
        break;
      }

      case 'confirm_save': {
        const isYes = clean.includes('हां') || clean.includes('हव') || clean.includes('yes') || clean.includes('सही') || clean.includes('सेव') || clean.includes('save');
        if (isYes) {
          handleCommitSaveLand();
        } else {
          speak('कृपया बताएं किस जानकारी को सुधारना है? या संबंधित सवाल पर वापस जाएं।');
        }
        break;
      }
    }
  };

  // General App Voice Navigation Engine
  const processGeneralVoiceCommand = (command: string) => {
    const c = command.toLowerCase();

    if (c.includes('भूमि') || c.includes('जमीन') || c.includes('खेत') || c.includes('my land')) {
      const resp = `आपके पास कुल ${lands.length} भूमियां पंजीकृत हैं। मेरी भूमि पृष्ठ खोला जा रहा है।`;
      setLastCommandAnswer(resp);
      speak(resp);
      setTimeout(() => {
        onClose();
        navigate('/my-land');
      }, 1800);
      return;
    }

    if (c.includes('काम') || c.includes('कैलेंडर') || c.includes('टास्क') || c.includes('calendar')) {
      const pendingCount = tasks.filter(t => t.status === 'pending').length;
      const resp = `आपके कुल ${pendingCount} कृषि कार्य बाकी हैं। फसल कैलेंडर खोला जा रहा है।`;
      setLastCommandAnswer(resp);
      speak(resp);
      setTimeout(() => {
        onClose();
        navigate('/calendar');
      }, 1800);
      return;
    }

    if (c.includes('खर्च') || c.includes('मुनाफा') || c.includes('लागत') || c.includes('expense')) {
      const totalExp = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
      const resp = `इस सत्र में अब तक कुल ₹${totalExp.toLocaleString('en-IN')} खर्च दर्ज हैं। खर्च व मुनाफा पृष्ठ खोला जा रहा है।`;
      setLastCommandAnswer(resp);
      speak(resp);
      setTimeout(() => {
        onClose();
        navigate('/expenses');
      }, 1800);
      return;
    }

    if (c.includes('स्वास्थ्य') || c.includes('मिट्टी') || c.includes('मृदा') || c.includes('health') || c.includes('report')) {
      const resp = 'खेत स्वास्थ्य एवं उत्पादकता रिपोर्ट खोली जा रही है। यहां आप एनपीके और पीडीएफ रिपोर्ट डाउनलोड कर सकते हैं।';
      setLastCommandAnswer(resp);
      speak(resp);
      setTimeout(() => {
        onClose();
        navigate('/health-report');
      }, 1800);
      return;
    }

    if (c.includes('योजना') || c.includes('सब्सिडी') || c.includes('scheme')) {
      const resp = 'पीएम किसान और कुसुम सोलर पंप जैसी प्रमुख सरकारी योजनाएं उपलब्ध हैं। योजनाएं खोली जा रही हैं।';
      setLastCommandAnswer(resp);
      speak(resp);
      setTimeout(() => {
        onClose();
        navigate('/schemes');
      }, 1800);
      return;
    }

    if (c.includes('मंडी') || c.includes('भाव') || c.includes('mandi') || c.includes('price')) {
      const resp = 'आज रायपुर मंडी में धान ₹2,350 और गेहूं ₹2,425 प्रति क्विंटल पर कारोबार कर रहा है। मंडी भाव खोले जा रहे हैं।';
      setLastCommandAnswer(resp);
      speak(resp);
      setTimeout(() => {
        onClose();
        navigate('/mandi');
      }, 1800);
      return;
    }

    if (c.includes('मौसम') || c.includes('बारिश') || c.includes('weather')) {
      const resp = 'आज का मौसम साफ है, तापमान 32 डिग्री सेल्सियस और वर्षा की संभावना केवल 10% है।';
      setLastCommandAnswer(resp);
      speak(resp);
      return;
    }

    // Default farming answer
    const defaultResp = `किसान साथी, "${command}" पर सलाह: खेत में पर्याप्त नमी बनाए रखें और किसी भी छिड़काव से पहले मौसम अवश्य जांचें।`;
    setLastCommandAnswer(defaultResp);
    speak(defaultResp);
  };

  const speakCurrentQuestion = () => {
    const currentStep = steps[currentStepIndex];
    if (!currentStep) return;
    const qText = selectedVoiceLang === 'cg'
      ? currentStep.questionCg
      : selectedVoiceLang === 'en'
      ? currentStep.questionEn
      : currentStep.questionHi;
    speak(qText);
  };

  const handleStepNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setRecognizedText('');
    }
  };

  const handleStepBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setRecognizedText('');
    }
  };

  const handleChipClick = (chip: string) => {
    setRecognizedText(chip);
    handleRecognizedInput(chip);
  };

  // Commit and Save Land to AppContext
  const handleCommitSaveLand = () => {
    if (isSavingLand || savedSuccessLandId) return;

    setIsSavingLand(true);
    const finalLandName = formData.landName.trim() || `खेत-${lands.length + 1} (${formData.village})`;

    const matchedCrop: RecommendedCrop = RECOMMENDED_CROPS.find(
      c => c.nameHi.includes(formData.targetCrop) || formData.targetCrop.includes(c.nameHi)
    ) || RECOMMENDED_CROPS[0];

    const newLandData: Omit<LandRecord, 'id'> = {
      name: finalLandName,
      area: formData.areaAmount || 2.5,
      areaUnit: formData.areaUnit || 'acre',
      irrigationSource: formData.irrigationSource,
      previousCrop: formData.previousCrop,
      village: formData.village,
      district: formData.district,
      state: 'छत्तीसगढ़',
      season: 'rabi',
      year: '2024-25',
      budget: formData.budget,
      selectedCrop: matchedCrop,
      selectedSchemes: ['scheme-01', 'scheme-03'],
      setupStep: 10,
      isComplete: true,
      status: 'पूर्ण',
      completionPercentage: 100,
      createdAt: new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      cropProgress: 25,
      currentStage: 'बुवाई सम्पन्न / कल्ले फूटना',
      healthScore: 91,
      nextActivity: { title: 'सिंचाई व खाद प्रबंधन', date: 'आगामी 7 दिन' },
      tasks: [
        {
          id: `task-${Date.now()}-1`,
          farmId: '',
          cropName: matchedCrop.nameHi,
          title: 'प्रथम सिंचाई व यूरिया छिड़काव',
          titleHi: 'प्रथम सिंचाई व यूरिया छिड़काव',
          description: 'खेत में पानी लगाकर कल्ले फूटने के समय प्रति एकड़ 45 किग्रा यूरिया दें।',
          descriptionHi: 'खेत में पानी लगाकर कल्ले फूटने के समय प्रति एकड़ 45 किग्रा यूरिया दें।',
          category: 'fertilizer',
          weekNumber: 3,
          dueDate: '2024-11-05',
          priority: 'high',
          status: 'pending',
          weatherDependent: true
        }
      ],
      expenses: [
        {
          id: `exp-${Date.now()}-1`,
          farmId: '',
          cropName: matchedCrop.nameHi,
          category: 'seeds',
          categoryHi: 'बीज खरीद',
          amount: Math.round(formData.budget * 0.25),
          date: new Date().toISOString().split('T')[0],
          season: 'rabi',
          notes: 'प्रमाणित बीज खरीद'
        }
      ],
      soilDetails: {
        uploaded: formData.hasSoilReport === 'हां',
        analysisCompleted: true,
        nitrogen: '240 kg/ha',
        phosphorus: '22 kg/ha',
        potassium: '280 kg/ha',
        ph: 6.8,
        organicCarbon: 0.65,
        soilTexture: 'काली चिकनी दोमट',
        findings: ['पोटाश प्रचुर मात्रा में उपलब्ध', 'जैविक खाद का प्रयोग बढ़ाएं']
      }
    };

    try {
      const newId = addLand(newLandData);
      setSavedSuccessLandId(newId);
      setIsSavingLand(false);

      const successSpeech = selectedVoiceLang === 'cg'
        ? `बधाई हो संगी! तोर खेत "${finalLandName}" फसलसेतु म सफलता से दर्ज हो गे हे!`
        : `बधाई हो! आपकी भूमि "${finalLandName}" फसलसेतु में सफलतापूर्वक पंजीकृत हो गई है।`;
      speak(successSpeech);
      showToast('भूमि आवाज द्वारा सफलतापूर्वक पंजीकृत हो गई!', 'success');
    } catch (err) {
      console.error('Error saving land via voice:', err);
      setIsSavingLand(false);
      showToast('भूमि सुरक्षित करने में समस्या आई, कृपया पुनः प्रयास करें', 'error');
    }
  };

  if (!isOpen) return null;

  const currentStep = steps[currentStepIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden shadow-2xl border border-emerald-100 flex flex-col">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#087A43] via-[#075B35] to-[#044326] text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white text-[#087A43] flex items-center justify-center font-bold shadow-md">
              <Bot className="w-6 h-6 text-[#087A43]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  फसलसेतु आवाज सहायक
                </h2>
                <span className="text-[10px] bg-amber-400 text-emerald-950 font-extrabold px-2 py-0.5 rounded-full">
                  किसान मित्र
                </span>
              </div>
              <p className="text-[11px] text-emerald-100">
                बिना पढ़े-लिखे बोलकर काम करें • शुद्ध क्षेत्रीय भाषा
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="bg-emerald-900/80 rounded-xl p-1 flex items-center gap-1 border border-emerald-700">
              <button
                onClick={() => setSelectedVoiceLang('hi')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                  selectedVoiceLang === 'hi' ? 'bg-white text-[#075B35] shadow-xs' : 'text-emerald-200'
                }`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setSelectedVoiceLang('cg')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                  selectedVoiceLang === 'cg' ? 'bg-amber-400 text-emerald-950 shadow-xs' : 'text-emerald-200'
                }`}
              >
                छत्तीसगढ़ी
              </button>
              <button
                onClick={() => setSelectedVoiceLang('en')}
                className={`text-[10px] font-bold px-2 py-0.5 rounded-lg transition-all ${
                  selectedVoiceLang === 'en' ? 'bg-white text-[#075B35] shadow-xs' : 'text-emerald-200'
                }`}
              >
                ENG
              </button>
            </div>

            {/* Mute Toggle */}
            <button
              onClick={() => {
                setSpeechMuted(!speechMuted);
                if (!speechMuted && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                }
              }}
              className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 cursor-pointer"
              title={speechMuted ? 'ध्वनि चालू करें' : 'ध्वनि बंद करें'}
            >
              {speechMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="bg-[#FAFBF7] border-b border-gray-200 px-4 py-2 flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setActiveTab('register_land');
              setSavedSuccessLandId(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'register_land'
                ? 'bg-[#087A43] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{isHindi ? 'बोलकर भूमि पंजीकरण' : 'Voice Land Registration'}</span>
          </button>
          <button
            onClick={() => setActiveTab('voice_nav')}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeTab === 'voice_nav'
                ? 'bg-[#087A43] text-white shadow-xs'
                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{isHindi ? 'बोलकर ऐप चलाएं' : 'Voice Commands'}</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Permission or Browser Warning */}
          {(!speechSupported || permissionError) && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2">
              <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">
                  {!speechSupported ? 'ब्राउज़र स्पीच सूचना:' : 'माइक्रोफ़ोन अनुमति आवश्यक:'}
                </p>
                <p className="text-[11px] mt-0.5 text-amber-800">
                  {permissionError || 'आपका ब्राउज़र प्रत्यक्ष स्पीच-टू-टेक्स्ट का सीमित समर्थन करता है। आप नीचे दिए गए बड़े बटनों को छूकर भी आसानी से जवाब दे सकते हैं।'}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'register_land' ? (
            savedSuccessLandId ? (
              /* Success View */
              <div className="py-8 text-center space-y-4 animate-in fade-in">
                <div className="w-20 h-20 bg-emerald-100 text-[#087A43] rounded-full mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-gray-900">
                    भूमि पंजीकरण सफल!
                  </h3>
                  <p className="text-xs text-gray-600 mt-1 max-w-sm mx-auto">
                    खेत <strong>"{formData.landName || 'नया खेत'}"</strong> ({formData.areaAmount} {formData.areaUnit}) को फसलसेतु में सुरक्षित कर दिया गया है।
                  </p>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      onClose();
                      navigate('/my-land');
                    }}
                    className="px-5 py-2.5 bg-[#087A43] text-white rounded-xl font-bold text-xs shadow-md hover:bg-[#075B35] transition-all cursor-pointer"
                  >
                    {isHindi ? 'मेरी भूमि देखें' : 'View My Land'}
                  </button>
                  <button
                    onClick={() => {
                      setSavedSuccessLandId(null);
                      setCurrentStepIndex(0);
                      setFormData(prev => ({ ...prev, landName: '' }));
                    }}
                    className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-xs hover:bg-gray-200 transition-all cursor-pointer"
                  >
                    + एक और खेत जोड़ें
                  </button>
                </div>
              </div>
            ) : (
              /* Step-by-Step Voice Guided Wizard */
              <div className="space-y-4">
                {/* Progress bar */}
                <div className="flex items-center justify-between text-xs text-gray-500 font-semibold mb-1">
                  <span>चरण {currentStepIndex + 1} / {steps.length}</span>
                  <span className="text-[#087A43] font-bold">{currentStep.titleHi}</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#087A43] h-full transition-all duration-300"
                    style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                  />
                </div>

                {/* Spoken Question Prompt Card */}
                <div className="bg-[#FAFBF7] border-2 border-emerald-200/80 rounded-3xl p-5 shadow-xs relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#087A43] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      {selectedVoiceLang === 'cg' ? 'सवाल (छत्तीसगढ़ी)' : selectedVoiceLang === 'en' ? 'Question' : 'सवाल (हिंदी)'}
                    </span>
                    <button
                      onClick={speakCurrentQuestion}
                      className="text-xs text-[#087A43] font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>सवाल दोहराएं</span>
                    </button>
                  </div>

                  <p className="text-base sm:text-lg font-black text-gray-900 leading-snug">
                    {selectedVoiceLang === 'cg' 
                      ? currentStep.questionCg 
                      : selectedVoiceLang === 'en' 
                      ? currentStep.questionEn 
                      : currentStep.questionHi}
                  </p>

                  {/* Summary Preview on Confirmation Step */}
                  {currentStep.key === 'confirm_save' && (
                    <div className="mt-4 p-3 bg-white rounded-2xl border border-gray-200 text-xs space-y-1.5">
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500">किसान:</span>
                        <span className="font-bold">{formData.farmerName} ({formData.village})</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500">खेत का नाम व रकबा:</span>
                        <span className="font-bold text-[#087A43]">{formData.landName || 'मुख्य खेत'} • {formData.areaAmount} {formData.areaUnit}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500">सिंचाई साधन:</span>
                        <span className="font-bold">{formData.irrigationSource}</span>
                      </div>
                      <div className="flex justify-between border-b border-gray-100 pb-1">
                        <span className="text-gray-500">पिछली व आगामी फसल:</span>
                        <span className="font-bold">{formData.previousCrop} ➔ {formData.targetCrop}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">अनुमानित बजट:</span>
                        <span className="font-bold text-emerald-800">₹{formData.budget.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Speech Recognized Live Indicator */}
                <div className="p-3 bg-white rounded-2xl border border-gray-200 text-center">
                  <p className="text-[11px] text-gray-400 font-medium">
                    {isListening 
                      ? '🔴 माइक चालू है... अपनी भाषा में बोलिए' 
                      : recognizedText 
                      ? 'पहचाना गया उत्तर:' 
                      : 'माइक दबाकर बोलें या नीचे दिए गए विकल्पों में से चुनें'}
                  </p>
                  {recognizedText && (
                    <p className="text-base font-extrabold text-[#087A43] mt-1">
                      "{recognizedText}"
                    </p>
                  )}
                </div>

                {/* Big Tap Quick Chips for Illiterate / Non-Typing Farmers */}
                <div>
                  <p className="text-[11px] text-gray-500 font-semibold mb-2">
                    त्वरित विकल्प (छूकर भी चुन सकते हैं):
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {currentStep.quickChips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChipClick(chip)}
                        className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#075B35] rounded-xl text-xs font-bold border border-emerald-200 transition-all cursor-pointer active:scale-95 shadow-2xs"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation and Confirmation Controls */}
                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    onClick={handleStepBack}
                    disabled={currentStepIndex === 0}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>पिछला सवाल</span>
                  </button>

                  {currentStep.key === 'confirm_save' ? (
                    <button
                      onClick={handleCommitSaveLand}
                      disabled={isSavingLand}
                      className="flex-1 py-3 px-5 bg-[#087A43] hover:bg-[#075B35] text-white rounded-xl font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                    >
                      <Check className="w-5 h-5 text-amber-300" />
                      <span>
                        {isSavingLand
                          ? (isHindi ? 'सुरक्षित हो रहा है...' : 'Saving...')
                          : (isHindi ? 'हाँ, सुरक्षित करें' : 'Yes, Save Land')}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={handleStepNext}
                      className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <span>छोड़ें / आगे बढ़ें</span>
                    </button>
                  )}
                </div>
              </div>
            )
          ) : (
            /* Voice Navigation & Farming Q&A Tab */
            <div className="space-y-4">
              <div className="bg-[#FAFBF7] border border-gray-200 rounded-3xl p-4 text-center space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#087A43] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  बोलकर ऐप चलाएं
                </span>
                <h3 className="text-base font-black text-gray-900">
                  कुछ भी बोलें, फसलसेतु आपकी सेवा में है
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  उदा.: "मेरी जमीन दिखाओ", "कैलेंडर कार्य बताओ", "खर्च दिखाओ", या "मंडी भाव क्या है?"
                </p>
              </div>

              {/* Sample voice command cards */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { text: 'मेरी जमीन दिखाओ', action: 'खुलेगा: मेरी भूमि' },
                  { text: 'फसल कैलेंडर कार्य', action: 'खुलेगा: आगामी कार्य' },
                  { text: 'खर्च व मुनाफा', action: 'खुलेगा: बही-खाता' },
                  { text: 'खेत स्वास्थ्य रिपोर्ट', action: 'खुलेगा: NPK रिपोर्ट' },
                  { text: 'सरकारी योजनाएं', action: 'खुलेगा: सब्सिडी' },
                  { text: 'आज का मंडी भाव', action: 'खुलेगा: लाइव भाव' }
                ].map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setRecognizedText(cmd.text);
                      processGeneralVoiceCommand(cmd.text);
                    }}
                    className="p-3 bg-white hover:bg-emerald-50/60 rounded-2xl border border-gray-200 text-left transition-all cursor-pointer shadow-2xs group"
                  >
                    <p className="text-xs font-bold text-gray-900 group-hover:text-[#087A43]">
                      🗣️ "{cmd.text}"
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{cmd.action}</p>
                  </button>
                ))}
              </div>

              {/* Response Feed */}
              {lastCommandAnswer && (
                <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#075B35]">
                    <Sparkles className="w-4 h-4" />
                    <span>फसलसेतु जवाब:</span>
                  </div>
                  <p className="text-xs text-emerald-950 font-medium leading-relaxed">
                    {lastCommandAnswer}
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Big Bottom Central Microphone Bar */}
        <div className="bg-gray-50 border-t border-gray-200 p-4 shrink-0 flex items-center justify-between gap-4">
          <div className="text-xs text-gray-500 hidden sm:block">
            <p className="font-semibold text-gray-700">बोलने के लिए माइक दबाएं</p>
            <p className="text-[10px]">{isListening ? 'माइक सुन रहा है...' : 'माइक बंद है'}</p>
          </div>

          {/* Central Large Mic Button */}
          <button
            onClick={toggleListening}
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center text-white transition-all shadow-xl mx-auto cursor-pointer relative group ${
              isListening
                ? 'bg-rose-600 ring-8 ring-rose-200 animate-pulse scale-105'
                : 'bg-[#087A43] hover:bg-[#075B35] ring-4 ring-emerald-200 active:scale-95'
            }`}
            title="माइक चालू / बंद करें"
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white animate-bounce" />
            ) : (
              <Mic className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            )}
          </button>

          <div className="text-right text-xs text-gray-500 hidden sm:block">
            <span className="text-[10px] bg-emerald-100 text-[#075B35] font-bold px-2 py-0.5 rounded-full inline-block">
              {selectedVoiceLang === 'cg' ? 'छत्तीसगढ़ी' : selectedVoiceLang === 'en' ? 'English' : 'हिंदी'}
            </span>
            <p className="text-[10px] text-gray-400 mt-0.5">भाषा ऊपर बदलें</p>
          </div>
        </div>

      </div>
    </div>
  );
};
