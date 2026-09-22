import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Settings, FileText, Plus, LogOut, Upload, Printer, ChevronRight, 
  Plane, User, Briefcase, Calendar, Clock, MapPin, CheckCircle2, AlertCircle, X, Trash2, Wand2, Loader2, Image as ImageIcon
} from 'lucide-react';

// --- Supabase Initialization ---
const supabaseUrl = 'https://szhltfawxvkouavvxhzb.supabase.co/rest/v1'; 
const supabaseKey = 'sb_publishable_qTryF-iKLsMRJy7-pDdAwg_2TBQnu99'; 
const supabase = createClient(supabaseUrl, supabaseKey);

const DEFAULT_SETTINGS = {
  agencyName: 'VisaEx Travel Agency',
  phone: '+880 1711 399220',
  address: 'Majumdari, Sylhet',
  regNo: '12340052129',
  primaryColor: '#0b1b3d',
  fontFamily: 'Inter, sans-serif',
  agencyLogo: '', 
  bgImageOpacity: 5,
  airlines: [] 
};

const DEFAULT_PASSENGER = { name: '', type: 'Adult', ticketNo: '' };
const DEFAULT_SEGMENT = {
  airline: '',
  airlineLogo: '',
  flightNo: '',
  depCity: '',
  depCode: '',
  depTime: '',
  depDate: '',
  depAirport: '',
  arrCity: '',
  arrCode: '',
  arrTime: '',
  arrDate: '',
  arrAirport: '',
  cabinClass: 'Economy',
  duration: '',
  baggagePersonal: '1 pc, 1 kg',
  baggageCabin: '1 pc, 7 kg',
  baggageChecked: '1 pc, 23 kg'
};

const DEFAULT_TICKET = {
  bookingRef: '',
  eTicketNo: '',
  passengers: [{ ...DEFAULT_PASSENGER }],
  segments: [{ ...DEFAULT_SEGMENT }],
  importantNotes: [
    'Please arrive at the airport at least 3 hours prior to departure.',
    'Passengers must provide valid ID used to purchase their ticket.',
    'Tickets must be used in the sequence set out in the itinerary.'
  ]
};

const Input = ({ label, value, onChange, placeholder, type = "text", required = false }) => (
  <div className="flex flex-col gap-1.5 mb-4">
    {label && <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
    />
  </div>
);

const Button = ({ children, onClick, variant = 'primary', icon: Icon, className = "", type = "button", disabled = false }) => {
  const baseStyle = "inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-sm focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100"
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = "" }) => (
  <div className={`bg-white border border-slate-200 rounded-md shadow-sm ${className}`}>
    {children}
  </div>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentView, setCurrentView] = useState('generator');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) setCurrentView('login');
      else setCurrentView('generator');
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setCurrentView('login');
      else setCurrentView('generator');
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('user_data')
          .select('settings')
          .eq('user_id', user.id)
          .single();

        if (data && data.settings) {
          setSettings({ ...DEFAULT_SETTINGS, ...data.settings });
        }
      } catch (err) {
        console.error("Fetch exception:", err);
      }
    };

    fetchSettings();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4 text-slate-500">
          <div className="w-6 h-6 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">INITIALIZING SYSTEM</p>
        </div>
      </div>
    );
  }

  if (!user || currentView === 'login') {
    return <LoginView />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans text-slate-900 selection:bg-slate-200">
      <style>{`
        :root {
          --agency-primary: ${settings.primaryColor};
          --agency-font: '${settings.fontFamily.split(',')[0].replace(/'/g, '')}', sans-serif;
        }
        @media print {
          body { background-color: white !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          @page { margin: 0; size: A4; }
        }
      `}</style>

      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col no-print">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Plane className="text-slate-400" size={20} />
            TicketSystem
          </h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider">Editorial Edition</p>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={FileText} 
            label="Ticket Generator" 
            active={currentView === 'generator'} 
            onClick={() => setCurrentView('generator')} 
          />
          <NavItem 
            icon={Settings} 
            label="Agency Settings" 
            active={currentView === 'admin'} 
            onClick={() => setCurrentView('admin')} 
          />
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button 
            onClick={handleLogout} 
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <LogOut size={16} />
            Secure Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative no-print">
        {currentView === 'admin' && <AdminView settings={settings} user={user} />}
        {currentView === 'generator' && <GeneratorView settings={settings} />}
      </main>
    </div>
  );
}

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium rounded-sm transition-colors ${
      active 
        ? 'bg-slate-100 text-slate-900' 
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={18} className={active ? "text-slate-900" : "text-slate-400"} />
    {label}
  </button>
);

const LoginView = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setError('');
    
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
    }
    setIsLoggingIn(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Plane className="mx-auto h-12 w-12 text-slate-900 mb-4" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Secure Access</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your credentials to access the ticketing system.</p>
        </div>
        <Card className="p-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 border border-red-100 p-3 rounded-sm">{error}</div>}
            <Input label="Email Address" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@visaex.com" required />
            <Input label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            <Button type="submit" className="w-full mt-4" disabled={isLoggingIn}>
              {isLoggingIn ? 'Authenticating...' : 'Authenticate'}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

const AdminView = ({ settings, user }) => {
  const [formData, setFormData] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [newAirlineName, setNewAirlineName] = useState('');
  const [newAirlineLogo, setNewAirlineLogo] = useState('');

  const handleChange = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleChange('agencyLogo', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAirlineLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewAirlineLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const addAirline = () => {
    if (!newAirlineName.trim()) return;
    setFormData(prev => ({
      ...prev,
      airlines: [...(prev.airlines || []), { name: newAirlineName.trim(), logo: newAirlineLogo }]
    }));
    setNewAirlineName('');
    setNewAirlineLogo('');
  };

  const removeAirline = (index) => {
    setFormData(prev => ({
      ...prev,
      airlines: prev.airlines.filter((_, i) => i !== index)
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_data')
        .upsert({ user_id: user.id, settings: formData });

      if (error) throw error;
      setSaveMessage('Settings securely updated.');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setSaveMessage('Error saving settings. Check RLS policies.');
    }
    setIsSaving(false);
  };

  return (
    <div className="p-8 max-w-3xl mx-auto pb-24">
      <div className="mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Agency Configuration</h2>
        <p className="text-sm text-slate-500 mt-1">Manage your brand identity, contact details, and editorial preferences.</p>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-2">Brand Assets</h3>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold tracking-wide text-slate-600 uppercase mb-2">Agency Logo</label>
              <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center hover:bg-slate-50 transition-colors relative">
                <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                {formData.agencyLogo ? (
                  <img src={formData.agencyLogo} alt="Logo Preview" className="h-20 mx-auto object-contain" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-slate-500">
                    <Upload size={24} />
                    <span className="text-sm font-medium">Click or drag to upload PNG/JPG</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 w-full space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Primary Brand Color</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.primaryColor} 
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="h-10 w-20 p-1 bg-white border border-slate-300 rounded-sm cursor-pointer"
                  />
                  <span className="text-sm font-mono text-slate-500">{formData.primaryColor}</span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Typography Font Family</label>
                <select 
                  value={formData.fontFamily}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none"
                >
                  <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                  <option value="'Playfair Display', serif">Playfair Display (Editorial Serif)</option>
                  <option value="'Space Grotesk', sans-serif">Space Grotesk (Tech Sans)</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-2">Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <Input label="Agency Name" value={formData.agencyName} onChange={e => handleChange('agencyName', e.target.value)} />
            <Input label="Registration Number" value={formData.regNo} onChange={e => handleChange('regNo', e.target.value)} />
            <Input label="Contact Phone" value={formData.phone} onChange={e => handleChange('phone', e.target.value)} />
            <Input label="Physical Address" value={formData.address} onChange={e => handleChange('address', e.target.value)} />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 border-b border-slate-100 pb-2">Airline Database</h3>
          <p className="text-xs text-slate-500 mb-4">Store airline names and logos here to automatically match them in the ticket generator.</p>
          
          <div className="flex flex-col md:flex-row gap-4 items-end mb-6 bg-slate-50 p-4 border border-slate-200 rounded-sm">
            <div className="flex-1 w-full">
              <Input label="Airline Name" placeholder="e.g. Thai Airways" value={newAirlineName} onChange={e => setNewAirlineName(e.target.value)} />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold tracking-wide text-slate-600 uppercase mb-2">Airline Logo</label>
              <div className="flex items-center gap-3">
                <input type="file" accept="image/*" onChange={handleAirlineLogoUpload} className="text-xs w-full text-slate-500 file:mr-4 file:py-2 file:px-3 file:border-0 file:rounded-sm file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer border border-slate-300 rounded-sm bg-white" />
                {newAirlineLogo && <img src={newAirlineLogo} alt="preview" className="h-8 w-8 object-contain bg-white border border-slate-200 p-1 rounded-sm" />}
              </div>
            </div>
            <Button onClick={addAirline} disabled={!newAirlineName} className="mb-4">Add Airline</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(formData.airlines || []).map((airline, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-sm bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  {airline.logo ? (
                    <img src={airline.logo} alt={airline.name} className="h-8 w-12 object-contain mix-blend-multiply" />
                  ) : (
                    <div className="h-8 w-12 bg-slate-100 flex items-center justify-center text-[10px] text-slate-400 rounded-sm">No Logo</div>
                  )}
                  <span className="text-sm font-medium text-slate-800">{airline.name}</span>
                </div>
                <button onClick={() => removeAirline(idx)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-sm transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {(!formData.airlines || formData.airlines.length === 0) && (
              <div className="col-span-full text-center text-sm text-slate-500 py-6 border-2 border-dashed border-slate-200 rounded-sm">No airlines added to database yet.</div>
            )}
          </div>
        </Card>

        <div className="flex items-center justify-between pt-4">
          <span className="text-sm text-emerald-600 font-medium flex items-center gap-2">
            {saveMessage && <><CheckCircle2 size={16} /> {saveMessage}</>}
          </span>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </div>
      </div>
    </div>
  );
};

const GeneratorView = ({ settings }) => {
  const [ticketData, setTicketData] = useState(DEFAULT_TICKET);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const updateField = (field, value) => setTicketData(prev => ({ ...prev, [field]: value }));
  
  const updateArrayItem = (arrayName, index, field, value) => {
    setTicketData(prev => {
      const newArray = [...prev[arrayName]];
      newArray[index] = { ...newArray[index], [field]: value };

      if (arrayName === 'segments' && field === 'airline') {
        const matchedAirline = (settings.airlines || []).find(
          a => a.name.toLowerCase().trim() === value.toLowerCase().trim()
        );
        if (matchedAirline) {
          newArray[index].airlineLogo = matchedAirline.logo;
        }
      }

      return { ...prev, [arrayName]: newArray };
    });
  };

  const addArrayItem = (arrayName, defaultItem) => {
    setTicketData(prev => ({ ...prev, [arrayName]: [...prev[arrayName], { ...defaultItem }] }));
  };

  const removeArrayItem = (arrayName, index) => {
    setTicketData(prev => ({ ...prev, [arrayName]: prev[arrayName].filter((_, i) => i !== index) }));
  };

  const handleAirlineLogoUpload = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateArrayItem('segments', index, 'airlineLogo', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const processAIExtraction = async (fileBase64 = null, mimeType = null) => {
    if (!aiInputText.trim() && !fileBase64) return;
    setIsAiLoading(true);
    setAiError('');
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || ''; 
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;
      
      const payload = {
        contents: [{
          role: "user",
          parts: [
            { text: "Extract flight ticket information from the provided itinerary (text or image) and return a strictly formatted JSON object matching the requested schema. Extrapolate missing baggage info based on standard economy allowances if necessary." }
          ]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              bookingRef: { type: "STRING" },
              eTicketNo: { type: "STRING" },
              passengers: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: { name: { type: "STRING" }, type: { type: "STRING" }, ticketNo: { type: "STRING" } }
                }
              },
              segments: {
                type: "ARRAY",
                items: {
                  type: "OBJECT",
                  properties: {
                    airline: { type: "STRING" }, flightNo: { type: "STRING" }, depCity: { type: "STRING" },
                    depCode: { type: "STRING" }, depTime: { type: "STRING" }, depDate: { type: "STRING" },
                    depAirport: { type: "STRING" }, arrCity: { type: "STRING" }, arrCode: { type: "STRING" },
                    arrTime: { type: "STRING" }, arrDate: { type: "STRING" }, arrAirport: { type: "STRING" },
                    cabinClass: { type: "STRING" }, duration: { type: "STRING" }, baggagePersonal: { type: "STRING" },
                    baggageCabin: { type: "STRING" }, baggageChecked: { type: "STRING" }
                  }
                }
              },
              importantNotes: { type: "ARRAY", items: { type: "STRING" } }
            }
          }
        }
      };

      if (aiInputText.trim()) {
        payload.contents[0].parts.push({ text: `ITINERARY TEXT:\n${aiInputText}` });
      }

      if (fileBase64 && mimeType) {
        payload.contents[0].parts.push({
          inlineData: { mimeType: mimeType, data: fileBase64.split(',')[1] }
        });
      }

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      
      if (result.candidates && result.candidates.length > 0) {
        const jsonText = result.candidates[0].content.parts[0].text;
        const parsedData = JSON.parse(jsonText);
        
        if (parsedData.segments && settings.airlines) {
           parsedData.segments = parsedData.segments.map(seg => {
             const matchedAirline = settings.airlines.find(a => a.name.toLowerCase().trim() === seg.airline?.toLowerCase().trim());
             return { ...seg, airlineLogo: matchedAirline ? matchedAirline.logo : '' };
           });
        }
        
        setTicketData(prev => ({ ...prev, ...parsedData }));
        setIsAIModalOpen(false);
        setAiInputText('');
      } else {
        setAiError("Failed to parse itinerary. The document may not be clear enough.");
      }
    } catch (err) {
      console.error("AI parsing error:", err);
      setAiError("An error occurred during extraction. Please check your Gemini API key.");
    }
    setIsAiLoading(false);
  };

  const handleAIFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      processAIExtraction(reader.result, file.type);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="h-full flex flex-col md:flex-row relative">
      {isAIModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-md shadow-2xl max-w-lg w-full p-6 relative">
            <button onClick={() => {setIsAIModalOpen(false); setAiError('');}} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-full transition-colors"><X size={20}/></button>
            <div className="mb-6 pr-8">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2"><Wand2 size={20} className="text-emerald-600" /> AI Auto-Fill</h2>
              <p className="text-sm text-slate-500 mt-1">Paste ticket text or upload a screenshot (JPG/PNG). The AI will extract the data into your form.</p>
            </div>
            
            {aiError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm font-medium border border-red-100 rounded-sm flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 shrink-0"/> 
                <p>{aiError}</p>
              </div>
            )}

            <div className="space-y-4">
              <textarea 
                value={aiInputText}
                onChange={e => setAiInputText(e.target.value)}
                placeholder="Paste raw itinerary text here..."
                className="w-full h-32 px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors resize-none"
              />
              
              <div className="flex items-center gap-4 my-2">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">OR UPLOAD IMAGE</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <div className="border-2 border-dashed border-slate-300 rounded-md p-6 text-center hover:bg-slate-50 transition-colors relative bg-slate-50/50">
                <input type="file" accept="image/png, image/jpeg, image/webp" onChange={handleAIFileUpload} disabled={isAiLoading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <ImageIcon size={24} className="text-slate-400" />
                  <span className="text-sm font-medium text-slate-700">Click or drag screenshot here</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" onClick={() => {setIsAIModalOpen(false); setAiError('');}}>Cancel</Button>
              <Button onClick={() => processAIExtraction()} disabled={isAiLoading || (!aiInputText.trim())}>
                {isAiLoading ? <><Loader2 size={16} className="animate-spin" /> Extracting...</> : 'Process Text'}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 p-6 md:p-8 overflow-y-auto pb-32 ${isPreviewOpen ? 'hidden md:block md:w-1/2' : 'w-full'}`}>
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Itinerary Builder</h2>
            <p className="text-sm text-slate-500 mt-1">Construct ticket data precisely.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setIsAIModalOpen(true)} icon={Wand2} className="hidden md:inline-flex border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 shadow-sm">
              AI Auto-Fill
            </Button>
            <Button variant="secondary" onClick={() => setIsPreviewOpen(true)} className="md:hidden">
              Preview
            </Button>
          </div>
        </div>

        <Button variant="secondary" onClick={() => setIsAIModalOpen(true)} icon={Wand2} className="w-full mb-6 md:hidden border-emerald-200 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 shadow-sm">
          Auto-Fill with AI
        </Button>

        <div className="space-y-8 max-w-2xl">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <FileText size={18} className="text-slate-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Booking References</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Booking Ref (PNR)" placeholder="e.g. 7K3P5R" value={ticketData.bookingRef} onChange={e => updateField('bookingRef', e.target.value)} />
              <Input label="E-Ticket Number" placeholder="Optional general ticket no." value={ticketData.eTicketNo} onChange={e => updateField('eTicketNo', e.target.value)} />
            </div>
          </Card>

          <Card className="p-6 bg-slate-50 border-slate-200">
            <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <User size={18} className="text-slate-500" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Passengers</h3>
              </div>
              <button onClick={() => addArrayItem('passengers', DEFAULT_PASSENGER)} className="text-xs font-semibold text-[color:var(--agency-primary)] hover:underline">
                + Add Passenger
              </button>
            </div>
            
            <div className="space-y-4">
              {ticketData.passengers.map((pax, idx) => (
                <div key={idx} className="bg-white p-4 border border-slate-200 rounded-sm relative">
                  {ticketData.passengers.length > 1 && (
                    <button onClick={() => removeArrayItem('passengers', idx)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Input label={`Name ${idx + 1}`} placeholder="LAST/FIRST MR" value={pax.name} onChange={e => updateArrayItem('passengers', idx, 'name', e.target.value)} />
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Type</label>
                      <select value={pax.type} onChange={e => updateArrayItem('passengers', idx, 'type', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm">
                        <option>Adult</option><option>Child</option><option>Infant</option>
                      </select>
                    </div>
                    <Input label="Ticket No." placeholder="Specific to pax" value={pax.ticketNo} onChange={e => updateArrayItem('passengers', idx, 'ticketNo', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Plane size={18} className="text-slate-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">Flight Segments</h3>
              </div>
              <button onClick={() => addArrayItem('segments', DEFAULT_SEGMENT)} className="text-xs font-semibold text-[color:var(--agency-primary)] hover:underline">
                + Add Flight Segment
              </button>
            </div>

            <div className="space-y-8">
              {ticketData.segments.map((seg, idx) => (
                <div key={idx} className="p-5 border border-slate-200 rounded-sm relative bg-slate-50/50">
                   {ticketData.segments.length > 1 && (
                    <button onClick={() => removeArrayItem('segments', idx)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500">
                      <X size={16} />
                    </button>
                  )}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-slate-800 text-white text-xs font-bold px-2 py-1 rounded-sm">SEGMENT {idx + 1}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Airline Name</label>
                      <input 
                        type="text" 
                        list={`airline-options-${idx}`}
                        value={seg.airline} 
                        onChange={e => updateArrayItem('segments', idx, 'airline', e.target.value)} 
                        placeholder="e.g. Thai Airways" 
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                      />
                      <datalist id={`airline-options-${idx}`}>
                        {(settings.airlines || []).map((a, i) => <option key={i} value={a.name} />)}
                      </datalist>
                    </div>
                    <Input label="Flight Number" placeholder="e.g. TG575" value={seg.flightNo} onChange={e => updateArrayItem('segments', idx, 'flightNo', e.target.value)} />
                    
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-xs font-semibold tracking-wide text-slate-600 uppercase mb-2">Airline Logo (Optional)</label>
                      <input type="file" accept="image/*" onChange={(e) => handleAirlineLogoUpload(e, idx)} className="text-xs w-full text-slate-500 file:mr-4 file:py-1 file:px-3 file:border-0 file:rounded-sm file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 cursor-pointer" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 mt-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Departure</h4>
                      <Input label="City/Airport Name" placeholder="Vientiane (VTE)" value={seg.depCity} onChange={e => updateArrayItem('segments', idx, 'depCity', e.target.value)} />
                      <Input label="Time (HH:MM)" placeholder="20:30" value={seg.depTime} onChange={e => updateArrayItem('segments', idx, 'depTime', e.target.value)} />
                      <Input label="Date" placeholder="Wed, Sep 23, 2026" value={seg.depDate} onChange={e => updateArrayItem('segments', idx, 'depDate', e.target.value)} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Arrival</h4>
                      <Input label="City/Airport Name" placeholder="Bangkok (BKK)" value={seg.arrCity} onChange={e => updateArrayItem('segments', idx, 'arrCity', e.target.value)} />
                      <Input label="Time (HH:MM)" placeholder="21:55" value={seg.arrTime} onChange={e => updateArrayItem('segments', idx, 'arrTime', e.target.value)} />
                      <Input label="Date" placeholder="Wed, Sep 23, 2026" value={seg.arrDate} onChange={e => updateArrayItem('segments', idx, 'arrDate', e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-4 mt-4">
                    <div className="flex flex-col gap-1.5 mb-4">
                      <label className="text-xs font-semibold tracking-wide text-slate-600 uppercase">Cabin Class</label>
                      <select value={seg.cabinClass} onChange={e => updateArrayItem('segments', idx, 'cabinClass', e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-300 rounded-sm">
                        <option>Economy</option><option>Premium Economy</option><option>Business</option><option>First</option>
                      </select>
                    </div>
                    <Input label="Duration" placeholder="1h 25m" value={seg.duration} onChange={e => updateArrayItem('segments', idx, 'duration', e.target.value)} />
                  </div>

                  <div className="border-t border-slate-200 pt-4 mt-4">
                     <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-1"><Briefcase size={12}/> Baggage Allowance</h4>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input label="Personal" placeholder="1 pc, 1kg" value={seg.baggagePersonal} onChange={e => updateArrayItem('segments', idx, 'baggagePersonal', e.target.value)} />
                        <Input label="Carry-on" placeholder="1 pc, 7kg" value={seg.baggageCabin} onChange={e => updateArrayItem('segments', idx, 'baggageCabin', e.target.value)} />
                        <Input label="Checked" placeholder="1 pc, 23kg" value={seg.baggageChecked} onChange={e => updateArrayItem('segments', idx, 'baggageChecked', e.target.value)} />
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className={`fixed inset-0 z-50 md:relative md:z-auto bg-slate-800 md:bg-slate-200 md:flex-1 h-full md:border-l border-slate-300 flex flex-col transition-transform duration-300 ${isPreviewOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="bg-slate-900 text-white p-4 flex justify-between items-center md:hidden">
          <span className="font-bold">Document Preview</span>
          <button onClick={() => setIsPreviewOpen(false)} className="p-2"><X size={20} /></button>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 border-b border-slate-300 flex justify-end gap-4 shrink-0 shadow-sm z-10 relative no-print">
          <Button onClick={() => window.print()} icon={Printer} className="shadow-sm">
            Print / Export PDF
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center pb-24">
           <TicketDocument settings={settings} data={ticketData} />
        </div>
      </div>
    </div>
  );
};

const TicketDocument = ({ settings, data }) => {
  return (
    <div 
      className="bg-white shadow-2xl print:shadow-none w-full max-w-[210mm] min-h-[297mm] text-slate-800 overflow-hidden relative"
      style={{ fontFamily: "var(--agency-font)", printColorAdjust: 'exact', WebkitPrintColorAdjust: 'exact' }}
    >
      <div className="p-10 md:p-12">
        <div className="flex flex-row justify-between items-start border-b-[3px] pb-6 mb-8" style={{ borderColor: 'var(--agency-primary)' }}>
          <div className="w-1/2">
            {settings.agencyLogo ? (
               <img src={settings.agencyLogo} alt="Agency Logo" className="max-h-36 object-contain mix-blend-multiply" />
            ) : (
               <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: 'var(--agency-primary)' }}>
                 {settings.agencyName}
               </h1>
            )}
          </div>
          <div className="w-1/2 text-right">
            <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--agency-primary)' }}>E-Ticket Itinerary</h2>
            <div className="text-xs leading-relaxed text-slate-600">
              <p className="font-bold text-slate-900">{settings.agencyName}</p>
              <p>{settings.address}</p>
              <p>Phone: {settings.phone}</p>
              {settings.regNo && <p>Reg No: {settings.regNo}</p>}
            </div>
          </div>
        </div>

        <div className="mb-8 border border-slate-200 rounded-sm overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-slate-50">
             <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Booking Ref (PNR)</p>
                <p className="font-bold text-lg text-slate-900">{data.bookingRef || '---'}</p>
             </div>
             <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">E-Ticket Number</p>
                <p className="font-bold text-lg text-slate-900">{data.eTicketNo || 'Multiple'}</p>
             </div>
             <div className="p-4 col-span-2">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">Date of Issue</p>
                <p className="font-semibold text-slate-900">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
          </div>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-slate-200 pb-2" style={{ color: 'var(--agency-primary)' }}>
            <User size={16} /> Passenger Information
          </h3>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-xs uppercase tracking-wider">
                <th className="px-4 py-2 font-semibold">Passenger Name</th>
                <th className="px-4 py-2 font-semibold">Type</th>
                <th className="px-4 py-2 font-semibold">Ticket Number</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.passengers.map((pax, idx) => (
                <tr key={idx} className="bg-white">
                  <td className="px-4 py-3 font-bold text-slate-900">{pax.name || '---'}</td>
                  <td className="px-4 py-3 text-slate-600">{pax.type}</td>
                  <td className="px-4 py-3 font-mono text-slate-800">{pax.ticketNo || data.eTicketNo || '---'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mb-10">
          <h3 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-slate-200 pb-2" style={{ color: 'var(--agency-primary)' }}>
            <Plane size={16} /> Flight Itinerary
          </h3>
          
          <div className="space-y-6">
            {data.segments.map((seg, idx) => (
              <div key={idx} className="relative">
                {idx > 0 && (
                  <div className="absolute -top-6 left-8 h-6 border-l-2 border-dashed border-slate-300"></div>
                )}
                
                <div className="border border-slate-200 rounded-sm overflow-hidden">
                  <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {seg.airlineLogo ? (
                        <img src={seg.airlineLogo} alt="Airline" className="h-6 w-auto object-contain mix-blend-multiply" />
                      ) : (
                        <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">Air</div>
                      )}
                      <div>
                        <span className="font-bold text-slate-900 leading-none">{seg.airline || 'Airline Name'}</span>
                        <span className="text-xs text-slate-500 ml-2">Flight {seg.flightNo || '---'}</span>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-1 bg-white border border-slate-200 rounded-sm">
                      {seg.cabinClass}
                    </span>
                  </div>

                  <div className="p-4 md:p-6 flex flex-row items-center justify-between">
                    <div className="w-1/3 text-left">
                      <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{seg.depTime || '--:--'}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: 'var(--agency-primary)' }}>{seg.depDate || 'Date'}</p>
                      <p className="text-sm font-bold text-slate-800 mt-2">{seg.depCity || 'Departure City'}</p>
                    </div>
                    
                    <div className="w-1/3 px-4 flex flex-col items-center justify-center text-slate-400">
                      <p className="text-[10px] uppercase tracking-widest font-bold mb-1">{seg.duration || 'Duration'}</p>
                      <div className="w-full flex items-center">
                        <div className="h-[2px] bg-slate-200 flex-1"></div>
                        <Plane size={16} className="mx-2 rotate-45 transform" style={{ color: 'var(--agency-primary)' }} />
                        <div className="h-[2px] bg-slate-200 flex-1"></div>
                      </div>
                    </div>
                    
                    <div className="w-1/3 text-right">
                      <p className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{seg.arrTime || '--:--'}</p>
                      <p className="text-xs font-bold mt-1" style={{ color: 'var(--agency-primary)' }}>{seg.arrDate || 'Date'}</p>
                      <p className="text-sm font-bold text-slate-800 mt-2">{seg.arrCity || 'Arrival City'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 border-t border-slate-200 px-4 py-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="flex gap-2 items-start">
                      <span className="font-bold text-slate-500 uppercase">Personal:</span>
                      <span className="text-slate-800 font-medium">{seg.baggagePersonal || '-'}</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="font-bold text-slate-500 uppercase">Cabin:</span>
                      <span className="text-slate-800 font-medium">{seg.baggageCabin || '-'}</span>
                    </div>
                    <div className="flex gap-2 items-start">
                      <span className="font-bold text-slate-500 uppercase">Checked:</span>
                      <span className="text-slate-800 font-medium">{seg.baggageChecked || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
           <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-slate-500 flex items-center gap-2">
            <AlertCircle size={14} /> Important Information
          </h3>
          <ul className="text-xs text-slate-600 space-y-2 pl-1">
            {data.importantNotes.map((note, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="font-bold" style={{ color: 'var(--agency-primary)' }}>•</span>
                {note}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-16 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
          <p>Thank you for booking with {settings.agencyName}. Have a safe journey.</p>
        </div>
      </div>
    </div>
  );
};
