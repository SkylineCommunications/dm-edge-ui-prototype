import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Overview from "./pages/Overview";
import Locations from "./pages/Locations";
import LocationDetail from "./pages/LocationDetail";
import ConnectorsOverview from "./pages/ConnectorsOverview";
import PendingApprovals from "./pages/PendingApprovals";
import InstallEdge from "./pages/InstallEdge";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Overview />} />
            <Route path="/nodes" element={<Locations />} />
            <Route path="/nodes/:locationId" element={<LocationDetail />} />
            <Route path="/locations" element={<Locations />} />
            <Route path="/locations/:locationId" element={<LocationDetail />} />
            <Route path="/connectors" element={<ConnectorsOverview />} />
            <Route path="/install" element={<InstallEdge />} />
            <Route path="/approvals" element={<PendingApprovals />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
