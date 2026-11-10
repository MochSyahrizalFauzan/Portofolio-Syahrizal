export const assets = {
  documents: {
    cvId: "/documents/cv-id.pdf",
    cvEn: "/documents/cv-en.pdf",
  },
  icon:{
    linkedin: "/icons/linkedin.png",
    github: "/icons/github.png",
    instagram: "/icons/instagram.png",
  },
  profile: {
    image: "/images/profile/profile.jpeg",
  },
  projects: {
    rcsa: "/images/projects/rcsa-management-system.webp",
    warehouse: "/images/projects/warehouse-gis-system.webp",
  },
  certificates: {
    bnsp: "/images/certificates/bnsp-certified-web-developer.webp",
    cisco: "/images/certificates/ccnav7-introduction-to-networks.webp",
    gemini: "/images/certificates/gemini-certified-student.webp",
    hardware: "/images/certificates/computer-hardware-exam.webp",
  },
} as const;

export const isAssetAvailable = (path?: string) =>
  Boolean(path && typeof path === "string");
