import { createRoot } from 'react-dom/client'
import './main.less'
import App from './components/App/App.tsx'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline';
import { green, purple } from '@mui/material/colors'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: green[400] },
    secondary: { main: purple[400] },
    background: {
      default: '#1e1e1e',              // main window background
      paper: '#252526',                // panels / tab bar
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#a0a0a0',
    },
    divider: '#333',
  },
  typography: {
    fontFamily: ['"JetBrains Mono"', 'monospace'].join(','),
    fontSize: 13,
  },
})

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={darkTheme}>
    <CssBaseline />
    <App />
  </ThemeProvider>
);
