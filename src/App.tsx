import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { seedFromStaticFile } from "./lib/posts";
import Today from "./pages/Today";
import History from "./pages/History";
import HistoryDetail from "./pages/HistoryDetail";
import Settings from "./pages/Settings";
import SalesPosts from "./pages/SalesPosts";

export default function App() {
  useEffect(() => {
    seedFromStaticFile();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/today" replace />} />
        <Route path="/today" element={<Today />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:id" element={<HistoryDetail />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/sales" element={<SalesPosts />} />
        <Route path="*" element={<Navigate to="/today" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
