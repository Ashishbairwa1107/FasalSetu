import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  FarmerProfile,
  OnboardingState,
  FarmField,
  LandRecord,
  CropCalendarTask,
  ExpenseRecord,
  GovtScheme,
  CommunityPost,
  KrishiAlert,
  CropDiagnosis,
  ChatMessage,
  Language,
  NearbyMill,
  SubscriptionRecord,
  PaymentTransaction,
  GatewayConfig,
  SubscriptionEntitlements
} from '../types';
import {
  DEFAULT_FARMER_PROFILE,
  INITIAL_FARMS,
  INITIAL_LANDS,
  INITIAL_CALENDAR_TASKS,
  INITIAL_EXPENSES,
  INITIAL_SCHEMES,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_ALERTS,
  SAMPLE_CROP_DIAGNOSES,
  AI_FAQ_KNOWLEDGE,
  NEARBY_MILLS
} from '../data/mockData';
import {
  fetchPersistedData,
  apiSaveProfile,
  apiSaveSetting,
  apiSaveLand,
  apiUpdateLand,
  apiDeleteLand,
  apiSaveTask,
  apiToggleTask,
  apiDeleteTask,
  apiSaveExpense,
  apiDeleteExpense,
  downloadWorkbookFile,
  apiSendChatMessage,
  fetchCurrentSubscription,
  fetchPaymentTransactions,
  fetchGatewayConfig
} from '../services/apiService';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  profile: FarmerProfile;
  updateProfile: (updates: Partial<FarmerProfile>) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  onboarding: OnboardingState;
  setOnboarding: React.Dispatch<React.SetStateAction<OnboardingState>>;
  completeOnboarding: () => void;
  resetOnboarding: () => void;

  // Lands (Independent records workflow)
  lands: LandRecord[];
  addLand: (land: Omit<LandRecord, 'id'>) => string;
  updateLand: (id: string, updates: Partial<LandRecord>) => void;
  deleteLand: (id: string) => void;
  currentDraftLand: Partial<LandRecord> | null;
  saveDraftLand: (draft: Partial<LandRecord>) => void;
  clearDraftLand: () => void;

  // Land-specific Tasks
  addLandTask: (landId: string, task: Omit<CropCalendarTask, 'id'>) => void;
  updateLandTask: (landId: string, taskId: string, updates: Partial<CropCalendarTask>) => void;
  toggleLandTask: (landId: string, taskId: string) => void;
  deleteLandTask: (landId: string, taskId: string) => void;

  // Land-specific Expenses
  addLandExpense: (landId: string, expense: Omit<ExpenseRecord, 'id'>) => void;
  updateLandExpense: (landId: string, expenseId: string, updates: Partial<ExpenseRecord>) => void;
  deleteLandExpense: (landId: string, expenseId: string) => void;

  // Legacy farm compatibility
  farms: FarmField[];
  addFarm: (farm: Omit<FarmField, 'id'>) => void;
  updateFarm: (id: string, updates: Partial<FarmField>) => void;
  deleteFarm: (id: string) => void;

  // Global tasks & expenses
  tasks: CropCalendarTask[];
  addTask: (task: Omit<CropCalendarTask, 'id'>) => void;
  updateTask: (id: string, updates: Partial<CropCalendarTask>) => void;
  toggleTaskStatus: (id: string) => void;
  deleteTask: (id: string) => void;

  expenses: ExpenseRecord[];
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => void;
  updateExpense: (id: string, updates: Partial<ExpenseRecord>) => void;
  deleteExpense: (id: string) => void;

  schemes: GovtScheme[];
  toggleSchemeBookmark: (id: string) => void;
  updateSchemeStatus: (id: string, status: GovtScheme['applicationStatus']) => void;

  communityPosts: CommunityPost[];
  addCommunityPost: (post: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'hasLiked' | 'comments'>) => void;
  toggleLikePost: (id: string) => void;
  addCommentToPost: (postId: string, text: string) => void;
  toggleSavePost: (id: string) => void;

  alerts: KrishiAlert[];
  markAlertRead: (id: string) => void;
  clearAllReadAlerts: () => void;

  cropDiagnoses: CropDiagnosis[];
  addDiagnosis: (diagnosis: Omit<CropDiagnosis, 'id' | 'date'>) => void;

  chatMessages: ChatMessage[];
  sendUserChatMessage: (text: string, imageUrl?: string) => Promise<void>;
  clearChat: () => void;

  // Nearby Mills
  nearbyMills: NearbyMill[];
  toggleMillFavorite: (id: string) => void;

  // Voice Assistant for Farmers
  voiceAssistantOpen: boolean;
  voiceAssistantMode: 'register_land' | 'voice_nav';
  openVoiceAssistant: (mode?: 'register_land' | 'voice_nav') => void;
  closeVoiceAssistant: () => void;

  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;

  resetAllDemoData: () => void;

  // Local Excel Persistence status & export
  apiConnected: boolean;
  lastExcelSavedAt: string | null;
  downloadExcel: () => void;

  // Subscription & Payment Workflow
  subscription: SubscriptionRecord | null;
  subscriptionLoading: boolean;
  refreshSubscription: () => Promise<void>;
  transactions: PaymentTransaction[];
  refreshTransactions: () => Promise<void>;
  isPremium: boolean;
  isBasic: boolean;
  hasActiveSubscription: boolean;
  gatewayConfig: GatewayConfig | null;
  entitlements: SubscriptionEntitlements | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'khetmitra_profile_v2',
  LANGUAGE: 'khetmitra_lang_v2',
  ONBOARDING: 'khetmitra_onboarding_v2',
  FARMS: 'khetmitra_farms_v2',
  LANDS: 'khetmitra_lands_v3',
  DRAFT_LAND: 'khetmitra_draft_land_v3',
  MILLS: 'khetmitra_mills_v3',
  TASKS: 'khetmitra_tasks_v2',
  EXPENSES: 'khetmitra_expenses_v2',
  SCHEMES: 'khetmitra_schemes_v2',
  POSTS: 'khetmitra_posts_v2',
  ALERTS: 'khetmitra_alerts_v2',
  DIAGNOSES: 'khetmitra_diagnoses_v2',
  CHAT: 'khetmitra_chat_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profile
  const [profile, setProfile] = useState<FarmerProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : DEFAULT_FARMER_PROFILE;
  });

  // Language
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANGUAGE) as Language;
    return saved || 'hi';
  });

  // Local Excel Persistence State
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [lastExcelSavedAt, setLastExcelSavedAt] = useState<string | null>(null);

  // Load saved data from Excel API on startup / refresh
  useEffect(() => {
    let isMounted = true;
    fetchPersistedData().then(result => {
      if (!isMounted) return;
      if (result.success) {
        setApiConnected(true);
        if (result.profile) {
          setProfile(result.profile);
        }
        if (result.lands && result.lands.length > 0) {
          setLands(result.lands);
          const syncedFarms: FarmField[] = result.lands.map(l => ({
            id: l.id,
            name: l.name,
            area: l.area,
            areaUnit: l.areaUnit === 'bigha' ? 'Bigha' : l.areaUnit === 'hectare' ? 'Hectare' : 'Acres',
            location: `${l.village}, ${l.district}`,
            soilType: 'Black / काली मिट्टी',
            irrigationType: (l.irrigationSource.includes('नहर') ? 'Canal / नहर' : 'Tube well / नलकूप') as any,
            currentCrop: l.selectedCrop ? l.selectedCrop.nameHi : l.previousCrop || 'धान',
            cropVariety: 'प्रमाणित किस्म',
            sowingDate: '2024-07-01',
            expectedHarvestDate: '2024-11-15',
            growthStage: 'flowering',
            healthScore: l.healthScore || 90,
            lastInspected: '2024-10-18'
          }));
          setFarms(syncedFarms);
        }
        if (result.tasks && result.tasks.length > 0) {
          setTasks(result.tasks);
        }
        if (result.expenses && result.expenses.length > 0) {
          setExpenses(result.expenses);
        }
        if (result.settings?.current_language) {
          setLanguageState(result.settings.current_language as Language);
        }
      } else {
        setApiConnected(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Subscription & Payment State
  const [subscription, setSubscription] = useState<SubscriptionRecord | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState<boolean>(true);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [gatewayConfig, setGatewayConfig] = useState<GatewayConfig | null>(null);
  const [entitlements, setEntitlements] = useState<SubscriptionEntitlements | null>(null);

  const refreshSubscription = async () => {
    setSubscriptionLoading(true);
    try {
      const res = await fetchCurrentSubscription(profile.id || 'farmer-001');
      if (res.success) {
        setSubscription(res.subscription);
        if (res.entitlements) setEntitlements(res.entitlements);
      }
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const refreshTransactions = async () => {
    const res = await fetchPaymentTransactions(profile.id || 'farmer-001');
    if (res.success) {
      setTransactions(res.transactions);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      fetchCurrentSubscription(profile.id || 'farmer-001'),
      fetchPaymentTransactions(profile.id || 'farmer-001'),
      fetchGatewayConfig()
    ]).then(([subRes, txRes, gwRes]) => {
      if (!active) return;
      if (subRes.success) {
        setSubscription(subRes.subscription);
        if (subRes.entitlements) setEntitlements(subRes.entitlements);
      }
      if (txRes.success) {
        setTransactions(txRes.transactions);
      }
      setGatewayConfig(gwRes);
      setSubscriptionLoading(false);
    }).catch(err => {
      console.warn('[AppContext] Failed to load subscription state:', err);
      if (active) setSubscriptionLoading(false);
    });

    return () => {
      active = false;
    };
  }, [profile.id]);

  const isPremium = Boolean(subscription && subscription.status === 'active' && subscription.planId === 'premium');
  const isBasic = Boolean(subscription && subscription.status === 'active' && subscription.planId === 'basic');
  const hasActiveSubscription = Boolean(subscription && subscription.status === 'active');

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setProfile(prev => ({ ...prev, language: lang }));
    apiSaveSetting('current_language', lang).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
    apiSaveProfile({ ...profile, language: lang });
  };

  // Onboarding
  const [onboarding, setOnboarding] = useState<OnboardingState>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ONBOARDING);
    return saved ? JSON.parse(saved) : {
      completed: true,
      step: 1,
      language: 'hi',
      authType: 'phone',
      phoneOrEmail: '+91 98765 43210',
      otpVerified: true,
      profileCreated: true,
      farmingTypeSelected: true
    };
  });

  // Lands (New Multi-step Land Management Workflow)
  const [lands, setLands] = useState<LandRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANDS);
    return saved ? JSON.parse(saved) : INITIAL_LANDS;
  });

  // Draft Land (in progress setup)
  const [currentDraftLand, setCurrentDraftLand] = useState<Partial<LandRecord> | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRAFT_LAND);
    return saved ? JSON.parse(saved) : null;
  });

  // Farms (legacy / synced with lands)
  const [farms, setFarms] = useState<FarmField[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FARMS);
    return saved ? JSON.parse(saved) : INITIAL_FARMS;
  });

  // Nearby Mills
  const [nearbyMills, setNearbyMills] = useState<NearbyMill[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MILLS);
    return saved ? JSON.parse(saved) : NEARBY_MILLS;
  });

  // Global Tasks
  const [tasks, setTasks] = useState<CropCalendarTask[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
    return saved ? JSON.parse(saved) : INITIAL_CALENDAR_TASKS;
  });

  // Global Expenses
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Schemes
  const [schemes, setSchemes] = useState<GovtScheme[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SCHEMES);
    return saved ? JSON.parse(saved) : INITIAL_SCHEMES;
  });

  // Community Posts
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : INITIAL_COMMUNITY_POSTS;
  });

  // Alerts
  const [alerts, setAlerts] = useState<KrishiAlert[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  // Crop Diagnoses
  const [cropDiagnoses, setCropDiagnoses] = useState<CropDiagnosis[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIAGNOSES);
    return saved ? JSON.parse(saved) : SAMPLE_CROP_DIAGNOSES;
  });

  // Chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'msg-welcome',
        sender: 'ai',
        text: 'नमस्ते राम कुमार जी! मैं फसलसेतु सहायक हूँ। आप अपनी फसल, कीट-रोग, मौसम, खाद या कृषि योजनाओं के बारे में कोई भी सवाल पूछ सकते हैं।',
        timestamp: 'अभी-अभी',
        suggestions: [
          'धान में पीलापन क्यों आ रहा है?',
          'कितनी सिंचाई करें?',
          'खाद की मात्रा बताएं'
        ],
        isDemoNotice: true
      }
    ];
  });

  // Toast
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Voice Assistant
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false);
  const [voiceAssistantMode, setVoiceAssistantMode] = useState<'register_land' | 'voice_nav'>('register_land');

  const openVoiceAssistant = (mode: 'register_land' | 'voice_nav' = 'register_land') => {
    setVoiceAssistantMode(mode);
    setVoiceAssistantOpen(true);
  };

  const closeVoiceAssistant = () => {
    setVoiceAssistantOpen(false);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 3500);
  };

  const hideToast = () => setToast(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ONBOARDING, JSON.stringify(onboarding));
  }, [onboarding]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANDS, JSON.stringify(lands));
  }, [lands]);

  useEffect(() => {
    if (currentDraftLand) {
      localStorage.setItem(STORAGE_KEYS.DRAFT_LAND, JSON.stringify(currentDraftLand));
    } else {
      localStorage.removeItem(STORAGE_KEYS.DRAFT_LAND);
    }
  }, [currentDraftLand]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MILLS, JSON.stringify(nearbyMills));
  }, [nearbyMills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify(farms));
  }, [farms]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SCHEMES, JSON.stringify(schemes));
  }, [schemes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(communityPosts));
  }, [communityPosts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIAGNOSES, JSON.stringify(cropDiagnoses));
  }, [cropDiagnoses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Actions
  const updateProfile = (updates: Partial<FarmerProfile>) => {
    const updated = { ...profile, ...updates };
    setProfile(updated);
    showToast(language === 'hi' ? 'प्रोफ़ाइल सफलतापूर्वक अपडेट की गई' : 'Profile updated successfully', 'success');

    apiSaveProfile(updated).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const completeOnboarding = () => {
    setOnboarding(prev => ({ ...prev, completed: true }));
    showToast(language === 'hi' ? 'फसलसेतु में आपका स्वागत है!' : 'Welcome to FasalSetu!', 'success');
  };

  const resetOnboarding = () => {
    setOnboarding({
      completed: false,
      step: 1,
      language,
      authType: 'phone',
      phoneOrEmail: '+91 98765 43210',
      otpVerified: false,
      profileCreated: false,
      farmingTypeSelected: false
    });
  };

  // Land Management Actions
  const addLand = (newLandData: Omit<LandRecord, 'id'>): string => {
    const id = `land-${Date.now()}`;
    const newLand: LandRecord = {
      ...newLandData,
      id,
      tasks: newLandData.tasks || [],
      expenses: newLandData.expenses || []
    };
    setLands(prev => [newLand, ...prev]);

    // Also sync with legacy farms list
    const legacyFarm: FarmField = {
      id,
      name: newLand.name,
      area: newLand.area,
      areaUnit: newLand.areaUnit === 'bigha' ? 'Bigha' : newLand.areaUnit === 'hectare' ? 'Hectare' : 'Acres',
      location: `${newLand.village}, ${newLand.district}`,
      soilType: 'Black / काली मिट्टी',
      irrigationType: (newLand.irrigationSource.includes('नहर') ? 'Canal / नहर' : 'Tube well / नलकूप') as any,
      currentCrop: newLand.selectedCrop ? newLand.selectedCrop.nameHi : newLand.previousCrop || 'धान',
      cropVariety: 'प्रमाणित किस्म',
      sowingDate: '2024-07-01',
      expectedHarvestDate: '2024-11-15',
      growthStage: 'flowering',
      healthScore: newLand.healthScore || 90,
      lastInspected: '2024-10-18'
    };
    setFarms(prev => [legacyFarm, ...prev]);

    showToast(language === 'hi' ? 'नई भूमि सफलतापूर्वक पंजीकृत हो गई' : 'New land registered successfully', 'success');

    // Persist to Excel workbook
    apiSaveLand(newLand).then(res => {
      if (res.success) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });

    return id;
  };

  const updateLand = (id: string, updates: Partial<LandRecord>) => {
    setLands(prev => prev.map(l => (l.id === id ? { ...l, ...updates } : l)));
    // Also sync legacy farm
    setFarms(prev => prev.map(f => {
      if (f.id === id) {
        return {
          ...f,
          name: updates.name || f.name,
          area: updates.area || f.area,
          currentCrop: updates.selectedCrop?.nameHi || f.currentCrop
        };
      }
      return f;
    }));
    showToast(language === 'hi' ? 'भूमि का विवरण अपडेट हुआ' : 'Land updated successfully', 'success');

    // Persist to Excel workbook
    apiUpdateLand(id, updates).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const deleteLand = (id: string) => {
    setLands(prev => prev.filter(l => l.id !== id));
    setFarms(prev => prev.filter(f => f.id !== id));
    showToast(language === 'hi' ? 'भूमि हटा दी गई' : 'Land removed', 'info');

    // Persist deletion to Excel workbook
    apiDeleteLand(id).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const saveDraftLand = (draft: Partial<LandRecord>) => {
    setCurrentDraftLand(prev => ({ ...prev, ...draft }));
  };

  const clearDraftLand = () => {
    setCurrentDraftLand(null);
  };

  // Land-specific Tasks
  const addLandTask = (landId: string, taskData: Omit<CropCalendarTask, 'id'>) => {
    const newTask: CropCalendarTask = {
      ...taskData,
      id: `task-${Date.now()}`
    };
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return { ...l, tasks: [newTask, ...l.tasks] };
      }
      return l;
    }));
    // Also add to global tasks
    setTasks(prev => [newTask, ...prev]);
    showToast(language === 'hi' ? 'कार्य कैलेंडर में जोड़ा गया' : 'Task added to land calendar', 'success');

    // Persist to Excel workbook
    apiSaveTask({ ...newTask, farmId: landId }).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const updateLandTask = (landId: string, taskId: string, updates: Partial<CropCalendarTask>) => {
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return {
          ...l,
          tasks: l.tasks.map(t => (t.id === taskId ? { ...t, ...updates } : t))
        };
      }
      return l;
    }));
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
    showToast(language === 'hi' ? 'कार्य अपडेट हुआ' : 'Task updated', 'success');

    apiSaveTask({ id: taskId, farmId: landId, ...updates }).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const toggleLandTask = (landId: string, taskId: string) => {
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return {
          ...l,
          tasks: l.tasks.map(t => {
            if (t.id === taskId) {
              const nextStatus = t.status === 'completed' ? 'pending' : 'completed';
              return { ...t, status: nextStatus };
            }
            return t;
          })
        };
      }
      return l;
    }));
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, status: t.status === 'completed' ? 'pending' : 'completed' };
      }
      return t;
    }));

    apiToggleTask(taskId).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const deleteLandTask = (landId: string, taskId: string) => {
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return {
          ...l,
          tasks: l.tasks.filter(t => t.id !== taskId)
        };
      }
      return l;
    }));
    setTasks(prev => prev.filter(t => t.id !== taskId));
    showToast(language === 'hi' ? 'कार्य हटाया गया' : 'Task removed', 'info');

    apiDeleteTask(taskId).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  // Land-specific Expenses
  const addLandExpense = (landId: string, expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return { ...l, expenses: [newExpense, ...l.expenses] };
      }
      return l;
    }));
    setExpenses(prev => [newExpense, ...prev]);
    showToast(language === 'hi' ? 'खर्च सफलतापूर्वक दर्ज हुआ' : 'Expense recorded', 'success');

    apiSaveExpense({ ...newExpense, farmId: landId }).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const updateLandExpense = (landId: string, expenseId: string, updates: Partial<ExpenseRecord>) => {
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return {
          ...l,
          expenses: l.expenses.map(e => (e.id === expenseId ? { ...e, ...updates } : e))
        };
      }
      return l;
    }));
    setExpenses(prev => prev.map(e => (e.id === expenseId ? { ...e, ...updates } : e)));
    showToast(language === 'hi' ? 'खर्च अपडेट हुआ' : 'Expense updated', 'success');

    apiSaveExpense({ id: expenseId, farmId: landId, ...updates }).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const deleteLandExpense = (landId: string, expenseId: string) => {
    setLands(prev => prev.map(l => {
      if (l.id === landId) {
        return {
          ...l,
          expenses: l.expenses.filter(e => e.id !== expenseId)
        };
      }
      return l;
    }));
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    showToast(language === 'hi' ? 'खर्च रिकॉर्ड हटाया गया' : 'Expense removed', 'info');

    apiDeleteExpense(expenseId).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  // Nearby Mills Action
  const toggleMillFavorite = (id: string) => {
    setNearbyMills(prev => prev.map(m => {
      if (m.id === id) {
        const next = !m.isFavorite;
        showToast(next ? 'मिल पसंदीदा में जोड़ी गई' : 'पसंदीदा से हटाई गई', 'info');
        return { ...m, isFavorite: next };
      }
      return m;
    }));
  };

  // Legacy Farm Actions
  const addFarm = (newFarm: Omit<FarmField, 'id'>) => {
    const farm: FarmField = {
      ...newFarm,
      id: `farm-${Date.now()}`
    };
    setFarms(prev => [farm, ...prev]);
    showToast(language === 'hi' ? 'खेत जोड़ा गया' : 'Farm added', 'success');
  };

  const updateFarm = (id: string, updates: Partial<FarmField>) => {
    setFarms(prev => prev.map(f => (f.id === id ? { ...f, ...updates } : f)));
    showToast(language === 'hi' ? 'खेत अपडेट हुआ' : 'Farm updated', 'success');
  };

  const deleteFarm = (id: string) => {
    setFarms(prev => prev.filter(f => f.id !== id));
    showToast(language === 'hi' ? 'खेत हटाया गया' : 'Farm removed', 'info');
  };

  // Global Task Actions
  const addTask = (newTask: Omit<CropCalendarTask, 'id'>) => {
    const task: CropCalendarTask = { ...newTask, id: `task-${Date.now()}` };
    setTasks(prev => [task, ...prev]);
    showToast(language === 'hi' ? 'कार्य जोड़ा गया' : 'Task added', 'success');

    apiSaveTask(task).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const updateTask = (id: string, updates: Partial<CropCalendarTask>) => {
    setTasks(prev => prev.map(t => (t.id === id ? { ...t, ...updates } : t)));
    showToast(language === 'hi' ? 'कार्य अपडेट हुआ' : 'Task updated', 'success');

    apiSaveTask({ id, ...updates }).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'completed' ? 'pending' : 'completed' };
      }
      return t;
    }));

    apiToggleTask(id).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast(language === 'hi' ? 'कार्य हटाया गया' : 'Task deleted', 'info');

    apiDeleteTask(id).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  // Global Expense Actions
  const addExpense = (newExpense: Omit<ExpenseRecord, 'id'>) => {
    const expense: ExpenseRecord = { ...newExpense, id: `exp-${Date.now()}` };
    setExpenses(prev => [expense, ...prev]);
    showToast(language === 'hi' ? 'खर्च दर्ज किया गया' : 'Expense recorded', 'success');

    apiSaveExpense(expense).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const updateExpense = (id: string, updates: Partial<ExpenseRecord>) => {
    setExpenses(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));
    showToast(language === 'hi' ? 'खर्च अपडेट हुआ' : 'Expense updated', 'success');

    apiSaveExpense({ id, ...updates }).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast(language === 'hi' ? 'खर्च रिकॉर्ड हटाया गया' : 'Expense deleted', 'info');

    apiDeleteExpense(id).then(ok => {
      if (ok) {
        setApiConnected(true);
        setLastExcelSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    });
  };

  const toggleSchemeBookmark = (id: string) => {
    setSchemes(prev => prev.map(s => (s.id === id ? { ...s, bookmarked: !s.bookmarked } : s)));
  };

  const updateSchemeStatus = (id: string, status: GovtScheme['applicationStatus']) => {
    setSchemes(prev => prev.map(s => (s.id === id ? { ...s, applicationStatus: status } : s)));
    showToast(language === 'hi' ? 'आवेदन स्थिति अपडेट हुई' : 'Application status updated', 'success');
  };

  const addCommunityPost = (newPost: Omit<CommunityPost, 'id' | 'createdAt' | 'likes' | 'hasLiked' | 'comments'>) => {
    const post: CommunityPost = {
      ...newPost,
      id: `post-${Date.now()}`,
      createdAt: 'अभी-अभी',
      likes: 0,
      hasLiked: false,
      comments: []
    };
    setCommunityPosts(prev => [post, ...prev]);
    showToast(language === 'hi' ? 'सवाल प्रकाशित हुआ' : 'Question posted', 'success');
  };

  const toggleLikePost = (id: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === id) {
        const hasLiked = !p.hasLiked;
        return {
          ...p,
          hasLiked,
          likes: hasLiked ? p.likes + 1 : Math.max(0, p.likes - 1)
        };
      }
      return p;
    }));
  };

  const addCommentToPost = (postId: string, text: string) => {
    setCommunityPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const newComment = {
          id: `c-${Date.now()}`,
          authorName: profile.name,
          authorRole: 'किसान साथी',
          isExpert: false,
          text,
          date: 'अभी-अभी',
          likes: 0
        };
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
    showToast(language === 'hi' ? 'टिप्पणी जोड़ी गई' : 'Comment added', 'success');
  };

  const toggleSavePost = (id: string) => {
    setCommunityPosts(prev => prev.map(p => (p.id === id ? { ...p, saved: !p.saved } : p)));
  };

  const markAlertRead = (id: string) => {
    setAlerts(prev => prev.map(a => (a.id === id ? { ...a, read: true } : a)));
  };

  const clearAllReadAlerts = () => {
    setAlerts(prev => prev.filter(a => !a.read));
    showToast(language === 'hi' ? 'पढ़े गए अलर्ट हटाए गए' : 'Read alerts cleared', 'info');
  };

  const addDiagnosis = (newDiagnosis: Omit<CropDiagnosis, 'id' | 'date'>) => {
    const diagnosis: CropDiagnosis = {
      ...newDiagnosis,
      id: `diag-${Date.now()}`,
      date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    };
    setCropDiagnoses(prev => [diagnosis, ...prev]);
    showToast(language === 'hi' ? 'रोग विश्लेषण सहेजा गया' : 'Diagnosis saved', 'success');
  };

  const sendUserChatMessage = async (text: string, imageUrl?: string): Promise<void> => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      imageUrl
    };

    // Capture previous history before state update
    const previousHistory = chatMessages.map(m => ({
      sender: m.sender,
      text: m.text
    }));

    setChatMessages(prev => [...prev, userMsg]);

    try {
      const result = await apiSendChatMessage({
        message: text,
        conversationHistory: [...previousHistory, { sender: 'user', text }],
        farmerName: profile.name,
        location: `${profile.village}, ${profile.district}`,
        imageUrl
      });

      if (result.success && result.replyText) {
        const aiReply: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: result.replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: result.suggestions || [
            'धान में पीलापन क्यों आ रहा है?',
            'कितनी सिंचाई करें?',
            'खाद की मात्रा बताएं'
          ],
          isDemoNotice: false
        };
        setChatMessages(prev => [...prev, aiReply]);
      } else {
        const errorReply: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: language === 'en'
            ? `⚠️ **AI Service Notice:**\n${result.error || 'Could not connect to AI service.'}\n\nPlease try again shortly or call Farmer Helpline 1800-180-1551.`
            : `⚠️ **AI सेवा सूचना:**\n${result.error || 'AI सर्वर से उत्तर प्राप्त करने में समस्या आई।'}\n\nकृपया कुछ क्षण बाद पुनः प्रयास करें या किसान हेल्पलाइन 1800-180-1551 पर संपर्क करें।`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: language === 'en' ? ['Try Again', 'Helpline Number'] : ['पुनः प्रयास करें', 'किसान हेल्पलाइन नंबर']
        };
        setChatMessages(prev => [...prev, errorReply]);
      }
    } catch (err: any) {
      const errorReply: ChatMessage = {
        id: `ai-err-${Date.now()}`,
        sender: 'ai',
        text: language === 'en'
          ? `⚠️ **Network Error:**\n${err?.message || 'Could not connect to server.'}\n\nPlease verify your connection.`
          : `⚠️ **नेटवर्क सूचना:**\n${err?.message || 'सर्वर से संपर्क नहीं हो सका।'}\n\nकृपया अपना इंटरनेट कनेक्शन जांचें।`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: language === 'en' ? ['Try Again'] : ['पुनः प्रयास करें']
      };
      setChatMessages(prev => [...prev, errorReply]);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    showToast(language === 'hi' ? 'बातचीत इतिहास साफ किया गया' : 'Chat cleared', 'info');
  };

  const resetAllDemoData = () => {
    setProfile(DEFAULT_FARMER_PROFILE);
    setLanguageState('hi');
    setLands(INITIAL_LANDS);
    setFarms(INITIAL_FARMS);
    setCurrentDraftLand(null);
    setNearbyMills(NEARBY_MILLS);
    setTasks(INITIAL_CALENDAR_TASKS);
    setExpenses(INITIAL_EXPENSES);
    setSchemes(INITIAL_SCHEMES);
    setCommunityPosts(INITIAL_COMMUNITY_POSTS);
    setAlerts(INITIAL_ALERTS);
    setCropDiagnoses(SAMPLE_CROP_DIAGNOSES);
    setChatMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'ai',
        text: 'नमस्ते! मैं फसलसेतु सहायक हूँ। डेटा रीसेट कर दिया गया है।',
        timestamp: 'अभी-अभी',
        suggestions: ['धान में पीलापन क्यों आ रहा है?', 'कितनी सिंचाई करें?'],
        isDemoNotice: true
      }
    ]);
    localStorage.clear();
    showToast('सभी डेमो डेटा मूल स्थिति में रीसेट हो गया है', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        language,
        setLanguage,
        onboarding,
        setOnboarding,
        completeOnboarding,
        resetOnboarding,
        lands,
        addLand,
        updateLand,
        deleteLand,
        currentDraftLand,
        saveDraftLand,
        clearDraftLand,
        addLandTask,
        updateLandTask,
        toggleLandTask,
        deleteLandTask,
        addLandExpense,
        updateLandExpense,
        deleteLandExpense,
        nearbyMills,
        toggleMillFavorite,
        farms,
        addFarm,
        updateFarm,
        deleteFarm,
        tasks,
        addTask,
        updateTask,
        toggleTaskStatus,
        deleteTask,
        expenses,
        addExpense,
        updateExpense,
        deleteExpense,
        schemes,
        toggleSchemeBookmark,
        updateSchemeStatus,
        communityPosts,
        addCommunityPost,
        toggleLikePost,
        addCommentToPost,
        toggleSavePost,
        alerts,
        markAlertRead,
        clearAllReadAlerts,
        cropDiagnoses,
        addDiagnosis,
        chatMessages,
        sendUserChatMessage,
        clearChat,
        voiceAssistantOpen,
        voiceAssistantMode,
        openVoiceAssistant,
        closeVoiceAssistant,
        toast,
        showToast,
        hideToast,
        resetAllDemoData,
        apiConnected,
        lastExcelSavedAt,
        downloadExcel: downloadWorkbookFile,

        // Subscription & Payments
        subscription,
        subscriptionLoading,
        refreshSubscription,
        transactions,
        refreshTransactions,
        isPremium,
        isBasic,
        hasActiveSubscription,
        gatewayConfig,
        entitlements
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
