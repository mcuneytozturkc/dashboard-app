import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  Chart as ChartJS, BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler
} from "chart.js";
import "./index.css";
import App from './App.tsx'
import "./i18n";

ChartJS.register(BarElement, LineElement, PointElement, ArcElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
