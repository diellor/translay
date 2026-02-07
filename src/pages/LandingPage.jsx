import {
  useState, useEffect, useRef, useCallback,
} from 'react';
import {
  Box, Grid, Container, Typography,
  useTheme, LinearProgress, Button, FormControl,
  InputLabel, Select, MenuItem, TextField, CircularProgress, Fade,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Player } from '@lottiefiles/react-lottie-player';

import Navbar     from '../components/Navbar';
import AcceptBox  from '../components/AcceptBox';
import UploadBox  from '../components/UploadBox';
import loadingAni from '../../public/animations/animation.json';

/* helper for safe JSON */
const fetchJsonSafe = async (res) => { try { return await res.json(); } catch { return {}; } };

const MAX_PAGES = 50;

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
  const [translationState, setTranslationState] = useState('idle');
  const [pdfUrl,           setPdfUrl]           = useState('');

  /* price & purchase */
  const [price,         setPrice]         = useState(null);
  const [pageCount,     setPageCount]     = useState(0);
  const [purchaseState, setPurchaseState] = useState('idle');
  const [userEmail,     setUserEmail]     = useState('');
  const [emailValid,    setEmailValid]    = useState(false);
  const [fullDocUrl,    setFullDocUrl]    = useState('');

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
  const [steadyState, setSteadyState] = useState('idle');

  /* ---------- rotating waiting messages -------------------------------------- */
  const waitingMessages = [
    'Extracting text from your PDF…',
    'Almost there…',
    'Letting the magic happen…',
    'We\u2019re working hard to make this even faster…',
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
    setPdfUrl(s.pdfUrl);
    setPrice(s.price); setPurchaseState(s.purchaseState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    saveSession({
      fileId, uploadState, uploadProgress, translationState,
      translationLang, pdfUrl,
      price, purchaseState,
    });
  }, [fileId, uploadState, uploadProgress, translationState, translationLang,
    pdfUrl, price, purchaseState, saveSession]);

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
    clearInterval(rotateRef.current);
    clearTimeout(fadeRef.current);

    setUploadState('idle'); setTranslationState('idle');
    setPurchaseState('idle'); setFileId(null); currentFileIdRef.current = null;
    setTranslationLang(''); setPdfUrl(''); setFullDocUrl('');
    setPrice(null); setPageCount(0); setUserEmail(''); setEmailValid(false);
    setUploadProgress(0); setWaitMsgIdx(0); setFadeIn(true);
    sessionStorage.removeItem('translay_state');
  };
  const handleCancel = resetAll;

  /* ---------------------------------------------------------------------------
     File upload handler
  ---------------------------------------------------------------------------- */
  const handleFileUpload = async (file) => {
    if (file.type !== 'application/pdf') { alert('Please upload a PDF.'); return; }
    if (file.size > 200 * 1024 * 1024)    { alert('File is larger than 200 MB.'); return; }

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
        if (d.pages > MAX_PAGES) {
          alert(`Document has ${d.pages} pages, which exceeds the maximum of ${MAX_PAGES}. Please upload a smaller file.`);
          resetAll();
          return;
        }
        setPrice(d.price);
        setPageCount(d.pages || 0);
      } catch { setPrice(null); setPageCount(0); }
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
      alert('Something went wrong. Please try again.'); setPurchaseState('idle');
    }
  };

  /* ---------------------------------------------------------------------------
     Polling: full document ready after purchase
  ---------------------------------------------------------------------------- */
  useEffect(() => {
    if (purchaseState !== 'success' || !fileId) return;
    const c = makeController();
    let attempts = 0;
    const maxAttempts = 120; // 120 × 5s = 10 min

    const poll = async () => {
      if (attempts >= maxAttempts) return;
      attempts++;
      try {
        const r = await fetch(
          `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf&preview=false`,
          { signal: c.signal }
        );
        if (r.ok) {
          const { url } = await r.json();
          setFullDocUrl(url);
          return; // stop polling
        }
      } catch {}
    };

    poll();
    const id = setInterval(poll, 5000);
    return () => { clearInterval(id); c.abort(); };
  }, [purchaseState, fileId]);

  /* ---------------------------------------------------------------------------
     startTranslation (preview)
  ---------------------------------------------------------------------------- */
  const startTranslation = async () => {
    if (!fileId || !translationLang) return;
    setTranslationState('starting');
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
        setTranslationState('error'); alert(message || 'Server error');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setTranslationState('error'); alert('Failed starting translation.');
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
    const maxAttempts = 72;

    const poll = async () => {
      if (attempts >= maxAttempts) { console.warn('Max polling attempts reached'); return; }
      attempts++;

      try {
        const pdfRes = await fetch(
            `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf`,
            { signal: c.signal }
        );

        if (pdfRes.ok) {
          const { url: newPdfUrl } = await pdfRes.json();
          setPdfUrl(newPdfUrl);
          setTranslationState('done');
          return;
        }
      } catch (err) { console.error('Polling error', err); }
    };

    poll();
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
        setFadeIn(false);
        fadeRef.current = setTimeout(() => {
          setWaitMsgIdx(i => (i + 1) % waitingMessages.length);
          setFadeIn(true);
        }, 500);
      }, 10_000);

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
                                sx={{ mt:2, textTransform:'none', color:'#888' }}>
                          Cancel upload
                        </Button>
                      </>
                  )}

                  {/* 3. Choose language */}
                  {uploadState==='success' && steadyState==='idle' && (
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
                                sx={{ textTransform:'none', fontWeight:600, py:1.3, borderRadius:2 }}>
                          Continue
                        </Button>

                        <Button variant="text" size="small" onClick={handleCancel}
                                sx={{ mt:1, textTransform:'none', color:'#888' }}>
                          Cancel
                        </Button>
                      </>
                  )}

                  {/* 4. Waiting (starting / OCR / translating) */}
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
                                sx={{ mt:2, textTransform:'none', color:'#888' }}>
                          Cancel
                        </Button>
                      </>
                  )}

                  {/* 5. Preview ready */}
                  {uploadState==='success' && steadyState==='done' && purchaseState==='idle' && (
                      pageCount > 5 ? (
                          <>
                            <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
                              Preview Ready ({pageCount} pages total)
                            </Typography>
                            <Button variant="contained" fullWidth onClick={handleUnlockClick}
                                    sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:2 }}>
                              Unlock Full Translation
                            </Button>
                            <Button variant="outlined" fullWidth onClick={resetAll}
                                    sx={{ mt:2, textTransform:'none', fontWeight:600, borderRadius:2 }}>
                              Upload another file
                            </Button>
                          </>
                      ) : (
                          <>
                            <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
                              Translation Complete
                            </Typography>
                            <Button variant="outlined" fullWidth onClick={resetAll}
                                    sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:2 }}>
                              Translate another file
                            </Button>
                          </>
                      )
                  )}

                  {/* 6. Email */}
                  {purchaseState==='email' && (
                      <>
                        <Typography variant="h6" fontWeight={700} align="center" mb={2}>
                          Unlock Full Translation
                        </Typography>
                        <Typography variant="body2" align="center" mb={3}>
                          Enter your email to receive the full translated document.
                        </Typography>
                        <TextField label="Email address" fullWidth value={userEmail} onChange={handleEmailChange}
                                   sx={{ mb:3 }} aria-label="Email address"/>
                        <Button variant="contained" fullWidth disabled={!emailValid} onClick={handleSecureCheckout}
                                sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:2 }}>
                          Start full translation
                        </Button>
                      </>
                  )}

                  {/* 7. Processing */}
                  {purchaseState==='processing' && (
                      <Box display="flex" flexDirection="column" alignItems="center" aria-busy="true">
                        <CircularProgress sx={{ mb:3 }}/>
                        <Typography variant="body1" fontWeight={600}>Starting translation…</Typography>
                      </Box>
                  )}

                  {/* 8. Success — poll for full document */}
                  {purchaseState==='success' && (
                      <>
                        {fullDocUrl ? (
                          <>
                            <Typography variant="h5" fontWeight={700} align="center" color="primary" mb={2}>
                              Your full translation is ready!
                            </Typography>
                            <Button variant="contained" fullWidth
                                    onClick={() => window.open(fullDocUrl, '_blank')}
                                    sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:2, mb:2 }}>
                              Download Full PDF
                            </Button>
                            <Button variant="outlined" fullWidth onClick={resetAll}
                                    sx={{ textTransform:'none', fontWeight:600, borderRadius:2 }}>
                              Upload another file
                            </Button>
                          </>
                        ) : (
                          <>
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <CircularProgress sx={{ mb:3 }}/>
                              <Typography variant="h6" fontWeight={600} align="center" mb={1}>
                                Translating full document...
                              </Typography>
                              <Typography variant="body2" color="textSecondary" align="center">
                                You can wait here and download when ready, or close this page and receive the download link via email (check spam folder).
                              </Typography>
                            </Box>
                          </>
                        )}
                      </>
                  )}

                  {/* ERROR states */}
                  {uploadState==='success' && steadyState==='error' && (
                      <>
                        <Typography color="error" fontWeight={600} align="center" mb={2}>
                          Something went wrong.
                        </Typography>
                        <Button variant="outlined" fullWidth onClick={() => setTranslationState('idle')}
                                sx={{ borderRadius:2 }}>
                          Try Again
                        </Button>
                      </>
                  )}
                  {uploadState==='error' && (
                      <>
                        <Typography color="error" fontWeight={600} mb={2}>
                          Upload failed. Please try again.
                        </Typography>
                        <Button variant="outlined" onClick={() => setUploadState('idle')}
                                sx={{ borderRadius:2 }}>
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
                      <Box sx={{ backgroundColor:'#fff', borderRadius:2, overflow:'hidden', boxShadow:2, height:'70vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
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
                            sx={{ textTransform:'none', fontWeight:600, borderRadius:2 }}
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
                            sx={{ textTransform:'none', fontWeight:600, borderRadius:2 }}
                        >
                          Download DOCX
                        </Button>
                      </Box>
                    </Box>
                ) : (
                    <Box sx={{ opacity:accepted ? 1 : 0.35, transition:'opacity .6s', maxWidth:'85ch' }}>
                      <Typography variant="h3" sx={{ fontWeight:800, fontFamily:'Inter', color:'#fff' }}>
                        AI-powered document translation
                      </Typography>
                      <Typography variant="h6" sx={{ fontFamily:'Inter', fontWeight:400, color:'rgba(255,255,255,0.85)', mt:1 }}>
                        Upload a PDF, pick a language, get a professionally translated document with layout preserved.
                      </Typography>
                    </Box>
                )}
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
  );
}
