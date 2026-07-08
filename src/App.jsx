import React, { useState, useEffect } from 'react';
import { ShoppingBag, Box, Calendar, User, Shield, Search, LogOut, RefreshCw, Send, DollarSign, Layers } from 'lucide-react';

// The Comprehensive 100 Staff Codes Database Dictionary Mapping
const STAFF_CODES_DATABASE = {
  "Managers": ["MGR-X9L2", "MGR-P4T7", "MGR-K1W8", "MGR-V6M3", "MGR-B2R9", "MGR-N8J4", "MGR-C5Q1", "MGR-H7F6", "MGR-Z3D5", "MGR-Y9X2", "MGR-L4P8", "MGR-T1K7", "MGR-W6V3", "MGR-M2B9", "MGR-R8N4", "MGR-J5C1", "MGR-Q7H6", "MGR-F3Z5", "MGR-D9Y2", "MGR-X4L8", "MGR-P1T7", "MGR-K6W3", "MGR-V2M9", "MGR-B8R4", "MGR-N5J1"],
  "Fishermen": ["FSH-C7Q6", "FSH-H3F5", "FSH-Z9D2", "FSH-Y4X8", "FSH-L1P7", "FSH-T6K3", "FSH-W2V9", "FSH-M8B4", "FSH-R5N1", "FSH-J7C6", "FSH-Q3H5", "FSH-F9Z2", "FSH-D4Y8", "FSH-X1L7", "FSH-P6T3"],
  "Gatherers": ["GTH-K2W9", "GTH-V8M4", "GTH-B5R1", "GTH-N7J6", "GTH-C3Q5", "GTH-H9F2", "GTH-Z4D8", "GTH-Y1X7", "GTH-L6P3", "GTH-T2K9", "GTH-W8V4", "GTH-M5B1", "GTH-R7N6", "GTH-J3C5", "GTH-Q9H2", "GTH-F4Z8", "GTH-D1Y7", "GTH-X6L3", "GTH-P2T9", "GTH-K8W4", "GTH-V5M1", "GTH-B7R6", "GTH-N3J5", "GTH-C9Q2", "GTH-H4F8"],
  "Farmers": ["FRM-Z1D7", "FRM-Y6X3", "FRM-L2P9", "FRM-T8K4", "FRM-W5V1", "FRM-M7B6", "FRM-R3N5", "FRM-J9C2", "FRM-Q4H8", "FRM-F1Z7", "FRM-D6Y3", "FRM-X2L9", "FRM-P8T4", "FRM-K5W1", "FRM-V7M6", "FRM-B3R5", "FRM-N9J2", "FRM-C4Q8", "FRM-H1F7", "FRM-Z6D3", "FRM-Y2X9", "FRM-L8P4", "FRM-T5K1", "FRM-W7V6", "FRM-M3B5"],
  "Sellers": ["SLR-R9N2", "SLR-J4C8", "SLR-Q1H7", "SLR-F6Z3", "SLR-D2Y9", "SLR-X8L4", "SLR-P5T1", "SLR-K7W6", "SLR-V3M5", "SLR-B9R2"]
};

// Simulated Catalog Items mirroring inventory states of image_103661.jpg
const INITIAL_PRODUCTS = [
  { id: 1, title: "Karambit Elite", stats: "Damage: 85 | Speed: 95", inStock: true },
  { id: 2, title: "Yun Tou Dau Broadsword", stats: "Damage: 120 | Speed: 40", inStock: true },
  { id: 3, title: "Bonny Flintlock Pistol", stats: "Damage: 150 | Range: 60", inStock: true },
  { id: 4, title: "Espingole Musketoon", stats: "Damage: 210 | AOE Blast", inStock: false },
  { id: 5, title: "Heavy Strikers", stats: "Damage: 90 | Weight: High", inStock: true },
  { id: 6, title: "Hunter's Dispatcher", stats: "Damage: 75 | Bleed Effect", inStock: true },
  { id: 7, title: "Great Piercing Rapier", stats: "Damage: 110 | Pierce Tier 3", inStock: false },
  { id: 8, title: "Valyrian Steel Dagger", stats: "Damage: 130 | Concealed", inStock: false }
];

export default function App() {
  // State Initialization
  const [currentView, setCurrentView] = useState('storefront');
  const [searchQuery, setSearchQuery] = useState('');
  const [userSession, setUserSession] = useState(null);
  const [staffSession, setStaffSession] = useState(null);
  const [staffCodeInput, setStaffCodeInput] = useState('');
  const [staffLoginError, setStaffLoginError] = useState('');

  // Platform Business Databases (Hydrated from LocalStorage to mimic Serverless state persistence)
  const [userProfile, setUserProfile] = useState(() => {
    const saved = localStorage.getItem('bhq_user_profile');
    return saved ? JSON.parse(saved) : { username: 'nobodyknows34', pounds_balance: 750.00, benjis_ordered: 14 };
  });

  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('bhq_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [resourceTickets, setResourceTickets] = useState(() => {
    const saved = localStorage.getItem('bhq_resource_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [transferTickets, setTransferTickets] = useState(() => {
    const saved = localStorage.getItem('bhq_transfer_tickets');
    return saved ? JSON.parse(saved) : [];
  });

  const [generatedTicket, setGeneratedTicket] = useState(null);

  // Worker Form inputs
  const [workerAmount, setWorkerAmount] = useState('');
  const [workerResourceType, setWorkerResourceType] = useState('Fish');

  // Manager inputs
  const [payrollCode, setPayrollCode] = useState('');
  const [payrollAmount, setPayrollAmount] = useState('');

  // Sync state tracking variables with local memory
  useEffect(() => {
    localStorage.setItem('bhq_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('bhq_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bhq_resource_tickets', JSON.stringify(resourceTickets));
  }, [resourceTickets]);

  useEffect(() => {
    localStorage.setItem('bhq_transfer_tickets', JSON.stringify(transferTickets));
  }, [transferTickets]);

  // OAuth Simulation handlers
  const handleDiscordLoginSimulation = () => {
    setUserSession({
      id: "1512209739629461554",
      username: userProfile.username,
      avatar: "🐺",
      role: "Customer"
    });
    setCurrentView('storefront');
  };

  const handleStaffLogin = (e) => {
    e.preventDefault();
    const uppercaseCode = staffCodeInput.trim().toUpperCase();
    let foundRole = null;

    for (const [role, codes] of Object.entries(STAFF_CODES_DATABASE)) {
      if (codes.includes(uppercaseCode)) {
        foundRole = role.slice(0, -1); // Manager, Fisherman, etc.
        break;
      }
    }

    if (foundRole) {
      setStaffSession({ code: uppercaseCode, role: foundRole });
      setStaffLoginError('');
      if (foundRole === 'Manager') setCurrentView('mgr_dashboard');
      else if (foundRole === 'Seller') setCurrentView('slr_dashboard');
      else setCurrentView('worker_dashboard');
    } else {
      setStaffLoginError('Invalid Authorization Token Sequence.');
    }
  };

  const handleLogout = () => {
    setUserSession(null);
    setStaffSession(null);
    setCurrentView('storefront');
  };

  // Checkout Operations handling local state database persistence & offline tracking queues
  const processCheckout = async (product) => {
    const newOrder = {
      order_id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
      username: userProfile.username,
      product: product.title,
      timestamp: new Date().toLocaleTimeString(),
      status: 'pending'
    };

    let updatedOrders = [...orders, newOrder];

    try {
      const res = await fetch('http://localhost:3000/api/notify-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: 1 })
      });
      const data = await res.json();
      if (data.status === 'sent') {
        newOrder.status = 'sent';
      }
    } catch (err) {
      console.warn("BotGhost hook offline. Order securely safely cached inside pending validation queue.");
    }

    setOrders(updatedOrders);
    setUserProfile(prev => ({ ...prev, benjis_ordered: prev.benjis_ordered + 1 }));
    alert(`Order submitted successfully! Reference: ${newOrder.order_id}`);
  };

  // Sync Offline Queue Hook Engine
  const syncPendingQueue = async () => {
    let statusChanged = false;
    const workingQueue = orders.map(async (order) => {
      if (order.status === 'pending') {
        try {
          const res = await fetch('http://localhost:3000/api/notify-discord', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity: 1 })
          });
          const data = await res.json();
          if (data.status === 'sent') {
            statusChanged = true;
            return { ...order, status: 'sent' };
          }
        } catch (e) {
          return order;
        }
      }
      return order;
    });

    const resolvedQueue = await Promise.all(workingQueue);
    if (statusChanged) {
      setOrders(resolvedQueue);
      alert("Offline buffer queue parsed successfully. Discord feeds synchronized.");
    } else {
      alert("Sync completed. No connectivity changes detected from remote server.");
    }
  };

  // Load Pounds Processing Engine
  const triggerLoadPoundsTicket = async () => {
    const tkn = 'TCK-' + Math.floor(100000 + Math.random() * 900000);
    setGeneratedTicket(tkn);

    try {
      await fetch('http://localhost:3000/api/notify-discord', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: tkn })
      });
    } catch (e) {
      console.error("Failed to announce balance generation to server hooks.");
    }
  };

  // Worker Form Actions
  const handleWorkerSubmit = (e) => {
    e.preventDefault();
    if (!workerAmount || isNaN(workerAmount)) return;

    const newTicket = {
      id: 'RES-' + Math.floor(100000 + Math.random() * 900000),
      worker: staffSession.code,
      role: staffSession.role,
      type: workerResourceType,
      amount: parseInt(workerAmount),
      status: 'pending'
    };

    setResourceTickets(prev => [...prev, newTicket]);
    setWorkerAmount('');
    alert(`Supply chain inventory ticket created: ${newTicket.id}. Announced to Manager channels.`);
  };

  // Calculations for Financial Split Panels
  const calculatedTotalPoundsGained = orders.length * 150;
  const shareSplits = calculatedTotalPoundsGained / 2;

  return (
    <div className="flex h-screen bg-[#0a0a0a] text-gray-300 font-sans overflow-hidden">

      {/* 1. VISUAL DESIGN & SIDEBAR VIEWPORT CONTROLLER */}
      <aside className="w-64 bg-[#111111] border-r border-gray-800 flex flex-col justify-between z-30">
        <div>
          <div className="flex items-center gap-3 p-6 text-white text-xl font-black tracking-widest uppercase border-b border-gray-900">
            <span className="text-[#ff6b00] text-2xl">⚡</span> BENJI HQ
          </div>
          <nav className="mt-6 flex flex-col gap-1 px-4">
            <button
              onClick={() => setCurrentView('storefront')}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 ${currentView === 'storefront' ? 'bg-[#1a1a1a] text-[#ff6b00] border-l-4 border-[#ff6b00]' : 'hover:bg-gray-900 hover:text-white'}`}
            >
              <ShoppingBag size={18} /> Storefront
            </button>
            <button
              onClick={() => setCurrentView('my_stuff')}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 ${currentView === 'my_stuff' ? 'bg-[#1a1a1a] text-[#ff6b00] border-l-4 border-[#ff6b00]' : 'hover:bg-gray-900 hover:text-white'}`}
            >
              <Box size={18} /> My Stuff
            </button>
            <button
              onClick={() => setCurrentView('live_events')}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 ${currentView === 'live_events' ? 'bg-[#1a1a1a] text-[#ff6b00] border-l-4 border-[#ff6b00]' : 'hover:bg-gray-900 hover:text-white'}`}
            >
              <Calendar size={18} /> Live Events
            </button>
            <button
              onClick={() => setCurrentView(userSession ? 'my_account' : 'auth_wall')}
              className={`flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 ${['my_account', 'auth_wall'].includes(currentView) ? 'bg-[#1a1a1a] text-[#ff6b00] border-l-4 border-[#ff6b00]' : 'hover:bg-gray-900 hover:text-white'}`}
            >
              <User size={18} /> My Account
            </button>
            <div className="pt-4 mt-4 border-t border-gray-900">
              <button
                onClick={() => {
                  if(staffSession) {
                    if(staffSession.role === 'Manager') setCurrentView('mgr_dashboard');
                    else if(staffSession.role === 'Seller') setCurrentView('slr_dashboard');
                    else setCurrentView('worker_dashboard');
                  } else {
                    setCurrentView('staff_login');
                  }
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 ${['staff_login', 'mgr_dashboard', 'slr_dashboard', 'worker_dashboard'].includes(currentView) ? 'bg-[#1a1a1a] text-orange-400 border-l-4 border-orange-500' : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300'}`}
              >
                <Shield size={18} /> Staff Portal
              </button>
            </div>
          </nav>
        </div>
        <div className="p-6 text-xs text-gray-600 border-t border-gray-900 tracking-wider">
          Benji HQ Ltd © 2026
        </div>
      </aside>

      {/* CORE FRAMEWORK WORKSPACE WINDOW LAYOUT */}
      <main className="flex-1 flex flex-col overflow-hidden">

        {/* TOP BAR CONFIGURATION SECTION */}
        <header className="h-20 border-b border-gray-900 flex items-center justify-between px-8 bg-[#0a0a0a] shrink-0 z-20">
          <h1 className="text-sm font-bold text-gray-400 tracking-[0.3em] uppercase">ACCOUNTS & VAULT</h1>
          <div className="flex items-center gap-4">
            {userSession || staffSession ? (
              <div className="flex items-center gap-3 bg-[#111] border border-gray-800 px-4 py-2 rounded-lg">
                <div className="w-7 h-7 rounded-full bg-[#ff6b00] text-black font-black flex items-center justify-center text-xs">
                  {staffSession ? "👑" : userSession.avatar}
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-xs font-bold leading-none">{staffSession ? staffSession.code : userSession.username}</span>
                  <span className="text-[10px] text-gray-500 font-mono mt-0.5 block">{staffSession ? `${staffSession.role} Active` : "Customer Tier"}</span>
                </div>
                <span className={`ml-2 px-2.5 py-0.5 text-[10px] uppercase font-black rounded-sm ${staffSession ? 'bg-orange-950 text-orange-400 border border-orange-800' : 'bg-zinc-800 text-zinc-400'}`}>
                  {staffSession ? staffSession.role : "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="ml-4 flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800 text-red-400 hover:bg-red-900/40 text-xs font-bold rounded tracking-wide transition uppercase"
                >
                  <LogOut size={12} /> LOGOUT
                </button>
              </div>
            ) : (
              <button
                onClick={handleDiscordLoginSimulation}
                className="flex items-center gap-2 px-4 py-2 bg-[#ff6b00] text-black font-black text-xs uppercase tracking-wider rounded shadow-lg shadow-orange-600/10 hover:bg-orange-500 transition-all"
              >
                Connect Profile
              </button>
            )}
          </div>
        </header>

        {/* COMPONENT VIEW SWITCHER ROUTER SYSTEM */}
        <div className="flex-1 overflow-y-auto p-8 bg-[#0a0a0a]">

          {/* VIEW: STOREFRONT */}
          {currentView === 'storefront' && (
            <div className="max-w-6xl mx-auto bg-[#111111] border border-gray-900 rounded-xl p-8 shadow-2xl relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff6b00] to-transparent"></div>
              <h2 className="text-center text-white text-lg font-black tracking-[0.4em] uppercase mb-6">
                BENJI SHOP
              </h2>

              {/* SEARCH FILTERS CONTROLS AREA */}
              <div className="flex justify-center items-center gap-3 mb-10 max-w-2xl mx-auto">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search weapon components & vaults..."
                    className="w-full bg-[#161616] border border-gray-800 text-white placeholder-gray-600 text-sm rounded-md py-2.5 pl-10 pr-4 focus:outline-none focus:border-[#ff6b00] focus:ring-1 focus:ring-[#ff6b00] transition"
                  />
                </div>
                <button className="px-5 py-2.5 bg-[#1a1a1a] border border-gray-800 text-gray-400 text-xs uppercase font-bold rounded-md hover:text-white hover:border-gray-700 transition">
                  Pawn Item
                </button>
                <button className="px-5 py-2.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs uppercase font-bold rounded-md hover:bg-emerald-900/60 transition">
                  Apply for Loan
                </button>
              </div>

              {/* RESPONSIBLE CSS PRODUCT CARDS GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {INITIAL_PRODUCTS.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => (
                  <div key={product.id} className="bg-[#161616] border border-gray-800/80 rounded-lg overflow-hidden flex flex-col justify-between relative group hover:border-gray-700 transition duration-150">

                    {/* If product has no stock, overlay stamped sold graphic matching visual design requirements */}
                    {!product.inStock && <div className="sold-stamp">SOLD</div>}

                    <div className="p-4">
                      {/* Image Frame Frame Container Placeholder */}
                      <div className="h-40 bg-[#0d0d0d] rounded border border-gray-900 flex items-center justify-center p-4 mb-4 relative overflow-hidden">
                        <span className="text-3xl opacity-30 select-none group-hover:scale-110 transition duration-300">⚔️</span>
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/80 rounded text-[10px] font-mono text-[#ff6b00]">
                          Asset Model Secure
                        </div>
                      </div>
                      <h3 className="text-white font-bold text-sm tracking-wide mb-1">{product.title}</h3>
                      <p className="text-xs text-gray-500 font-mono leading-relaxed">{product.stats}</p>
                    </div>

                    <div className="p-4 pt-0">
                      <button
                        disabled={!product.inStock}
                        onClick={() => processCheckout(product)}
                        className={`w-full py-2 text-xs font-black uppercase tracking-wider rounded transition flex items-center justify-center gap-2 ${product.inStock ? 'bg-sky-950 text-sky-400 border border-sky-800 hover:bg-sky-900' : 'bg-zinc-900 text-zinc-600 border border-zinc-950 cursor-not-allowed'}`}
                      >
                        {product.inStock ? "Copy Buy Request" : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW: DISCORD SIMULATED OAUTH AUTHENTICATION WALL */}
          {currentView === 'auth_wall' && (
            <div className="max-w-md mx-auto bg-[#111] border border-gray-900 rounded-xl p-8 text-center mt-12 shadow-2xl relative">
              <div className="w-12 h-12 bg-orange-950 text-[#ff6b00] rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 border border-orange-800">🔒</div>
              <h2 className="text-white font-black text-lg uppercase tracking-widest mb-2">Vault Entry Restricted</h2>
              <p className="text-xs text-gray-500 mb-6 leading-relaxed">To view your balances, request ledger entries, or load virtual in-game currency profiles, authenticate using the application gateway.</p>
              <div className="bg-black/40 border border-gray-900 rounded p-3 mb-6 text-[11px] font-mono text-left text-gray-400">
                <span className="text-orange-500 font-bold block mb-1">OAuth Client ID Detected:</span>
                1512209739629461554
              </div>
              <button
                onClick={handleDiscordLoginSimulation}
                className="w-full py-3 bg-[#ff6b00] text-black font-black uppercase text-xs tracking-widest rounded hover:bg-orange-500 transition shadow-lg shadow-orange-600/5"
              >
                Log In with Discord OAuth2
              </button>
            </div>
          )}

          {/* VIEW: MY ACCOUNT SECTION */}
          {currentView === 'my_account' && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-4">Account Metadata Profile</h3>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-[#1a1a1a] border border-gray-800 rounded-lg flex items-center justify-center text-2xl text-orange-500 font-bold">🐺</div>
                      <div>
                        <div className="text-white font-black text-lg">{userProfile.username}</div>
                        <div className="text-xs text-gray-500 font-mono">ID: 1512209739629461554</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-900/60 flex justify-between text-xs font-mono">
                    <span className="text-gray-500">Total Benjis Handled:</span>
                    <span className="text-white font-bold">{userProfile.benjis_ordered} units</span>
                  </div>
                </div>

                <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 rounded-full blur-2xl pointer-events-none"></div>
                  <div>
                    <h3 className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-2">Vault Currency Balance</h3>
                    <div className="text-3xl font-black text-[#ff6b00] font-mono tracking-tight mt-1">
                      {userProfile.pounds_balance.toFixed(2)} <span className="text-xs uppercase font-bold text-gray-400">pounds</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-2 leading-relaxed">This ledger tracks in-game currency balances strictly managed inside the secure profile platform.</p>
                  </div>
                  <div className="mt-6 flex gap-2">
                    <button
                      onClick={triggerLoadPoundsTicket}
                      className="flex-1 py-2.5 bg-orange-950 text-orange-400 border border-orange-800 hover:bg-orange-900 text-xs font-black uppercase tracking-wider rounded transition"
                    >
                      Load Pounds
                    </button>
                  </div>
                </div>
              </div>

              {generatedTicket && (
                <div className="bg-orange-950/20 border border-orange-900/60 p-4 rounded-xl text-center flex flex-col items-center animate-fadeIn">
                  <span className="text-[10px] text-orange-400 uppercase font-black tracking-widest mb-1">Unique Ticket Reference Dispatched</span>
                  <div className="text-xl font-mono font-black text-white bg-black/60 px-4 py-2 rounded border border-orange-900/40 my-1">{generatedTicket}</div>
                  <p className="text-[11px] text-gray-400 max-w-md mt-1">Ticket routed to the live Staff Discord Monitoring Channel. Fulfilling staff will apply adjustments directly into your secure index file.</p>
                </div>
              )}

              <div className="bg-[#111] border border-gray-900 rounded-xl p-6">
                <h3 className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4">Historical Transaction Orders Log</h3>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-600 font-mono">No active historical checkout events discovered.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-gray-900 text-gray-500">
                          <th className="pb-3">Reference Block</th>
                          <th className="pb-3">Item Descriptor</th>
                          <th className="pb-3">Timestamp</th>
                          <th className="pb-3 text-right">Webhook Relay Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900/40">
                        {orders.map((order, i) => (
                          <tr key={i} className="hover:bg-black/20">
                            <td className="py-3 font-bold text-white">{order.order_id}</td>
                            <td className="py-3 text-gray-300">{order.product}</td>
                            <td className="py-3 text-gray-500">{order.timestamp}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${order.status === 'sent' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900 animate-pulse'}`}>
                                {order.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW: STAFF GATEWAY LOGIN WALL */}
          {currentView === 'staff_login' && (
            <div className="max-w-md mx-auto bg-[#111] border border-gray-900 rounded-xl p-8 mt-12 shadow-2xl">
              <div className="text-center mb-6">
                <span className="text-xs text-orange-500 font-black tracking-widest uppercase">Secured Node Clearance</span>
                <h2 className="text-white font-black text-xl uppercase tracking-widest mt-1">Staff Authentication</h2>
              </div>
              <form onSubmit={handleStaffLogin} className="flex flex-col gap-4">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 block mb-2 tracking-wide">Enter Authorized Deployment Key Token</label>
                  <input
                    type="text"
                    value={staffCodeInput}
                    onChange={(e) => setStaffCodeInput(e.target.value)}
                    placeholder="e.g., MGR-X9L2, FSH-C7Q6, SLR-R9N2"
                    className="w-full bg-[#161616] border border-gray-800 text-white font-mono text-sm rounded-md p-3 focus:outline-none focus:border-orange-500 transition"
                  />
                </div>
                {staffLoginError && (
                  <div className="text-xs text-red-400 bg-red-950/40 border border-red-900 p-2.5 rounded font-mono text-center">
                    {staffLoginError}
                  </div>
                )}
                <button type="submit" className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded border border-zinc-700 transition">
                  Request Portal Link Allocation
                </button>
              </form>
            </div>
          )}

          {/* PORTAL VIEW: WORKER INTERFACES (FISHERMEN, GATHERERS, FARMERS) */}
          {currentView === 'worker_dashboard' && staffSession && (
            <div className="max-w-xl mx-auto bg-[#111] border border-gray-900 p-8 rounded-xl shadow-2xl">
              <div className="flex justify-between items-center border-b border-gray-900 pb-4 mb-6">
                <div>
                  <span className="text-xs text-orange-500 font-black tracking-widest uppercase">Supply Chain Operations</span>
                  <h2 className="text-white font-black text-lg uppercase tracking-wider">{staffSession.role} Data Entry Node</h2>
                </div>
                <span className="px-3 py-1 font-mono text-xs bg-zinc-900 border border-gray-800 text-white rounded">{staffSession.code}</span>
              </div>

              <form onSubmit={handleWorkerSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 block mb-2 tracking-wide">Select Gathered Structural Commodity Resource</label>
                  <select
                    value={workerResourceType}
                    onChange={(e) => setWorkerResourceType(e.target.value)}
                    className="w-full bg-[#161616] border border-gray-800 text-white text-sm rounded-md p-3 focus:outline-none focus:border-orange-500"
                  >
                    {staffSession.role === 'Fisherman' && <option value="Fish">Raw Saltwater Catch (Fish)</option>}
                    {staffSession.role === 'Gatherer' && <option value="Salt">Refined Mineral Salts (Salt)</option>}
                    {staffSession.role === 'Farmer' && <option value="Crops">Arable Crop Yields (Crops)</option>}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] uppercase font-bold text-gray-500 block mb-2 tracking-wide">Resource Batch Volume (Quantity Amount)</label>
                  <input
                    type="number"
                    value={workerAmount}
                    onChange={(e) => setWorkerAmount(e.target.value)}
                    placeholder="Enter whole integer quantities..."
                    className="w-full bg-[#161616] border border-gray-800 text-white font-mono text-sm rounded-md p-3 focus:outline-none focus:border-orange-500"
                  />
                </div>

                <button type="submit" className="w-full py-3 bg-[#ff6b00] text-black font-black text-xs uppercase tracking-widest rounded hover:bg-orange-500 transition flex items-center justify-center gap-2">
                  <Send size={14} /> Dispatch Supply Chain Webhook Ticket
                </button>
              </form>
            </div>
          )}

          {/* PORTAL VIEW: SELLER SYSTEM INTERFACE */}
          {currentView === 'slr_dashboard' && staffSession && (
            <div className="max-w-4xl mx-auto flex flex-col gap-6">
              <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex justify-between items-center">
                <div>
                  <span className="text-xs text-orange-500 font-black tracking-widest uppercase">Frontline Client Point-of-Sale</span>
                  <h2 className="text-white font-black text-lg uppercase tracking-wide">Seller Delivery Interface</h2>
                </div>
                <span className="px-3 py-1 font-mono text-xs bg-zinc-900 border border-gray-800 text-white rounded">{staffSession.code}</span>
              </div>

              <div className="bg-[#111] border border-gray-900 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xs text-gray-400 font-black uppercase tracking-widest">Active Client Order Real-time Queue</h3>
                  <button
                    onClick={syncPendingQueue}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 text-xs font-bold rounded font-mono transition"
                  >
                    <RefreshCw size={12} /> Sync Pending Orders Queue
                  </button>
                </div>
                {orders.length === 0 ? (
                  <div className="text-center py-8 text-xs text-gray-600 font-mono">No active consumer profiles processing checkout fields currently.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-gray-900 text-gray-500">
                          <th className="pb-3">Client Target</th>
                          <th className="pb-3">Reference ID</th>
                          <th className="pb-3">Product Description</th>
                          <th className="pb-3">State</th>
                          <th className="pb-3 text-right">System Action Execution</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900/40">
                        {orders.map((order, idx) => (
                          <tr key={idx} className="hover:bg-black/20">
                            <td className="py-3 text-white font-bold">{order.username}</td>
                            <td className="py-3 text-gray-400">{order.order_id}</td>
                            <td className="py-3 text-gray-400">{order.product}</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${order.status === 'sent' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900 animate-pulse'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              <button
                                onClick={() => {
                                  setUserProfile(prev => ({ ...prev, pounds_balance: prev.pounds_balance + 150.00 }));
                                  setOrders(prev => prev.filter(o => o.order_id !== order.order_id));
                                  alert(`Delivered! Loaded 150.00 pounds into profile index for user: ${order.username}`);
                                }}
                                className="px-3 py-1 bg-sky-950 border border-sky-800 text-sky-400 hover:bg-sky-900 rounded font-sans font-bold text-[11px]"
                              >
                                Fulfill & Credit Pounds
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PORTAL VIEW: ADVANCED MANAGER SYSTEM DASHBOARD */}
          {currentView === 'mgr_dashboard' && staffSession && (
            <div className="max-w-5xl mx-auto flex flex-col gap-6">

              {/* TOP HEADER SUMMARY BAR */}
              <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <span className="text-xs text-orange-500 font-black tracking-widest uppercase">Administrative Headquarters Control Node</span>
                  <h2 className="text-white font-black text-xl uppercase tracking-wide mt-0.5">Management Deployment Console</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 font-mono text-xs bg-zinc-900 border border-gray-800 text-white rounded">{staffSession.code}</span>
                  <button
                    onClick={syncPendingQueue}
                    className="flex items-center gap-1 bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700 text-xs font-bold px-3 py-1 rounded transition"
                  >
                    <RefreshCw size={12} /> Sync Engine
                  </button>
                </div>
              </div>

              {/* PROFIT SPLIT & REVENUE ACCOUNTABILITY LEDGERS */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#111] border border-gray-900 p-5 rounded-xl">
                  <span className="text-[10px] text-gray-500 uppercase font-black tracking-wider block mb-1">Gross Pool Valuation</span>
                  <div className="text-2xl font-black text-white font-mono">{calculatedTotalPoundsGained.toFixed(2)} <span className="text-xs text-gray-500">pounds</span></div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Calculated recursively across gross execution parameters.</p>
                </div>
                <div className="bg-[#111] border border-gray-900 p-5 rounded-xl border-l-4 border-l-[#ff6b00]">
                  <span className="text-[10px] text-[#ff6b00] uppercase font-black tracking-wider block mb-1">Owner Split Cut Allocation (50%)</span>
                  <div className="text-2xl font-black text-[#ff6b00] font-mono">{shareSplits.toFixed(2)} <span className="text-xs text-gray-500">pounds</span></div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Retained deployment reserves for platform owner.</p>
                </div>
                <div className="bg-[#111] border border-gray-900 p-5 rounded-xl border-l-4 border-l-cyan-500">
                  <span className="text-[10px] text-cyan-400 uppercase font-black tracking-wider block mb-1">Staff Payroll Reserves Split (50%)</span>
                  <div className="text-2xl font-black text-cyan-400 font-mono">{shareSplits.toFixed(2)} <span className="text-xs text-gray-500">pounds</span></div>
                  <p className="text-[11px] text-gray-600 mt-1 leading-relaxed">Distributed dynamically to worker tokens.</p>
                </div>
              </div>

              {/* WORKER INVENTORY DROPOFF PAYROLL SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* INPUT LOG: PAYROLL SALARY ALLOCATION SYSTEM */}
                <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-white font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                      <DollarSign size={14} className="text-orange-500" /> Active Worker Payroll Matrix
                    </h3>
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-mono">Target Staff Code Token Sequence</label>
                        <input
                          type="text"
                          value={payrollCode}
                          onChange={(e) => setPayrollCode(e.target.value)}
                          placeholder="e.g., FSH-C7Q6"
                          className="w-full bg-[#161616] border border-gray-800 text-white font-mono text-xs rounded p-2.5 focus:outline-none focus:border-[#ff6b00]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-gray-500 block mb-1 font-mono">Pounds Salary Payload Amount</label>
                        <input
                          type="number"
                          value={payrollAmount}
                          onChange={(e) => setPayrollAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-[#161616] border border-gray-800 text-white font-mono text-xs rounded p-2.5 focus:outline-none focus:border-[#ff6b00]"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if(!payrollCode || !payrollAmount) return;
                      alert(`Payroll payload of ${payrollAmount} pounds successfully credited to worker key index: ${payrollCode.toUpperCase()}`);
                      setPayrollCode('');
                      setPayrollAmount('');
                    }}
                    className="w-full mt-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest rounded border border-zinc-700 transition"
                  >
                    Execute Salary Transaction Distribution
                  </button>
                </div>

                {/* TRANSFER SUBSECTION LEDGER ACTION BUTTON CONTAINER */}
                <div className="bg-[#111] border border-gray-900 p-6 rounded-xl flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs text-white font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                      <Layers size={14} className="text-orange-500" /> Owner Dividend Clearance Ledger
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4">Generates authorization ticket headers and executes direct server webhooks using serverless loops to alert the platform owner.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={async () => {
                        const tkt = 'OWN-TRF-' + Math.floor(100000 + Math.random() * 900000);
                        const newTransfer = { id: tkt, amount: shareSplits, status: 'pending' };
                        setTransferTickets(prev => [...prev, newTransfer]);

                        try {
                          await ('http://localhost:3000/api/notify-discord', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ quantity: tkt })
                          });
                        } catch(e){}
                        alert(`Owner transfer authorization instance generated securely: ${tkt}`);
                      }}
                      className="w-full py-2.5 bg-[#ff6b00] text-black font-black text-xs uppercase tracking-widest rounded hover:bg-orange-500 transition"
                    >
                      Initiate Owner Cut Transfer Webhook
                    </button>
                  </div>
                </div>
              </div>

              {/* LIVE TRANSFER TRACKING PANEL TICKETS */}
              {transferTickets.length > 0 && (
                <div className="bg-[#111] border border-gray-900 rounded-xl p-6">
                  <h3 className="text-xs text-white font-black uppercase tracking-widest mb-3">Owner Transfer Realtime Verification Status</h3>
                  <div className="space-y-2">
                    {transferTickets.map((t, idx) => (
                      <div key={idx} className="bg-[#161616] border border-gray-800 p-3 rounded flex justify-between items-center text-xs font-mono">
                        <div>
                          <span className="text-white font-bold block">{t.id}</span>
                          <span className="text-gray-500 text-[11px]">Value: {t.amount.toFixed(2)} pounds</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${t.status === 'Complete' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900' : 'bg-amber-950 text-amber-400 border border-amber-900 animate-pulse'}`}>
                            {t.status}
                          </span>
                          <button
                            onClick={() => {
                              setTransferTickets(prev => prev.map(item => item.id === t.id ? { ...item, status: 'Complete' } : item));
                              alert("Cryptographic signature approved. Transfer state locked to Complete.");
                            }}
                            className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white font-sans font-bold text-[10px] uppercase tracking-wide rounded border border-zinc-700"
                          >
                            Owner Overwrite Complete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* RESOURCE TICKETS EVALUATION GRID ROW */}
              <div className="bg-[#111] border border-gray-900 rounded-xl p-6">
                <h3 className="text-xs text-gray-400 font-black uppercase tracking-widest mb-4">Pending Worker Commodity Drops Drops Ledger</h3>
                {resourceTickets.length === 0 ? (
                  <div className="text-center py-6 text-xs text-gray-600 font-mono">No worker resource tickets currently awaiting processing validation.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead>
                        <tr className="border-b border-gray-900 text-gray-500">
                          <th className="pb-3">Ticket ID</th>
                          <th className="pb-3">Worker Node</th>
                          <th className="pb-3">Resource</th>
                          <th className="pb-3">Batch Amount</th>
                          <th className="pb-3">Status</th>
                          <th className="pb-3 text-right">Settlement Operation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-900/40">
                        {resourceTickets.map((ticket, idx) => (
                          <tr key={idx} className="hover:bg-black/20">
                            <td className="py-3 font-bold text-white">{ticket.id}</td>
                            <td className="py-3 text-gray-400">{ticket.worker} ({ticket.role})</td>
                            <td className="py-3 text-orange-400">{ticket.type}</td>
                            <td className="py-3 text-gray-300 font-bold">{ticket.amount} units</td>
                            <td className="py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${ticket.status === 'Done' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400 animate-pulse'}`}>
                                {ticket.status}
                              </span>
                            </td>
                            <td className="py-3 text-right">
                              {ticket.status !== 'Done' && (
                                <button
                                  onClick={() => {
                                    setResourceTickets(prev => prev.map(t => t.id === ticket.id ? { ...t, status: 'Done' } : t));
                                    alert(`Settled Ticket ${ticket.id}. Disbursed supply chain transaction payment into worker registry.`);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-950 border border-emerald-800 text-emerald-400 hover:bg-emerald-900 rounded font-sans font-bold text-[11px]"
                                >
                                  Pay Worker & Mark Done
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* VIEW: MY STUFF (MOCK SYSTEM FALLBACK CONTAINER PLACEHOLDERS) */}
          {currentView === 'my_stuff' && (
            <div className="max-w-xl mx-auto bg-[#111] border border-gray-900 p-8 rounded-xl text-center font-mono text-xs text-gray-500">
              ⚡ Vault inventory index tracking blocks successfully established. No custom user modifications discovered inside cache arrays.
            </div>
          )}

          {/* VIEW: LIVE EVENTS (MOCK SYSTEM FALLBACK CONTAINER PLACEHOLDERS) */}
          {currentView === 'live_events' && (
            <div className="max-w-xl mx-auto bg-[#111] border border-gray-900 p-8 rounded-xl text-center font-mono text-xs text-gray-500">
              📅 Synchronizing with active calendar tracking engines. Next live delivery window schedule locks in approximately 04:12:44.
            </div>
          )}

        </div>
      </main>
    </div>
  );
}