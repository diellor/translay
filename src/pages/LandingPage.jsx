// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Grid,
//   Container,
//   Typography,
//   useTheme,
//   useMediaQuery,
//   LinearProgress,
//   Button,
//   FormControl,
//   InputLabel,
//   Select,
//   MenuItem,
// } from '@mui/material';
// import CheckCircleIcon from '@mui/icons-material/CheckCircle';
// import { Player } from '@lottiefiles/react-lottie-player';

// import Navbar     from '../components/Navbar';
// import AcceptBox  from '../components/AcceptBox';
// import UploadBox  from '../components/UploadBox';
// import loadingAni from '../../public/animations/animation.json';

// export default function LandingPage() {
//   const theme    = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down('md'));

//   /* ───────────────────────── state (unchanged) ───────────────────────── */
//   const [accepted,         setAccepted]         = useState(false);
//   const [uploadState,      setUploadState]      = useState('idle');
//   const [uploadProgress,   setUploadProgress]   = useState(0);
//   const [fileId,           setFileId]           = useState(null);
//   const [translationLang,  setTranslationLang]  = useState('');
//   const [translationState, setTranslationState] = useState('idle');
//   const [htmlPreview,      setHtmlPreview]      = useState('');
//   const [pdfUrl,           setPdfUrl]           = useState('');
//   const [txtUrl,           setTxtUrl]           = useState('');

//   /* ───────────────────────── accept terms ─────────────────────────────── */
//   useEffect(() => {
//     if (localStorage.getItem('accepted_terms') === 'true') setAccepted(true);
//   }, []);

//   const handleAccept = () => {
//     localStorage.setItem('accepted_terms', 'true');
//     setAccepted(true);
//   };

//   /* ───────────────────────── upload file (unchanged) ──────────────────── */
//   const handleFileUpload = async (file) => {
//     try {
//       setUploadState('uploading');
//       setUploadProgress(0);

//       const res = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/upload-url');
//       if (!res.ok) throw new Error();
//       const { url, fileId } = await res.json();
//       setFileId(fileId);

//       const xhr = new XMLHttpRequest();
//       xhr.open('PUT', url, true);
//       xhr.setRequestHeader('Content-Type', 'application/pdf');

//       xhr.upload.onprogress = (e) =>
//         e.lengthComputable && setUploadProgress(Math.round((e.loaded / e.total) * 100));

//       xhr.onload  = () => setUploadState(xhr.status === 200 ? 'success' : 'error');
//       xhr.onerror = () => setUploadState('error');
//       xhr.send(file);
//     } catch {
//       setUploadState('error');
//     }
//   };
//   const unlockFull = async () => {
//     if (!fileId) return;
//     try {
//       const res = await fetch(
//         'https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full',
//         {
//           method : 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body   : JSON.stringify({ fileId, language: translationLang, mode: 'full' }),
//         }
//       );
//       if (!res.ok) {
//         const { message } = await res.json();
//         alert(`❌ ${message}`);
//       } else {
//         const { url } = await res.json();
//         if (url) window.open(url, '_blank');
//       }
//     } catch {
//       alert('❌ Something went wrong unlocking the full document.');
//     }
//   };

//   /* ───────────────────────── start translation (unchanged) ────────────── */
//   const startTranslation = async () => {
//     try {
//       /* ───────────────────────── language map (add once) ──────────────────── */
//       // const LANG_MAP = {
//       //   en: 'English',
//       //   fr: 'French',
//       //   de: 'German',
//       //   es: 'Spanish',
//       //   it: 'Italian',
//       // };
//       // translationLang = LANG_MAP[translationLang] ?? translationLang;

//       setTranslationState('loading');
//       console.log("Lang: ",translationLang)
//       const res = await fetch(
//         'https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full',
//         {
//           method : 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body   : JSON.stringify({ fileId, language: translationLang, mode: 'preview' }),
//         }
//       );
//       if (!res.ok) {
//         const { message } = await res.json();
//         setTranslationState('error');
//         alert(`❌ ${message}`);
//       }
//     } catch {
//       setTranslationState('error');
//       alert('❌ Something went wrong starting translation.');
//     }
//   };

//   /* ───────────────────────── polling (original logic) ─────────────────── */
//   /*  🔁  Preview-polling loop — original logic pasted back  */
// useEffect(() => {
//   let interval;
//   let attempts = 0;

//   const checkHtmlReady = async () => {
//     if (!fileId) return;

//     attempts += 1;
//     console.log(`🔍 Checking for preview... Attempt ${attempts}`);

//     try {
//       // HTML
//       const htmlRes = await fetch(
//         `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=html`
//       );
//       if (htmlRes.ok) {
//         const { url: htmlUrl } = await htmlRes.json();
//         const htmlContentRes = await fetch(htmlUrl);
//         if (htmlContentRes.ok) {
//           const html = await htmlContentRes.text();
//           console.log('HTML file content:', html);
//           setHtmlPreview(html);
//           setTranslationState('done');
//         }
//       }

//       // PDF
//       const pdfRes = await fetch(
//         `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf`
//       );
//       if (pdfRes.ok) setPdfUrl((await pdfRes.json()).url);

//       // TXT
//       const txtRes = await fetch(
//         `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=txt`
//       );
//       if (txtRes.ok) setTxtUrl((await txtRes.json()).url);
//     } catch {
//       console.log('🔁 Preview not ready yet.');
//     }
//   };

//   if (uploadState === 'success' && translationState === 'loading') {
//     interval = setInterval(checkHtmlReady, 5000);
//   }

//   /*  When htmlPreview becomes truthy this effect re-runs (because
//       htmlPreview is in the dependency array) and the cleanup below
//       automatically clears the old interval – exactly like in your first build. */
//   return () => clearInterval(interval);
// }, [uploadState, translationState, fileId, htmlPreview]);


//   /* ───────────────────────── helper ───────────────────────────────────── */
//   const gap = theme.spacing(6);            // 48 px gap desktop / 0 mobile

//   /* ───────────────────────── render ───────────────────────────────────── */
//   return (
//     <Box
//       sx={{
//         overflowX : 'hidden',                              // kill sideways scroll
//         minHeight : '100vh',
//         width     : '100vw',
//         display   : 'flex',
//         flexDirection: 'column',
//         background   : 'linear-gradient(135deg,#1e3c72 0%,#2a5298 100%)',
//       }}
//     >
//       <Navbar />

//       <Box
//         sx={{
//           flexGrow : 1,
//           display  : 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           height   : '100vh',
//           mt       : '-64px',            // navbar height
//         }}
//       >
//         <Container maxWidth="lg">
//           <Grid
//             container
//             alignItems="center"
//             wrap={{ xs:'wrap', md:'nowrap' }}
//             sx={{ columnGap:{ xs:0, md:gap } }}
//           >

//             {/* ─────────────── left: card ─────────────── */}
//             <Grid
//               item
//               sx={{
//                 flex: '0 0 360px',            // EXACT original width
//                 width: '100%',
//                 mb: { xs: 4, md: 0 },
//               }}
//             >
//               <Typography
//                 variant="h3"
//                 sx={{ fontFamily:'Montserrat', fontWeight:700, color:'#fff', mb:3, textAlign:'center' }}
//               >
//                 translay.ai
//               </Typography>

//               <Box
//                 sx={{
//                   backgroundColor:'#fff',
//                   borderRadius:3,
//                   boxShadow:4,
//                   p:{ xs:3, sm:4 },
//                   minHeight:'420px',
//                   display:'flex',
//                   flexDirection:'column',
//                   justifyContent:'center',
//                 }}
//               >
//                 {/* ---------- (all conditional UI unchanged) ---------- */}
//                 {!accepted ? (
//                   <AcceptBox onAccept={handleAccept} />
//                 ) : uploadState === 'uploading' ? (
//                   <>
//                     <Typography fontWeight={600} mb={2}>
//                       Uploading: {uploadProgress}%
//                     </Typography>
//                     <LinearProgress
//                       variant="determinate"
//                       value={uploadProgress}
//                       sx={{ width:'100%', height:8, borderRadius:5 }}
//                     />
//                   </>
//                 ) : uploadState === 'success' && translationState === 'idle' ? (
//                   <>
//                     <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
//                       <CheckCircleIcon sx={{ fontSize:40, mr:1, color:'#1976d2' }} />
//                       <Box>
//                         <Typography variant="subtitle1" fontWeight={500}>
//                           File Upload Successful
//                         </Typography>
//                         <Typography variant="h6" fontWeight={700}>
//                           Almost there...
//                         </Typography>
//                       </Box>
//                     </Box>

//                     <FormControl fullWidth sx={{ mt:2, mb:3 }}>
//                       <InputLabel id="lang">Translate to:</InputLabel>
//                       <Select
//                         labelId="lang"
//                         value={translationLang}
//                         label="Translate to"
//                         onChange={(e) => setTranslationLang(e.target.value)}
//                         sx={{ borderRadius:2, boxShadow:'0 4px 10px rgba(0,0,0,.08)' }}
//                       >
//                         <MenuItem value="english">🇬🇧 English</MenuItem>
//                         <MenuItem value="french">🇫🇷 French</MenuItem>
//                         <MenuItem value="german">🇩🇪 German</MenuItem>
//                         <MenuItem value="spanish">🇪🇸 Spanish</MenuItem>
//                         <MenuItem value="italian">🇮🇹 Italian</MenuItem>
//                       </Select>
//                     </FormControl>

//                     <Button
//                       variant="contained"
//                       fullWidth
//                       disabled={!translationLang}
//                       onClick={startTranslation}
//                       sx={{ textTransform:'none', fontWeight:600, py:1.3, borderRadius:'999px' }}
//                     >
//                       Continue
//                     </Button>
//                   </>
//                 ) : uploadState === 'success' && translationState === 'loading' ? (
//                   <>
//                     <Box sx={{ display:'flex', justifyContent:'center', mb:3 }}>
//                       <Player autoplay loop src={loadingAni} style={{ width:'100%', maxWidth:'200px' }} />
//                     </Box>
//                     <Typography variant="h6" fontWeight={600} align="center">
//                       Letting the magic happen...
//                     </Typography>
//                     <Typography variant="body2" color="textSecondary" align="center" mt={1}>
//                       Translating your document preview. This may take a moment.
//                     </Typography>
//                   </>
//                 ) : uploadState === 'success' && translationState === 'done' ? (
//                   <>
//                     <Typography variant="h6" fontWeight={600} align="center" color="primary">
//                       ✅ Preview Ready!
//                     </Typography>
//                     <Typography variant="body2" align="center" mt={1}>
//                       You can now view or download your translated file.
//                     </Typography>

//                     <Button variant="contained" fullWidth sx={{ mt:2 }} onClick={() => window.open(pdfUrl,'_blank')}>
//                       Download PDF
//                     </Button>
//                     <Button variant="outlined" fullWidth sx={{ mt:1 }} onClick={() => window.open(txtUrl,'_blank')}>
//                       Download TXT
//                     </Button>
//                     <Button
//                       variant="text"
//                       fullWidth
//                       sx={{ mt:2 }}
//                       onClick={() => {
//                         setUploadState('idle');
//                         setTranslationState('idle');
//                         setFileId(null);
//                         setTranslationLang('');
//                         setHtmlPreview('');
//                         setPdfUrl('');
//                         setTxtUrl('');
//                       }}
//                     >
//                       Upload Another
//                     </Button>
//                   </>
//                 ) : uploadState === 'success' && translationState === 'error' ? (
//                   <>
//                     <Typography color="error" fontWeight={600} align="center" mb={2}>
//                       ❌ Something went wrong.
//                     </Typography>
//                     <Button variant="outlined" fullWidth onClick={() => setTranslationState('idle')}>
//                       Try Again
//                     </Button>
//                   </>
//                 ) : uploadState === 'error' ? (
//                   <>
//                     <Typography color="error" fontWeight={600} mb={2}>
//                       ❌ Upload failed. Please try again.
//                     </Typography>
//                     <Button variant="outlined" onClick={() => setUploadState('idle')}>
//                       Try Again
//                     </Button>
//                   </>
//                 ) : (
//                   <UploadBox onUpload={handleFileUpload} />
//                 )}
//               </Box>
//             </Grid>

//             {/* ─────────────── right: preview / hero ─────────────── */}
//             <Grid
//               item
//               sx={{
//                 flex: '1 1 0',
//                 display:{ xs:'none', md:'flex' },
//                 justifyContent:'center',
//               }}
//             >
//               {htmlPreview ? (
//                 <Box
//                   sx={{
//                     backgroundColor:'#fff',
//                     borderRadius:2,
//                     p:3,
//                     maxHeight:'80vh',
//                     overflowY:'auto',
//                     width:'100%',
//                     maxWidth:'85ch',      // keeps lines readable
//                     boxShadow:2,
//                     wordBreak:'break-word',
//                     overflowWrap:'anywhere',
//                   }}
//                   dangerouslySetInnerHTML={{ __html: htmlPreview }}
//                 />
//               ) : (
//                 <Box sx={{ opacity:accepted ? 1:0.35, transition:'opacity .6s', maxWidth:'85ch' }}>
//                   <Typography variant="h3" sx={{ fontWeight:800, fontFamily:'Inter', color:'#fff' }}>
//                     AI-powered translations for any PDF
//                   </Typography>
//                   <Typography variant="h6" sx={{ fontFamily:'Inter', fontWeight:600, color:'#fff', mt:1 }}>
//                     from messy PDF to polished translation — in minutes.
//                   </Typography>
//                 </Box>
//               )}
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>
//     </Box>
//   );
// }


import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,        // NEW
  CircularProgress, // NEW
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Player } from '@lottiefiles/react-lottie-player';

import Navbar     from '../components/Navbar';
import AcceptBox  from '../components/AcceptBox';
import UploadBox  from '../components/UploadBox';
import loadingAni from '../../public/animations/animation.json';

export default function LandingPage() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  /* ───────────────────────── state (unchanged) ───────────────────────── */
  const [accepted,         setAccepted]         = useState(false);
  const [uploadState,      setUploadState]      = useState('idle');
  const [uploadProgress,   setUploadProgress]   = useState(0);
  const [fileId,           setFileId]           = useState(null);
  const [translationLang,  setTranslationLang]  = useState('');
  const [translationState, setTranslationState] = useState('idle');   // idle | loading | done | error
  const [htmlPreview,      setHtmlPreview]      = useState('');
  const [pdfUrl,           setPdfUrl]           = useState('');
  const [txtUrl,           setTxtUrl]           = useState('');

  /* ───────── NEW: price & purchase pipeline state ───────── */
  const [price,           setPrice]           = useState(null);           // fetched $ value
  const [purchaseState,   setPurchaseState]   = useState('idle');        // idle | email | processing | success
  const [userEmail,       setUserEmail]       = useState('');
  const [emailValid,      setEmailValid]      = useState(false);

  /* add at top of component, just below other handlers */
  const resetAll = () => {
    setUploadState('idle');
    setTranslationState('idle');
    setPurchaseState('idle');
    setFileId(null);
    setTranslationLang('');
    setHtmlPreview('');
    setPdfUrl('');
    setTxtUrl('');
    setPrice(null);
    setUserEmail('');
    setEmailValid(false);
  };

  /* ───────────────────────── accept terms ─────────────────────────────── */
  useEffect(() => {
    if (localStorage.getItem('accepted_terms') === 'true') setAccepted(true);
  }, []);

  const handleAccept = () => {
    localStorage.setItem('accepted_terms', 'true');
    setAccepted(true);
  };

  /* ───────────────────────── upload file (unchanged) ──────────────────── */
  const handleFileUpload = async (file) => {
    try {
      setUploadState('uploading');
      setUploadProgress(0);

      const res = await fetch('https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/upload-url');
      if (!res.ok) throw new Error();
      const { url, fileId } = await res.json();
      setFileId(fileId);

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', 'application/pdf');

      xhr.upload.onprogress = (e) =>
        e.lengthComputable && setUploadProgress(Math.round((e.loaded / e.total) * 100));

      xhr.onload  = () => setUploadState(xhr.status === 200 ? 'success' : 'error');
      xhr.onerror = () => setUploadState('error');
      xhr.send(file);
    } catch {
      setUploadState('error');
    }
  };

  /* ──────────────── NEW: fetch price when preview ready ─────────────── */
  useEffect(() => {
    const getPrice = async () => {
      if (!fileId || translationState !== 'done') return;

      try {
        const res = await fetch(
          `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/metadata?fileId=${fileId}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();            // { price: 4.99 }  (example)
        setPrice(data.price);
      } catch {
        setPrice(null);            // silently ignore, we’ll hide the button if price isn’t available
      }
    };
    getPrice();
  }, [fileId, translationState]);

  /* ──────────────────────── NEW: unlock & checkout ───────────────────── */
  const handleUnlockClick = () => setPurchaseState('email');

  const handleEmailChange = (e) => {
    const value = e.target.value.trim();
    setUserEmail(value);
    setEmailValid(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value));   // simple RFC-ish test
  };

  const handleSecureCheckout = async () => {
    if (!emailValid || !fileId) return;
    setPurchaseState('processing');
    try {
      const res = await fetch(
        'https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full',
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({
            fileId,
            language : translationLang,
            mode     : 'full',
            email    : userEmail,     // backend can start accepting this later
          }),
        }
      );
      if (!res.ok) throw new Error();
      setPurchaseState('success');
    } catch {
      alert('❌ Something went wrong unlocking the full document.');
      setPurchaseState('idle');
    }
  };

  /* ───────────────────────── start translation (unchanged) ────────────── */
  const startTranslation = async () => {
    try {
      setTranslationState('loading');
      const res = await fetch(
        'https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/unlock-full',
        {
          method : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body   : JSON.stringify({ fileId, language: translationLang, mode: 'preview' }),
        }
      );
      if (!res.ok) {
        const { message } = await res.json();
        setTranslationState('error');
        alert(`❌ ${message}`);
      }
    } catch {
      setTranslationState('error');
      alert('❌ Something went wrong starting translation.');
    }
  };

  /* ───────────────────────── polling (original logic) ─────────────────── */
  useEffect(() => {
    let interval;
    let attempts = 0;

    const checkHtmlReady = async () => {
      if (!fileId) return;
      attempts += 1;

      try {
        // HTML
        const htmlRes = await fetch(
          `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=html`
        );
        if (htmlRes.ok) {
          const { url: htmlUrl } = await htmlRes.json();
          const htmlContentRes = await fetch(htmlUrl);
          if (htmlContentRes.ok) {
            const html = await htmlContentRes.text();
            setHtmlPreview(html);
            setTranslationState('done');
          }
        }

        // PDF & TXT (only needed for internal use; they’re not shown any more)
        const pdfRes = await fetch(
          `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=pdf`
        );
        if (pdfRes.ok) setPdfUrl((await pdfRes.json()).url);

        const txtRes = await fetch(
          `https://0hzrc4zx45.execute-api.eu-west-3.amazonaws.com/get-preview?fileId=${fileId}&type=txt`
        );
        if (txtRes.ok) setTxtUrl((await txtRes.json()).url);
      } catch {
        /* ignore – keep polling */
      }
    };

    if (uploadState === 'success' && translationState === 'loading') {
      interval = setInterval(checkHtmlReady, 5000);
    }
    return () => clearInterval(interval);
  }, [uploadState, translationState, fileId, htmlPreview]);

  /* ───────────────────────── helper ───────────────────────────────────── */
  const gap = theme.spacing(6);

  /* ───────────────────────── render ───────────────────────────────────── */
  return (
    <Box
      sx={{
        overflowX : 'hidden',
        minHeight : '100vh',
        width     : '100vw',
        display   : 'flex',
        flexDirection: 'column',
        background   : 'linear-gradient(135deg,#1e3c72 0%,#2a5298 100%)',
      }}
    >
      <Navbar />

      <Box
        sx={{
          flexGrow : 1,
          display  : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height   : '100vh',
          mt       : '-64px',
        }}
      >
        <Container maxWidth="lg">
          <Grid
            container
            alignItems="center"
            wrap={{ xs:'wrap', md:'nowrap' }}
            sx={{ columnGap:{ xs:0, md:gap } }}
          >
            {/* ─────────────── left: card ─────────────── */}
            <Grid
              item
              sx={{
                flex: '0 0 360px',
                width: '100%',
                mb: { xs: 4, md: 0 },
              }}
            >
              <Typography
                variant="h3"
                sx={{ fontFamily:'Montserrat', fontWeight:700, color:'#fff', mb:3, textAlign:'center' }}
              >
                translay.ai
              </Typography>

              <Box
                sx={{
                  backgroundColor:'#fff',
                  borderRadius:3,
                  boxShadow:4,
                  p:{ xs:3, sm:4 },
                  minHeight:'420px',
                  display:'flex',
                  flexDirection:'column',
                  justifyContent:'center',
                }}
              >
                {/* ============ CONDITIONAL UI ============ */}
                {/* 1. Accept terms */}
                {!accepted && <AcceptBox onAccept={handleAccept} />}

                {/* 2. Uploading */}
                {accepted && uploadState === 'uploading' && (
                  <>
                    <Typography fontWeight={600} mb={2}>
                      Uploading: {uploadProgress}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={uploadProgress}
                      sx={{ width:'100%', height:8, borderRadius:5 }}
                    />
                  </>
                )}

                {/* 3. Upload success – choose language */}
                {uploadState === 'success' && translationState === 'idle' && (
                  <>
                    <Box sx={{ display:'flex', alignItems:'center', mb:2 }}>
                      <CheckCircleIcon sx={{ fontSize:40, mr:1, color:'#1976d2' }} />
                      <Box>
                        <Typography variant="subtitle1" fontWeight={500}>
                          File Upload Successful
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          Almost there...
                        </Typography>
                      </Box>
                    </Box>

                    <FormControl fullWidth sx={{ mt:2, mb:3 }}>
                      <InputLabel id="lang">Translate to:</InputLabel>
                      <Select
                        labelId="lang"
                        value={translationLang}
                        label="Translate to"
                        onChange={(e) => setTranslationLang(e.target.value)}
                        sx={{ borderRadius:2, boxShadow:'0 4px 10px rgba(0,0,0,.08)' }}
                      >
                        <MenuItem value="english">🇬🇧 English</MenuItem>
                        <MenuItem value="french">🇫🇷 French</MenuItem>
                        <MenuItem value="german">🇩🇪 German</MenuItem>
                        <MenuItem value="spanish">🇪🇸 Spanish</MenuItem>
                        <MenuItem value="italian">🇮🇹 Italian</MenuItem>
                      </Select>
                    </FormControl>

                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!translationLang}
                      onClick={startTranslation}
                      sx={{ textTransform:'none', fontWeight:600, py:1.3, borderRadius:'999px' }}
                    >
                      Continue
                    </Button>
                  </>
                )}

                {/* 4. Translating… */}
                {uploadState === 'success' && translationState === 'loading' && (
                  <>
                    <Box sx={{ display:'flex', justifyContent:'center', mb:3 }}>
                      <Player autoplay loop src={loadingAni} style={{ width:'100%', maxWidth:'200px' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} align="center">
                      Letting the magic happen...
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" mt={1}>
                      Translating your document preview. This may take a moment.
                    </Typography>
                  </>
                )}

                {/* 5a. Preview done – price fetched – waiting for purchase */}
                {uploadState === 'success'
                  && translationState === 'done'
                  && purchaseState === 'idle'
                  && price != null && (
                  <>
                    <Typography variant="h6" fontWeight={600} align="center" color="primary" mb={2}>
                      ✅ Preview Ready!
                    </Typography>
                    <Button
                      variant="contained"
                      fullWidth
                      sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}
                      onClick={handleUnlockClick}
                    >
                      UNLOCK FULL&nbsp;—&nbsp;${price}
                    </Button>
                  </>
                )}

                {/* 5b. Collect email */}
                {purchaseState === 'email' && (
                  <>
                    <Typography variant="h6" fontWeight={700} align="center" mb={2}>
                      🎉 Thank you for your trust!
                    </Typography>
                    <Typography variant="body2" align="center" mb={3}>
                      Enter your email below. We’ll send the download link within a few minutes of successful purchase.
                    </Typography>

                    <TextField
                      label="Email address"
                      fullWidth
                      value={userEmail}
                      onChange={handleEmailChange}
                      sx={{ mb:3 }}
                    />

                    <Button
                      variant="contained"
                      fullWidth
                      disabled={!emailValid}
                      onClick={handleSecureCheckout}
                      sx={{ py:1.3, textTransform:'none', fontWeight:600, borderRadius:'999px' }}
                    >
                      Secure checkout
                    </Button>
                  </>
                )}

                {/* 5c. Processing payment */}
                {purchaseState === 'processing' && (
                  <Box display="flex" flexDirection="column" alignItems="center">
                    <CircularProgress sx={{ mb:3 }} />
                    <Typography variant="body1" fontWeight={600}>
                      Processing payment…
                    </Typography>
                  </Box>
                )}

                {/* 5d. Success */}
                {purchaseState === 'success' && (
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

    {/* NEW upload-another button */}
    <Button
      variant="outlined"
      fullWidth
      onClick={resetAll}
      sx={{ textTransform:'none', fontWeight:600 }}
    >
      Upload another file
    </Button>
  </>
)}

                {/* 6. Errors */}
                {uploadState === 'success' && translationState === 'error' && (
                  <>
                    <Typography color="error" fontWeight={600} align="center" mb={2}>
                      ❌ Something went wrong.
                    </Typography>
                    <Button variant="outlined" fullWidth onClick={() => setTranslationState('idle')}>
                      Try Again
                    </Button>
                  </>
                )}

                {uploadState === 'error' && (
                  <>
                    <Typography color="error" fontWeight={600} mb={2}>
                      ❌ Upload failed. Please try again.
                    </Typography>
                    <Button variant="outlined" onClick={() => setUploadState('idle')}>
                      Try Again
                    </Button>
                  </>
                )}

                {/* 7. Default – upload box */}
                {accepted && uploadState === 'idle' && <UploadBox onUpload={handleFileUpload} />}
              </Box>
            </Grid>

            {/* ─────────────── right: preview / hero ─────────────── */}
            <Grid
  item
  sx={{
    flex: '1 1 0',
    display:{ xs:'none', md:'flex' },
    justifyContent:'center',
  }}
>
  {htmlPreview ? (
    /* wrap preview + download buttons together */
    <Box sx={{ width:'100%', maxWidth:'85ch', display:'flex', flexDirection:'column' }}>
      {/* Preview itself */}
      <Box
        sx={{
          backgroundColor:'#fff',
          borderRadius:2,
          p:3,
          maxHeight:'70vh',
          overflowY:'auto',
          boxShadow:2,
          wordBreak:'break-word',
          overflowWrap:'anywhere',
        }}
        dangerouslySetInnerHTML={{ __html: htmlPreview }}
      />

      {/* Download buttons – shown only if URLs are ready */}
      {(pdfUrl || txtUrl) && (
        <Box sx={{ display:'flex', gap:2, mt:2 }}>
          {pdfUrl && (
            <Button
              variant="contained"
              onClick={() => window.open(pdfUrl,'_blank')}
              sx={{ textTransform:'none', fontWeight:600 }}
            >
              Download PDF
            </Button>
          )}
          {txtUrl && (
            <Button
              variant="outlined"
              onClick={() => window.open(txtUrl,'_blank')}
              sx={{ textTransform:'none', fontWeight:600 }}
            >
              Download TXT
            </Button>
          )}
        </Box>
      )}
    </Box>
  ) : (
    /* unchanged hero copy */
    <Box sx={{ opacity:accepted ? 1:0.35, transition:'opacity .6s', maxWidth:'85ch' }}>
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
    </Box>
  );
}
