import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PersonaProvider } from "@/context/PersonaContext";
import AppShell from "@/components/AppShell";
import ApprovalsPage from "@/pages/ApprovalsPage";
import EngagementPage from "@/pages/EngagementPage";
import Home from "@/pages/Home";
import NotFound from "@/pages/NotFound";
import PayPage from "@/pages/PayPage";
import PeoplePage from "@/pages/PeoplePage";
import RequestsPage from "@/pages/RequestsPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

function Router() {
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/requests/new" component={RequestsPage} />
        <Route path="/requests" component={RequestsPage} />
        <Route path="/people" component={PeoplePage} />
        <Route path="/engagements/:id" component={EngagementPage} />
        <Route path="/approvals" component={ApprovalsPage} />
        <Route path="/pay" component={PayPage} />
        <Route path="/suppliers" component={PeoplePage} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <PersonaProvider>
            <Router />
          </PersonaProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
