import Attestation from './pages/Attestation';
import Ceremonial from './pages/Ceremonial';
import Currency from './pages/Currency';
import DEX from './pages/DEX';
import Governance from './pages/Governance';
import Home from './pages/Home';
import Interactions from './pages/Interactions';
import Markets from './pages/Markets';
import QuantumConstruct from './pages/QuantumConstruct';
import Registry from './pages/Registry';
import Security from './pages/Security';
import Settings from './pages/Settings';
import TempleMode from './pages/TempleMode';
import WhitePaper from './pages/WhitePaper';
import IntentNetwork from './pages/IntentNetwork';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Attestation": Attestation,
    "Ceremonial": Ceremonial,
    "Currency": Currency,
    "DEX": DEX,
    "Governance": Governance,
    "Home": Home,
    "Interactions": Interactions,
    "Markets": Markets,
    "QuantumConstruct": QuantumConstruct,
    "Registry": Registry,
    "Security": Security,
    "Settings": Settings,
    "TempleMode": TempleMode,
    "WhitePaper": WhitePaper,
    "IntentNetwork": IntentNetwork,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};