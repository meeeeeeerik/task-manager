import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { observer } from 'mobx-react-lite';

import { themeStore } from '../../theme';

const NotFound = observer(function NotFound() {
  const navigate = useNavigate();
  const dark = themeStore.isDark;

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography
        sx={{
          fontSize: { xs: 80, sm: 120 },
          fontWeight: 900,
          lineHeight: 1,
          color: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          userSelect: 'none',
        }}
      >
        404
      </Typography>

      <DashboardIcon sx={{ fontSize: 48, color: 'primary.main', mt: -4 }} />

      <Typography variant="h5" fontWeight={800}>
        Page not found
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>

      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{ borderRadius: 8, px: 4, mt: 1 }}
      >
        Go Home
      </Button>
    </Box>
  );
});

export { NotFound };
