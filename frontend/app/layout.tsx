import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque } from "next/font/google";

import EasterEggs from "../components/EasterEggs";
import MotionRoot from "../components/MotionRoot";
import "./globals.css";

// One typeface for everything: a grotesque with a bit of wobble in it.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TalkTracker",
  description:
    "Upload a WhatsApp or copied Instagram chat and find out who’s carrying it: who texts more, who replies slower, who starts it, and who’s funnier.",
};

export const viewport: Viewport = {
  themeColor: "#f8f7f4",
  colorScheme: "light",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // suppressHydrationWarning: the inline script adds "js" to <html>
    // before React hydrates, on purpose.
    <html lang="en" className={`${bricolage.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <script
          // Marks the page as scripted before the first paint, so entrance
          // animations start from hidden instead of flashing.
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        <MotionRoot />
        <EasterEggs />
        {children}
      </body>
    </html>
  );
}
