import type { Language } from "@/types";

export const translations = {
  en: {
    nav: { home: "Home", about: "About", experience: "Experience", projects: "Projects", certifications: "Certifications", contact: "Contact" },
    hero: { eyebrow: "Portfolio / 2026", intro: "Building thoughtful web experiences with a practical full-stack mindset.", viewProjects: "View projects", downloadCv: "Download CV", unavailableCv: "CV will be available soon" },
    about: { label: "01 / About", title: "A developer focused on useful, well-structured software.", interests: "Interests" },
    skills: { label: "02 / Skills", title: "Tools I work with", frontend: "Frontend Development", backend: "Backend Development", database: "Database", tools: "Tools & Other Technologies" },
    experience: { label: "03 / Experience", title: "Experience & education", work: "Experience", education: "Education" },
    projects: { label: "04 / Selected work", title: "Projects with purpose", github: "GitHub", demo: "Live demo", confidential: "Internal project · details kept private", unavailable: "Links will be added when available" },
    certifications: { label: "05 / Certifications", title: "Continuous learning" },
    contact: { label: "06 / Contact", title: "Let’s start a conversation.", description: "Have an opportunity, question, or idea to discuss? Send a message and I’ll get back to you.", name: "Name", email: "Email", subject: "Subject", message: "Message", send: "Send message", sending: "Sending…", success: "Your message has been sent successfully.", error: "Something went wrong. Please try again.", notConfigured: "The contact form is not configured yet. Please use email or LinkedIn instead.", required: "This field is required.", invalidEmail: "Please enter a valid email address.", direct: "Or reach me directly" },
    footer: "Designed and built with care.",
  },
  id: {
    nav: { home: "Beranda", about: "Tentang", experience: "Pengalaman", projects: "Proyek", certifications: "Sertifikasi", contact: "Kontak" },
    hero: { eyebrow: "Portfolio / 2026", intro: "Membangun pengalaman web yang bermanfaat dengan pendekatan full-stack yang praktis.", viewProjects: "Lihat proyek", downloadCv: "Unduh CV", unavailableCv: "CV segera tersedia" },
    about: { label: "01 / Tentang", title: "Developer yang berfokus pada software yang bermanfaat dan terstruktur.", interests: "Minat" },
    skills: { label: "02 / Skill", title: "Teknologi yang saya gunakan", frontend: "Pengembangan Frontend", backend: "Pengembangan Backend", database: "Database", tools: "Tools & Teknologi Lain" },
    experience: { label: "03 / Pengalaman", title: "Pengalaman & pendidikan", work: "Pengalaman", education: "Pendidikan" },
    projects: { label: "04 / Karya pilihan", title: "Proyek dengan tujuan", github: "GitHub", demo: "Live demo", confidential: "Proyek internal · detail bersifat privat", unavailable: "Link akan ditambahkan setelah tersedia" },
    certifications: { label: "05 / Sertifikasi", title: "Belajar secara berkelanjutan" },
    contact: { label: "06 / Kontak", title: "Mari mulai percakapan.", description: "Memiliki peluang, pertanyaan, atau ide untuk didiskusikan? Kirim pesan dan saya akan membalasnya.", name: "Nama", email: "Email", subject: "Subjek", message: "Pesan", send: "Kirim pesan", sending: "Mengirim…", success: "Pesan berhasil dikirim.", error: "Terjadi kesalahan. Silakan coba lagi.", notConfigured: "Form kontak belum dikonfigurasi. Silakan gunakan email atau LinkedIn.", required: "Field ini wajib diisi.", invalidEmail: "Masukkan alamat email yang valid.", direct: "Atau hubungi langsung" },
    footer: "Dirancang dan dibangun dengan perhatian.",
  },
} as const;

export type Translation = (typeof translations)[Language];
