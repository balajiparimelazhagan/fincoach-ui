import React, { Suspense } from 'react';
import { IonApp, IonSpinner, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { UserProvider } from './context/UserContext';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Dark theme disabled - using light/white theme */
/* import '@ionic/react/css/palettes/dark.always.css'; */

/* Theme variables */
import './theme/variables.css';

// ── Lazy-loaded pages (route-level code splitting) ───────────────────────────
const Login          = React.lazy(() => import('./pages/Login'));
const Dashboard      = React.lazy(() => import('./pages/Dashboard'));
const Transactions   = React.lazy(() => import('./pages/Transactions'));
const Insights       = React.lazy(() => import('./pages/Insights'));
const Cashflow       = React.lazy(() => import('./pages/Cashflow'));
const Patterns       = React.lazy(() => import('./pages/Patterns'));
const Budget         = React.lazy(() => import('./pages/Budget'));
const Portfolio      = React.lazy(() => import('./pages/Portfolio'));

setupIonicReact();

const PageFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <IonSpinner name="dots" className="text-primary" />
  </div>
);

const App: React.FC = () => {
  return (
    <IonApp>
      <UserProvider>
        <IonReactRouter>
          <Suspense fallback={<PageFallback />}>
            <Route exact path="/login"           component={Login} />
            <Route exact path="/dashboard"       component={Dashboard} />
            <Route exact path="/transactions"    component={Transactions} />
            <Route exact path="/insights"        component={Insights} />
            <Route exact path="/cashflow"         component={Cashflow} />
            <Route exact path="/budget"          component={Budget} />
            <Route exact path="/patterns"        component={Patterns} />
            <Route exact path="/portfolio"       component={Portfolio} />
            <Route exact path="/" render={() => <Redirect to="/login" />} />
          </Suspense>
        </IonReactRouter>
      </UserProvider>
    </IonApp>
  );
};

export default App;
