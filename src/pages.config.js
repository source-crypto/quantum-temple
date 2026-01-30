/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import Attestation from './pages/Attestation';
import Ceremonial from './pages/Ceremonial';
import Currency from './pages/Currency';
import DEX from './pages/DEX';
import Governance from './pages/Governance';
import Home from './pages/Home';
import Integrations from './pages/Integrations';
import IntentNetwork from './pages/IntentNetwork';
import Interactions from './pages/Interactions';
import Markets from './pages/Markets';
import OperationalReadinessDashboard from './pages/OperationalReadinessDashboard';
import QuantumConstruct from './pages/QuantumConstruct';
import Registry from './pages/Registry';
import Security from './pages/Security';
import Settings from './pages/Settings';
import TempleMode from './pages/TempleMode';
import WhitePaper from './pages/WhitePaper';
import AdminDashboard from './pages/AdminDashboard';
import ManifestoAgentTest from './pages/ManifestoAgentTest';
import Manifesto from './pages/Manifesto';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Attestation": Attestation,
    "Ceremonial": Ceremonial,
    "Currency": Currency,
    "DEX": DEX,
    "Governance": Governance,
    "Home": Home,
    "Integrations": Integrations,
    "IntentNetwork": IntentNetwork,
    "Interactions": Interactions,
    "Markets": Markets,
    "OperationalReadinessDashboard": OperationalReadinessDashboard,
    "QuantumConstruct": QuantumConstruct,
    "Registry": Registry,
    "Security": Security,
    "Settings": Settings,
    "TempleMode": TempleMode,
    "WhitePaper": WhitePaper,
    "AdminDashboard": AdminDashboard,
    "ManifestoAgentTest": ManifestoAgentTest,
    "Manifesto": Manifesto,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};