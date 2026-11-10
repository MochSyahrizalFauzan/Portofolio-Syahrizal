import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({ variable: "--font-heading", subsets: ["latin"], weight: "400" });
const inter = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Moch Syahrizal Fauzan | Junior Full-Stack Developer",
  description: "Personal portfolio of Moch Syahrizal Fauzan, a Computer Science graduate and Junior Full-Stack Developer based in Bandung, Indonesia.",
  openGraph: {
    title: "Moch Syahrizal Fauzan | Junior Full-Stack Developer",
    description: "Personal portfolio of Moch Syahrizal Fauzan.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body className={`${instrumentSerif.variable} ${inter.variable}`}>{children}</body></html>;
}
