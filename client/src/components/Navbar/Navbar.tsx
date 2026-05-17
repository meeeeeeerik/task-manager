import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Tooltip,
  Container,
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { observer } from 'mobx-react-lite';

import { authStore } from '../../stores/authStore';
import { themeStore } from '../../theme';
import { inviteStore } from '../../stores/inviteStore';
import { InvitationsInbox } from '../InvitationsInbox/InvitationsInbox';

const POLL_INTERVAL = 30_000;

const Navbar = observer(function Navbar() {
  const navigate = useNavigate();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const { user } = authStore;
  const dark = themeStore.isDark;

  useEffect(() => {
    if (!user) return;

    inviteStore.fetchPending();
    const id = setInterval(inviteStore.fetchPending, POLL_INTERVAL);

    return () => clearInterval(id);
  }, [user]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: dark ? 'rgba(26,31,46,0.96)' : 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(16px)',
        borderBottom: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
        color: 'text.primary',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 0 }, gap: 1 }}>
          <Box
            component={Link}
            to="/"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              textDecoration: 'none',
              mr: 'auto',
            }}
          >
            <DashboardIcon sx={{ color: 'primary.main', fontSize: 26 }} />
            <Typography variant="h6" fontWeight={900} color="text.primary">
              TaskFlow
            </Typography>
          </Box>

          <Tooltip title="Toggle theme">
            <IconButton onClick={themeStore.toggleTheme} sx={{ color: 'text.secondary' }}>
              {dark ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>

          {user ? (
            <>
              <InvitationsInbox />

              <Avatar
                src={user.avatar}
                onClick={(e) => setAnchor(e.currentTarget)}
                sx={{
                  width: 34,
                  height: 34,
                  cursor: 'pointer',
                  backgroundColor: user.color,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {user.name[0]}
              </Avatar>

              <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                PaperProps={{ sx: { borderRadius: 2, minWidth: 180, mt: 1 } }}
              >
                <Box sx={{ px: 2, py: 1.5 }}>
                  <Typography variant="body2" fontWeight={700}>
                    {user.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user.email}
                  </Typography>
                </Box>

                <Divider />

                <MenuItem
                  onClick={() => {
                    authStore.logout();
                    navigate('/auth');
                    setAnchor(null);
                  }}
                  sx={{ color: 'error.main' }}
                >
                  <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box
              component={Link}
              to="/auth"
              sx={{ color: 'primary.main', textDecoration: 'none', fontWeight: 700, fontSize: 14 }}
            >
              Sign In
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
});

export { Navbar };
