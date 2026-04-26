import { DM_Sans, Space_Grotesk } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const sans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"]
});

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"]
});

export const metadata = {
  title: "NaviMailX",
  description: "AI Email Router SaaS",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${sans.variable} ${display.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
