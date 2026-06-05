import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Locations from "./pages/Locations";
import LocationDetail from "./pages/LocationDetail";
import InstallEdge from "./pages/InstallEdge";
import PendingApprovals from "./pages/PendingApprovals";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter basename={import.meta.env.DEV ? "/" : "/dm-edge-ui-prototype/"}>
        <main className="min-h-screen p-6 overflow-auto">
          <Routes>
            <Route path="/" element={<Locations />} />
            <Route path="/nodes" element={<Locations />} />
            <Route path="/nodes/:locationId" element={<LocationDetail />} />
            <Route path="/install" element={<InstallEdge />} />
            <Route path="/approvals" element={<PendingApprovals />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
