import Home from './pages/Home';
import Currency from './pages/Currency';
import Interactions from './pages/Interactions';
import Ceremonial from './pages/Ceremonial';
import Attestation from './pages/Attestation';
import Registry from './pages/Registry';
import Governance from './pages/Governance';
import DEX from './pages/DEX';
import Settings from './pages/Settings';
import Security from './pages/Security';
import WhitePaper from './pages/WhitePaper';
import Markets from './pages/Markets';
import TempleMode from './pages/TempleMode';
import QuantumConstruct from './pages/QuantumConstruct';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Currency": Currency,
    "Interactions": Interactions,
    "Ceremonial": Ceremonial,
    "Attestation": Attestation,
    "Registry": Registry,
    "Governance": Governance,
    "DEX": DEX,
    "Settings": Settings,
    "Security": Security,
    "WhitePaper": WhitePaper,
    "Markets": Markets,
    "TempleMode": TempleMode,
    "QuantumConstruct": QuantumConstruct,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};