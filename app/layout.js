import { Boogaloo, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import Nav from "@/components/Nav";
import ScrollReset from "@/components/ScrollReset";
import ThemeProvider from "@/components/ThemeProvider";
import FeedbackWidget from "@/components/FeedbackWidget";
import OnboardingTour from "@/components/OnboardingTour";
import CookieConsent from "@/components/CookieConsent";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Link from "next/link";

const boogaloo = Boogaloo({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const dmSans   = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-sans" });
const dmMono   = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono" });

export const metadata = {
  metadataBase: new URL('https://zweitakthoden.de'),
  title: {
    default: 'Zweitakthoden – Moped & Mofa Community für Schrauber',
    template: '%s — Zweitakthoden',
  },
  description: 'Die Community für Zweitakt-Schrauber in Deutschland. Simson, Puch, Zündapp, Tomos – Moped-Forum, Ausfahrten und Bike-Profile. Kostenlos mitmachen.',
  keywords: ['Zweitakt Community', 'Moped Forum', 'Mofa Community', 'Simson Treffen', 'Zweitakt schrauben', 'Moped Schrauber', 'Simson Community Deutschland', 'Zündapp Forum', 'Puch Maxi Community', 'Zweitakt Forum'],
  openGraph: {
    title: 'Zweitakthoden – Moped & Mofa Community',
    description: 'Die Community für Zweitakt-Schrauber. Simson-Treffen, Ausfahrten planen, Bikes vorstellen.',
    siteName: 'Zweitakthoden',
    locale: 'de_DE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${boogaloo.variable} ${dmSans.variable} ${dmMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          (function(){
            var palettes={blue:{a:'rgb(155,195,214)',b:'rgb(175,210,225)',c:'rgb(210,230,238)',d:'rgb(100,155,180)'},pink:{a:'#FF5C8F',b:'#ff85aa',c:'#ffb3cb',d:'#e0366a'},sage:{a:'#7DC4A0',b:'#9DD4B8',c:'#C5E8D6',d:'#4FA87A'},amber:{a:'#E8A045',b:'#F0BB78',c:'#F8DCBA',d:'#C07820'},lilac:{a:'#A99BD4',b:'#C2B8E0',c:'#DDD8EF',d:'#7A68B8'}};
            var key=localStorage.getItem('zh-palette')||'blue';
            var p=palettes[key]||palettes.blue;
            var r=document.documentElement.style;
            r.setProperty('--accent',p.a);r.setProperty('--accent-2',p.b);r.setProperty('--accent-3',p.c);r.setProperty('--accent-ink',p.d);
            r.setProperty('--accent-hot',p.a);r.setProperty('--accent-hot-2',p.b);r.setProperty('--accent-hot-3',p.c);
          })();
        `}} />
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
        <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
        <ScrollReset />
        <Nav />
        <div aria-hidden="true" style={{ height: 'var(--nav-h)' }} />
        <main id="main-content" className="flex-1">{children}</main>
        <FeedbackWidget />
        <OnboardingTour />
        <CookieConsent />
        <Analytics />
        <SpeedInsights />
        <footer className="zh-footer">
          <div className="zh-footer-top">
            <Link href="/" className="zh-footer-logo">Zweitakt<span>hoden</span></Link>
            <div className="zh-footer-cols">
              <div className="zh-footer-col">
                <div className="zh-footer-col-label">Community</div>
                <ul className="zh-footer-links">
                  <li><Link href="/events">Termine</Link></li>
                  <li><Link href="/profiles">Schrauber</Link></li>
                  <li><Link href="/auth/register">Registrieren</Link></li>
                </ul>
              </div>
              <div className="zh-footer-col">
                <div className="zh-footer-col-label">Kontakt</div>
                <ul className="zh-footer-links">
                  <li><a href="mailto:info@zweitakthoden.de">info@zweitakthoden.de</a></li>
                  <li><a href="https://www.instagram.com/zweitakt_hoden/" target="_blank" rel="noopener noreferrer">Instagram</a></li>
                </ul>
              </div>
              <div className="zh-footer-col">
                <div className="zh-footer-col-label">Rechtliches</div>
                <ul className="zh-footer-links">
                  <li><Link href="/impressum">Impressum</Link></li>
                  <li><Link href="/datenschutz">Datenschutz</Link></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="zh-footer-bottom">
            <span className="zh-footer-copy">© 2026 Zweitakthoden</span>
            <span className="zh-footer-copy" style={{ color: 'var(--ink-faint)' }}>·</span>
            <span className="zh-footer-copy">Design & Entwicklung: <a href="https://delavega-design.de/" target="_blank" rel="noopener noreferrer" className="zh-footer-credit">delavega-design.de</a></span>
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
