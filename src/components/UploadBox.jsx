import { useState } from 'react';
import {
  Box, Typography, IconButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { PDFDocument } from 'pdf-lib';

const MAX_PAGES = 50;

export default function UploadBox({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('❌ Please upload a PDF file.'); return;
    }
    if (file.size > 200 * 1024 * 1024) {
      alert('❌ File is larger than 200 MB.'); return;
    }
    try {
      const buf = await file.arrayBuffer();
      const doc = await PDFDocument.load(buf, { ignoreEncryption: true });
      if (doc.getPageCount() > MAX_PAGES) {
        alert(`❌ Document has ${doc.getPageCount()} pages. Maximum allowed is ${MAX_PAGES} pages.`);
        return;
      }
    } catch {
      // If page counting fails, let the backend handle it
    }
    onUpload?.(file);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setIsDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver  = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };

  return (
    <Box onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
         sx={{
           width:'100%', minHeight:'100%', display:'flex', flexDirection:'column',
           alignItems:'center', justifyContent:'center', textAlign:'center',
           border: isDragging ? '2px dashed #1976d2' : '2px dashed transparent',
           transition:'border 0.2s ease-in-out',
         }}>
      <label htmlFor="pdf-upload">
        <IconButton color="primary" component="span" sx={{ fontSize:64 }}
                    aria-label="Add PDF">
          <AddCircleIcon sx={{ fontSize:64 }}/>
        </IconButton>
      </label>
      <input id="pdf-upload" type="file" accept="application/pdf" hidden
             onChange={(e) => handleFile(e.target.files[0])}/>

      <Typography variant="subtitle1" sx={{ fontWeight:500 }}>
        Drop / Add PDF
      </Typography>
      <Typography variant="caption" sx={{ mt:1, color:'#666' }}>
        Max {MAX_PAGES} pages · 200 MB
      </Typography>
    </Box>
  );
}
