import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box } from '@mui/material';
import { observer } from 'mobx-react-lite';

import { getTheme, themeStore } from './theme';
import { Navbar } from './components/Navbar/Navbar';
import { Home } from './pages/Home/Home';
import { BoardPage } from './pages/Board/Board';
import { Auth } from './pages/Auth/Auth';
import { NotFound } from './pages/NotFound/NotFound';

const App = observer(function App() {
  return (
    <ThemeProvider theme={getTheme(themeStore.isDark)}>
      <CssBaseline />

      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />

          <Route
            path="/*"
            element={
              <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
                <Navbar />

                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/board/:id" element={<BoardPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Box>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
});

export { App };
