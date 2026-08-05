import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "./providers";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

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
    <html lang="en">
      <body className={`${outfit.className} antialiased`}>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
