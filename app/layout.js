import { Boogaloo, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import Nav from "@/components/Nav";
import ScrollReset from "@/components/ScrollReset";
import ThemeProvider from "@/components/ThemeProvider";
import Link from "next/link";

const boogaloo = Boogaloo({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const dmSans   = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-sans" });
const dmMono   = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono" });

export const metadata = {
  title: "Zweitakthoden — Die Community",
  description: "Community für Zweitakt-Schrauber, Profile, Fahrzeuge und Ausfahrten",
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
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
        <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
        <ScrollReset />
        <Nav />
        <div aria-hidden="true" style={{ height: 'var(--nav-h)' }} />
        <main id="main-content" className="flex-1">{children}</main>
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
