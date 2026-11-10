import { assets } from "@/lib/assets";
import type { Project } from "@/types";

export const projects: Project[] = [
  {
    id: "rcsa",
    title: { id: "RCSA Management System", en: "RCSA Management System" },
    description: {
      id: "Aplikasi web internal untuk mendukung digitalisasi pengelolaan data Risk Control Self Assessment pada Divisi Manajemen Risiko.",
      en: "An internal web application supporting the digitization of Risk Control Self Assessment data management within the Risk Management Division.",
    },
    technologies: ["React", "Express.js", "MySQL"],
    image: assets.projects.rcsa,
    confidential: true,
  },
  {
    id: "warehouse",
    title: { id: "Warehouse Management & GIS System", en: "Warehouse Management & GIS System" },
    description: {
      id: "Sistem informasi untuk pengelolaan lokasi penyimpanan dan alokasi peralatan surveying dan mapping menggunakan pendekatan GIS.",
      en: "An information system for warehouse storage management and surveying and mapping equipment allocation using a GIS approach.",
    },
    technologies: ["Next.js", "Express.js", "MySQL", "QGIS"],
    image: assets.projects.warehouse,
  },
];
