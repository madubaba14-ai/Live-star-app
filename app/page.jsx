'use client'
import { useState, useEffect, useRef, useCallback } from "react"

const FIREBASE_CONFIG = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID",
}

const AGORA_APP_ID      = "YOUR_AGORA_APP_ID"
const PAYPAL_CLIENT     = "YOUR_PAYPAL_CLIENT_ID"
const CLOUDINARY_NAME   = "YOUR_CLOUDINARY_CLOUD_NAME"
const CLOUDINARY_PRESET = "YOUR_CLOUDINARY_UPLOAD_PRESET"
const ADMIN_UIDS        = ["ADMIN_UID_HERE"]

const WITHDRAW_RATE = 1500
const MIN_WITHDRAW  = 15000
const CALL_RATE     = 2800
const DAILY_BONUS   = 5

const GIFTS = [
  { emoji:"🌹", cost:1,     name:"Rose"       },
  { emoji:"💋", cost:5,     name:"Kiss"       },
  { emoji:"🎈", cost:10,    name:"Balloon"    },
  { emoji:"💍", cost:50,    name:"Ring"       },
  { emoji:"👑", cost:100,   name:"Crown"      },
  { emoji:"🚗", cost:500,   name:"Car"        },
  { emoji:"🚁", cost:1000,  name:"Helicopter" },
  { emoji:"🦁", cost:2000,  name:"Lion"       },
  { emoji:"🚀", cost:5000,  name:"Rocket"     },
  { emoji:"🏰", cost:10000, name:"Castle"     },
  { emoji:"🦄", cost:15000, name:"Unicorn"    },
  { emoji:"🌌", cost:50000, name:"Galaxy"     },
]

const PACKAGES = [
  { price:1,   coins:100,   tag:null,        color:"#6366f1" },
  { price:25,  coins:1500,  tag:"Popular",   color:"#ec4899" },
  { price:50,  coins:3500,  tag:"Value",     color:"#f59e0b" },
  { price:100, coins:8000,  tag:"Best Deal", color:"#10b981" },
  { price:250, coins:20000, tag:"VIP",       color:"#ef4444" },
]

const FIRST_OFFER = { price:50, coins:100000, originalCoins:3500 }

let _app=null, _auth=null, _db=null
async function getFirebase() {
  if (_app) return { auth:_auth, db:_db }
  try {
    const { initializeApp, getApps } = await import("firebase/app")
    const { getAuth }                = await import("firebase/auth")
    const { getFirestore }           = await import("firebase/firestore")
    _app  = getApps().length ? getApps()[0] : initializeApp(FIREBASE_CONFIG)
    _auth = getAuth(_app)
    _db   = getFirestore(_app)
    return { auth:_auth, db:_db }
  } catch(e) { return { auth:null, db:null } }
}

const css = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'DM Sans',sans-serif;-webkit-tap-highlight-color:transparent}
:root{
  --bg:#0a0a0f;--bg2:#111118;--bg3:#1a1a24;
  --surface:rgba(255,255,255,0.04);--surface2:rgba(255,255,255,0.08);
  --border:rgba(255,255,255,0.08);
  --gold:#f5c842;--rose:#f43f88;--violet:#8b5cf6;
  --text:#f0eeff;--muted:rgba(240,238,255,0.45);--green:#22c55e;
}
.app{min-height:100vh;background:var(--bg);color:var(--text);padding-bottom:80px;max-width:430px;margin:0 auto;position:relative;overflow-x:hidden}
.auth-wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:1.5rem;background:linear-gradient(160deg,#0d0320 0%,#0a0a0f 60%,#120a1e 100%)}
.auth-card{width:100%;max-width:360px}
.auth-logo{font-family:'Syne',sans-serif;font-size:3rem;font-weight:800;background:linear-gradient(135deg,#f43f88,#f5c842);-webkit-background-clip:text;-webkit-text-fill-color:transparent;text-align:center;margin-bottom:.25rem}
.auth-sub{text-align:center;color:var(--muted);font-size:.85rem;margin-bottom:2rem}
.auth-tabs{display:flex;background:var(--surface2);border:1px solid var(--border);border-radius:12px;padding:4px;margin-bottom:1.25rem}
.auth-tab{flex:1;padding:.625rem;border-radius:8px;border:none;font-family:'Syne',sans-serif;font-weight:700;font-size:.85rem;cursor:pointer;transition:all .2s;background:transparent;color:var(--muted)}
.auth-tab.active{background:var(--rose);color:white;box-shadow:0 4px 12px rgba(244,63,136,.35)}
.auth-field{width:100%;padding:.875rem 1rem;background:var(--bg3);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.9rem;outline:none;margin-bottom:.75rem;transition:border-color .2s}
.auth-field:focus{border-color:var(--rose)}
.auth-field::placeholder{color:var(--muted)}
.header{display:flex;justify-content:space-between;align-items:center;padding:1.25rem 1rem .75rem;position:sticky;top:0;z-index:100;background:linear-gradient(to bottom,var(--bg) 80%,transparent)}
.logo{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;background:linear-gradient(135deg,var(--rose),var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.coin-badge{display:flex;align-items:center;gap:.375rem;background:var(--surface2);border:1px solid var(--border);border-radius:99px;padding:.375rem .75rem;font-weight:600;font-size:.875rem;cursor:pointer;transition:all .2s}
.coin-badge:hover{border-color:var(--gold)}
.icon-btn{position:relative;width:2.25rem;height:2.25rem;background:var(--surface2);border:1px solid var(--border);border-radius:99px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;transition:all .2s;flex-shrink:0}
.icon-btn:hover{background:var(--surface)}
.unread-badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;background:#ef4444;border-radius:99px;border:2px solid var(--bg);font-size:.55rem;font-weight:800;color:white;display:flex;align-items:center;justify-content:center;padding:0 3px}
.section-label{font-family:'Syne',sans-serif;font-size:.7rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);padding:0 1rem;margin-bottom:.625rem;display:flex;align-items:center;gap:.5rem}
.live-dot{width:6px;height:6px;background:#ef4444;border-radius:50%;animation:blink 1.4s ease-in-out infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}
.live-strip{display:flex;gap:.75rem;overflow-x:auto;padding:0 1rem .5rem;scrollbar-width:none}
.live-strip::-webkit-scrollbar{display:none}
.live-card{flex-shrink:0;width:90px;cursor:pointer}
.live-card img{width:90px;height:110px;object-fit:cover;border-radius:12px;border:2px solid #ef4444;display:block}
.live-badge{position:absolute;bottom:28px;left:50%;transform:translateX(-50%);background:#ef4444;color:white;font-size:.55rem;font-weight:800;padding:2px 8px;border-radius:99px;text-transform:uppercase;white-space:nowrap}
.live-card-name{color:var(--text);font-size:.7rem;font-weight:500;text-align:center;margin-top:.3rem;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.user-list{display:flex;flex-direction:column;gap:.625rem;padding:0 1rem}
.user-card{display:flex;align-items:center;gap:.875rem;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:.875rem;cursor:pointer;transition:all .2s}
.user-card:hover{border-color:rgba(244,63,136,.25)}
.avatar-wrap{position:relative;flex-shrink:0}
.avatar-wrap img{width:48px;height:48px;border-radius:50%;object-fit:cover;display:block}
.online-dot{position:absolute;bottom:1px;right:1px;width:11px;height:11px;background:var(--green);border-radius:50%;border:2px solid var(--bg)}
.crown-badge{position:absolute;top:-4px;right:-4px;font-size:.7rem}
.user-info{flex:1;min-width:0}
.user-name{font-weight:600;font-size:.9rem;color:var(--text)}
.user-bio{color:var(--muted);font-size:.78rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.user-followers{font-size:.7rem;color:var(--muted);margin-top:2px}
.call-chip{background:linear-gradient(135deg,#f59e0b,#ef4444);color:white;font-size:.7rem;font-weight:700;padding:.3rem .7rem;border-radius:99px;border:none;cursor:pointer;white-space:nowrap}
.empty-state{text-align:center;padding:2.5rem 1rem;color:var(--muted);font-size:.85rem}
.go-live-btn{display:flex;align-items:center;justify-content:center;gap:.5rem;width:calc(100% - 2rem);margin:1rem;padding:.9rem;background:linear-gradient(135deg,var(--rose),var(--violet));border:none;border-radius:14px;color:white;font-family:'Syne',sans-serif;font-size:.95rem;font-weight:700;cursor:pointer;box-shadow:0 8px 24px rgba(244,63,136,.35);transition:all .2s}
.go-live-btn:hover{transform:translateY(-1px)}
.nav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:rgba(10,10,15,.95);backdrop-filter:blur(16px);border-top:1px solid var(--border);display:flex;justify-content:space-around;padding:.5rem .25rem .75rem;z-index:200}
.nav-btn{display:flex;flex-direction:column;align-items:center;gap:3px;padding:.5rem .875rem;background:transparent;border:none;cursor:pointer;border-radius:12px;transition:all .2s;position:relative}
.nav-btn.active{background:rgba(244,63,136,.12)}
.nav-icon{font-size:1.2rem}
.nav-label{font-size:.6rem;font-weight:600;letter-spacing:.04em;color:var(--muted);text-transform:uppercase}
.nav-btn.active .nav-label{color:var(--rose)}
.nav-bar{position:absolute;bottom:2px;width:16px;height:2px;background:var(--rose);border-radius:99px}
.wallet-hero{margin:1rem;background:linear-gradient(135deg,#1a0a2e,#0f0a1e);border:1px solid rgba(139,92,246,.3);border-radius:20px;padding:1.5rem;position:relative;overflow:hidden}
.wallet-amount{font-family:'Syne',sans-serif;font-size:2.8rem;font-weight:800;color:var(--gold);line-height:1.1}
.section-card{margin:0 1rem 1rem;background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:1.125rem}
.section-card-title{font-family:'Syne',sans-serif;font-size:.85rem;font-weight:700;color:var(--text);margin-bottom:1rem}
.pkg-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:.625rem}
.pkg-card{border-radius:12px;padding:1rem;border:1.5px solid transparent;cursor:pointer;transition:all .2s;text-align:left}
.pkg-card:hover{transform:translateY(-2px)}
.pkg-card.selected{border-color:var(--rose)!important}
.pkg-tag{font-size:.6rem;font-weight:800;text-transform:uppercase;padding:2px 8px;border-radius:99px;background:rgba(255,255,255,.15);color:white;display:inline-block;margin-bottom:.5rem}
.pkg-coins{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800;color:white}
.pkg-price{font-size:.8rem;color:rgba(255,255,255,.7);margin-top:2px}
.first-offer-card{margin:0 1rem 1rem;background:linear-gradient(135deg,rgba(245,200,66,.12),rgba(239,68,68,.12));border:1.5px solid rgba(245,200,66,.3);border-radius:16px;padding:1.25rem;cursor:pointer;transition:all .2s}
.first-offer-card:hover{border-color:var(--gold)}
.offer-coins{font-family:'Syne',sans-serif;font-size:2rem;font-weight:800;color:var(--gold)}
.withdraw-summary{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:.75rem;margin-bottom:.75rem}
.input-field{width:100%;padding:.75rem 1rem;background:var(--bg3);border:1px solid var(--border);border-radius:10px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.875rem;outline:none;transition:border-color .2s}
.input-field:focus{border-color:var(--rose)}
.input-field::placeholder{color:var(--muted)}
.btn-primary{width:100%;padding:.875rem;background:linear-gradient(135deg,var(--rose),var(--violet));border:none;border-radius:12px;color:white;font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700;cursor:pointer;transition:all .2s;box-shadow:0 6px 20px rgba(244,63,136,.3)}
.btn-primary:hover{transform:translateY(-1px)}
.btn-primary:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
.btn-ghost{width:100%;padding:.875rem;background:var(--surface2);border:1px solid var(--border);border-radius:12px;color:var(--text);font-family:'DM Sans',sans-serif;font-size:.875rem;font-weight:500;cursor:pointer;transition:all .2s}
.btn-ghost:hover{background:var(--surface)}
.profile-hero{display:flex;flex-direction:column;align-items:center;padding:2rem 1rem 1rem}
.profile-avatar{width:90px;height:90px;border-radius:50%;object-fit:cover;border:3px solid var(--rose);cursor:pointer}
.profile-name{font-family:'Syne',sans-serif;font-size:1.2rem;font-weight:800;margin-top:.75rem}
.profile-stats{display:flex;gap:2rem;margin-top:1rem}
.stat-item{text-align:center}
.stat-val{font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:800}
.stat-label{color:var(--muted);font-size:.7rem;text-transform:uppercase;letter-spacing:.06em}
.host-card{display:flex;align-items:center;gap:.875rem;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:.875rem;cursor:pointer;transition:all .2s;margin-bottom:.625rem}
.host-card:hover{border-color:rgba(245,200,66,.35)}
.host-card img{width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid var(--gold)}
.modal-overlay{position:fixed;inset:0;z-index:500;background:rgba(0,0,0,.75);display:flex;align-items:flex-end;justify-content:center}
.modal-sheet{width:100%;max-width:430px;background:var(--bg2);border-top:1px solid var(--border);border-radius:20px 20px 0 0;padding:1.5rem 1rem 2rem;max-height:85vh;overflow-y:auto}
.modal-handle{width:36px;height:4px;background:var(--border);border-radius:99px;margin:0 auto 1.25rem}
.gift-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:.625rem}
.gift-btn{display:flex;flex-direction:column;align-items:center;padding:.625rem .5rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;cursor:pointer;transition:all .2s;gap:3px}
.gift-btn:hover:not(:disabled){border-color:var(--gold);background:rgba(245,200,66,.08)}
.gift-btn:disabled{opacity:.4;cursor:not-allowed}
.gift-cost{font-size:.6rem;font-weight:700;color:var(--gold)}
.toast-wrap{position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;pointer-events:none}
.toast{background:rgba(20,20,30,.95);border:1px solid rgba(244,63,136,.3);color:var(--text);padding:.625rem 1rem;border-radius:10px;font-size:.85rem;font-weight:500;backdrop-filter:blur(12px);box-shadow:0 4px 16px rgba(0,0,0,.5);max-width:260px;animation:slideIn .3s ease}
@keyframes slideIn{from{transform:translateX(100%);opacity:0}to{transform:translateX(0);opacity:1}}
.bonus-modal{position:fixed;inset:0;z-index:600;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:1rem}
.bonus-card{width:100%;max-width:320px;background:var(--bg2);border:1px solid rgba(244,63,136,.25);border-radius:24px;overflow:hidden}
.bonus-top{background:linear-gradient(135deg,var(--rose),var(--violet));padding:2rem;text-align:center}
.bonus-body{padding:1.5rem}
.bonus-amount{background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:1.25rem;text-align:center;margin-bottom:1rem}
.live-screen{position:fixed;inset:0;z-index:700;background:#000;display:flex;flex-direction:column}
.live-video-area{flex:1;position:relative;background:linear-gradient(180deg,#1a0a2e,#0d0d1a);display:flex;align-items:center;justify-content:center;overflow:hidden}
.live-video-fill{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.live-placeholder{display:flex;flex-direction:column;align-items:center;gap:.75rem;z-index:1}
.live-host-img{width:100px;height:100px;border-radius:50%;border:3px solid var(--rose);object-fit:cover}
.live-top-bar{position:absolute;top:1rem;left:1rem;right:1rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem;z-index:2}
.live-chip{display:flex;align-items:center;gap:.5rem;background:rgba(0,0,0,.6);backdrop-filter:blur(8px);padding:.4rem .75rem;border-radius:99px}
.live-chip img{width:28px;height:28px;border-radius:50%}
.viewer-chip{background:rgba(0,0,0,.6);backdrop-filter:blur(8px);padding:.4rem .75rem;border-radius:99px;font-size:.8rem}
.live-exit{width:36px;height:36px;background:rgba(239,68,68,.8);border:none;border-radius:50%;cursor:pointer;font-size:1rem;color:white;flex-shrink:0}
.live-bottom{position:absolute;bottom:0;left:0;right:0;padding:.75rem;display:flex;gap:.625rem;align-items:center;z-index:2}
.ctrl-btn{width:40px;height:40px;background:rgba(255,255,255,.15);border:none;border-radius:50%;cursor:pointer;font-size:1.1rem;flex-shrink:0}
.ctrl-btn.off{background:rgba(239,68,68,.6)}
.gift-open{margin-left:auto;background:linear-gradient(135deg,var(--rose),var(--violet));border:none;border-radius:20px;padding:.5rem 1rem;color:white;font-weight:700;font-size:.8rem;cursor:pointer}
.live-chat-area{height:28%;background:rgba(0,0,0,.85);display:flex;flex-direction:column}
.chat-msgs{flex:1;overflow-y:auto;padding:.5rem}
.chat-msg{display:flex;gap:.5rem;margin-bottom:.375rem;align-items:flex-start}
.chat-msg img{width:22px;height:22px;border-radius:50%;flex-shrink:0}
.chat-msg-name{color:var(--rose);font-size:.7rem;font-weight:700}
.chat-msg-text{color:var(--text);font-size:.8rem}
.chat-row{display:flex;gap:.5rem;padding:.5rem}
.chat-input-live{flex:1;padding:.5rem .875rem;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:99px;color:white;font-size:.8rem;outline:none}
.chat-send{width:36px;height:36px;background:var(--rose);border:none;border-radius:50%;cursor:pointer;color:white;font-size:.9rem;flex-shrink:0}
.gift-overlay{position:absolute;bottom:28%;left:0;right:0;background:rgba(10,10,15,.97);border-top-left-radius:16px;border-top-right-radius:16px;padding:1rem;z-index:3}
.flying-gift{position:absolute;font-size:2rem;animation:flyUp 1.5s ease-out forwards;pointer-events:none;z-index:5}
@keyframes flyUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-200px) scale(2);opacity:0}}
.notif-item{display:flex;align-items:center;gap:.75rem;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:.875rem;margin-bottom:.625rem}
.notif-item.unread{border-color:rgba(244,63,136,.25);background:rgba(244,63,136,.05)}
.notif-item img{width:38px;height:38px;border-radius:50%;flex-shrink:0;object-fit:cover}
.admin-overlay{position:fixed;inset:0;z-index:800;background:rgba(0,0,0,.8);display:flex;align-items:center;justify-content:center;padding:1rem}
.admin-card{width:100%;max-width:440px;background:var(--bg2);border-radius:20px;overflow:hidden;max-height:90vh;overflow-y:auto}
.admin-top{background:linear-gradient(135deg,#eab308,#f97316);padding:1.25rem;text-align:center}
.admin-body{padding:1.25rem}
.req-card{background:var(--bg3);border:1px solid var(--border);border-radius:12px;padding:1rem;margin-bottom:.75rem}
.page-title{font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;padding:1.25rem 1rem .75rem;letter-spacing:-.02em}
.loading-screen{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);flex-direction:column;gap:1rem}
.spinner{width:36px;height:36px;border:3px solid var(--surface2);border-top-color:var(--rose);border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.premium-hero{margin:1rem;background:linear-gradient(135deg,rgba(234,179,8,.15),rgba(239,68,68,.1));border:1px solid rgba(234,179,8,.25);border-radius:20px;padding:1.5rem;display:flex;align-items:center;gap:1rem}
`

export default function App() {
  const [loading,       setLoading]       = useState(true)
  const [fbUser,        setFbUser]        = useState(null)
  const [authEmail,     setAuthEmail]     = useState("")
  const [authPass,      setAuthPass]      = useState("")
  const [authMode,      setAuthMode]      = useState("login")
  const [authLoading,   setAuthLoading]   = useState(false)
  const [profile,       setProfile]       = useState(null)
  const [editName,      setEditName]      = useState("")
  const [editBio,       setEditBio]       = useState("")
  const [editAge,       setEditAge]       = useState("")
  const [editCountry,   setEditCountry]   = useState("")
  const [editCity,      setEditCity]      = useState("")
  const [editGender,    setEditGender]    = useState("Male")
  const [uploadingPhoto,setUploadingPhoto]= useState(false)
  const [screen,        setScreen]        = useState("home")
  const [users,         setUsers]         = useState([])
  const [showLive,      setShowLive]      = useState(false)
  const [isOwnLive,     setIsOwnLive]     = useState(false)
  const [liveHost,      setLiveHost]      = useState(null)
  const [liveHostId,    setLiveHostId]    = useState("")
  const [viewers,       setViewers]       = useState(0)
  const [showGifts,     setShowGifts]     = useState(false)
  const [flyingGifts,   setFlyingGifts]   = useState([])
  const [micOn,         setMicOn]         = useState(true)
  const [camOn,         setCamOn]         = useState(true)
  const [liveConnecting,setLiveConnecting]= useState(false)
  const [chatMsgs,      setChatMsgs]      = useState([])
  const [chatInput,     setChatInput]     = useState("")
  const [showCall,      setShowCall]      = useState(false)
  const [callUser,      setCallUser]      = useState(null)
  const [callActive,    setCallActive]    = useState(false)
  const [callTimer,     setCallTimer]     = useState(0)
  const [callConnecting,setCallConnecting]= useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser,  setSelectedUser]  = useState(null)
  const [selectedPkg,   setSelectedPkg]   = useState(null)
  const [usedOffer,     setUsedOffer]     = useState(false)
  const [paypalEmail,   setPaypalEmail]   = useState("")
  const [showNotifs,    setShowNotifs]    = useState(false)
  const [notifs,        setNotifs]        = useState([])
  const [unreadCount,   setUnreadCount]   = useState(0)
  const [showBonus,     setShowBonus]     = useState(false)
  const [bonusCanClaim, setBonusCanClaim] = useState(false)
  const [showAdmin,     setShowAdmin]     = useState(false)
  const [adminReqs,     setAdminReqs]     = useState([])
  const [platformEarn,  setPlatformEarn]  = useState(0)
  const [toasts,        setToasts]        = useState([])

  const agoraRef         = useRef(null)
  const localTracksRef   = useRef([])
  const premiumClientRef = useRef(null)
  const premiumTracksRef = useRef([])
  const callIntervalRef  = useRef(null)
  const chatEndRef       = useRef(null)
  const paypalRef        = useRef(null)
  const fileInputRef     = useRef(null)

  const toast = useCallback((msg) => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  const avatarUrl = (name) =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name||"U")}&background=f43f88&color=fff&size=150`

  const fmt = (s) =>
    `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`

  const isOnline = (u) =>
    u?.isOnline || (u?.lastSeen?.toMillis?.() > Date.now()-300000)

  // ── Scripts ──
  useEffect(() => {
    if (PAYPAL_CLIENT && PAYPAL_CLIENT !== "YOUR_PAYPAL_CLIENT_ID" && !window.paypal) {
      const s = document.createElement("script")
      s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT}&currency=USD`
      s.async = true
      document.body.appendChild(s)
    }
    if (!window.AgoraRTC) {
      const s = document.createElement("script")
      s.src = "https://download.agora.io/sdk/release/AgoraRTC_N-4.18.2.js"
      s.async = true
      document.body.appendChild(s)
    }
  }, [])

  // ── Auth listener ──
  useEffect(() => {
    let unsub
    ;(async () => {
      const { auth, db } = await getFirebase()
      if (!auth || !db) { setLoading(false); return }
      const { onAuthStateChanged }        = await import("firebase/auth")
      const { doc, getDoc, updateDoc, Timestamp } = await import("firebase/firestore")
      unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          setFbUser(user)
          const snap = await getDoc(doc(db, "profiles", user.uid))
          if (snap.exists()) {
            const d = snap.data()
            const isAdmin = ADMIN_UIDS.includes(user.uid) || !!d.isAdmin
            const p = { uid: user.uid, ...d, isAdmin }
            setProfile(p)
            setEditName(d.displayName||""); setEditBio(d.bio||"")
            setEditAge(d.age?.toString()||""); setEditCountry(d.country||"")
            setEditCity(d.city||""); setEditGender(d.gender||"Male")
            setUsedOffer(d.hasUsedFirstTimeOffer||false)
            await updateDoc(doc(db,"profiles",user.uid), { isOnline:true, lastSeen:Timestamp.now() })
          }
        } else { setFbUser(null); setProfile(null) }
        setLoading(false)
      })
    })()
    return () => unsub?.()
  }, [])

  // ── Realtime users ──
  useEffect(() => {
    if (!fbUser) return
    let unsub
    ;(async () => {
      const { db } = await getFirebase()
      if (!db) return
      const { collection, onSnapshot } = await import("firebase/firestore")
      unsub = onSnapshot(collection(db, "profiles"), snap => {
        const list = []
        snap.forEach(d => { if (d.id !== fbUser.uid) list.push({ uid:d.id, ...d.data() }) })
        setUsers(list)
      })
    })()
    return () => unsub?.()
  }, [fbUser])

  // ── Realtime notifications ──
  useEffect(() => {
    if (!fbUser) return
    let unsub
    ;(async () => {
      const { db } = await getFirebase()
      if (!db) return
      const { collection, onSnapshot, query, where } = await import("firebase/firestore")
      const q = query(collection(db,"notifications"), where("toUid","==",fbUser.uid))
      unsub = onSnapshot(q, snap => {
        const list=[]; let unread=0
        snap.forEach(d => { const n={id:d.id,...d.data()}; list.push(n); if(!n.read) unread++ })
        list.sort((a,b)=>(b.timestamp?.toMillis?.()||0)-(a.timestamp?.toMillis?.()||0))
        setNotifs(list); setUnreadCount(unread)
      })
    })()
    return () => unsub?.()
  }, [fbUser])

  // ── Realtime live chat ──
  useEffect(() => {
    if (!showLive) return
    const chatId = liveHostId || fbUser?.uid
    if (!chatId) return
    let unsub
    ;(async () => {
      const { db } = await getFirebase()
      if (!db) return
      const { collection, onSnapshot } = await import("firebase/firestore")
      unsub = onSnapshot(collection(db,"livechats",chatId,"messages"), snap => {
        const list=[]
        snap.forEach(d => list.push({ id:d.id,...d.data() }))
        list.sort((a,b)=>a.timestamp-b.timestamp)
        setChatMsgs(list)
      })
    })()
    return () => unsub?.()
  }, [showLive, liveHostId, fbUser])

  // ── Admin data ──
  useEffect(() => {
    if (!showAdmin || !profile?.isAdmin) return
    let u1, u2
    ;(async () => {
      const { db } = await getFirebase()
      if (!db) return
      const { collection, onSnapshot, doc } = await import("firebase/firestore")
      u1 = onSnapshot(collection(db,"withdrawals"), snap => {
        const list=[]
        snap.forEach(d => list.push({ id:d.id,...d.data() }))
        list.sort((a,b)=>(b.timestamp?.toMillis?.()||0)-(a.timestamp?.toMillis?.()||0))
        setAdminReqs(list)
      })
      u2 = onSnapshot(doc(db,"platform","earnings"), d => {
        if (d.exists()) setPlatformEarn(d.data().totalCommission||0)
      })
    })()
    return () => { u1?.(); u2?.() }
  }, [showAdmin, profile])

  // ── Daily bonus ──
  useEffect(() => {
    if (!fbUser) return
    ;(async () => {
      const { db } = await getFirebase()
      if (!db) return
      const { doc, getDoc } = await import("firebase/firestore")
      const snap = await getDoc(doc(db,"dailyBonus",fbUser.uid))
      const today = new Date().toISOString().split("T")[0]
      if (!snap.exists() || snap.data().lastClaimDate !== today) {
        setBonusCanClaim(true); setShowBonus(true)
      }
    })()
  }, [fbUser])

  // ── PayPal button ──
  useEffect(() => {
    if (!selectedPkg || !paypalRef.current) return
    const iv = setInterval(() => {
      if (!window.paypal) return
      clearInterval(iv)
      paypalRef.current.innerHTML = ""
      window.paypal.Buttons({
        createOrder: (_,a) => a.order.create({ purchase_units:[{ amount:{ value:selectedPkg.price.toString(), currency_code:"USD" }, description:`${selectedPkg.coins} LiveStar Coins` }] }),
        onApprove:   async (_,a) => { await a.order.capture(); await addCoins(selectedPkg.coins, selectedPkg.isOffer); toast(`✅ +${selectedPkg.coins.toLocaleString()} coins!`); setSelectedPkg(null) },
        onError:     () => toast("Payment failed. Please try again.")
      }).render("#paypal-container")
    }, 200)
    return () => clearInterval(iv)
  }, [selectedPkg])

  useEffect(() => { chatEndRef.current?.scrollIntoView({behavior:"smooth"}) }, [chatMsgs])

  // ── Call timer ──
  useEffect(() => {
    if (!callActive) return
    callIntervalRef.current = setInterval(() => {
      setCallTimer(t => {
        const n = t + 1
        if (n > 0 && n % 60 === 0) { deductCoins(CALL_RATE); toast(`💎 ${CALL_RATE} coins deducted`) }
        return n
      })
    }, 1000)
    return () => clearInterval(callIntervalRef.current)
  }, [callActive])

  // ── Firebase helpers ──
  const addCoins = async (amount, isOffer=false) => {
    if (!fbUser) return
    const { db } = await getFirebase()
    if (!db) return
    const { doc, updateDoc, increment } = await import("firebase/firestore")
    const upd = { coins: increment(amount) }
    if (isOffer) { upd.hasUsedFirstTimeOffer = true; setUsedOffer(true) }
    await updateDoc(doc(db,"profiles",fbUser.uid), upd)
    setProfile(p => p ? { ...p, coins:(p.coins||0)+amount } : p)
  }

  const deductCoins = async (amount) => {
    if (!fbUser) return
    const { db } = await getFirebase()
    if (!db) return
    const { doc, updateDoc, increment } = await import("firebase/firestore")
    await updateDoc(doc(db,"profiles",fbUser.uid), { coins: increment(-amount) })
    setProfile(p => p ? { ...p, coins:Math.max(0,(p.coins||0)-amount) } : p)
  }

  const transferCoins = async (toUid, amount) => {
    const { db } = await getFirebase()
    if (!db) return
    const net = Math.floor(amount * 0.9)
    const { doc, updateDoc, increment } = await import("firebase/firestore")
    await deductCoins(amount)
    await updateDoc(doc(db,"profiles",toUid), { coins: increment(net) })
    await updateDoc(doc(db,"platform","earnings"), { totalCommission: increment(amount - net) }).catch(()=>{})
  }

  // ── Auth actions ──
  const handleAuth = async () => {
    if (!authEmail || !authPass) { toast("Fill all fields"); return }
    setAuthLoading(true)
    try {
      const { auth, db } = await getFirebase()
      if (!auth || !db) { toast("Firebase not configured"); return }
      if (authMode === "register") {
        const { createUserWithEmailAndPassword } = await import("firebase/auth")
        const { doc, setDoc, Timestamp }         = await import("firebase/firestore")
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPass)
        await setDoc(doc(db,"profiles",cred.user.uid), {
          displayName:authEmail.split("@")[0], email:authEmail, coins:100, bio:"Hey there!",
          photoURL:"", country:"", city:"", age:18, gender:"Male", islive:false,
          lastBonus:Date.now(), followers:[], following:[],
          isOnline:true, lastSeen:Timestamp.now(),
          isPremium:false, isAdmin:false, hasUsedFirstTimeOffer:false
        })
        toast("🎉 Account created!")
      } else {
        const { signInWithEmailAndPassword } = await import("firebase/auth")
        await signInWithEmailAndPassword(auth, authEmail, authPass)
        toast("👋 Welcome back!")
      }
    } catch(e) { toast(e.message?.split("(auth")[0]?.replace("Firebase: ","") || "Error") }
    finally { setAuthLoading(false) }
  }

  const handleLogout = async () => {
    const { auth, db } = await getFirebase()
    if (auth && db && fbUser) {
      const { signOut }                      = await import("firebase/auth")
      const { doc, updateDoc, Timestamp }    = await import("firebase/firestore")
      await updateDoc(doc(db,"profiles",fbUser.uid), { isOnline:false, lastSeen:Timestamp.now() })
      await signOut(auth)
    }
    setScreen("home")
  }

  const saveProfile = async () => {
    if (!fbUser) return
    const { db } = await getFirebase()
    if (!db) return
    const { doc, updateDoc } = await import("firebase/firestore")
    const upd = { displayName:editName, bio:editBio, age:parseInt(editAge)||18, country:editCountry, city:editCity, gender:editGender }
    await updateDoc(doc(db,"profiles",fbUser.uid), upd)
    setProfile(p => p ? { ...p, ...upd } : p)
    toast("✅ Profile saved!")
  }

  const uploadPhoto = async (file) => {
    if (!file || !fbUser || CLOUDINARY_NAME==="YOUR_CLOUDINARY_CLOUD_NAME") { toast("Cloudinary not configured"); return }
    setUploadingPhoto(true)
    try {
      const fd = new FormData(); fd.append("file",file); fd.append("upload_preset",CLOUDINARY_PRESET)
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`, { method:"POST", body:fd })
      const data = await res.json()
      const { db } = await getFirebase()
      if (db) {
        const { doc, updateDoc } = await import("firebase/firestore")
        await updateDoc(doc(db,"profiles",fbUser.uid), { photoURL:data.secure_url })
        setProfile(p => p ? { ...p, photoURL:data.secure_url } : p)
        toast("📷 Photo updated!")
      }
    } catch(e) { toast("Upload failed") }
    finally { setUploadingPhoto(false) }
  }

  const claimBonus = async () => {
    if (!fbUser || !bonusCanClaim) return
    const { db } = await getFirebase()
    if (!db) return
    const { doc, setDoc, Timestamp } = await import("firebase/firestore")
    const today = new Date().toISOString().split("T")[0]
    await addCoins(DAILY_BONUS)
    await setDoc(doc(db,"dailyBonus",fbUser.uid), { lastClaimDate:today, lastUpdated:Timestamp.now() })
    setBonusCanClaim(false); setShowBonus(false)
    toast(`🎁 +${DAILY_BONUS} coins claimed!`)
  }

  const toggleFollow = async (target) => {
    if (!fbUser || !profile) return
    const { db } = await getFirebase()
    if (!db) return
    const { doc, updateDoc, arrayUnion, arrayRemove, collection, addDoc, Timestamp } = await import("firebase/firestore")
    const isFollowing = profile.following?.includes(target.uid)
    if (isFollowing) {
      await updateDoc(doc(db,"profiles",fbUser.uid), { following:arrayRemove(target.uid) })
      await updateDoc(doc(db,"profiles",target.uid), { followers:arrayRemove(fbUser.uid) })
      setProfile(p => p ? { ...p, following:(p.following||[]).filter(x=>x!==target.uid) } : p)
    } else {
      await updateDoc(doc(db,"profiles",fbUser.uid), { following:arrayUnion(target.uid) })
      await updateDoc(doc(db,"profiles",target.uid), { followers:arrayUnion(fbUser.uid) })
      setProfile(p => p ? { ...p, following:[...(p.following||[]),target.uid] } : p)
      await addDoc(collection(db,"notifications"), {
        toUid:target.uid, fromUid:fbUser.uid,
        fromPhoto:profile.photoURL||avatarUrl(profile.displayName),
        type:"follow", message:`${profile.displayName} started following you`,
        read:false, timestamp:Timestamp.now()
      })
    }
  }

  const requestWithdraw = async () => {
    if (!fbUser||!profile) return
    if ((profile.coins||0) < MIN_WITHDRAW) { toast(`Need ${MIN_WITHDRAW.toLocaleString()} coins`); return }
    if (!usedOffer&&!profile.isPremium) { toast("Purchase a package first to unlock withdrawals"); return }
    if (!paypalEmail.includes("@")) { toast("Enter a valid PayPal email"); return }
    const { db } = await getFirebase()
    if (!db) return
    const { collection, addDoc, doc, updateDoc, Timestamp } = await import("firebase/firestore")
    const usd = (profile.coins / WITHDRAW_RATE).toFixed(2)
    await addDoc(collection(db,"withdrawals"), {
      uid:fbUser.uid, displayName:profile.displayName, email:profile.email,
      paypalEmail, amountInDollars:`$${usd}`, coinsRedeemed:profile.coins,
      status:"pending", timestamp:Timestamp.now()
    })
    await updateDoc(doc(db,"profiles",fbUser.uid), { coins:0 })
    setProfile(p => p ? { ...p, coins:0 } : p)
    setPaypalEmail("")
    toast(`💸 Withdrawal of $${usd} requested!`)
  }

  const sendChat = async () => {
    if (!chatInput.trim()||!profile) return
    const chatId = liveHostId||fbUser?.uid; if (!chatId) return
    const msg = { text:chatInput, sender:fbUser.uid, senderName:profile.displayName, senderPhoto:profile.photoURL||avatarUrl(profile.displayName), timestamp:Date.now() }
    setChatInput("")
    const { db } = await getFirebase()
    if (db) {
      const { doc, setDoc } = await import("firebase/firestore")
      await setDoc(doc(db,"livechats",chatId,"messages",Date.now().toString()), msg)
    } else setChatMsgs(p => [...p, { id:Date.now(),...msg }])
  }

  const sendGift = async (gift) => {
    if (!fbUser||!profile||isOwnLive||!liveHostId) { setShowGifts(false); return }
    if ((profile.coins||0) < gift.cost) { toast("Not enough coins"); setShowGifts(false); return }
    await transferCoins(liveHostId, gift.cost)
    const id = Date.now()
    setFlyingGifts(p => [...p, { id, emoji:gift.emoji, x:Math.random()*60+20 }])
    setTimeout(() => setFlyingGifts(p => p.filter(g=>g.id!==id)), 1800)
    setShowGifts(false)
    toast(`Sent ${gift.emoji} ${gift.name}!`)
    const { db } = await getFirebase()
    if (db) {
      const { collection, addDoc, Timestamp } = await import("firebase/firestore")
      await addDoc(collection(db,"notifications"), {
        toUid:liveHostId, fromUid:fbUser.uid,
        fromPhoto:profile.photoURL||avatarUrl(profile.displayName),
        type:"gift", message:`${profile.displayName} sent ${gift.emoji} ${gift.name}`,
        read:false, timestamp:Timestamp.now()
      })
    }
  }

  // ── Agora ──
  const startLive = async () => {
    if (AGORA_APP_ID==="YOUR_AGORA_APP_ID") { toast("Agora not configured"); return }
    if (!window.AgoraRTC||!fbUser) { toast("Not ready"); return }
    setIsOwnLive(true); setShowLive(true); setLiveHostId(fbUser.uid); setViewers(0); setChatMsgs([]); setLiveConnecting(true)
    try {
      const client = window.AgoraRTC.createClient({ mode:"live", codec:"vp8" })
      await client.setClientRole("host")
      await client.join(AGORA_APP_ID, fbUser.uid, null, null)
      const tracks = await window.AgoraRTC.createMicrophoneAndCameraTracks()
      await client.publish(tracks)
      setTimeout(() => tracks[1].play("live-local"), 100)
      agoraRef.current = client; localTracksRef.current = tracks
      client.on("user-joined", () => setViewers(v=>v+1))
      client.on("user-left",   () => setViewers(v=>Math.max(0,v-1)))
      setLiveConnecting(false)
      const { db } = await getFirebase()
      if (db) { const { doc, updateDoc } = await import("firebase/firestore"); await updateDoc(doc(db,"profiles",fbUser.uid), { islive:true }) }
      toast("🔴 You're live!")
    } catch(e) { setShowLive(false); setIsOwnLive(false); setLiveConnecting(false); toast("Failed: "+e.message) }
  }

  const joinLive = async (hostUid) => {
    if (AGORA_APP_ID==="YOUR_AGORA_APP_ID") { toast("Agora not configured"); return }
    if (!window.AgoraRTC) { toast("Not ready"); return }
    setLiveConnecting(true)
    try {
      const client = window.AgoraRTC.createClient({ mode:"live", codec:"vp8" })
      await client.setClientRole("audience")
      await client.join(AGORA_APP_ID, hostUid, null, null)
      agoraRef.current = client
      client.on("user-published", async (user, type) => {
        await client.subscribe(user, type)
        if (type==="video"&&user.videoTrack) setTimeout(()=>user.videoTrack.play("live-remote"),200)
        if (type==="audio"&&user.audioTrack) user.audioTrack.play()
      })
      setLiveConnecting(false); toast("✅ Joined live!")
    } catch(e) { setLiveConnecting(false); toast("Failed to join: "+e.message) }
  }

  const exitLive = async () => {
    if (!confirm("Exit live?")) return
    try {
      if (agoraRef.current) { await agoraRef.current.leave(); agoraRef.current=null }
      localTracksRef.current.forEach(t=>t.close()); localTracksRef.current=[]
      if (isOwnLive&&fbUser) {
        const { db } = await getFirebase()
        if (db) { const { doc, updateDoc } = await import("firebase/firestore"); await updateDoc(doc(db,"profiles",fbUser.uid), { islive:false }) }
      }
    } catch(e) {}
    setShowLive(false); setIsOwnLive(false); setLiveHost(null); setLiveHostId(""); setChatMsgs([]); setShowGifts(false); setLiveConnecting(false)
  }

  const toggleMic = () => { const t=localTracksRef.current[0]; if(t){ t.setEnabled(!micOn); setMicOn(!micOn) } }
  const toggleCam = () => { const t=localTracksRef.current[1]; if(t){ t.setEnabled(!camOn); setCamOn(!camOn) } }

  const startPremiumCall = async () => {
    if (!callUser||!fbUser) return
    if (AGORA_APP_ID==="YOUR_AGORA_APP_ID") { toast("Agora not configured"); return }
    if (!window.AgoraRTC) { toast("Not ready"); return }
    if ((profile?.coins||0)<CALL_RATE) { toast(`Need ${CALL_RATE} coins`); return }
    setCallConnecting(true)
    try {
      const channel = `call_${[fbUser.uid,callUser.uid].sort().join("_")}_${Date.now()}`
      const client  = window.AgoraRTC.createClient({ mode:"rtc", codec:"vp8" })
      await client.join(AGORA_APP_ID, channel, null, fbUser.uid)
      const tracks = await window.AgoraRTC.createMicrophoneAndCameraTracks()
      await client.publish(tracks)
      setTimeout(()=>tracks[1].play("call-local"),100)
      client.on("user-published", async(u,type)=>{
        await client.subscribe(u,type)
        if(type==="video"&&u.videoTrack) setTimeout(()=>u.videoTrack.play("call-remote"),100)
        if(type==="audio"&&u.audioTrack) u.audioTrack.play()
      })
      premiumClientRef.current=client; premiumTracksRef.current=tracks
      setCallActive(true); setCallConnecting(false)
      toast("📹 Call connected!")
    } catch(e) { setCallConnecting(false); toast("Call failed: "+e.message) }
  }

  const endCall = async () => {
    clearInterval(callIntervalRef.current)
    const mins = Math.ceil(callTimer/60)
    if (mins>0&&callUser) await transferCoins(callUser.uid, mins*CALL_RATE)
    try {
      if (premiumClientRef.current) { await premiumClientRef.current.leave(); premiumClientRef.current=null }
      premiumTracksRef.current.forEach(t=>t.close()); premiumTracksRef.current=[]
    } catch(e){}
    setCallActive(false); setCallTimer(0); setShowCall(false); setCallUser(null); setCallConnecting(false)
    if (mins>0) toast(`Call ended — ${mins} min used`)
  }

  const updateWithdrawal = async (id, status) => {
    const { db } = await getFirebase(); if (!db) return
    const { doc, updateDoc, Timestamp } = await import("firebase/firestore")
    await updateDoc(doc(db,"withdrawals",id), { status, processedAt:Timestamp.now() })
    toast(`Withdrawal ${status}`)
  }

  const markNotifsRead = async () => {
    const { db } = await getFirebase(); if (!db||!fbUser) return
    const { collection, getDocs, query, where, updateDoc, doc } = await import("firebase/firestore")
    const q = query(collection(db,"notifications"), where("toUid","==",fbUser.uid), where("read","==",false))
    const snap = await getDocs(q)
    snap.forEach(async d => updateDoc(doc(db,"notifications",d.id),{read:true}))
    setUnreadCount(0)
  }

  const liveUsers  = users.filter(u => u.islive)
  const otherUsers = users.filter(u => !u.islive)

  // ── LOADING ──
  if (loading) return (
    <>
      <style>{css}</style>
      <div className="loading-screen">
        <div style={{fontFamily:"Syne,sans-serif",fontSize:"2rem",fontWeight:800,background:"linear-gradient(135deg,#f43f88,#f5c842)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>LiveStar ✦</div>
        <div className="spinner"/>
      </div>
    </>
  )

  // ── AUTH ──
  if (!fbUser) return (
    <>
      <style>{css}</style>
      <div className="auth-wrap">
        <div className="auth-card">
          <div className="auth-logo">LiveStar ✦</div>
          <div className="auth-sub">Live streaming · Gifts · Premium calls</div>
          <div className="auth-tabs">
            <button className={`auth-tab${authMode==="login"?" active":""}`}    onClick={()=>setAuthMode("login")}>Login</button>
            <button className={`auth-tab${authMode==="register"?" active":""}`} onClick={()=>setAuthMode("register")}>Register</button>
          </div>
          <input className="auth-field" type="email"    placeholder="Email address" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
          <input className="auth-field" type="password" placeholder="Password"      value={authPass}  onChange={e=>setAuthPass(e.target.value)}  onKeyDown={e=>e.key==="Enter"&&handleAuth()}/>
          <button className="btn-primary" onClick={handleAuth} disabled={authLoading} style={{marginTop:"0.25rem"}}>
            {authLoading ? "Please wait…" : authMode==="login" ? "Login →" : "Create Account →"}
          </button>
          <p style={{textAlign:"center",color:"var(--muted)",fontSize:"0.75rem",marginTop:"1rem"}}>By continuing you confirm you are 18+</p>
        </div>
      </div>
    </>
  )

  // ── MAIN APP ──
  return (
    <>
      <style>{css}</style>
      <div className="app">

        <div className="toast-wrap">
          {toasts.map(t=><div key={t.id} className="toast">{t.msg}</div>)}
        </div>

        {showBonus && bonusCanClaim && (
          <div className="bonus-modal" onClick={()=>setShowBonus(false)}>
            <div className="bonus-card" onClick={e=>e.stopPropagation()}>
              <div className="bonus-top">
                <div style={{fontSize:"3rem"}}>🎁</div>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.4rem",fontWeight:800,color:"white",marginTop:"0.5rem"}}>Daily Bonus!</div>
                <div style={{color:"rgba(255,255,255,0.7)",fontSize:"0.8rem",marginTop:"0.25rem"}}>Come back every day to earn free coins</div>
              </div>
              <div className="bonus-body">
                <div className="bonus-amount">
                  <div style={{fontSize:"2.5rem",fontFamily:"Syne,sans-serif",fontWeight:800,color:"#f5c842"}}>💎 {DAILY_BONUS}</div>
                  <div style={{color:"var(--muted)",fontSize:"0.75rem",marginTop:"4px"}}>Free coins today</div>
                </div>
                <button className="btn-primary" onClick={claimBonus}>🎁 Claim Free Coins</button>
                <button className="btn-ghost"   onClick={()=>setShowBonus(false)} style={{marginTop:"0.5rem"}}>Later</button>
              </div>
            </div>
          </div>
        )}

        {/* HOME */}
        {screen==="home" && (
          <>
            <div className="header">
              <div className="logo">LiveStar ✦</div>
              <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                {profile?.isAdmin && <div className="icon-btn" onClick={()=>setShowAdmin(true)}>👑</div>}
                <div className="coin-badge" onClick={()=>setScreen("wallet")}>
                  <span>💎</span><span>{(profile?.coins||0).toLocaleString()}</span>
                </div>
                <div className="icon-btn" onClick={()=>{ setShowNotifs(true); markNotifsRead() }}>
                  🔔
                  {unreadCount>0 && <div className="unread-badge">{unreadCount>9?"9+":unreadCount}</div>}
                </div>
              </div>
            </div>

            {bonusCanClaim && (
              <div onClick={()=>setShowBonus(true)} style={{margin:"0 1rem 1rem",background:"linear-gradient(135deg,rgba(244,63,136,0.12),rgba(139,92,246,0.08))",border:"1px solid rgba(244,63,136,0.2)",borderRadius:14,padding:"0.75rem 1rem",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer"}}>
                <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
                  <span style={{fontSize:"1.5rem"}}>🎁</span>
                  <div>
                    <div style={{color:"white",fontWeight:600,fontSize:"0.875rem"}}>Daily Bonus Available!</div>
                    <div style={{color:"var(--muted)",fontSize:"0.75rem"}}>Claim 💎 {DAILY_BONUS} free coins</div>
                  </div>
                </div>
                <span style={{color:"var(--green)",fontWeight:700,fontSize:"0.85rem"}}>Claim →</span>
              </div>
            )}

            {liveUsers.length>0 ? (
              <div style={{marginBottom:"1.25rem"}}>
                <div className="section-label"><div className="live-dot"/>Live Now</div>
                <div className="live-strip">
                  {liveUsers.map(u=>(
                    <div key={u.uid} className="live-card" style={{position:"relative"}}
                      onClick={async()=>{ setLiveHost(u); setLiveHostId(u.uid); setIsOwnLive(false); setShowLive(true); setChatMsgs([]); setViewers(0); await joinLive(u.uid) }}>
                      <img src={u.photoURL||avatarUrl(u.displayName)} alt={u.displayName}/>
                      <div className="live-badge">● LIVE</div>
                      <div className="live-card-name">{(u.displayName||"User").split(" ")[0]}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{margin:"0 1rem 1rem",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"1.25rem",textAlign:"center"}}>
                <div style={{fontSize:"1.75rem",marginBottom:"0.5rem"}}>📡</div>
                <div style={{color:"var(--muted)",fontSize:"0.85rem"}}>No one is live right now</div>
                <div style={{color:"rgba(240,238,255,0.25)",fontSize:"0.75rem",marginTop:"0.25rem"}}>Be the first to go live!</div>
              </div>
            )}

            <button className="go-live-btn" onClick={startLive}><span>📹</span> Start Your Live</button>

            <div className="section-label" style={{marginBottom:"0.75rem"}}>People</div>
            <div className="user-list" style={{paddingBottom:"1rem"}}>
              {otherUsers.length===0 ? (
                <div className="empty-state"><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>👥</div>No other users yet. Invite friends!</div>
              ) : otherUsers.map(u=>(
                <div key={u.uid} className="user-card" onClick={()=>{setSelectedUser(u);setShowUserModal(true)}}>
                  <div className="avatar-wrap">
                    <img src={u.photoURL||avatarUrl(u.displayName)} alt={u.displayName}/>
                    {isOnline(u)&&<div className="online-dot"/>}
                    {u.isPremium&&<div className="crown-badge">👑</div>}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{u.displayName||"User"}</div>
                    <div className="user-bio">{u.bio||"No bio yet"}</div>
                    <div className="user-followers">{(u.followers?.length||0).toLocaleString()} followers</div>
                  </div>
                  {u.gender==="Female" && (
                    <button className="call-chip" onClick={e=>{e.stopPropagation();setCallUser(u);setShowCall(true)}}>📹 Call</button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* WALLET */}
        {screen==="wallet" && (
          <>
            <div className="page-title">💎 Wallet</div>
            <div className="wallet-hero">
              <div style={{color:"var(--muted)",fontSize:"0.75rem",letterSpacing:"0.08em",textTransform:"uppercase"}}>Your Balance</div>
              <div className="wallet-amount">💎 {(profile?.coins||0).toLocaleString()}</div>
              <div style={{color:"var(--muted)",fontSize:"0.875rem",marginTop:"0.25rem"}}>${((profile?.coins||0)/WITHDRAW_RATE).toFixed(2)} USD</div>
              <div style={{fontSize:"0.7rem",color:"rgba(240,238,255,0.25)",marginTop:"2px"}}>{WITHDRAW_RATE} coins = $1.00</div>
            </div>

            <div className="section-card">
              <div className="section-card-title">💸 Withdraw Earnings</div>
              <div style={{fontSize:"0.75rem",color:"var(--muted)",marginBottom:"0.75rem"}}>Minimum: {MIN_WITHDRAW.toLocaleString()} coins (${(MIN_WITHDRAW/WITHDRAW_RATE).toFixed(2)})</div>
              {!usedOffer&&!profile?.isPremium&&(
                <div style={{background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:10,padding:"0.75rem",marginBottom:"0.875rem",fontSize:"0.78rem",color:"#fde68a"}}>
                  ⚠️ Purchase a coin package first to unlock withdrawals
                </div>
              )}
              {(profile?.coins||0)>=MIN_WITHDRAW&&(
                <div className="withdraw-summary">
                  <div style={{fontSize:"0.75rem",color:"var(--muted)",marginBottom:"4px"}}>Ready to withdraw</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.35rem",fontWeight:800,color:"var(--green)"}}>${((profile?.coins||0)/WITHDRAW_RATE).toFixed(2)}</div>
                </div>
              )}
              <input className="input-field" placeholder="Your PayPal email" value={paypalEmail} onChange={e=>setPaypalEmail(e.target.value)} style={{marginBottom:"0.75rem"}}/>
              <button className="btn-primary" onClick={requestWithdraw} disabled={(profile?.coins||0)<MIN_WITHDRAW}>
                {(profile?.coins||0)>=MIN_WITHDRAW ? `💸 Withdraw $${((profile?.coins||0)/WITHDRAW_RATE).toFixed(2)}` : `Need ${MIN_WITHDRAW.toLocaleString()} coins`}
              </button>
            </div>

            {!usedOffer&&(
              <>
                <div style={{padding:"0 1rem",marginBottom:"0.5rem"}}>
                  <span style={{background:"linear-gradient(135deg,#f59e0b,#ef4444)",color:"white",fontSize:"0.65rem",fontWeight:800,padding:"3px 10px",borderRadius:"99px",textTransform:"uppercase",letterSpacing:"0.08em"}}>🔥 First Time Offer</span>
                </div>
                <div className="first-offer-card" onClick={()=>setSelectedPkg({...FIRST_OFFER,isOffer:true})}>
                  <div style={{fontSize:"0.65rem",fontWeight:800,letterSpacing:"0.1em",textTransform:"uppercase",color:"var(--gold)"}}>One-time exclusive</div>
                  <div style={{textDecoration:"line-through",color:"var(--muted)",fontSize:"0.875rem",marginTop:"0.25rem"}}>💎 {FIRST_OFFER.originalCoins.toLocaleString()}</div>
                  <div className="offer-coins">💎 {FIRST_OFFER.coins.toLocaleString()}</div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"0.5rem"}}>
                    <div style={{fontSize:"1rem",fontWeight:600,color:"var(--green)"}}>${FIRST_OFFER.price}.00</div>
                    <div style={{fontSize:"0.7rem",color:"var(--gold)",fontWeight:700}}>28× More Coins!</div>
                  </div>
                </div>
              </>
            )}

            <div style={{padding:"0 1rem",marginBottom:"0.5rem"}}>
              <div style={{fontFamily:"Syne,sans-serif",fontSize:"0.85rem",fontWeight:700}}>Top Up Coins</div>
            </div>
            <div style={{padding:"0 1rem",marginBottom:"1rem"}}>
              <div className="pkg-grid">
                {PACKAGES.map((p,i)=>(
                  <div key={i} className={`pkg-card${selectedPkg?.price===p.price?" selected":""}`}
                    style={{background:`${p.color}18`,borderColor:selectedPkg?.price===p.price?p.color:"transparent"}}
                    onClick={()=>setSelectedPkg(p)}>
                    {p.tag&&<div className="pkg-tag" style={{background:p.color}}>{p.tag}</div>}
                    <div className="pkg-coins">💎 {p.coins.toLocaleString()}</div>
                    <div className="pkg-price">${p.price.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>

            {selectedPkg&&(
              <div style={{margin:"0 1rem 2rem"}}>
                <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"1rem",marginBottom:"0.75rem",textAlign:"center"}}>
                  <div style={{color:"var(--muted)",fontSize:"0.8rem",marginBottom:"4px"}}>You selected</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.25rem",fontWeight:800,color:"var(--gold)"}}>💎 {selectedPkg.coins?.toLocaleString()}</div>
                  <div style={{color:"var(--green)",fontWeight:600}}>${selectedPkg.price?.toFixed(2)}</div>
                </div>
                <div ref={paypalRef} id="paypal-container" style={{background:"white",borderRadius:12,padding:"1rem",minHeight:"50px"}}/>
                <button className="btn-ghost" onClick={()=>setSelectedPkg(null)} style={{marginTop:"0.5rem"}}>Cancel</button>
              </div>
            )}
          </>
        )}

        {/* PREMIUM */}
        {screen==="premium" && (
          <>
            <div className="page-title">👑 Premium</div>
            <div className="premium-hero">
              <div style={{fontSize:"2.5rem"}}>📹</div>
              <div>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:"1rem",fontWeight:800,color:"var(--gold)"}}>Private Video Calls</div>
                <div style={{color:"var(--muted)",fontSize:"0.8rem",marginTop:"0.25rem"}}>1-on-1 with exclusive female hosts</div>
                <div style={{color:"var(--rose)",fontWeight:700,fontSize:"0.85rem",marginTop:"0.25rem"}}>💎 {CALL_RATE.toLocaleString()} coins / minute</div>
              </div>
            </div>
            <div style={{padding:"0 1rem",marginBottom:"0.75rem"}}><div className="section-label">Available Hosts</div></div>
            <div style={{padding:"0 1rem 4rem"}}>
              {users.filter(u=>u.gender==="Female").length===0 ? (
                <div className="empty-state"><div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>📹</div>No female hosts available yet</div>
              ) : users.filter(u=>u.gender==="Female").map(u=>(
                <div key={u.uid} className="host-card" onClick={()=>{setCallUser(u);setShowCall(true)}}>
                  <img src={u.photoURL||avatarUrl(u.displayName)} alt={u.displayName}/>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,display:"flex",alignItems:"center",gap:"0.5rem"}}>{u.displayName}{u.isPremium&&<span style={{color:"#f5c842"}}>👑</span>}</div>
                    <div style={{color:"var(--muted)",fontSize:"0.78rem"}}>{u.bio||"No bio"}</div>
                    <div style={{fontSize:"0.7rem",marginTop:"2px",color:isOnline(u)?"var(--green)":"var(--muted)"}}>{isOnline(u)?"🟢 Online":"⚫ Offline"}</div>
                  </div>
                  <div style={{textAlign:"right"}}><div style={{fontSize:"1.5rem"}}>📹</div><div style={{fontSize:"0.65rem",color:"var(--gold)"}}>{CALL_RATE.toLocaleString()}/min</div></div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* PROFILE */}
        {screen==="profile" && (
          <>
            <div className="profile-hero">
              <div style={{position:"relative"}}>
                <img className="profile-avatar" src={profile?.photoURL||avatarUrl(profile?.displayName)} alt="Profile" onClick={()=>fileInputRef.current?.click()}/>
                <div onClick={()=>fileInputRef.current?.click()} style={{position:"absolute",bottom:0,right:0,width:"1.875rem",height:"1.875rem",background:"var(--rose)",borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:"0.875rem"}}>
                  {uploadingPhoto?"⏳":"📷"}
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={e=>e.target.files?.[0]&&uploadPhoto(e.target.files[0])} style={{display:"none"}}/>
              </div>
              <div className="profile-name">{profile?.displayName||"Your Name"}</div>
              <div style={{color:"var(--muted)",fontSize:"0.85rem",marginTop:"0.25rem"}}>{profile?.email||""}</div>
              <div className="profile-stats">
                <div className="stat-item"><div className="stat-val">💎 {(profile?.coins||0).toLocaleString()}</div><div className="stat-label">Coins</div></div>
                <div className="stat-item"><div className="stat-val">{profile?.followers?.length||0}</div><div className="stat-label">Followers</div></div>
                <div className="stat-item"><div className="stat-val">{profile?.following?.length||0}</div><div className="stat-label">Following</div></div>
              </div>
            </div>
            <div style={{padding:"0 1rem",display:"flex",flexDirection:"column",gap:"0.625rem",marginBottom:"4rem"}}>
              <input className="input-field" placeholder="Display Name" value={editName}    onChange={e=>setEditName(e.target.value)}/>
              <textarea className="input-field" placeholder="Bio" style={{resize:"none",height:"80px"}} value={editBio} onChange={e=>setEditBio(e.target.value)}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.625rem"}}>
                <input className="input-field" placeholder="Age" type="number" value={editAge} onChange={e=>setEditAge(e.target.value)}/>
                <select className="input-field" value={editGender} onChange={e=>setEditGender(e.target.value)}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <input className="input-field" placeholder="Country" value={editCountry} onChange={e=>setEditCountry(e.target.value)}/>
              <input className="input-field" placeholder="City"    value={editCity}    onChange={e=>setEditCity(e.target.value)}/>
              <button className="btn-primary" onClick={saveProfile}>Save Profile</button>
              <button className="btn-ghost" onClick={handleLogout} style={{color:"#ef4444",borderColor:"rgba(239,68,68,0.3)"}}>Logout</button>
            </div>
          </>
        )}

        {/* BOTTOM NAV */}
        <div className="nav">
          {[{id:"home",icon:"🏠",label:"Home"},{id:"wallet",icon:"💎",label:"Wallet"},{id:"premium",icon:"👑",label:"Premium"},{id:"profile",icon:"👤",label:"Profile"}].map(t=>(
            <button key={t.id} className={`nav-btn${screen===t.id?" active":""}`} onClick={()=>setScreen(t.id)}>
              <span className="nav-icon">{t.icon}</span>
              <span className="nav-label">{t.label}</span>
              {screen===t.id&&<div className="nav-bar"/>}
            </button>
          ))}
        </div>

        {/* LIVE SCREEN */}
        {showLive&&(
          <div className="live-screen">
            <div className="live-video-area">
              {isOwnLive ? <div id="live-local"  className="live-video-fill"/> : <div id="live-remote" className="live-video-fill"/>}
              {liveConnecting&&(
                <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:"1rem",zIndex:10}}>
                  <div className="spinner"/><div style={{color:"white",fontSize:"0.9rem"}}>Connecting…</div>
                </div>
              )}
              {!liveConnecting&&(
                <div className="live-placeholder">
                  <img className="live-host-img" src={isOwnLive?profile?.photoURL||avatarUrl(profile?.displayName):liveHost?.photoURL||avatarUrl(liveHost?.displayName)} alt=""/>
                  <div style={{color:"white",fontFamily:"Syne,sans-serif",fontSize:"1rem",fontWeight:700}}>{isOwnLive?"You're Live 🔴":liveHost?.displayName}</div>
                  <div style={{color:"rgba(255,255,255,0.4)",fontSize:"0.8rem"}}>{isOwnLive?"Waiting for viewers…":"Waiting for video…"}</div>
                </div>
              )}
              {flyingGifts.map(g=><div key={g.id} className="flying-gift" style={{left:`${g.x}%`,bottom:"30%"}}>{g.emoji}</div>)}
              <div className="live-top-bar">
                <div className="live-chip">
                  <img src={isOwnLive?profile?.photoURL||avatarUrl(profile?.displayName):liveHost?.photoURL||avatarUrl(liveHost?.displayName)} alt=""/>
                  <span style={{color:"white",fontSize:"0.8rem",fontWeight:600}}>{isOwnLive?"You":liveHost?.displayName?.split(" ")[0]}</span>
                  <span style={{background:"#ef4444",color:"white",fontSize:"0.55rem",fontWeight:800,padding:"1px 6px",borderRadius:"99px"}}>LIVE</span>
                </div>
                <div style={{display:"flex",gap:"0.5rem",alignItems:"center"}}>
                  <div className="viewer-chip">👁 {viewers}</div>
                  <button className="live-exit" onClick={exitLive}>✕</button>
                </div>
              </div>
              {isOwnLive ? (
                <div className="live-bottom">
                  <button className={`ctrl-btn${!micOn?" off":""}`} onClick={toggleMic}>{micOn?"🎤":"🔇"}</button>
                  <button className={`ctrl-btn${!camOn?" off":""}`} onClick={toggleCam}>{camOn?"📹":"📵"}</button>
                </div>
              ) : (
                <div className="live-bottom">
                  <button className="gift-open" onClick={()=>setShowGifts(!showGifts)}>🎁 Send Gift</button>
                </div>
              )}
              {showGifts&&!isOwnLive&&(
                <div className="gift-overlay">
                  <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.75rem",display:"flex",justifyContent:"space-between"}}>
                    <span>Send a Gift</span>
                    <span style={{color:"var(--gold)",fontSize:"0.8rem"}}>💎 {(profile?.coins||0).toLocaleString()}</span>
                  </div>
                  <div className="gift-grid">
                    {GIFTS.map((g,i)=>(
                      <button key={i} className="gift-btn" onClick={()=>sendGift(g)} disabled={(profile?.coins||0)<g.cost}>
                        <span style={{fontSize:"1.5rem"}}>{g.emoji}</span>
                        <span style={{fontSize:"0.6rem",color:"var(--muted)"}}>{g.name}</span>
                        <span className="gift-cost">💎 {g.cost}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="live-chat-area">
              <div className="chat-msgs">
                {chatMsgs.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.3)",fontSize:"0.8rem",padding:"1rem"}}>Be the first to say something!</div>}
                {chatMsgs.map(m=>(
                  <div key={m.id||m.timestamp} className="chat-msg">
                    <img src={m.senderPhoto||avatarUrl(m.senderName)} alt=""/>
                    <div><span className="chat-msg-name">{m.senderName} </span><span className="chat-msg-text">{m.text}</span></div>
                  </div>
                ))}
                <div ref={chatEndRef}/>
              </div>
              <div className="chat-row">
                <input className="chat-input-live" placeholder="Say something…" value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()}/>
                <button className="chat-send" onClick={sendChat}>➤</button>
              </div>
            </div>
          </div>
        )}

        {/* PREMIUM CALL */}
        {showCall&&callUser&&(
          <div style={{position:"fixed",inset:0,zIndex:800,background:"#000",display:"flex",flexDirection:"column"}}>
            <div id="call-remote" style={{flex:1,position:"relative",background:"linear-gradient(180deg,#1a0a2e,#0d0d1a)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden"}}>
              {!callActive&&!callConnecting&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}>
                  <img src={callUser.photoURL||avatarUrl(callUser.displayName)} alt="" style={{width:110,height:110,borderRadius:"50%",border:"3px solid var(--rose)",objectFit:"cover"}}/>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.25rem",fontWeight:800,color:"white"}}>{callUser.displayName}</div>
                  <div style={{color:"rgba(255,255,255,0.6)",fontSize:"0.85rem"}}>💎 {CALL_RATE.toLocaleString()} coins / minute</div>
                  <button className="btn-primary" style={{width:"auto",padding:"0.875rem 2rem"}} onClick={startPremiumCall}>📹 Start Call</button>
                  <button onClick={()=>{setShowCall(false);setCallUser(null)}} style={{background:"none",border:"1px solid rgba(239,68,68,0.4)",color:"#ef4444",padding:"0.6rem 1.5rem",borderRadius:"12px",cursor:"pointer",fontSize:"0.85rem"}}>Cancel</button>
                </div>
              )}
              {callConnecting&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:"1rem"}}><div className="spinner"/><div style={{color:"white"}}>Connecting…</div></div>}
              {callActive&&<div id="call-local" style={{position:"absolute",top:"1rem",right:"1rem",width:80,height:100,borderRadius:12,overflow:"hidden",border:"2px solid var(--rose)",background:"var(--bg3)"}}/>}
              {callActive&&<div style={{position:"absolute",top:"1rem",left:"1rem",background:"rgba(0,0,0,0.6)",padding:"0.4rem 0.75rem",borderRadius:"99px"}}><span style={{fontFamily:"Syne,sans-serif",fontWeight:700,color:"white"}}>{fmt(callTimer)}</span></div>}
              {callActive&&(
                <div style={{position:"absolute",bottom:"1.5rem",left:"50%",transform:"translateX(-50%)",display:"flex",gap:"1rem"}}>
                  <button style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",fontSize:"1.3rem"}} onClick={()=>toast("Mic toggled")}>🎤</button>
                  <button style={{width:60,height:60,borderRadius:"50%",background:"#ef4444",border:"none",cursor:"pointer",fontSize:"1.5rem"}} onClick={endCall}>📞</button>
                  <button style={{width:50,height:50,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"none",cursor:"pointer",fontSize:"1.3rem"}} onClick={()=>toast("Camera toggled")}>📹</button>
                </div>
              )}
            </div>
            {callActive&&(
              <div style={{background:"rgba(0,0,0,0.9)",padding:"0.75rem 1rem",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{color:"var(--muted)",fontSize:"0.8rem"}}>Per minute</span>
                <span style={{color:"var(--gold)",fontWeight:700}}>💎 {CALL_RATE.toLocaleString()}</span>
                <span style={{color:"var(--muted)",fontSize:"0.8rem"}}>Balance: 💎 {(profile?.coins||0).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {/* USER MODAL */}
        {showUserModal&&selectedUser&&(
          <div className="modal-overlay" onClick={()=>setShowUserModal(false)}>
            <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
              <div className="modal-handle"/>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"1.25rem"}}>
                <img src={selectedUser.photoURL||avatarUrl(selectedUser.displayName)} alt="" style={{width:80,height:80,borderRadius:"50%",objectFit:"cover",border:"3px solid var(--rose)"}}/>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.1rem",fontWeight:800,marginTop:"0.75rem"}}>{selectedUser.displayName}</div>
                <div style={{color:"var(--muted)",fontSize:"0.85rem",marginTop:"0.25rem"}}>{selectedUser.bio||"No bio"}</div>
                <div style={{display:"flex",gap:"2rem",marginTop:"0.875rem"}}>
                  <div style={{textAlign:"center"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:800}}>{selectedUser.followers?.length||0}</div><div style={{color:"var(--muted)",fontSize:"0.7rem"}}>Followers</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontFamily:"Syne,sans-serif",fontWeight:800}}>{selectedUser.following?.length||0}</div><div style={{color:"var(--muted)",fontSize:"0.7rem"}}>Following</div></div>
                  <div style={{textAlign:"center"}}><div style={{fontSize:"1.1rem"}}>{isOnline(selectedUser)?"🟢":"⚫"}</div><div style={{color:"var(--muted)",fontSize:"0.7rem"}}>Status</div></div>
                </div>
              </div>
              <div style={{display:"flex",gap:"0.625rem",marginBottom:"0.75rem"}}>
                <button className="btn-primary" style={{flex:1}} onClick={()=>{toggleFollow(selectedUser);toast(profile?.following?.includes(selectedUser.uid)?"Unfollowed":"Following!")}}>
                  {profile?.following?.includes(selectedUser.uid)?"Unfollow":"+ Follow"}
                </button>
                {selectedUser.gender==="Female"&&(
                  <button className="btn-primary" style={{flex:1,background:"linear-gradient(135deg,#f59e0b,#ef4444)",boxShadow:"0 6px 20px rgba(245,158,11,0.3)"}} onClick={()=>{setShowUserModal(false);setCallUser(selectedUser);setShowCall(true)}}>📹 Call</button>
                )}
              </div>
              <button className="btn-ghost" onClick={()=>setShowUserModal(false)}>Close</button>
            </div>
          </div>
        )}

        {/* NOTIFICATIONS */}
        {showNotifs&&(
          <div className="modal-overlay" onClick={()=>setShowNotifs(false)}>
            <div className="modal-sheet" onClick={e=>e.stopPropagation()} style={{maxHeight:"80vh"}}>
              <div className="modal-handle"/>
              <div style={{fontFamily:"Syne,sans-serif",fontWeight:800,fontSize:"1rem",marginBottom:"1rem"}}>🔔 Notifications</div>
              {notifs.length===0 ? <div className="empty-state"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>🔔</div>No notifications yet</div>
              : notifs.map(n=>(
                <div key={n.id} className={`notif-item${!n.read?" unread":""}`}>
                  {n.fromPhoto&&<img src={n.fromPhoto} alt=""/>}
                  <div style={{flex:1}}>
                    <div style={{color:"var(--text)",fontSize:"0.85rem"}}>{n.message}</div>
                    <div style={{color:"var(--muted)",fontSize:"0.7rem",marginTop:"2px"}}>{n.timestamp?.toDate?.()?.toLocaleDateString()||""}</div>
                  </div>
                  {!n.read&&<div style={{width:8,height:8,background:"var(--rose)",borderRadius:"50%",flexShrink:0}}/>}
                </div>
              ))}
              <button className="btn-ghost" onClick={()=>setShowNotifs(false)} style={{marginTop:"0.75rem"}}>Close</button>
            </div>
          </div>
        )}

        {/* ADMIN */}
        {showAdmin&&profile?.isAdmin&&(
          <div className="admin-overlay" onClick={()=>setShowAdmin(false)}>
            <div className="admin-card" onClick={e=>e.stopPropagation()}>
              <div className="admin-top">
                <div style={{fontSize:"2rem"}}>👑</div>
                <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.3rem",fontWeight:800,color:"white",marginTop:"0.5rem"}}>Admin Panel</div>
              </div>
              <div className="admin-body">
                <div style={{background:"rgba(234,179,8,0.1)",border:"1px solid rgba(234,179,8,0.2)",borderRadius:12,padding:"1rem",marginBottom:"1.25rem"}}>
                  <div style={{color:"#fde68a",fontSize:"0.75rem",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>Platform Commission</div>
                  <div style={{fontFamily:"Syne,sans-serif",fontSize:"1.5rem",fontWeight:800,color:"var(--gold)"}}>💎 {platformEarn.toLocaleString()}</div>
                </div>
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.9rem",marginBottom:"0.875rem"}}>Pending Withdrawals ({adminReqs.filter(r=>r.status==="pending").length})</div>
                {adminReqs.filter(r=>r.status==="pending").length===0
                  ? <div className="empty-state"><div style={{fontSize:"2rem",marginBottom:"0.5rem"}}>✅</div>No pending withdrawals</div>
                  : adminReqs.filter(r=>r.status==="pending").map(r=>(
                    <div key={r.id} className="req-card">
                      <div style={{fontWeight:600,color:"var(--text)"}}>{r.displayName}</div>
                      <div style={{color:"var(--green)",fontWeight:700,fontSize:"1rem",margin:"4px 0"}}>{r.amountInDollars}</div>
                      <div style={{color:"var(--muted)",fontSize:"0.78rem"}}>PayPal: {r.paypalEmail}</div>
                      <div style={{color:"var(--muted)",fontSize:"0.73rem",marginBottom:"0.75rem"}}>{r.timestamp?.toDate?.()?.toLocaleDateString()}</div>
                      <div style={{display:"flex",gap:"0.5rem"}}>
                        <button onClick={()=>updateWithdrawal(r.id,"approved")} style={{flex:1,padding:"0.5rem",background:"var(--green)",borderRadius:8,color:"white",border:"none",cursor:"pointer",fontWeight:700}}>✓ Approve</button>
                        <button onClick={()=>updateWithdrawal(r.id,"rejected")} style={{flex:1,padding:"0.5rem",background:"#ef4444",borderRadius:8,color:"white",border:"none",cursor:"pointer",fontWeight:700}}>✗ Reject</button>
                      </div>
                    </div>
                  ))
                }
                <div style={{fontFamily:"Syne,sans-serif",fontWeight:700,fontSize:"0.9rem",margin:"1rem 0 0.875rem"}}>All Users ({users.length+1})</div>
                <div style={{display:"flex",flexDirection:"column",gap:"0.5rem",maxHeight:"200px",overflowY:"auto"}}>
                  {[profile,...users].map(u=>(
                    <div key={u?.uid} style={{display:"flex",alignItems:"center",gap:"0.75rem",background:"var(--surface2)",borderRadius:10,padding:"0.625rem"}}>
                      <img src={u?.photoURL||avatarUrl(u?.displayName)} alt="" style={{width:36,height:36,borderRadius:"50%",objectFit:"cover"}}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:"0.85rem",fontWeight:600}}>{u?.displayName}</div>
                        <div style={{fontSize:"0.7rem",color:"var(--muted)"}}>{u?.email} · 💎 {u?.coins?.toLocaleString()}</div>
                      </div>
                      {u?.isAdmin&&<span style={{fontSize:"0.65rem",background:"rgba(234,179,8,0.2)",color:"#f5c842",padding:"2px 8px",borderRadius:"99px"}}>Admin</span>}
                    </div>
                  ))}
                </div>
                <button className="btn-ghost" onClick={()=>setShowAdmin(false)} style={{marginTop:"1.25rem"}}>Close</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}
