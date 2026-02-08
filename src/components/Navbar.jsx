import { useState } from 'react';
import {
  AppBar, Toolbar, Button, IconButton,
  Drawer, List, ListItemButton, ListItemText,
  Box, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { Link as RouterLink, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const links = [
    { label: 'Home',    to: '/' },
    { label: 'About',   to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  const LinkBtn = ({ label, to }) => (
    <Button
      component={RouterLink}
      to={to}
      state={{ fromLanding:true }}
      disableRipple
      sx={{
        px:1.5, fontWeight:600, textTransform:'none', color:'#fff',
        position:'relative', transition:'color .15s ease',
        '&:hover':{ color:'rgba(255,255,255,0.8)', backgroundColor:'transparent' },
        '&:after':{
          content:'""', position:'absolute', left:4, right:4, bottom:4,
          height:2, borderRadius:1, backgroundColor:'#fff',
          opacity: pathname===to ? 1 : 0,
          transform: pathname===to ? 'translateY(0)' : 'translateY(6px)',
          transition:'all .15s ease',
        },
        '&:hover:after':{ opacity:1, transform:'translateY(0)' },
      }}
    >
      {label}
    </Button>
  );

  return (
    <>
      <AppBar position="fixed" elevation={0}
              sx={{ backdropFilter:'blur(6px)', background:'transparent',
                    px:{ xs:2, md:4 } }}>
        <Toolbar disableGutters sx={{ minHeight:64 }}>
          <Typography variant="h6" component={RouterLink} to="/"
                      sx={{ fontWeight:700, color:'#fff', textDecoration:'none', display:{ xs:'block', md:'none' } }}>
            translay.ai
          </Typography>
          <Box sx={{ flexGrow:1 }}/>
          <Box sx={{ display:{ xs:'none', md:'flex' }, gap:2 }}>
            {links.map((l) => <LinkBtn key={l.to} {...l} />)}
          </Box>
          <IconButton edge="end" aria-label="menu"
                      onClick={() => setOpen(true)}
                      sx={{ display:{ md:'none' }, color:'#fff' }}>
            <MenuIcon/>
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}
              slotProps={{ paper:{ sx:{ width:280, backgroundColor:'#fff' } } }}>
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:2, borderBottom:'1px solid rgba(0,0,0,0.08)' }}>
          <Typography variant="h6" sx={{ fontWeight:700, color:'#1976d2' }}>
            translay.ai
          </Typography>
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon/>
          </IconButton>
        </Box>
        <List sx={{ pt:2 }}>
          {links.map((l) => (
            <ListItemButton key={l.to}
                            component={RouterLink}
                            to={l.to}
                            onClick={() => setOpen(false)}
                            sx={{
                              py:2, px:3,
                              borderLeft: pathname===l.to ? '3px solid #1976d2' : '3px solid transparent',
                              backgroundColor: pathname===l.to ? 'rgba(25,118,210,0.04)' : 'transparent',
                              '&:hover':{ backgroundColor:'rgba(25,118,210,0.08)' }
                            }}>
              <ListItemText
                primary={l.label}
                slotProps={{
                  primary: {
                    style: {
                      fontWeight: pathname===l.to ? 700 : 600,
                      color: pathname===l.to ? '#1976d2' : '#333',
                    }
                  }
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}
