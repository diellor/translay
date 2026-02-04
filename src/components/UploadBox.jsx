import { useState } from 'react';
import {
  Box, Typography, IconButton,
} from '@mui/material';
import AddCircleIcon from '@mui/icons-material/AddCircle';

export default function UploadBox({ onUpload }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      alert('❌ Please upload a PDF file.'); return;
    }
    if (file.size > 200 * 1024 * 1024) {
      alert('❌ File is larger than 29 MB.'); return;
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
        Max size: 200 MB
      </Typography>
    </Box>
  );
}
