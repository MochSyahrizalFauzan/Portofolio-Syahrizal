import { assets } from "@/lib/assets";
import type { Certification } from "@/types";

export const certifications: Certification[] = [
  {
    name: { id: "Certified Web Developer (CWDev)", en: "Certified Web Developer (CWDev)" },
    issuer: { id: "BNSP – LSP Informatika", en: "BNSP – LSP Informatika" },
    year: "2026",
    description: { id: "Kategori Web Development / Software Development.", en: "Web Development / Software Development category." },
    image: assets.certificates.bnsp,
  },
  {
    name: { id: "CCNAv7: Introduction to Networks", en: "CCNAv7: Introduction to Networks" },
    issuer: { id: "Cisco Networking Academy", en: "Cisco Networking Academy" },
    year: "2024",
    description: { id: "Konfigurasi jaringan, router, switch, pengalamatan IPv4/IPv6, dan troubleshooting.", en: "Network configuration, router and switch fundamentals, IPv4/IPv6 addressing, and troubleshooting." },
    image: assets.certificates.cisco,
  },
  {
    name: { id: "Gemini Certified Student", en: "Gemini Certified Student" },
    issuer: { id: "Google for Education", en: "Google for Education" },
    year: "2026",
    description: { id: "Produktivitas dasar dengan generative AI. Berlaku Agustus 2026 – Agustus 2029.", en: "Basic generative AI productivity. Valid August 2026 – August 2029." },
    image: assets.certificates.gemini,
  },
  {
    name: { id: "Sertifikat Ujian Hardware Komputer", en: "Computer Hardware Examination Certificate" },
    issuer: { id: "AP2SC UNIKOM", en: "AP2SC UNIKOM" },
    year: "2025",
    description: { id: "Predikat Istimewa dengan nilai rata-rata 90/100. Fokus pada perakitan, jaringan dasar, troubleshooting, dan instalasi sistem operasi.", en: "Excellent distinction with an average score of 90/100. Focused on assembly, basic networking, troubleshooting, and operating system installation." },
    image: assets.certificates.hardware,
  },
];
