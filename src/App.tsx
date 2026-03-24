import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Overview from "./pages/Overview";
import LocationDetail from "./pages/LocationDetail";
import ConnectorsOverview from "./pages/ConnectorsOverview";
import PendingApprovals from "./pages/PendingApprovals";
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
            <Route path="/locations/:locationId" element={<LocationDetail />} />
            <Route path="/connectors" element={<ConnectorsOverview />} />
            <Route path="/approvals" element={<PendingApprovals />} />
            <Route path="/settings" element={<div className="text-muted-foreground">Settings — Coming soon</div>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
