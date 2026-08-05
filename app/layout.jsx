import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "RafiulAnamLLC — Shop quality products online",
    template: "%s | RafiulAnamLLC",
  },
  description: "RafiulAnamLLC — shop quality products online across every category.",
  openGraph: {
    type: "website",
    siteName: "RafiulAnamLLC",
    title: "RafiulAnamLLC — Shop quality products online",
    description: "RafiulAnamLLC — shop quality products online across every category.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <Toaster
            toastOptions={{
              style: {
                background: "#1c1b19",
                color: "#f7f4ef",
                borderRadius: "10px",
                fontSize: "14px",
              },
            }}
          />
          {children}
        </Providers>
      </body>
    </html>
  );
}
