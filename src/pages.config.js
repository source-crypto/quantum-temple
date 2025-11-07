import Home from './pages/Home';
import Currency from './pages/Currency';
import Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Currency": Currency,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: Layout,
};