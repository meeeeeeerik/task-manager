import { Box, Typography, Chip, Divider } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { themeStore } from '../../theme';

const FRONTEND = ['React', 'TypeScript', 'Vite', 'MobX', 'Material UI'];
const BACKEND = ['Node.js', 'Express', 'JWT', 'REST API'];

const Footer = observer(function Footer() {
  const dark = themeStore.isDark;

  function chipSx(color: string) {
    return {
      height: 24,
      fontSize: 11,
      fontWeight: 700,
      backgroundColor: dark ? `${color}22` : `${color}18`,
      color,
      border: `1px solid ${color}44`,
    };
  }

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        py: 3,
        px: 2,
        borderTop: dark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(0,0,0,0.07)',
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          gap: { xs: 3, sm: 5 },
          mb: 2,
        }}
      >
        <Box>
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={700}
            display="block"
            mb={0.8}
            letterSpacing={1}
            sx={{ textTransform: 'uppercase' }}
          >
            Frontend
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', justifyContent: 'center' }}>
            {FRONTEND.map((t) => (
              <Chip key={t} label={t} size="small" sx={chipSx('#5C6BC0')} />
            ))}
          </Box>
        </Box>

        <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />

        <Box>
          <Typography
            variant="caption"
            color="text.disabled"
            fontWeight={700}
            display="block"
            mb={0.8}
            letterSpacing={1}
            sx={{ textTransform: 'uppercase' }}
          >
            Backend
          </Typography>

          <Box sx={{ display: 'flex', gap: 0.7, flexWrap: 'wrap', justifyContent: 'center' }}>
            {BACKEND.map((t) => (
              <Chip key={t} label={t} size="small" sx={chipSx('#26A69A')} />
            ))}
          </Box>
        </Box>
      </Box>

      <Typography variant="caption" color="text.disabled">
        TaskFlow © {new Date().getFullYear()}
      </Typography>
    </Box>
  );
});

export { Footer };
