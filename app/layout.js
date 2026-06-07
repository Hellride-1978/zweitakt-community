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
import CookieConsent from "@/components/CookieConsent"
import PlzNudgeBanner from "@/components/PlzNudgeBanner"
import PresenceUpdater from "@/components/PresenceUpdater";
import PageTracker from "@/components/PageTracker";
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Link from "next/link";
import Script from "next/script";
import NewsletterForm from "@/components/NewsletterForm";

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
        <Script src="/palette-init.js" strategy="beforeInteractive" />
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
        <PlzNudgeBanner />
        <PresenceUpdater />
        <PageTracker />
        <Analytics />
        <SpeedInsights />
        <footer className="zh-footer">
          <div className="zh-footer-inner">
          <div className="zh-footer-top">
            <div className="zh-footer-brand">
              <Link href="/" className="zh-footer-logo">Zweitakt<span>hoden</span></Link>
              <div style={{ marginTop: 24 }}>
                <NewsletterForm showLabel />
              </div>
            </div>
            <div className="zh-footer-cols">
              <div className="zh-footer-col">
                <div className="zh-footer-col-label">Community</div>
                <ul className="zh-footer-links">
                  <li><Link href="/events">Termine</Link></li>
                  <li><Link href="/profiles">Schrauber</Link></li>
                  <li><Link href="/vehicles">Bikes</Link></li>
                  <li><Link href="/schrauberhalle">Schrauberhalle</Link></li>
                  <li><Link href="/forum">Forum</Link></li>
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
          </div>
        </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
