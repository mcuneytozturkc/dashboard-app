import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/NavBar";
import ExcelToChartPage from "./pages/ExcelToChartPage";
import PdfToChartPage from "./pages/PdfToChartPage";
import Contact from "./pages/Contact";
import { useEffect, useState } from "react";
// İleride diğer sayfaları buraya ekle: ExcelPage, PdfPage, ContactPage vs.

function App() {
  const [darkMode, setDarkMode] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode ? "true" : "false");
  }, [darkMode]);
  return (
    <div className={darkMode ? "dark min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors" : "min-h-screen bg-gray-100 transition-colors"}>
      <BrowserRouter>
        <Navbar darkMode={darkMode} setDarkMode={setDarkMode} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/excel" element={<ExcelToChartPage />} />
          <Route path="/pdf" element={<PdfToChartPage />} />
          <Route path="/contact" element={<Contact />} />

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
