import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Statements from "./pages/Statements";
import Games from "./pages/Games";
import ViralChains from "./pages/ViralChains";
import Users from "./pages/Users";
import Analytics from "./pages/Analytics";
import Monetization from "./pages/Monetization";
import Experiments from "./pages/Experiments";
import Moderation from "./pages/Moderation";
import Config from "./pages/Config";
import ProTrials from "./pages/ProTrials";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/statements" element={<Statements />} />
          <Route path="/games" element={<Games />} />
          <Route path="/chains" element={<ViralChains />} />
          <Route path="/users" element={<Users />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/monetization" element={<Monetization />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/moderation" element={<Moderation />} />
          <Route path="/config" element={<Config />} />
          <Route path="/pro-trials" element={<ProTrials />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
