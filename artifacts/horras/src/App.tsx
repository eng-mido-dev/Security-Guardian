import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import { AppProvider } from "@/context/AppContext";
import { LangProvider } from "@/context/LangContext";
import { Layout } from "@/components/Layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/Home";
import CheckLink from "@/pages/CheckLink";
import SecurityTest from "@/pages/SecurityTest";
import Report from "@/pages/Report";
import Learn from "@/pages/Learn";
import Tools from "@/pages/Tools";
import About from "@/pages/About";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/check-link" component={CheckLink} />
        <Route path="/security-test" component={SecurityTest} />
        <Route path="/report" component={Report} />
        <Route path="/learn" component={Learn} />
        <Route path="/tools" component={Tools} />
        <Route path="/about" component={About} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LangProvider>
        <AppProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AppProvider>
      </LangProvider>
    </QueryClientProvider>
  );
}

export default App;
