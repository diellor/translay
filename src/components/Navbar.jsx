// src/components/Navbar.jsx
import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  IconButton,
  Drawer,
  ListItemButton,
  ListItemText,
  Box,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { alpha } from '@mui/material/styles';

export default function Navbar() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const PEACH = '#fda085'; // accent colour that matches the gradient
  const links = [
    { label: 'Home',    to: '/' },
    { label: 'About',   to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  /* ------------------------------------------------------------------ */
  /*  Helper: single link button (desktop)                              */
  /* ------------------------------------------------------------------ */
  const LinkBtn = ({ label, to }) => (
    <Button
      component={RouterLink}
      to={to}
      disableRipple
      sx={{
        px: 1.5,
        fontWeight: 600,
        textTransform: 'none',
        color: '#fff',
        position: 'relative',
        transition: 'color .15s ease',
        '&:hover': {
          color: 'rgba(255,255,255,0.8)',
          backgroundColor: 'transparent',
        },
        // underline animation
        '&:after': {
          content: '""',
          position: 'absolute',
          left: 4,
          right: 4,
          bottom: 4,
          height: 2,
          borderRadius: 1,
          backgroundColor: PEACH,
          opacity: pathname === to ? 1 : 0,
          transform: pathname === to ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all .15s ease',
        },
        '&:hover:after': {
          opacity: 1,
          transform: 'translateY(0)',
        },
      }}
    >
      {label}
    </Button>
  );

  /* ------------------------------------------------------------------ */
  /*  Component JSX                                                     */
  /* ------------------------------------------------------------------ */
  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backdropFilter: 'blur(6px)',
          background: 'transparent',
          px: { xs: 2, md: 4 },
        }}
      >
        <Toolbar disableGutters sx={{ minHeight: 64 }}>
          {/* push links to the right */}
          <Box sx={{ flexGrow: 1 }} />

          {/* desktop links */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
            {links.map((l) => (
              <LinkBtn key={l.to} {...l} />
            ))}
          </Box>

          {/* burger for mobile */}
          <IconButton
            edge="end"
            onClick={() => setOpen(true)}
            sx={{ display: { md: 'none' }, color: '#fff' }}
            aria-label="open navigation"
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* mobile drawer */}
      <Drawer
        anchor="right"
        open={open}
        onClose={() => setOpen(false)}
        PaperProps={{ sx: { width: 220, pt: 1 } }}
      >
        {links.map((l, i) => (
          <Box key={l.to}>
            {i !== 0 && <Divider />}
            <ListItemButton
              component={RouterLink}
              to={l.to}
              onClick={() => setOpen(false)}
              sx={{
                py: 1.5,
                '&:hover': {
                  backgroundColor: alpha(PEACH, 0.08),
                },
              }}
            >
              <ListItemText
                primary={l.label}
                primaryTypographyProps={{
                  fontWeight: pathname === l.to ? 700 : 600,
                  color: pathname === l.to ? PEACH : 'text.primary',
                }}
              />
            </ListItemButton>
          </Box>
        ))}
      </Drawer>
    </>
  );
}
