"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, Check, Mail, Menu, Moon, Send, Sun, X } from "lucide-react";
import { certifications } from "@/data/certifications";
import { education, experiences } from "@/data/experience";
import { profile } from "@/data/profile";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import { assets } from "@/lib/assets";
import { translations } from "@/i18n";
import type { Language, Theme } from "@/types";
import KernLanyardPass from "@/components/lanyard";

const sectionIds = ["home", "about", "experience", "projects", "certifications", "contact"] as const;

function Placeholder({ label }: { label: string }) {
  return <div className="placeholder" aria-label={label}><span>{label}</span></div>;
}

function Header({ language, setLanguage, theme, setTheme }: { language: Language; setLanguage: (value: Language) => void; theme: Theme; setTheme: (value: Theme) => void }) {
  const [open, setOpen] = useState(false);
  const t = translations[language];
  return (
    <header className="site-header">
      <a className="brand" href="#home" onClick={() => setOpen(false)} aria-label={profile.name}>MSF<span>.</span></a>
      <nav className={`desktop-nav ${open ? "mobile-open" : ""}`} aria-label="Primary navigation">
        {sectionIds.map((id) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{t.nav[id === "home" ? "home" : id]}</a>)}
      </nav>
      <div className="header-actions">
        <div className="language-switcher" aria-label="Language">
          <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>EN</button>
          <span>/</span>
          <button className={language === "id" ? "active" : ""} onClick={() => setLanguage("id")}>ID</button>
        </div>
        <button className="icon-button" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label={`Use ${theme === "light" ? "dark" : "light"} theme`}>
          {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
        </button>
        <button className="icon-button menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Toggle menu">
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
  
function SectionHeading({ label, title }: { label: string; title: string }) {
  return <div className="section-heading"><span className="eyebrow">{label}</span><h2>{title}</h2></div>;
}

export default function PortfolioShell() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("light");
  const [preferencesReady, setPreferencesReady] = useState(false);
  const reduceMotion = useReducedMotion();
  const t = translations[language];

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("portfolio-language");
    // Preferences are browser-only and must be applied after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (savedLanguage === "en" || savedLanguage === "id") setLanguage(savedLanguage);
    const savedTheme = window.localStorage.getItem("portfolio-theme");
    if (savedTheme === "light" || savedTheme === "dark") setTheme(savedTheme);
    else if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTheme("dark");
    setPreferencesReady(true);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    if (preferencesReady) window.localStorage.setItem("portfolio-theme", theme);
  }, [preferencesReady, theme]);

  useEffect(() => {
    if (preferencesReady) window.localStorage.setItem("portfolio-language", language);
  }, [language, preferencesReady]);

  useEffect(() => {
    const yearElement = document.getElementById("copyright-year");
    if (yearElement) yearElement.textContent = String(new Date().getFullYear());
  }, []);

  const fade = reduceMotion ? {} : { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.6 } };
  const cvPath = language === "en" ? assets.documents.cvEn : assets.documents.cvId;
  const [formState, setFormState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [formError, setFormError] = useState("");
  const endpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT;

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint) { setFormState("error"); setFormError(t.contact.notConfigured); return; }
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.get("name") || !data.get("email") || !data.get("subject") || !data.get("message")) { setFormState("error"); setFormError(t.contact.required); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(data.get("email")))) { setFormState("error"); setFormError(t.contact.invalidEmail); return; }
    setFormState("sending"); setFormError("");
    try {
      const response = await fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error("Form submission failed");
      form.reset(); setFormState("success");
    } catch { setFormState("error"); setFormError(t.contact.error); }
  }

  const labels = useMemo(() => ({ frontend: t.skills.frontend, backend: t.skills.backend, database: t.skills.database, tools: t.skills.tools }), [t]);

  return (
    <div className="portfolio">
      <Header language={language} setLanguage={setLanguage} theme={theme} setTheme={setTheme} />
      <main>
        <section id="home" className="hero section-shell">
          <div className="hero-copy">
            <motion.span className="eyebrow" {...fade}>{t.hero.eyebrow}</motion.span>
            <motion.h1 {...fade}>Moch Syahrizal<br /><em>Fauzan.</em></motion.h1>
            <motion.p className="hero-title" {...fade}>{profile.title}</motion.p>
            <motion.p className="hero-intro" {...fade}>{t.hero.intro}</motion.p>
            <motion.div className="hero-actions" {...fade}>
              <a className="button button-primary" href="#projects">{t.hero.viewProjects}<ArrowDown size={16} /></a>
              <a className="button button-secondary" href={cvPath} aria-label={t.hero.downloadCv}>{t.hero.downloadCv}<ArrowUpRight size={16} /></a>
            </motion.div>
            <motion.div className="social-links" {...fade}>
              <a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub <ArrowUpRight size={14} /></a>
              <a href={profile.linkedin} target="_blank" rel="noopener noreferrer" src={assets.icon.linkedin}>LinkedIn <ArrowUpRight size={14} /></a>
              <a href={profile.instagram} target="_blank" rel="noopener noreferrer">Instagram <ArrowUpRight size={14} /></a>
            </motion.div>
          </div>
          <motion.div className="hero-aside" {...fade}>
            <div className="kern-lanyard-host">
              <KernLanyardPass
                content={{
                  attendeeName: profile.name,
                  ticketType: profile.title,
                  ticketNumber: "SE/26",
                  eventName: "PORTFOLIO",
                  eventDate: "2026",
                  barcodeValue: "XIX-PORTFOLIO-2026-FS26",
                  backText: "Moch Syahrizal Fauzan",
                  strapText: "PORTFOLIO / MSF",
                }}
                look={{
                  paper: "#131417",
                  ink: "#F2F1EC",
                  accent: "#5B6B86",
                  strapColor: "#1A1A1A",
                  strapStyle: "flat",
                  photo: { src: assets.profile.image, alt: profile.name },
                  logo: { src: assets.profile.image, alt: "Logo" },
                  photoFit: "cover",
                  foil: true,
                  finish: "gloss",
                  sleeve: false,
                  sleeveTexture: "clear",
                  nameFont: { fontSize: "108px", fontWeight: 600 },
                  metaFont: { fontSize: "22px", fontWeight: 400 },
                  numberFont: { fontSize: "48px", fontWeight: 600 },
                }}
                light={{ angle: 25, height: 55, intensity: 1, rim: true }}
                layout={{ size: 300, padding: 40, stackGap: 12, thickness: 5.4 }}
                motion={{ physics: true }}
                entrance={{ entrance: "none", entrancePlay: "load" }}
                preview={{ exploreMore: "", madeForFramer: "" }}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
            <span className="scroll-note"><ArrowDown size={14} /> Scroll to explore</span>
          </motion.div>
        </section>

        <motion.section id="about" className="section-shell content-section" {...fade}>
          <SectionHeading label={t.about.label} title={t.about.title} />
          <div className="about-grid"><p className="lead-copy">{profile.summary[language]}</p><div className="detail-copy"><p>{t.about.interests}</p><p>{profile.interests[language]}</p><div className="availability"><span /> Open to opportunities</div></div></div>
        </motion.section>

        <motion.section id="skills" className="section-shell content-section skills-section" {...fade}>
          <SectionHeading label={t.skills.label} title={t.skills.title} />
          <div className="skills-grid">{skills.map((group) => <div className="skill-group" key={group.key}><span className="skill-number">0{skills.indexOf(group) + 1}</span><h3>{labels[group.key]}</h3><div className="tag-list">{group.technologies.map((skill) => <span className="tag" key={skill}>{skill}</span>)}</div></div>)}</div>
        </motion.section>

        <motion.section id="experience" className="section-shell content-section" {...fade}>
          <SectionHeading label={t.experience.label} title={t.experience.title} />
          <div className="experience-layout"><div><h3 className="subsection-title">{t.experience.work}</h3><div className="timeline">{experiences.map((item) => <article className="timeline-item" key={item.role.en}><span className="timeline-dot" /><div><div className="item-meta"><span>{item.period[language]}</span><span>{item.location[language]}</span></div><h3>{item.role[language]}</h3><p className="organization">{item.organization[language]}</p><ul>{item.description.map((line) => <li key={line.en}>{line[language]}</li>)}</ul></div></article>)}</div></div><div><h3 className="subsection-title">{t.experience.education}</h3><div className="timeline">{education.map((item) => <article className="timeline-item" key={item.institution.en}><span className="timeline-dot" /><div><div className="item-meta"><span>{item.period[language]}</span><span>{item.location[language]}</span></div><h3>{item.institution[language]}</h3><p className="organization">{item.degree[language]}</p>{item.details.map((line) => <p className="small-copy" key={line.en}>{line[language]}</p>)}</div></article>)}</div></div></div>
        </motion.section>

        <motion.section id="projects" className="section-shell content-section" {...fade}>
          <SectionHeading label={t.projects.label} title={t.projects.title} />
          <div className="project-grid">{projects.map((project, index) => <article className="project-card" key={project.id}><div className="project-image">{project.image ? <Placeholder label={`Project 0${index + 1}`} /> : <Placeholder label="Image unavailable" />}<span className="project-index">0{index + 1}</span></div><div className="project-body"><div><h3>{project.title[language]}</h3><p>{project.description[language]}</p></div><div className="tag-list">{project.technologies.map((technology) => <span className="tag" key={technology}>{technology}</span>)}</div><div className="project-footer">{project.confidential ? <span className="confidential">{t.projects.confidential}</span> : <span className="confidential">{t.projects.unavailable}</span>}<div className="project-links">{project.github && <a href={project.github} target="_blank" rel="noopener noreferrer">{t.projects.github}<ArrowUpRight size={14} /></a>}{project.demo && <a href={project.demo} target="_blank" rel="noopener noreferrer">{t.projects.demo}<ArrowUpRight size={14} /></a>}</div></div></div></article>)}</div>
        </motion.section>

        <motion.section id="certifications" className="section-shell content-section" {...fade}>
          <SectionHeading label={t.certifications.label} title={t.certifications.title} />
          <div className="cert-grid">{certifications.map((certificate) => <article className="cert-card" key={certificate.name.en}><div className="cert-top"><span className="cert-year">{certificate.year}</span><Check size={17} /></div><h3>{certificate.name[language]}</h3><p className="organization">{certificate.issuer[language]}</p><p className="small-copy">{certificate.description[language]}</p></article>)}</div>
        </motion.section>

        <motion.section id="contact" className="section-shell content-section contact-section" {...fade}>
          <div className="contact-intro"><SectionHeading label={t.contact.label} title={t.contact.title} /><p>{t.contact.description}</p><div className="direct-contact"><span>{t.contact.direct}</span><a href={`mailto:${profile.email}`}><Mail size={16} /> {profile.email}</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn <ArrowUpRight size={14} /></a></div></div>
          <form className="contact-form" onSubmit={submitForm} noValidate><label>{t.contact.name}<input name="name" type="text" /></label><label>{t.contact.email}<input name="email" type="email" /></label><label>{t.contact.subject}<input name="subject" type="text" /></label><label>{t.contact.message}<textarea name="message" rows={5} /></label>{formState === "error" && <p className="form-message error">{formError}</p>}{formState === "success" && <p className="form-message success">{t.contact.success}</p>}<button className="button button-primary submit-button" type="submit" disabled={formState === "sending"}>{formState === "sending" ? t.contact.sending : t.contact.send}<Send size={16} /></button></form>
        </motion.section>
      </main>
      <footer className="site-footer"><span>© <span id="copyright-year">2026</span> {profile.name}</span><span>{t.footer}</span><div><a href={profile.github} target="_blank" rel="noopener noreferrer">GitHub</a><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a><a href={`mailto:${profile.email}`}>Email</a></div></footer>
    </div>
  );
}
