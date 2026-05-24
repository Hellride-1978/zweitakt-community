import { Boogaloo, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import Nav from "@/components/Nav";

const boogaloo = Boogaloo({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const dmSans   = DM_Sans({ subsets: ["latin"], weight: ["300","400","500","600"], variable: "--font-sans" });
const dmMono   = DM_Mono({ subsets: ["latin"], weight: ["400","500"], variable: "--font-mono" });

export const metadata = {
  title: "Zweitakthoden — Die Community",
  description: "Community für Zweitakt-Schrauber, Profile, Fahrzeuge und Ausfahrten",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="de"
      className={`${boogaloo.variable} ${dmSans.variable} ${dmMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Zum Hauptinhalt springen</a>
        <Nav />
        <main id="main-content" className="flex-1">{children}</main>
      </body>
    </html>
  );
}
