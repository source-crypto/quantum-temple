import Home from './pages/Home';
import Currency from './pages/Currency';
import Interactions from './pages/Interactions';
import Ceremonial from './pages/Ceremonial';
import Attestation from './pages/Attestation';
import Registry from './pages/Registry';
import Governance from './pages/Governance';
import DEX from './pages/DEX';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Currency": Currency,
    "Interactions": Interactions,
    "Ceremonial": Ceremonial,
    "Attestation": Attestation,
    "Registry": Registry,
    "Governance": Governance,
    "DEX": DEX,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};