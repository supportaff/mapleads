import './globals.css';
import './overrides.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
const jakarta=Plus_Jakarta_Sans({subsets:['latin'],display:'swap',variable:'--font-jakarta'});
export const metadata:Metadata={title:'MapLeads — Global Business Lead Extraction',description:'Map-first business lead discovery and CSV extraction powered by Google Places.'};
const theme=`:root{--ml-ink:#12352f;--ml-teal:#087f68;--ml-mint:#39d6a0;--ml-soft:#e9fbf4;--ml-line:#cde9df}html,body{font-family:var(--font-jakarta),ui-sans-serif,system-ui,sans-serif}.brand-mark{background:linear-gradient(135deg,#087f68,#39d6a0)!important;box-shadow:0 8px 22px #087f6828}.nav.active{background:var(--ml-soft)!important;color:var(--ml-teal)!important}.find,.hunt,.command button{background:linear-gradient(135deg,#087f68,#0a9878)!important}.map-stage{background:radial-gradient(circle at 50% 42%,#ffffff 0,#f7fcfa 48%,#e9f7f1 100%)!important}.globe-overlay span,.map-result-badge{color:var(--ml-teal)!important}.globe-overlay b{color:var(--ml-ink)!important}.search-lab,.results-dock{border-color:var(--ml-line)!important}`;
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" className={jakarta.variable}><body>{children}<style dangerouslySetInnerHTML={{__html:theme}}/></body></html>}
