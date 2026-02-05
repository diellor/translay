// import React, {
//   useState, useEffect, useRef, useCallback,
// } from 'react';
// import {
//   Box, Grid, Container, Typography,
//   useTheme, useMediaQuery, LinearProgress,
//   Button, FormControl, InputLabel, Select,
//   MenuItem, TextField, CircularProgress,
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { Player } from '@lottiefiles/react-lottie-player';
//
// import Navbar     from '../components/Navbar';
// import AcceptBox  from '../components/AcceptBox';
// import UploadBox  from '../components/UploadBox';
// import InfoBox    from '../components/InfoBox';
// import loadingAni from '../../public/animations/animation.json';
//
// /* helper for safe JSON */
// const fetchJsonSafe = async (res) => { try { return await res.json(); } catch { return {}; } };
//
// export default function LandingPage() {
//   const theme    = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
//
//   /* ---------- core state ---------- */
//   const [accepted,         setAccepted]         = useState(false);
//   const [uploadState,      setUploadState]      = useState('idle');
//   const [uploadProgress,   setUploadProgress]   = useState(0);
//   const [fileId,           setFileId]           = useState(null);
//   const currentFileIdRef   = useRef(null);
//
//   const [translationLang,  setTranslationLang]  = useState('');
//   const [translationState, setTranslationState] = useState('idle');
//   const [htmlPreview,      setHtmlPreview]      = useState('');
//   const [pdfUrl,           setPdfUrl]           = useState('');
//   const [txtUrl,           setTxtUrl]           = useState('');
//
//   /* price & purchase */
//   const [price,         setPrice]         = useState(null);
//   const [purchaseState, setPurchaseState] = useState('idle');
//   const [userEmail,     setUserEmail]     = useState('');
//   const [emailValid,    setEmailValid]    = useState(false);
//
//   /* languages */
//   const [languages, setLanguages] = useState([
//     { code:'english', label:'🇬🇧 English' },
//     { code:'french',  label:'🇫🇷 French'  },
//     { code:'german',  label:'🇩🇪 German'  },
//     { code:'spanish', label:'🇪🇸 Spanish' },
//     { code:'italian', label:'🇮🇹 Italian' },
//   ]);
//
//   /* UI helpers */
//   const [pretendUploading, setPretendUploading] = useState(false);   // fake 10-s phase
//   const pretendTimerRef = useRef(null);
//   const [showInfo, setShowInfo] = useState(false);                   // buffer card
//   const [steadyState, setSteadyState] = useState('idle');            // debounced translationState
//
//   /* ---------- AbortControllers ---------- */
//   const controllers = useRef(new Set());
//   const makeController = () => { const c = new AbortController(); controllers.current.add(c); return c; };
//   useEffect(() => () => {
//     controllers.current.forEach(c => c.abort());
//     clearInterval(pretendTimerRef.current);
//   }, []);
//
//   /* ---------- session restore ---------- */
//   const saveSession = useCallback(o => sessionStorage.setItem('translay_state', JSON.stringify(o)), []);
//   const loadSession = () => { try { return JSON.parse(sessionStorage.getItem('translay_state')) || {}; }
//   catch { return {}; } };
//
//   useEffect(() => {
//     const s = loadSession();
//     if (!s.fileId) return;
//     setFileId(s.fileId); currentFileIdRef.current = s.fileId;
//     setUploadState(s.uploadState); setUploadProgress(s.uploadProgress);
//     setTranslationState(s.translationState); setTranslationLang(s.translationLang);
//     setHtmlPreview(s.htmlPreview); setPdfUrl(s.pdfUrl); setTxtUrl(s.txtUrl);
//     setPrice(s.price); setPurchaseState(s.purchaseState); setShowInfo(s.showInfo);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//
//   useEffect(() => {
//     saveSession({
//       fileId, uploadState, uploadProgress, translationState,
//       translationLang, htmlPreview, pdfUrl, txtUrl,
//       price, purchaseState, showInfo,
//     });
//   }, [fileId, uploadState, uploadProgress, translationState, translationLang,
//     htmlPreview, pdfUrl, txtUrl, price, purchaseState, showInfo, saveSession]);
//
//   /* ---------- accept terms ---------- */
//   useEffect(() => setAccepted(localStorage.getItem('accepted_terms') === 'true'), []);
//   const handleAccept = () => { localStorage.setItem('accepted_terms', 'true'); setAccepted(true); };
//
//   /* ---------- fetch languages ---------- */
//   useEffect(() => { (async () => {
//     const c = makeController();
//     try {
//       const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/languages', { signal:c.signal });
//       if (r.ok) { const d = await r.json(); if (Array.isArray(d)) setLanguages(d); }
//     } catch {} })();
//   }, []);
//
//   /* ---------- reset helper ---------- */
//   const resetAll = () => {
//     setUploadState('idle'); setPretendUploading(false); setTranslationState('idle');
//     setPurchaseState('idle'); setFileId(null); currentFileIdRef.current = null;
//     setTranslationLang(''); setHtmlPreview(''); setPdfUrl(''); setTxtUrl('');
//     setPrice(null); setUserEmail(''); setEmailValid(false); setShowInfo(false);
//     setUploadProgress(0); sessionStorage.removeItem('translay_state');
//   };
//
//   /* ---------- upload handler (with full 10-s fake) ---------- */
//   const handleFileUpload = async (file) => {
//     if (file.type !== 'application/pdf') { alert('❌ Please upload a PDF.'); return; }
//     if (file.size > 29 * 1024 * 1024)    { alert('❌ File is larger than 29 MB.'); return; }
//
//     try {
//       setUploadState('uploading'); setUploadProgress(0);
//
//       const ctrl = makeController();
//       const res  = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/upload-url',
//           { signal: ctrl.signal });
//       if (!res.ok) throw new Error();
//       const { url, fileId: newId } = await res.json();
//       setFileId(newId); currentFileIdRef.current = newId;
//
//       const xhr = new XMLHttpRequest();
//       xhr.open('PUT', url, true);
//       xhr.setRequestHeader('Content-Type', 'application/pdf');
//       xhr.upload.onprogress = e =>
//           e.lengthComputable && setUploadProgress(Math.round((e.loaded / e.total) * 90)); // real phase up to 90 %
//
//       xhr.onload = () => {
//         if (xhr.status !== 200) { setUploadState('error'); return; }
//
//         /* ---- 10-second animated finish ---- */
//         setPretendUploading(true);
//         const startPct  = Math.max(uploadProgress, 90);   // ensure at least 90 %
//         const duration  = 15_000;                         // ms
//         const stepTime  = 200;                            // ms between UI updates
//         const steps     = Math.ceil(duration / stepTime);
//         const increment = (100 - startPct) / steps;
//         let   pct       = startPct;
//         setUploadProgress(pct);
//
//         pretendTimerRef.current = setInterval(() => {
//           pct += increment;
//           setUploadProgress(Math.min(100, pct));
//
//           if (pct >= 100) {
//             clearInterval(pretendTimerRef.current);
//             setPretendUploading(false);
//             setUploadState('success');
//             setShowInfo(true);      // buffer card
//           }
//         }, stepTime);
//       };
//
//       xhr.onerror = () => setUploadState('error');
//       xhr.send(file);
//
//     } catch {
//       setUploadState('error');
//     }
//   };
//
//   /* ---------- debounce translationState to steadyState ---------- */
//   useEffect(() => { const id = setTimeout(() => setSteadyState(translationState), 300);
//         return () => clearTimeout(id); },
//       [translationState]);
//
//   /* ---------- price fetch when preview done ---------- */
//   useEffect(() => {
//     if (!fileId || translationState !== 'done') return;
//     const c = makeController();
//     (async () => {
//       try {
//         const r = await fetch(`https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/metadata?fileId=${fileId}`,
//             { signal:c.signal });
//         if (!r.ok) throw new Error();
//         const d = await r.json();
//         setPrice(d.price);
//       } catch { setPrice(null); }
//     })();
//   }, [fileId, translationState]);
//
//   /* ---------- purchase helpers ---------- */
//   const handleUnlockClick = () => setPurchaseState('email');
//   const handleEmailChange = e => {
//     const v = e.target.value.trim();
//     setUserEmail(v);
//     setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
//   };
//   const handleSecureCheckout = async () => {
//     if (!emailValid || !fileId) return;
//     setPurchaseState('processing');
//     const c = makeController();
//     try {
//       const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
//         method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
//         body: JSON.stringify({ fileId, language:translationLang, mode:'full',
//           email:userEmail, doubleOptIn:true })
//       });
//       if (!r.ok) throw new Error();
//       setPurchaseState('success');
//     } catch {
//       alert('❌ Something went wrong.'); setPurchaseState('idle');
//     }
//   };
//
//   /* ---------- startTranslation (preview) ---------- */
//   const startTranslation = async () => {
//     if (!fileId || !translationLang) return;
//     setTranslationState('loading');
//     const c = makeController();
//     try {
//       const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
//         method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
//         body: JSON.stringify({ fileId, language:translationLang, mode:'preview' })
//       });
//       if (r.status === 202)      setTranslationState('waiting_ocr');
//       else if (r.ok)             setTranslationState('loading');
//       else {
//         const { message } = await fetchJsonSafe(r);
//         setTranslationState('error'); alert(`❌ ${message || 'Server error'}`);
//       }
//     } catch (err) {
//       if (err.name !== 'AbortError') {
//         setTranslationState('error'); alert('❌ Failed starting translation.');
//       }
//     }
//   };
//
//   /* ---------- polling: waiting_ocr ---------- */
//   useEffect(() => {
//     if (translationState !== 'waiting_ocr') return;
//     const c = makeController();
//     const id = setInterval(async () => {
//       try {
//         const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
//           method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
//           body: JSON.stringify({ fileId, language:translationLang, mode:'preview' })
//         });
//         if (r.ok && r.status === 200) setTranslationState('loading');
//       } catch {}
//     }, 5000);
//     return () => { clearInterval(id); c.abort(); };
//   }, [translationState, fileId, translationLang]);
//
//   /* ---------- polling: preview ---------- */
//   useEffect(() => {
//     if (uploadState !== 'success' || translationState !== 'loading') return;
//     const c = makeController();
//     const poll = async () => {
//       try {
//         const htmlRes = await fetch(
//             `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=html`,
//             { signal:c.signal });
//         if (htmlRes.ok) {
//           const { url:htmlUrl } = await htmlRes.json();
//           const htmlCont = await fetch(htmlUrl, { signal:c.signal });
//           if (htmlCont.ok) {
//             setHtmlPreview(await htmlCont.text());
//             setTranslationState('done');
//           }
//         }
//         const [pdfRes, txtRes] = await Promise.all([
//           fetch(`https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf`,
//               { signal:c.signal }),
//           fetch(`https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=txt`,
//               { signal:c.signal }),
//         ]);
//         if (pdfRes.ok) setPdfUrl((await pdfRes.json()).url);
//         if (txtRes.ok) setTxtUrl((await txtRes.json()).url);
//       } catch {}
//     };
//     const id = setInterval(poll, 5000);
//     return () => { clearInterval(id); c.abort(); };
//   }, [uploadState, translationState, fileId]);
//
//   /* ---------- misc ---------- */
//   const gap = theme.spacing(6);
//   const isUploadingPhase = uploadState === 'uploading';
//
//   /* ---------- render ---------- */
//   return (
//       <Box sx={{ overflowX:'hidden', minHeight:'100vh', width:'100vw', display:'flex', flexDirection:'column' }}>
//         <Navbar/>
//         <Box sx={{ flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', mt:'-64px' }}>
//           <Container maxWidth="lg">
//             <Grid container wrap={{ xs:'wrap', md:'nowrap' }} alignItems="center" sx={{ columnGap:{ xs:0, md:gap } }}>
//               {/* LEFT CARD */}
//               <Grid item sx={{ flex:'0 0 360px', width:'100%', mb:{ xs:4, md:0 } }}>
//                 <Typography variant="h3" sx={{ fontFamily:'Montserrat', fontWeight:700,
//                   color:'#fff', mb:3, textAlign:'center' }}>
//                   translay.ai
//                 </Typography>
//
//                 <Box sx={{ backgroundColor:'#fff', borderRadius:3, boxShadow:4, p:{ xs:3, sm:4 },
//                   minHeight:'420px', display:'flex', flexDirection:'column', justifyContent:'center' }}
//                      aria-busy={steadyState==='loading' || steadyState==='waiting_ocr'}>
//
//                   {/* 1. Accept terms */}
//                   {!accepted && <AcceptBox onAccept={handleAccept}/>}
//
//                   {/* 2. Uploading */}
//                   {accepted && isUploadingPhase && (
//                       <>
//                         <Typography fontWeight={600} mb={2} aria-live="polite">
//                           Uploading: {uploadProgress.toFixed(0)}%
//                         </Typography>
//                         <LinearProgress variant="determinate" value={uploadProgress}
//                                         sx={{ width:'100%', height:8, borderRadius:5 }}/>
//                       </>
//                   )}
//
//                   {/* 3. Info buffer */}
//                   {uploadState==='success' && showInfo && <InfoBox onContinue={() => setShowInfo(false)}/>}
//
//                   {/* 4. Choose language */}
//                   {uploadState==='success' && !showInfo && steadyState==='idle' && (
//                       <>
//                         <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
//                           <CheckCircleIcon sx={{ fontSize:40, mr:1, color:'#1976d2' }}/>
//                           <Box>
//                             <Typography variant="subtitle1" fontWeight={500}>File Upload Successful</Typography>
//                             <Typography variant="h6"        fontWeight={700}>Almost there…</Typography>
//                           </Box>
//                         </Box>
//
//                         <FormControl fullWidth sx={{ mt:2, mb:3 }}>
//                           <InputLabel id="lang">Translate to:</InputLabel>
//                           <Select labelId="lang" value={translationLang} label="Translate to"
//                                   onChange={e => setTranslationLang(e.target.value)}
//                                   sx={{ borderRadius:2, boxShadow:'0 4px 10px rgba(0,0,0,.08)' }}>
//                             {languages.map(l => <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>)}
//                           </Select>
//                         </FormControl>
//
//                         <Button variant="contained" fullWidth disabled={!translationLang} onClick={startTranslation}
//                                 sx={{ textTransform:'none', fontWeight:600, py:1.3, borderRadius:'999px' }}>
//                           Continue
//                         </Button>
//                       </>
//                   )}
//
//                   {/* 5. Loading / OCR */}
//                   {uploadState==='success' && (steadyState==='loading' || steadyState==='waiting_ocr') && (
//                       <>
//                         <Box sx={{ display:'flex', justifyContent:'center', mb:3 }}>
//                           <Player autoplay loop src={loadingAni} style={{ width:'100%', maxWidth:'200px' }}
//                                   aria-label="Loading animation"/>
//                         </Box>
//                         <Typography variant="h6" fontWeight={600} align="center" aria-live="polite">
//                           {steadyState==='waiting_ocr' ? 'Running OCR…' : 'Letting the magic happen…'}
//                         </Typography>
//                         <Typography variant="body2" color="textSecondary" align="center" mt={1}>
//                           {steadyState==='waiting_ocr'
//                               ? 'Extracting text — please wait.'
//                               : 'Translating your document preview. This will be done in less than a minute'}
//                         </Typography>
//                       </>
//                   )}
//
//                   {/* 6. Preview ready */}
//                   {uploadState==='success' && steadyState==='done' && purchaseState==='idle' && (
//                       price > 0 ? (
//                           <>
//                             <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
//                               ✅ Preview Ready!
//                             </Typography>
//                             <Button variant="contained" fullWidth onClick={handleUnlockClick}
//                                     sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                               UNLOCK FULL — ${price}
//                             </Button>
//                             <Button variant="outlined" fullWidth onClick={resetAll}
//                                     sx={{ mt:2, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                               Upload another file
//                             </Button>
//                           </>
//                       ) : (
//                           <>
//                             <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
//                               ✅ Preview Ready!
//                             </Typography>
//                             <Button variant="outlined" fullWidth onClick={resetAll}
//                                     sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                               Translate another file
//                             </Button>
//                           </>
//                       )
//                   )}
//
//                   {/* 7. Email */}
//                   {purchaseState==='email' && (
//                       <>
//                         <Typography variant="h6" fontWeight={700} align="center" mb={2}>
//                           🎉 Thank you for your trust!
//                         </Typography>
//                         <Typography variant="body2" align="center" mb={3}>
//                           Enter your email below. We’ll email a confirmation link first,
//                           then send your full document.
//                         </Typography>
//                         <TextField label="Email address" fullWidth value={userEmail} onChange={handleEmailChange}
//                                    sx={{ mb:3 }} aria-label="Email address"/>
//                         <Button variant="contained" fullWidth disabled={!emailValid} onClick={handleSecureCheckout}
//                                 sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                           Secure checkout
//                         </Button>
//                       </>
//                   )}
//
//                   {/* 8. Processing */}
//                   {purchaseState==='processing' && (
//                       <Box display="flex" flexDirection="column" alignItems="center" aria-busy="true">
//                         <CircularProgress sx={{ mb:3 }}/>
//                         <Typography variant="body1" fontWeight={600}>Processing payment…</Typography>
//                       </Box>
//                   )}
//
//                   {/* 9. Success */}
//                   {purchaseState==='success' && (
//                       <>
//                         <Typography variant="h5" fontWeight={700} align="center" color="primary" mb={2}>
//                           🎉 Payment successful!
//                         </Typography>
//                         <Typography variant="body1" align="center" mb={1}>
//                           Your full document will be ready in a few minutes
//                         </Typography>
//                         <Typography variant="body2" align="center" mb={3}>
//                           and delivered to <strong>{userEmail}</strong>.
//                         </Typography>
//                         <Button variant="outlined" fullWidth onClick={resetAll}
//                                 sx={{ textTransform:'none', fontWeight:600 }}>
//                           Upload another file
//                         </Button>
//                       </>
//                   )}
//
//                   {/* ERROR states */}
//                   {uploadState==='success' && steadyState==='error' && (
//                       <>
//                         <Typography color="error" fontWeight={600} align="center" mb={2}>
//                           ❌ Something went wrong.
//                         </Typography>
//                         <Button variant="outlined" fullWidth onClick={() => setTranslationState('idle')}>
//                           Try Again
//                         </Button>
//                       </>
//                   )}
//                   {uploadState==='error' && (
//                       <>
//                         <Typography color="error" fontWeight={600} mb={2}>
//                           ❌ Upload failed. Please try again.
//                         </Typography>
//                         <Button variant="outlined" onClick={() => setUploadState('idle')}>
//                           Try Again
//                         </Button>
//                       </>
//                   )}
//
//                   {/* DEFAULT */}
//                   {accepted && uploadState==='idle' && <UploadBox onUpload={handleFileUpload}/>}
//
//                 </Box>
//               </Grid>
//
//               {/* RIGHT preview / hero */}
//               <Grid item sx={{ flex:'1 1 0', display:{ xs:'none', md:'flex' }, justifyContent:'center' }}>
//                 {htmlPreview ? (
//                     <Box sx={{ width:'100%', maxWidth:'85ch', display:'flex', flexDirection:'column' }}>
//                       <Box sx={{ backgroundColor:'#fff', borderRadius:2, p:3, maxHeight:'70vh',
//                         overflowY:'auto', boxShadow:2, wordBreak:'break-word', overflowWrap:'anywhere' }}
//                            dangerouslySetInnerHTML={{ __html:htmlPreview }} aria-label="Translation preview"/>
//                       {(pdfUrl || txtUrl) && (
//                           <Box sx={{ display:'flex', gap:2, mt:2 }}>
//                             {pdfUrl && (
//                                 <Button variant="contained" onClick={() => window.open(pdfUrl,'_blank')}
//                                         sx={{ textTransform:'none', fontWeight:600 }}>Download PDF</Button>
//                             )}
//                             {txtUrl && (
//                                 <Button variant="outlined" onClick={() => window.open(txtUrl,'_blank')}
//                                         sx={{ textTransform:'none', fontWeight:600 }}>Download TXT</Button>
//                             )}
//                           </Box>
//                       )}
//                     </Box>
//                 ) : (
//                     <Box sx={{ opacity:accepted ? 1 : 0.35, transition:'opacity .6s', maxWidth:'85ch' }}>
//                       <Typography variant="h3" sx={{ fontWeight:800, fontFamily:'Inter', color:'#fff' }}>
//                         AI-powered translations for any PDF
//                       </Typography>
//                       <Typography variant="h6" sx={{ fontFamily:'Inter', fontWeight:600, color:'#fff', mt:1 }}>
//                         from messy PDF to polished translation — in minutes.
//                       </Typography>
//                     </Box>
//                 )}
//               </Grid>
//             </Grid>
//           </Container>
//         </Box>
//       </Box>
//   );
// }
//
//
// import React, {
//   useState, useEffect, useRef, useCallback,
// } from 'react';
// import {
//   Box, Grid, Container, Typography,
//   useTheme, LinearProgress, Button, FormControl,
//   InputLabel, Select, MenuItem, TextField, CircularProgress,
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { Player } from '@lottiefiles/react-lottie-player';
//
// import Navbar     from '../components/Navbar';
// import AcceptBox  from '../components/AcceptBox';
// import UploadBox  from '../components/UploadBox';
// import InfoBox    from '../components/InfoBox';
// import loadingAni from '../../public/animations/animation.json';
//
// /* helper for safe JSON */
// const fetchJsonSafe = async (res) => { try { return await res.json(); } catch { return {}; } };
//
// export default function LandingPage() {
//   const theme = useTheme();
//
//   /* ---------- core state ---------- */
//   /* read “accepted” synchronously to avoid the AcceptBox flash ------------------ */
//   const [accepted, setAccepted] = useState(() => {
//     if (typeof window === 'undefined') return false;
//     return localStorage.getItem('accepted_terms') === 'true';
//   });
//
//   const [uploadState,      setUploadState]      = useState('idle');
//   const [uploadProgress,   setUploadProgress]   = useState(0);
//   const [fileId,           setFileId]           = useState(null);
//   const currentFileIdRef   = useRef(null);
//   const xhrRef             = useRef(null);
//
//   const [translationLang,  setTranslationLang]  = useState('');
//   const [translationState, setTranslationState] = useState('idle'); // 'idle' | 'starting' | 'waiting_ocr' | 'loading' | 'done' | 'error'
//   const [htmlPreview,      setHtmlPreview]      = useState('');
//   const [pdfUrl,           setPdfUrl]           = useState('');
//
//   /* price & purchase */
//   const [price,         setPrice]         = useState(null);
//   const [purchaseState, setPurchaseState] = useState('idle');
//   const [userEmail,     setUserEmail]     = useState('');
//   const [emailValid,    setEmailValid]    = useState(false);
//
//   /* languages (fallback list, overwritten by API) */
//   const [languages, setLanguages] = useState([
//     { code:'english',     label:'🇬🇧 English'     },
//     { code:'french',      label:'🇫🇷 French'      },
//     { code:'german',      label:'🇩🇪 German'      },
//     { code:'spanish',     label:'🇪🇸 Spanish'     },
//     { code:'italian',     label:'🇮🇹 Italian'     },
//     { code:'portuguese',  label:'🇵🇹 Portuguese'  },
//     { code:'dutch',       label:'🇳🇱 Dutch'       },
//     { code:'polish',      label:'🇵🇱 Polish'      },
//     { code:'romanian',    label:'🇷🇴 Romanian'    },
//     { code:'greek',       label:'🇬🇷 Greek'       },
//     { code:'turkish',     label:'🇹🇷 Turkish'     },
//     { code:'russian',     label:'🇷🇺 Russian'     },
//     { code:'swedish',     label:'🇸🇪 Swedish'     },
//   ]);
//
//   /* UI helpers */
//   const [pretendUploading, setPretendUploading] = useState(false);
//   const pretendTimerRef = useRef(null);
//   const [showInfo,    setShowInfo]    = useState(false);
//   const [steadyState, setSteadyState] = useState('idle');   // debounced translationState
//
//   /* rotating waiting messages --------------------------------------------------- */
//   const waitingMessages = [
//     'Extracting text from your PDF…',
//     'Almost there…',
//     'Letting the magic happen…',
//     'We’re working hard to make this even faster…',
//     'Bulk insert is on the way…',
//   ];
//   const [waitMsgIdx, setWaitMsgIdx] = useState(0);
//
//   /* ---------- AbortControllers ---------- */
//   const controllers = useRef(new Set());
//   const makeController = () => { const c = new AbortController(); controllers.current.add(c); return c; };
//   const abortAllControllers = () => {
//     controllers.current.forEach(c => c.abort());
//     controllers.current.clear();
//   };
//   useEffect(() => () => {
//     abortAllControllers();
//     clearInterval(pretendTimerRef.current);
//   }, []);
//
//   /* ---------- session restore -------------------------------------------------- */
//   const saveSession = useCallback(o => sessionStorage.setItem('translay_state', JSON.stringify(o)), []);
//   const loadSession = () => { try { return JSON.parse(sessionStorage.getItem('translay_state')) || {}; }
//   catch { return {}; } };
//
//   useEffect(() => {
//     const s = loadSession();
//     if (!s.fileId) return;
//     setFileId(s.fileId); currentFileIdRef.current = s.fileId;
//     setUploadState(s.uploadState); setUploadProgress(s.uploadProgress);
//     setTranslationState(s.translationState); setTranslationLang(s.translationLang);
//     setHtmlPreview(s.htmlPreview); setPdfUrl(s.pdfUrl);
//     setPrice(s.price); setPurchaseState(s.purchaseState); setShowInfo(s.showInfo);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);
//
//   useEffect(() => {
//     saveSession({
//       fileId, uploadState, uploadProgress, translationState,
//       translationLang, htmlPreview, pdfUrl,
//       price, purchaseState, showInfo,
//     });
//   }, [fileId, uploadState, uploadProgress, translationState, translationLang,
//     htmlPreview, pdfUrl, price, purchaseState, showInfo, saveSession]);
//
//   /* ---------- accept terms ----------------------------------------------------- */
//   const handleAccept = () => { localStorage.setItem('accepted_terms', 'true'); setAccepted(true); };
//
//   /* ---------- fetch languages -------------------------------------------------- */
//   useEffect(() => { (async () => {
//     const c = makeController();
//     try {
//       const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/languages', { signal:c.signal });
//       if (r.ok) { const d = await r.json(); if (Array.isArray(d)) setLanguages(d); }
//     } catch {} })();
//   }, []);
//
//   /* ---------- reset helper (also used for Cancel) ------------------------------ */
//   const resetAll = () => {
//     abortAllControllers();
//     if (xhrRef.current) { try { xhrRef.current.abort(); } catch {} }
//     clearInterval(pretendTimerRef.current);
//
//     setUploadState('idle'); setPretendUploading(false); setTranslationState('idle');
//     setPurchaseState('idle'); setFileId(null); currentFileIdRef.current = null;
//     setTranslationLang(''); setHtmlPreview(''); setPdfUrl('');
//     setPrice(null); setUserEmail(''); setEmailValid(false); setShowInfo(false);
//     setUploadProgress(0); sessionStorage.removeItem('translay_state');
//   };
//   const handleCancel = resetAll;   // semantic alias
//
//   /* ---------- upload handler (with 10-s fake finish) --------------------------- */
//   const handleFileUpload = async (file) => {
//     if (file.type !== 'application/pdf') { alert('❌ Please upload a PDF.'); return; }
//     if (file.size > 29 * 1024 * 1024)    { alert('❌ File is larger than 29 MB.'); return; }
//
//     try {
//       setUploadState('uploading'); setUploadProgress(0);
//
//       const ctrl = makeController();
//       const res  = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/upload-url',
//           { signal: ctrl.signal });
//       if (!res.ok) throw new Error();
//       const { url, fileId: newId } = await res.json();
//       setFileId(newId); currentFileIdRef.current = newId;
//
//       const xhr = new XMLHttpRequest();
//       xhrRef.current = xhr;
//       xhr.open('PUT', url, true);
//       xhr.setRequestHeader('Content-Type', 'application/pdf');
//       xhr.upload.onprogress = e =>
//           e.lengthComputable && setUploadProgress(Math.round((e.loaded / e.total) * 90));
//
//       xhr.onload = () => {
//         if (xhr.status !== 200) { setUploadState('error'); return; }
//
//         /* ---- 10-second finish ---- */
//         setPretendUploading(true);
//         const startPct  = Math.max(uploadProgress, 90);
//         const duration  = 15_000;
//         const stepTime  = 200;
//         const steps     = Math.ceil(duration / stepTime);
//         const increment = (100 - startPct) / steps;
//         let   pct       = startPct;
//         setUploadProgress(pct);
//
//         pretendTimerRef.current = setInterval(() => {
//           pct += increment;
//           setUploadProgress(Math.min(100, pct));
//
//           if (pct >= 100) {
//             clearInterval(pretendTimerRef.current);
//             setPretendUploading(false);
//             setUploadState('success');
//             setShowInfo(true);
//           }
//         }, stepTime);
//       };
//
//       xhr.onerror = () => setUploadState('error');
//       xhr.send(file);
//
//     } catch {
//       setUploadState('error');
//     }
//   };
//
//   /* ---------- debounce translationState --------------------------------------- */
//   useEffect(() => { const id = setTimeout(() => setSteadyState(translationState), 300);
//         return () => clearTimeout(id); },
//       [translationState]);
//
//   /* ---------- price fetch when preview done ----------------------------------- */
//   useEffect(() => {
//     if (!fileId || translationState !== 'done') return;
//     const c = makeController();
//     (async () => {
//       try {
//         const r = await fetch(`https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/metadata?fileId=${fileId}`,
// { signal:c.signal });
// if (!r.ok) throw new Error();
// const d = await r.json();
// setPrice(d.price);
// } catch { setPrice(null); }
// })();
// }, [fileId, translationState]);
//
// /* ---------- purchase helpers ------------------------------------------------ */
// const handleUnlockClick = () => setPurchaseState('email');
// const handleEmailChange = e => {
//   const v = e.target.value.trim();
//   setUserEmail(v);
//   setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
// };
// const handleSecureCheckout = async () => {
//   if (!emailValid || !fileId) return;
//   setPurchaseState('processing');
//   const c = makeController();
//   try {
//     const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
//       method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
//       body: JSON.stringify({ fileId, language:translationLang, mode:'full',
//         email:userEmail, doubleOptIn:true })
//     });
//     if (!r.ok) throw new Error();
//     setPurchaseState('success');
//   } catch {
//     alert('❌ Something went wrong.'); setPurchaseState('idle');
//   }
// };
//
// /* ---------- startTranslation (preview) –- no premature “loading” ------------- */
// const startTranslation = async () => {
//   if (!fileId || !translationLang) return;
//   setTranslationState('starting');          // hide previous screen immediately
//   const c = makeController();
//   try {
//     const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
//       method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
//       body: JSON.stringify({ fileId, language:translationLang, mode:'preview' })
//     });
//     if (r.status === 202)      setTranslationState('waiting_ocr');
//     else if (r.ok)             setTranslationState('loading');
//     else {
//       const { message } = await fetchJsonSafe(r);
//       setTranslationState('error'); alert(`❌ ${message || 'Server error'}`);
//     }
//   } catch (err) {
//     if (err.name !== 'AbortError') {
//       setTranslationState('error'); alert('❌ Failed starting translation.');
//     }
//   }
// };
//
// /* ---------- polling: waiting_ocr ------------------------------------------- */
// useEffect(() => {
//   if (translationState !== 'waiting_ocr') return;
//   const c = makeController();
//   const id = setInterval(async () => {
//     try {
//       const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
//         method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
//         body: JSON.stringify({ fileId, language:translationLang, mode:'preview' })
//       });
//       if (r.ok && r.status === 200) setTranslationState('loading');
//     } catch {}
//   }, 5000);
//   return () => { clearInterval(id); c.abort(); };
// }, [translationState, fileId, translationLang]);
//
// /* ---------- polling: preview ------------------------------------------------ */
// useEffect(() => {
//   if (uploadState !== 'success' || translationState !== 'loading') return;
//   const c = makeController();
//
//   let attempts = 0;
//   const maxAttempts = 12; // 12 * 5s = 1 minute max
//
//   const poll = async () => {
//     if (attempts >= maxAttempts) {
//       console.warn('Max polling attempts reached');
//       return;
//     }
//     attempts++;
//
//     try {
//       // Fetch HTML preview
//       if (!htmlPreview) {
//         const htmlRes = await fetch(
//             `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=html`,
//             { signal: c.signal }
//         );
//         if (htmlRes.ok) {
//           const { url: htmlUrl } = await htmlRes.json();
//           const htmlCont = await fetch(htmlUrl, { signal: c.signal });
//           if (htmlCont.ok) setHtmlPreview(await htmlCont.text());
//         }
//       }
//
//       // Fetch PDF preview
//       if (!pdfUrl) {
//         const pdfRes = await fetch(
//             `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf`,
//             { signal: c.signal }
//         );
//         if (pdfRes.ok) setPdfUrl((await pdfRes.json()).url);
//       }
//
//       // If both are ready, stop polling
//       if (htmlPreview && pdfUrl) setTranslationState('done');
//
//     } catch (err) { console.error('Polling error', err); }
//   };
//
//   const id = setInterval(poll, 5000);
//   return () => { clearInterval(id); c.abort(); };
// }, [uploadState, translationState, fileId, htmlPreview, pdfUrl]);
//
// /* ---------- rotating waiting message ticker --------------------------------- */
// useEffect(() => {
//   if (['waiting_ocr','loading','starting'].includes(translationState)) {
//     const id = setInterval(() =>
//         setWaitMsgIdx(i => (i + 1) % waitingMessages.length), 4000);
//     return () => clearInterval(id);
//   }
//   setWaitMsgIdx(0);
// }, [translationState]);
//
// /* ---------- derived helpers ------------------------------------------------- */
// const gap              = theme.spacing(6);
// const isUploadingPhase = (uploadState === 'uploading' || pretendUploading);
// const isBusyPhase      = isUploadingPhase ||
//     ['loading','waiting_ocr','starting'].includes(steadyState);
//
// /* ---------- render ---------------------------------------------------------- */
// return (
//     <Box sx={{ overflowX:'hidden', minHeight:'100vh', width:'100vw', display:'flex', flexDirection:'column' }}>
//       {!isBusyPhase && <Navbar/>}
//
//       <Box sx={{ flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center',
//         height:'100vh', mt:isBusyPhase ? 0 : '-64px' }}>
//         <Container maxWidth="lg">
//           <Grid container wrap={{ xs:'wrap', md:'nowrap' }} alignItems="center" sx={{ columnGap:{ xs:0, md:gap } }}>
//             {/* LEFT CARD ---------------------------------------------------- */}
//             <Grid item sx={{ flex:'0 0 360px', width:'100%', mb:{ xs:4, md:0 } }}>
//               <Typography variant="h3" sx={{ fontFamily:'Montserrat', fontWeight:700,
//                 color:'#fff', mb:3, textAlign:'center' }}>
//                 translay.ai
//               </Typography>
//
//               <Box sx={{ backgroundColor:'#fff', borderRadius:3, boxShadow:4, p:{ xs:3, sm:4 },
//                 minHeight:'420px', display:'flex', flexDirection:'column', justifyContent:'center' }}
//                    aria-busy={['loading','waiting_ocr','starting'].includes(steadyState)}>
//
//                 {/* 1. Accept terms */}
//                 {!accepted && <AcceptBox onAccept={handleAccept}/>}
//
//                 {/* 2. Uploading */}
//                 {accepted && isUploadingPhase && (
//                     <>
//                       <Typography fontWeight={600} mb={2} aria-live="polite">
//                         Uploading: {uploadProgress.toFixed(0)}%
//                       </Typography>
//                       <LinearProgress variant="determinate" value={uploadProgress}
//                                       sx={{ width:'100%', height:8, borderRadius:5 }}/>
//                       <Button variant="text" size="small" onClick={handleCancel}
//                               sx={{ mt:2, textTransform:'none' }}>
//                         Cancel upload
//                       </Button>
//                     </>
//                 )}
//
//                 {/* 3. Info buffer */}
//                 {uploadState==='success' && showInfo && <InfoBox onContinue={() => setShowInfo(false)}/>}
//
//                 {/* 4. Choose language */}
//                 {uploadState==='success' && !showInfo && steadyState==='idle' && (
//                     <>
//                       <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
//                         <CheckCircleIcon sx={{ fontSize:40, mr:1, color:'#1976d2' }}/>
//                         <Box>
//                           <Typography variant="subtitle1" fontWeight={500}>File Upload Successful</Typography>
//                           <Typography variant="h6"        fontWeight={700}>Almost there…</Typography>
//                         </Box>
//                       </Box>
//
//                       <FormControl fullWidth sx={{ mt:2, mb:3 }}>
//                         <InputLabel id="lang">Translate to:</InputLabel>
//                         <Select labelId="lang" value={translationLang} label="Translate to"
//                                 onChange={e => setTranslationLang(e.target.value)}
//                                 sx={{ borderRadius:2, boxShadow:'0 4px 10px rgba(0,0,0,.08)' }}>
//                           {languages.map(l => <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>)}
//                         </Select>
//                       </FormControl>
//
//                       <Button variant="contained" fullWidth disabled={!translationLang} onClick={startTranslation}
//                               sx={{ textTransform:'none', fontWeight:600, py:1.3, borderRadius:'999px' }}>
//                         Continue
//                       </Button>
//
//                       {/* NEW small cancel button ------------------------------------ */}
//                       <Button variant="text" size="small" onClick={handleCancel}
//                               sx={{ mt:1, textTransform:'none' }}>
//                         Cancel
//                       </Button>
//                     </>
//                 )}
//
//                 {/* 5. Waiting (starting / OCR / translating) -------------------- */}
//                 {uploadState==='success' && ['starting','waiting_ocr','loading'].includes(steadyState) && (
//                     <>
//                       <Box sx={{ display:'flex', justifyContent:'center', mb:3 }}>
//                         <Player autoplay loop src={loadingAni} style={{ width:'100%', maxWidth:'200px' }}
//                                 aria-label="Loading animation"/>
//                       </Box>
//                       <Typography variant="h6" fontWeight={600} align="center" aria-live="polite">
//                         {waitingMessages[waitMsgIdx]}
//                       </Typography>
//                       <Typography variant="body2" color="textSecondary" align="center" mt={1}>
//                         Thanks for your patience – it rarely takes more than a minute.
//                       </Typography>
//                       <Button variant="text" size="small" onClick={handleCancel}
//                               sx={{ mt:2, textTransform:'none' }}>
//                         Cancel
//                       </Button>
//                     </>
//                 )}
//
//                 {/* 6. Preview ready */}
//                 {uploadState==='success' && steadyState==='done' && purchaseState==='idle' && (
//                     price > 0 ? (
//                         <>
//                           <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
//                             ✅ Preview Ready!
//                           </Typography>
//                           <Button variant="contained" fullWidth onClick={handleUnlockClick}
//                                   sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                             UNLOCK FULL — ${price}
//                           </Button>
//                           <Button variant="outlined" fullWidth onClick={resetAll}
//                                   sx={{ mt:2, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                             Upload another file
//                           </Button>
//                         </>
//                     ) : (
//                         <>
//                           <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
//                             ✅ Preview Ready!
//                           </Typography>
//                           <Button variant="outlined" fullWidth onClick={resetAll}
//                                   sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                             Translate another file
//                           </Button>
//                         </>
//                     )
//                 )}
//
//                 {/* 7. Email */}
//                 {purchaseState==='email' && (
//                     <>
//                       <Typography variant="h6" fontWeight={700} align="center" mb={2}>
//                         🎉 Thank you for your trust!
//                       </Typography>
//                       <Typography variant="body2" align="center" mb={3}>
//                         Enter your email below. We’ll email a confirmation link first,
//                         then send your full document.
//                       </Typography>
//                       <TextField label="Email address" fullWidth value={userEmail} onChange={handleEmailChange}
//                                  sx={{ mb:3 }} aria-label="Email address"/>
//                       <Button variant="contained" fullWidth disabled={!emailValid} onClick={handleSecureCheckout}
//                               sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
//                         Secure checkout
//                       </Button>
//                     </>
//                 )}
//
//                 {/* 8. Processing */}
//                 {purchaseState==='processing' && (
//                     <Box display="flex" flexDirection="column" alignItems="center" aria-busy="true">
//                       <CircularProgress sx={{ mb:3 }}/>
//                       <Typography variant="body1" fontWeight={600}>Processing payment…</Typography>
//                     </Box>
//                 )}
//
//                 {/* 9. Success */}
//                 {purchaseState==='success' && (
//                     <>
//                       <Typography variant="h5" fontWeight={700} align="center" color="primary" mb={2}>
//                         🎉 Payment successful!
//                       </Typography>
//                       <Typography variant="body1" align="center" mb={1}>
//                         Your full document will be ready in a few minutes
//                       </Typography>
//                       <Typography variant="body2" align="center" mb={3}>
//                         and delivered to <strong>{userEmail}</strong>.
//                       </Typography>
//                       <Button variant="outlined" fullWidth onClick={resetAll}
//                               sx={{ textTransform:'none', fontWeight:600 }}>
//                         Upload another file
//                       </Button>
//                     </>
//                 )}
//
//                 {/* ERROR states */}
//                 {uploadState==='success' && steadyState==='error' && (
//                     <>
//                       <Typography color="error" fontWeight={600} align="center" mb={2}>
//                         ❌ Something went wrong.
//                       </Typography>
//                       <Button variant="outlined" fullWidth onClick={() => setTranslationState('idle')}>
//                         Try Again
//                       </Button>
//                     </>
//                 )}
//                 {uploadState==='error' && (
//                     <>
//                       <Typography color="error" fontWeight={600} mb={2}>
//                         ❌ Upload failed. Please try again.
//                       </Typography>
//                       <Button variant="outlined" onClick={() => setUploadState('idle')}>
//                         Try Again
//                       </Button>
//                     </>
//                 )}
//
//                 {/* DEFAULT (Add Files) */}
//                 {accepted && uploadState==='idle' && <UploadBox onUpload={handleFileUpload}/>}
//
//               </Box>
//             </Grid>
//
//             {/* RIGHT preview / hero ------------------------------------------------ */}
//             <Grid item sx={{ flex:'1 1 0', display:{ xs:'none', md:'flex' }, justifyContent:'center' }}>
//               {htmlPreview ? (
//                   <Box sx={{ width:'100%', maxWidth:'85ch', display:'flex', flexDirection:'column' }}>
//                     <Box sx={{ backgroundColor:'#fff', borderRadius:2, p:3, maxHeight:'70vh',
//                       overflowY:'auto', boxShadow:2, wordBreak:'break-word', overflowWrap:'anywhere' }}
//                          dangerouslySetInnerHTML={{ __html:htmlPreview }} aria-label="Translation preview"/>
//
//                     {/* Always-visible buttons (disabled until URLs available) */}
//                     <Box sx={{ display:'flex', gap:2, mt:2 }}>
//                       <Button
//                           variant="contained"
//                           disabled={!pdfUrl || steadyState !== 'done'}
//                           onClick={() => pdfUrl && window.open(pdfUrl,'_blank')}
//                           sx={{ textTransform:'none', fontWeight:600 }}
//                       >
//                         Download PDF
//                       </Button>
//                     </Box>
//                   </Box>
//               ) : (
//                   <Box sx={{ opacity:accepted ? 1 : 0.35, transition:'opacity .6s', maxWidth:'85ch' }}>
//                     <Typography variant="h3" sx={{ fontWeight:800, fontFamily:'Inter', color:'#fff' }}>
//                       AI-powered translations for any PDF
//                     </Typography>
//                     <Typography variant="h6" sx={{ fontFamily:'Inter', fontWeight:600, color:'#fff', mt:1 }}>
//                       from messy PDF to polished translation — in minutes.
//                     </Typography>
//                   </Box>
//               )}
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>
//     </Box>
// );
// }
//

import React, {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  Box, Grid, Container, Typography,
  useTheme, LinearProgress, Button, FormControl,
  InputLabel, Select, MenuItem, TextField, CircularProgress, Fade,
  Link,          // only used in the (commented-out) footer links
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Player } from '@lottiefiles/react-lottie-player';

import Navbar     from '../components/Navbar';
import AcceptBox  from '../components/AcceptBox';
import UploadBox  from '../components/UploadBox';
import InfoBox    from '../components/InfoBox';
import loadingAni from '../../public/animations/animation.json';

/* helper for safe JSON */
const fetchJsonSafe = async (res) => { try { return await res.json(); } catch { return {}; } };

export default function LandingPage() {
  const theme = useTheme();

  /* ---------------------------------------------------------------------------
     Core state
  ---------------------------------------------------------------------------- */
  const [accepted] = useState(() =>
      typeof window !== 'undefined' && localStorage.getItem('accepted_terms') === 'true'
  );

  const [uploadState,      setUploadState]      = useState('idle');
  const [uploadProgress,   setUploadProgress]   = useState(0);
  const [fileId,           setFileId]           = useState(null);
  const currentFileIdRef   = useRef(null);
  const xhrRef             = useRef(null);

  const [translationLang,  setTranslationLang]  = useState('');
  const [translationState, setTranslationState] = useState('idle'); // 'idle' | 'starting' | 'waiting_ocr' | 'loading' | 'done' | 'error'
  const [htmlPreview,      setHtmlPreview]      = useState('');
  const [pdfUrl,           setPdfUrl]           = useState('');

  /* price & purchase */
  const [price,         setPrice]         = useState(null);
  const [purchaseState, setPurchaseState] = useState('idle');
  const [userEmail,     setUserEmail]     = useState('');
  const [emailValid,    setEmailValid]    = useState(false);

  /* languages (fallback list, overwritten by API) */
  const [languages, setLanguages] = useState([
    { code:'english',     label:'🇬🇧 English'     },
    { code:'french',      label:'🇫🇷 French'      },
    { code:'german',      label:'🇩🇪 German'      },
    { code:'spanish',     label:'🇪🇸 Spanish'     },
    { code:'italian',     label:'🇮🇹 Italian'     },
    { code:'portuguese',  label:'🇵🇹 Portuguese'  },
    { code:'dutch',       label:'🇳🇱 Dutch'       },
    { code:'polish',      label:'🇵🇱 Polish'      },
    { code:'romanian',    label:'🇷🇴 Romanian'    },
    { code:'greek',       label:'🇬🇷 Greek'       },
    { code:'turkish',     label:'🇹🇷 Turkish'     },
    { code:'russian',     label:'🇷🇺 Russian'     },
    { code:'swedish',     label:'🇸🇪 Swedish'     },
  ]);

  /* UI helpers */
  const [pretendUploading, setPretendUploading] = useState(false);
  const pretendTimerRef = useRef(null);
  const [showInfo,    setShowInfo]    = useState(false);
  const [steadyState, setSteadyState] = useState('idle');   // debounced translationState

  /* ---------- rotating waiting messages -------------------------------------- */
  const waitingMessages = [
    'Extracting text from your PDF…',
    'Almost there…',
    'Letting the magic happen…',
    'We’re working hard to make this even faster…',
    'Bulk insert is on the way…',
  ];
  const [waitMsgIdx, setWaitMsgIdx] = useState(0);
  const [fadeIn,     setFadeIn]     = useState(true);
  const rotateRef    = useRef();
  const fadeRef      = useRef();

  /* ---------------------------------------------------------------------------
     AbortControllers helper
  ---------------------------------------------------------------------------- */
  const controllers = useRef(new Set());
  const makeController = () => { const c = new AbortController(); controllers.current.add(c); return c; };
  const abortAllControllers = () => {
    controllers.current.forEach(c => c.abort());
    controllers.current.clear();
  };
  useEffect(() => () => {
    abortAllControllers();
    clearInterval(pretendTimerRef.current);
    clearInterval(rotateRef.current);
    clearTimeout(fadeRef.current);
  }, []);

  /* ---------------------------------------------------------------------------
     Session restore
  ---------------------------------------------------------------------------- */
  const saveSession = useCallback(o => sessionStorage.setItem('translay_state', JSON.stringify(o)), []);
  const loadSession = () => { try { return JSON.parse(sessionStorage.getItem('translay_state')) || {}; }
  catch { return {}; } };

  useEffect(() => {
    const s = loadSession();
    if (!s.fileId) return;
    setFileId(s.fileId); currentFileIdRef.current = s.fileId;
    setUploadState(s.uploadState); setUploadProgress(s.uploadProgress);
    setTranslationState(s.translationState); setTranslationLang(s.translationLang);
    setHtmlPreview(s.htmlPreview); setPdfUrl(s.pdfUrl);
    setPrice(s.price); setPurchaseState(s.purchaseState); setShowInfo(s.showInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveSession({
      fileId, uploadState, uploadProgress, translationState,
      translationLang, htmlPreview, pdfUrl,
      price, purchaseState, showInfo,
    });
  }, [fileId, uploadState, uploadProgress, translationState, translationLang,
    htmlPreview, pdfUrl, price, purchaseState, showInfo, saveSession]);

  /* ---------------------------------------------------------------------------
     Fetch languages
  ---------------------------------------------------------------------------- */
  useEffect(() => { (async () => {
    const c = makeController();
    try {
      const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/languages', { signal:c.signal });
      if (r.ok) { const d = await r.json(); if (Array.isArray(d)) setLanguages(d); }
    } catch {} })();
  }, []);

  /* ---------------------------------------------------------------------------
     Reset helper
  ---------------------------------------------------------------------------- */
  const resetAll = () => {
    abortAllControllers();
    if (xhrRef.current) { try { xhrRef.current.abort(); } catch {} }
    clearInterval(pretendTimerRef.current);
    clearInterval(rotateRef.current);
    clearTimeout(fadeRef.current);

    setUploadState('idle'); setPretendUploading(false); setTranslationState('idle');
    setPurchaseState('idle'); setFileId(null); currentFileIdRef.current = null;
    setTranslationLang(''); setHtmlPreview(''); setPdfUrl('');
    setPrice(null); setUserEmail(''); setEmailValid(false); setShowInfo(false);
    setUploadProgress(0); setWaitMsgIdx(0); setFadeIn(true);
    sessionStorage.removeItem('translay_state');
  };
  const handleCancel = resetAll;   // semantic alias

  /* ---------------------------------------------------------------------------
     File upload handler (unchanged core logic)
  ---------------------------------------------------------------------------- */
  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') { alert('❌ Please upload a PDF.'); return; }
    if (file.size > 200 * 1024 * 1024)    { alert('❌ File is larger than 200 MB.'); return; }

    try {
      setUploadState('uploading'); setUploadProgress(0);

      const ctrl = makeController();
      const res  = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/upload-url',
          { signal: ctrl.signal });
      if (!res.ok) throw new Error();
      const { url, fileId: newId } = await res.json();
      setFileId(newId); currentFileIdRef.current = newId;

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');
      xhr.upload.onprogress = e =>
          e.lengthComputable && setUploadProgress(Math.round((e.loaded / e.total) * 100));

      xhr.onload = () => {
        if (xhr.status !== 200) { setUploadState('error'); return; }
        setUploadProgress(100);
        setUploadState('success');
      };

      xhr.onerror = () => setUploadState('error');
      xhr.send(file);

    } catch {
      setUploadState('error');
    }
  };

  /* ---------------------------------------------------------------------------
     Debounce translationState -> steadyState
  ---------------------------------------------------------------------------- */
  useEffect(() => { const id = setTimeout(() => setSteadyState(translationState), 300);
        return () => clearTimeout(id); },
      [translationState]);

  /* ---------------------------------------------------------------------------
     Price fetch when preview done
  ---------------------------------------------------------------------------- */
  useEffect(() => {
    if (!fileId || translationState !== 'done') return;
    const c = makeController();
    (async () => {
      try {
        const r = await fetch(`https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/metadata?fileId=${fileId}`,
            { signal:c.signal });
        if (!r.ok) throw new Error();
        const d = await r.json();
        setPrice(d.price);
      } catch { setPrice(null); }
    })();
  }, [fileId, translationState]);

  /* ---------------------------------------------------------------------------
     Purchase helpers
  ---------------------------------------------------------------------------- */
  const handleUnlockClick = () => setPurchaseState('email');
  const handleEmailChange = e => {
    const v = e.target.value.trim();
    setUserEmail(v);
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
  };
  const handleSecureCheckout = async () => {
    if (!emailValid || !fileId) return;
    setPurchaseState('processing');
    const c = makeController();
    try {
      const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
        method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
        body: JSON.stringify({ fileId, language:translationLang, mode:'full',
          email:userEmail, doubleOptIn:true })
      });
      if (!r.ok) throw new Error();
      setPurchaseState('success');
    } catch {
      alert('❌ Something went wrong.'); setPurchaseState('idle');
    }
  };

  /* ---------------------------------------------------------------------------
     startTranslation (preview) – avoids premature “loading” flash
  ---------------------------------------------------------------------------- */
  const startTranslation = async () => {
    if (!fileId || !translationLang) return;
    setTranslationState('starting');          // hide previous screen immediately
    const c = makeController();
    try {
      const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
        method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
        body: JSON.stringify({ fileId, language:translationLang, mode:'preview' })
      });
      if (r.status === 202)      setTranslationState('waiting_ocr');
      else if (r.ok)             setTranslationState('loading');
      else {
        const { message } = await fetchJsonSafe(r);
        setTranslationState('error'); alert(`❌ ${message || 'Server error'}`);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setTranslationState('error'); alert('❌ Failed starting translation.');
      }
    }
  };

  /* ---------------------------------------------------------------------------
     Polling: waiting_ocr -> loading
  ---------------------------------------------------------------------------- */
  useEffect(() => {
    if (translationState !== 'waiting_ocr') return;
    const c = makeController();
    const id = setInterval(async () => {
      try {
        const r = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full', {
          method:'POST', headers:{'Content-Type':'application/json'}, signal:c.signal,
          body: JSON.stringify({ fileId, language:translationLang, mode:'preview' })
        });
        if (r.ok && r.status === 200) setTranslationState('loading');
      } catch {}
    }, 5000);
    return () => { clearInterval(id); c.abort(); };
  }, [translationState, fileId, translationLang]);

  /* ---------------------------------------------------------------------------
     Polling: preview ready
  ---------------------------------------------------------------------------- */
  useEffect(() => {
    if (uploadState !== 'success' || translationState !== 'loading') return;
    const c = makeController();

    let attempts = 0;
    const maxAttempts = 72; // 72 × 5s = 6 min max (translation can take 5+ min)

    const poll = async () => {
      if (attempts >= maxAttempts) {
        console.warn('Max polling attempts reached');
        return;
      }
      attempts++;

      try {
        // Poll for PDF preview (DOCX flow - no HTML needed)
        const pdfRes = await fetch(
            `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf`,
            { signal: c.signal }
        );

        if (pdfRes.ok) {
          const { url: newPdfUrl } = await pdfRes.json();
          setPdfUrl(newPdfUrl);
          setTranslationState('done');
          return; // Stop polling
        }
      } catch (err) { console.error('Polling error', err); }
    };

    poll(); // Run immediately on first load
    const id = setInterval(poll, 5000);
    return () => { clearInterval(id); c.abort(); };
  }, [uploadState, translationState, fileId]);

  /* ---------------------------------------------------------------------------
     Waiting-message rotation with fade effect
  ---------------------------------------------------------------------------- */
  useEffect(() => {
    if (['starting','waiting_ocr','loading'].includes(translationState)) {
      setWaitMsgIdx(0); setFadeIn(true);

      rotateRef.current = setInterval(() => {
        setFadeIn(false);          // fade-out
        fadeRef.current = setTimeout(() => {
          setWaitMsgIdx(i => (i + 1) % waitingMessages.length);
          setFadeIn(true);         // fade-in
        }, 500);                   // matches <Fade timeout>
      }, 10_000);                  // each message stays 10 s

      return () => {
        clearInterval(rotateRef.current);
        clearTimeout(fadeRef.current);
      };
    }
    clearInterval(rotateRef.current);
    clearTimeout(fadeRef.current);
  }, [translationState]);

  /* ---------------------------------------------------------------------------
     Derived helpers
  ---------------------------------------------------------------------------- */
  const gap              = theme.spacing(6);
  const isUploadingPhase = uploadState === 'uploading';
  const isBusyPhase      = isUploadingPhase ||
      ['loading','waiting_ocr','starting'].includes(steadyState);

  /* ---------------------------------------------------------------------------
     Render
  ---------------------------------------------------------------------------- */
  return (
      <Box sx={{ overflowX:'hidden', minHeight:'100vh', width:'100vw', display:'flex', flexDirection:'column' }}>
        {!isBusyPhase && <Navbar/>}

        <Box sx={{ flexGrow:1, display:'flex', alignItems:'center', justifyContent:'center',
          height:'100vh', mt:isBusyPhase ? 0 : '-64px' }}>
          <Container maxWidth="lg">
            <Grid container wrap={{ xs:'wrap', md:'nowrap' }} alignItems="center" sx={{ columnGap:{ xs:0, md:gap } }}>
              {/* LEFT CARD ---------------------------------------------------- */}
              <Grid item sx={{ flex:'0 0 360px', width:'100%', mb:{ xs:4, md:0 } }}>
                <Typography variant="h3" sx={{ fontFamily:'Montserrat', fontWeight:700,
                  color:'#fff', mb:3, textAlign:'center' }}>
                  translay.ai
                </Typography>

                <Box sx={{ backgroundColor:'#fff', borderRadius:3, boxShadow:4, p:{ xs:3, sm:4 },
                  minHeight:'420px', display:'flex', flexDirection:'column', justifyContent:'center' }}
                     aria-busy={['loading','waiting_ocr','starting'].includes(steadyState)}>

                  {/* 1. Accept terms */}
                  {!accepted && <AcceptBox onAccept={() => {localStorage.setItem('accepted_terms','true'); location.reload();}}/>}

                  {/* 2. Uploading */}
                  {accepted && isUploadingPhase && (
                      <>
                        <Typography fontWeight={600} mb={2} aria-live="polite">
                          Uploading: {uploadProgress.toFixed(0)}%
                        </Typography>
                        <LinearProgress variant="determinate" value={uploadProgress}
                                        sx={{ width:'100%', height:8, borderRadius:5 }}/>
                        <Button variant="text" size="small" onClick={handleCancel}
                                sx={{ mt:2, textTransform:'none' }}>
                          Cancel upload
                        </Button>
                      </>
                  )}

                  {/* 3. Info buffer */}
                  {uploadState==='success' && showInfo && <InfoBox onContinue={() => setShowInfo(false)}/>}

                  {/* 4. Choose language */}
                  {uploadState==='success' && !showInfo && steadyState==='idle' && (
                      <>
                        <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
                          <CheckCircleIcon sx={{ fontSize:40, mr:1, color:'#1976d2' }}/>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={500}>File Upload Successful</Typography>
                            <Typography variant="h6"        fontWeight={700}>Almost there…</Typography>
                          </Box>
                        </Box>

                        <FormControl fullWidth sx={{ mt:2, mb:3 }}>
                          <InputLabel id="lang">Translate to:</InputLabel>
                          <Select labelId="lang" value={translationLang} label="Translate to"
                                  onChange={e => setTranslationLang(e.target.value)}
                                  sx={{ borderRadius:2, boxShadow:'0 4px 10px rgba(0,0,0,.08)' }}>
                            {languages.map(l => <MenuItem key={l.code} value={l.code}>{l.label}</MenuItem>)}
                          </Select>
                        </FormControl>

                        <Button variant="contained" fullWidth disabled={!translationLang} onClick={startTranslation}
                                sx={{ textTransform:'none', fontWeight:600, py:1.3, borderRadius:'999px' }}>
                          Continue
                        </Button>

                        {/* small Cancel button */}
                        <Button variant="text" size="small" onClick={handleCancel}
                                sx={{ mt:1, textTransform:'none' }}>
                          Cancel
                        </Button>
                      </>
                  )}

                  {/* 5. Waiting (starting / OCR / translating) -------------------- */}
                  {uploadState==='success' && ['starting','waiting_ocr','loading'].includes(steadyState) && (
                      <>
                        <Box sx={{ display:'flex', justifyContent:'center', mb:3 }}>
                          <Player autoplay loop src={loadingAni} style={{ width:'100%', maxWidth:'200px' }}
                                  aria-label="Loading animation"/>
                        </Box>

                        <Fade in={fadeIn} timeout={500} key={waitMsgIdx}>
                          <Typography variant="h6" fontWeight={600} align="center"
                                      sx={{ minHeight:24 }} aria-live="polite">
                            {waitingMessages[waitMsgIdx]}
                          </Typography>
                        </Fade>

                        <Typography variant="body2" color="textSecondary" align="center" mt={1}>
                          Thanks for your patience – it rarely takes more than a minute.
                        </Typography>
                        <Button variant="text" size="small" onClick={handleCancel}
                                sx={{ mt:2, textTransform:'none' }}>
                          Cancel
                        </Button>
                      </>
                  )}

                  {/* 6. Preview ready */}
                  {uploadState==='success' && steadyState==='done' && purchaseState==='idle' && (
                      price > 0 ? (
                          <>
                            <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
                              ✅ Preview Ready!
                            </Typography>
                            <Button variant="contained" fullWidth onClick={handleUnlockClick}
                                    sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
                              UNLOCK FULL — ${price}
                            </Button>
                            <Button variant="outlined" fullWidth onClick={resetAll}
                                    sx={{ mt:2, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
                              Upload another file
                            </Button>
                          </>
                      ) : (
                          <>
                            <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
                              ✅ Preview Ready!
                            </Typography>
                            <Button variant="outlined" fullWidth onClick={resetAll}
                                    sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
                              Translate another file
                            </Button>
                          </>
                      )
                  )}

                  {/* 7. Email */}
                  {purchaseState==='email' && (
                      <>
                        <Typography variant="h6" fontWeight={700} align="center" mb={2}>
                          🎉 Thank you for your trust!
                        </Typography>
                        <Typography variant="body2" align="center" mb={3}>
                          Enter your email below. We’ll email a confirmation link first,
                          then send your full document.
                        </Typography>
                        <TextField label="Email address" fullWidth value={userEmail} onChange={handleEmailChange}
                                   sx={{ mb:3 }} aria-label="Email address"/>
                        <Button variant="contained" fullWidth disabled={!emailValid} onClick={handleSecureCheckout}
                                sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}>
                          Secure checkout
                        </Button>
                      </>
                  )}

                  {/* 8. Processing */}
                  {purchaseState==='processing' && (
                      <Box display="flex" flexDirection="column" alignItems="center" aria-busy="true">
                        <CircularProgress sx={{ mb:3 }}/>
                        <Typography variant="body1" fontWeight={600}>Processing payment…</Typography>
                      </Box>
                  )}

                  {/* 9. Success */}
                  {purchaseState==='success' && (
                      <>
                        <Typography variant="h5" fontWeight={700} align="center" color="primary" mb={2}>
                          🎉 Payment successful!
                        </Typography>
                        <Typography variant="body1" align="center" mb={1}>
                          Your full document will be ready in a few minutes
                        </Typography>
                        <Typography variant="body2" align="center" mb={3}>
                          and delivered to <strong>{userEmail}</strong>.
                        </Typography>
                        <Button variant="outlined" fullWidth onClick={resetAll}
                                sx={{ textTransform:'none', fontWeight:600 }}>
                          Upload another file
                        </Button>
                      </>
                  )}

                  {/* ERROR states */}
                  {uploadState==='success' && steadyState==='error' && (
                      <>
                        <Typography color="error" fontWeight={600} align="center" mb={2}>
                          ❌ Something went wrong.
                        </Typography>
                        <Button variant="outlined" fullWidth onClick={() => setTranslationState('idle')}>
                          Try Again
                        </Button>
                      </>
                  )}
                  {uploadState==='error' && (
                      <>
                        <Typography color="error" fontWeight={600} mb={2}>
                          ❌ Upload failed. Please try again.
                        </Typography>
                        <Button variant="outlined" onClick={() => setUploadState('idle')}>
                          Try Again
                        </Button>
                      </>
                  )}

                  {/* DEFAULT (Add Files) */}
                  {accepted && uploadState==='idle' && <UploadBox onUpload={handleFileUpload}/>}

                </Box>
              </Grid>

              {/* RIGHT preview / hero ------------------------------------------------ */}
              <Grid item sx={{ flex:'1 1 0', display:{ xs:'none', md:'flex' }, justifyContent:'center' }}>
                {pdfUrl ? (
                    <Box sx={{ width:'100%', maxWidth:'85ch', display:'flex', flexDirection:'column' }}>
                      {/* PDF preview embed */}
                      <Box sx={{ backgroundColor:'#fff', borderRadius:2, overflow:'hidden', boxShadow:2, height:'70vh' }}>
                        <iframe
                          src={pdfUrl}
                          style={{ width:'100%', height:'100%', border:'none' }}
                          title="Translation preview"
                        />
                      </Box>

                      {/* Download buttons */}
                      <Box sx={{ display:'flex', gap:2, mt:2 }}>
                        <Button
                            variant="contained"
                            disabled={steadyState !== 'done'}
                            onClick={() => window.open(pdfUrl,'_blank')}
                            sx={{ textTransform:'none', fontWeight:600 }}
                        >
                          Download PDF
                        </Button>
                        <Button
                            variant="outlined"
                            disabled={steadyState !== 'done'}
                            onClick={async () => {
                              try {
                                const res = await fetch(`https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=docx`);
                                if (res.ok) {
                                  const { url } = await res.json();
                                  window.open(url, '_blank');
                                }
                              } catch (e) { console.error('DOCX download error', e); }
                            }}
                            sx={{ textTransform:'none', fontWeight:600 }}
                        >
                          Download DOCX
                        </Button>
                      </Box>
                    </Box>
                ) : (
                    <Box sx={{ opacity:accepted ? 1 : 0.35, transition:'opacity .6s', maxWidth:'85ch' }}>
                      <Typography variant="h3" sx={{ fontWeight:800, fontFamily:'Inter', color:'#fff' }}>
                        AI-powered translations for any PDF
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily:'Inter', fontWeight:600, color:'#fff', mt:1 }}>
                        from messy PDF to polished translation — in minutes.
                      </Typography>
                    </Box>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Footer links (optional) */}
        {/* {accepted && uploadState==='idle' && (
            <Box sx={{
              position:'fixed', bottom:24, left:0, right:0,
              display:'flex', justifyContent:'center', alignItems:'center',
            }}>
              <Typography
                  variant="caption"
                  sx={{ color:'#fff', textAlign:'center', opacity:0.7 }}
              >
                <Link component={RouterLink} to="/terms" underline="always" sx={{ fontWeight:600, color:'#fff' }}>
                  Terms&nbsp;of&nbsp;Service
                </Link>
                &nbsp;and&nbsp;
                <Link component={RouterLink} to="/privacy" underline="always" sx={{ fontWeight:600, color:'#fff' }}>
                  Privacy&nbsp;Policy
                </Link>
              </Typography>
            </Box>
        )} */}
      </Box>
  );
}
