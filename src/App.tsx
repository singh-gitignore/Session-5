import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SessionProvider } from "@/contexts/SessionContext";
import { ThemeProvider } from "@/components/theme-provider";
import { Landing } from "@/pages/Landing";
import { Simulation } from "@/pages/Simulation";
import { Results } from "@/pages/Results";
import { Toaster } from "@/components/ui/sonner";
import { AppLayout } from "@/components/layout/AppLayout";

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ai-coach-theme">
      <SessionProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/simulation" element={<Simulation />} />
              <Route path="/results" element={<Results />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
        <Toaster />
      </SessionProvider>
    </ThemeProvider>
  );
}

export default App;
