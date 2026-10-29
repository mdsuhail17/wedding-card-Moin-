import type { Metadata, Viewport } from "next";
import { Allura, Amiri, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const allura = Allura({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-allura",
  display: "swap",
});

const amiri = Amiri({
  weight: "400",
  subsets: ["arabic", "latin"],
  variable: "--font-amiri",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Moin & Noora · Wedding Invitation",
  description:
    "Mrs. Pyari Begum Khan & family invite you to the Nikah of Moin Khan with Noora Shaikh — 12 December 2026, Cubix Hotel, Hubballi, followed by the Reception on 13 December at The Grand Lawns.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${allura.variable} ${amiri.variable} ${cormorant.variable}`}
    >
      <body className="locked">{children}</body>
    </html>
  );
}
