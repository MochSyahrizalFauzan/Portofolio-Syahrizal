export type Language = "en" | "id";
export type Theme = "light" | "dark";

export type LocalizedText = Record<Language, string>;

export type Project = {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  technologies: string[];
  image?: string;
  github?: string;
  demo?: string;
  confidential?: boolean;
};

export type ExperienceItem = {
  type: "work" | "organization";
  role: LocalizedText;
  organization: LocalizedText;
  location: LocalizedText;
  period: LocalizedText;
  description: LocalizedText[];
};

export type EducationItem = {
  institution: LocalizedText;
  degree: LocalizedText;
  location: LocalizedText;
  period: LocalizedText;
  details: LocalizedText[];
};

export type Certification = {
  name: LocalizedText;
  issuer: LocalizedText;
  year: string;
  description: LocalizedText;
  image?: string;
};
