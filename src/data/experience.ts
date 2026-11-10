import type { EducationItem, ExperienceItem } from "@/types";

export const experiences: ExperienceItem[] = [
  {
    type: "work",
    role: { id: "Software Development Intern", en: "Software Development Intern" },
    organization: { id: "PT Bank Jabar Banten Syariah (BJB Syariah)", en: "PT Bank Jabar Banten Syariah (BJB Syariah)" },
    location: { id: "Bandung, Indonesia", en: "Bandung, Indonesia" },
    period: { id: "Agustus 2025 – Oktober 2025", en: "August 2025 – October 2025" },
    description: [
      { id: "Terlibat dalam pengembangan aplikasi internal untuk digitalisasi pengelolaan data RCSA.", en: "Contributed to an internal application for digitizing RCSA data management." },
      { id: "Mengembangkan antarmuka menggunakan React dan membantu backend dengan Express.js.", en: "Developed interfaces with React and assisted backend development with Express.js." },
      { id: "Mengelola data aplikasi menggunakan MySQL dan berkoordinasi dengan tim.", en: "Managed application data with MySQL and collaborated with the team." },
    ],
  },
  {
    type: "organization",
    role: { id: "Kepala Divisi Kesenian dan Olahraga (KESRA)", en: "Head of Arts and Sports Division (KESRA)" },
    organization: { id: "Himpunan Mahasiswa Informatika (HMIF) – UNIKOM", en: "Informatics Student Association (HMIF) – UNIKOM" },
    location: { id: "Bandung, Indonesia", en: "Bandung, Indonesia" },
    period: { id: "Desember 2024 – Desember 2025", en: "December 2024 – December 2025" },
    description: [
      { id: "Memimpin dan mengoordinasikan anggota serta program kerja divisi.", en: "Led and coordinated division members and work programs." },
      { id: "Mengoordinasikan kegiatan Informatics Sports Championship (ISC).", en: "Coordinated the Informatics Sports Championship (ISC)." },
    ],
  },
  {
    type: "organization",
    role: { id: "Anggota Divisi Kesenian dan Olahraga (KESRA)", en: "Arts and Sports Division Member (KESRA)" },
    organization: { id: "Himpunan Mahasiswa Informatika (HMIF) – UNIKOM", en: "Informatics Student Association (HMIF) – UNIKOM" },
    location: { id: "Bandung, Indonesia", en: "Bandung, Indonesia" },
    period: { id: "November 2023 – Desember 2024", en: "November 2023 – December 2024" },
    description: [
      { id: "Membantu perencanaan dan pelaksanaan program kerja.", en: "Supported work program planning and execution." },
      { id: "Menjadi PIC kegiatan badminton dan mengoordinasikan kebutuhan kompetisi.", en: "Served as badminton event PIC and coordinated competition needs." },
    ],
  },
];

export const education: EducationItem[] = [
  {
    institution: { id: "Universitas Komputer Indonesia (UNIKOM)", en: "Universitas Komputer Indonesia (UNIKOM)" },
    degree: { id: "S1 Teknik Informatika · IPK 3.16 / 4.00", en: "Bachelor of Computer Science · GPA 3.16 / 4.00" },
    location: { id: "Bandung, Indonesia", en: "Bandung, Indonesia" },
    period: { id: "November 2022 – November 2026", en: "November 2022 – November 2026" },
    details: [{ id: "Fokus: Pemrograman, pengembangan perangkat lunak, database, dan sistem informasi.", en: "Focus: Programming, software development, databases, and information systems." }],
  },
  {
    institution: { id: "SMK Prakarya Internasional", en: "SMK Prakarya Internasional" },
    degree: { id: "Teknik Komputer dan Jaringan (TKJ)", en: "Computer and Network Engineering (TKJ)" },
    location: { id: "Bandung, Indonesia", en: "Bandung, Indonesia" },
    period: { id: "Juli 2019 – Juli 2022", en: "July 2019 – July 2022" },
    details: [{ id: "Fokus: Hardware, sistem operasi, jaringan komputer, dan troubleshooting.", en: "Focus: Hardware, operating systems, computer networks, and troubleshooting." }],
  },
];
