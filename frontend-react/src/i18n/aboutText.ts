import type { Lang } from "./messages";
import type { InfoCard, TeamMember } from "../aboutContent";

export type AboutText = {
  pageTitle: string;
  title: string;
  subtitle: string;
  lead: string;
  project: string;
  projectSubtitle: string;
  mission: string;
  missionText: string;
  features: InfoCard[];
  team: string;
  teamSubtitle: string;
  members: TeamMember[];
  valuesTitle: string;
  valuesSubtitle: string;
  values: InfoCard[];
  ctaTitle: string;
  ctaText: string;
  tryTools: string;
  contact: string;
};

const membersFr: TeamMember[] = [
  {
    name: "BARBIER Ted",
    role: "Chef de Projet",
    description: "Passionné de cryptographie et leader naturel, Ted coordonne l'équipe avec vision et expertise technique. Il supervise le développement de nos outils innovants.",
    skills: ["Python", "JavaScript", "Cryptographie", "Gestion de projet"],
  },
  {
    name: "GRANIER Emmy",
    role: "Développeur Backend",
    description: "Spécialiste en algorithmes cryptographiques, Emmy développe les cœurs de calcul de nos outils d'analyse. Son expertise garantit des résultats fiables et performants.",
    skills: ["Python", "Algorithmes", "Sécurité", "Base de données"],
  },
  {
    name: "COCHARD Jules",
    role: "Développeur Backend",
    description: "Expert en architecture logicielle, Jules conçoit des solutions robustes et performantes pour nos applications. Il assure la stabilité de notre infrastructure.",
    skills: ["Python", "API REST", "Architecture", "Tests"],
  },
  {
    name: "NGUYEN Nhat-Lam",
    role: "Développeur Frontend",
    description: "Créatif et perfectionniste, Nhat-Lam donne vie à nos interfaces avec style et ergonomie exceptionnels. Il crée des expériences utilisateur intuitives et modernes.",
    skills: ["JavaScript", "CSS", "UX/UI", "React"],
  },
  {
    name: "NGUYEN Dinh-Huy",
    role: "Développeur Frontend",
    description: "Spécialiste en expérience utilisateur, Dinh-Huy optimise nos interfaces pour une utilisation intuitive et fluide. Il maîtrise les dernières technologies frontend.",
    skills: ["JavaScript", "Vue.js", "Design", "Animation"],
  },
  {
    name: "ERRAIS Adam",
    role: "Développeur Backend",
    description: "Expert en sécurité informatique, Adam s'assure que nos applications respectent les plus hauts standards de protection. Il veille à la sécurité de nos systèmes.",
    skills: ["Python", "Sécurité", "DevOps", "Cryptographie"],
  },
];

const membersEn: TeamMember[] = [
  {
    name: "BARBIER Ted",
    role: "Project lead",
    description: "Ted cares about cryptography and coordinates the team. He supervises the development of the tools.",
    skills: ["Python", "JavaScript", "Cryptography", "Project management"],
  },
  {
    name: "GRANIER Emmy",
    role: "Backend developer",
    description: "Emmy specialises in cryptographic algorithms and builds the calculation core of the analysis tools.",
    skills: ["Python", "Algorithms", "Security", "Databases"],
  },
  {
    name: "COCHARD Jules",
    role: "Backend developer",
    description: "Jules designs robust application architecture and keeps the infrastructure stable.",
    skills: ["Python", "REST API", "Architecture", "Tests"],
  },
  {
    name: "NGUYEN Nhat-Lam",
    role: "Frontend developer",
    description: "Nhat-Lam builds the interfaces and keeps them clear to use.",
    skills: ["JavaScript", "CSS", "UX/UI", "React"],
  },
  {
    name: "NGUYEN Dinh-Huy",
    role: "Frontend developer",
    description: "Dinh-Huy works on the user experience and the frontend technologies behind the pages.",
    skills: ["JavaScript", "Vue.js", "Design", "Animation"],
  },
  {
    name: "ERRAIS Adam",
    role: "Backend developer",
    description: "Adam focuses on computer security and on keeping the applications protected.",
    skills: ["Python", "Security", "DevOps", "Cryptography"],
  },
];

const fr: AboutText = {
  pageTitle: "À propos de nous",
  title: "À propos de nous",
  subtitle: "Équipe CryptInsa",
  lead: "Découvrez notre équipe passionnée de cryptographie et l'histoire derrière CryptInsa, votre plateforme d'analyse cryptographique.",
  project: "Notre Projet",
  projectSubtitle: "CryptInsa : votre allié en cryptanalyse",
  mission: "Mission",
  missionText: "CryptInsa est né de notre passion commune pour la cryptographie et la sécurité informatique. Nous avons créé cette plateforme pour rendre les outils de cryptanalyse accessibles et pour expliquer les mécanismes de chiffrement.",
  features: [
    { icon: "fa-chart-bar", title: "Analyse de Fréquence", text: "Outils pour analyser la fréquence des caractères et découvrir les motifs cachés." },
    { icon: "fa-key", title: "Chiffrement César", text: "Interface pour chiffrer, déchiffrer et observer les codes César." },
    { icon: "fa-graduation-cap", title: "Éducatif", text: "Un parcours pour apprendre la cryptographie en pratiquant." },
  ],
  team: "Notre Équipe",
  teamSubtitle: "Les personnes derrière CryptInsa",
  members: membersFr,
  valuesTitle: "Nos Valeurs",
  valuesSubtitle: "Ce qui nous guide",
  values: [
    { icon: "fa-lightbulb", title: "Innovation", text: "Nous cherchons des façons claires d'expliquer la cryptanalyse." },
    { icon: "fa-users", title: "Collaboration", text: "L'équipe avance ensemble vers le même objectif." },
    { icon: "fa-book-open", title: "Éducation", text: "Nous voulons partager les bases de la cryptographie." },
    { icon: "fa-shield-halved", title: "Sécurité", text: "La protection des données reste au centre du projet." },
  ],
  ctaTitle: "Rejoignez l'aventure cryptographique",
  ctaText: "Découvrez les outils CryptInsa",
  tryTools: "Essayer les outils",
  contact: "Voir l'équipe",
};

const en: AboutText = {
  pageTitle: "About us",
  title: "About us",
  subtitle: "CryptInsa team",
  lead: "Meet the team behind CryptInsa, a platform for learning cryptanalysis.",
  project: "Our project",
  projectSubtitle: "CryptInsa: a companion for cryptanalysis",
  mission: "Mission",
  missionText: "CryptInsa comes from a shared interest in cryptography and computer security. The platform makes cryptanalysis tools accessible and explains how encryption works.",
  features: [
    { icon: "fa-chart-bar", title: "Frequency analysis", text: "Tools that count characters and reveal hidden patterns." },
    { icon: "fa-key", title: "Caesar cipher", text: "An interface to encrypt, decrypt, and inspect Caesar ciphers." },
    { icon: "fa-graduation-cap", title: "Teaching", text: "A hands-on path for learning cryptography." },
  ],
  team: "Our team",
  teamSubtitle: "The people behind CryptInsa",
  members: membersEn,
  valuesTitle: "Our values",
  valuesSubtitle: "What guides the project",
  values: [
    { icon: "fa-lightbulb", title: "Clarity", text: "We look for clear ways to explain cryptanalysis." },
    { icon: "fa-users", title: "Collaboration", text: "The team works toward the same goal." },
    { icon: "fa-book-open", title: "Education", text: "We want to share the basics of cryptography." },
    { icon: "fa-shield-halved", title: "Security", text: "Protecting data stays at the centre of the project." },
  ],
  ctaTitle: "Try the cryptographic tools",
  ctaText: "Open the CryptInsa tools",
  tryTools: "Try the tools",
  contact: "See the team",
};

export const aboutText: Record<Lang, AboutText> = { fr, en };
