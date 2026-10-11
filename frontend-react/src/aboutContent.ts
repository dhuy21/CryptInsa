export type InfoCard = {
  icon: string;
  title: string;
  text: string;
};

export type TeamMember = {
  name: string;
  role: string;
  description: string;
  skills: string[];
};

export const features: InfoCard[] = [
  {
    icon: "fa-chart-bar",
    title: "Analyse de Fréquence",
    text: "Outils avancés pour analyser la fréquence des caractères et découvrir les patterns cachés.",
  },
  {
    icon: "fa-key",
    title: "Chiffrement César",
    text: "Interface intuitive pour chiffrer, déchiffrer et analyser les codes César.",
  },
  {
    icon: "fa-graduation-cap",
    title: "Éducatif",
    text: "Ressources pédagogiques pour apprendre la cryptographie de manière interactive.",
  },
];

export const members: TeamMember[] = [
  {
    name: "BARBIER Ted",
    role: "Chef de Projet",
    description:
      "Passionné de cryptographie et leader naturel, Ted coordonne l'équipe avec vision et expertise technique. Il supervise le développement de nos outils innovants.",
    skills: ["Python", "JavaScript", "Cryptographie", "Gestion de projet"],
  },
  {
    name: "GRANIER Emmy",
    role: "Développeur Backend",
    description:
      "Spécialiste en algorithmes cryptographiques, Emmy développe les cœurs de calcul de nos outils d'analyse. Son expertise garantit des résultats fiables et performants.",
    skills: ["Python", "Algorithmes", "Sécurité", "Base de données"],
  },
  {
    name: "COCHARD Jules",
    role: "Développeur Backend",
    description:
      "Expert en architecture logicielle, Jules conçoit des solutions robustes et performantes pour nos applications. Il assure la stabilité de notre infrastructure.",
    skills: ["Python", "API REST", "Architecture", "Tests"],
  },
  {
    name: "NGUYEN Nhat-Lam",
    role: "Développeur Frontend",
    description:
      "Créatif et perfectionniste, Nhat-Lam donne vie à nos interfaces avec style et ergonomie exceptionnels. Il crée des expériences utilisateur intuitives et modernes.",
    skills: ["JavaScript", "CSS", "UX/UI", "React"],
  },
  {
    name: "NGUYEN Dinh-Huy",
    role: "Développeur Frontend",
    description:
      "Spécialiste en expérience utilisateur, Dinh-Huy optimise nos interfaces pour une utilisation intuitive et fluide. Il maîtrise les dernières technologies frontend.",
    skills: ["JavaScript", "Vue.js", "Design", "Animation"],
  },
  {
    name: "ERRAIS Adam",
    role: "Développeur Backend",
    description:
      "Expert en sécurité informatique, Adam s'assure que nos applications respectent les plus hauts standards de protection. Il veille à la sécurité de nos systèmes.",
    skills: ["Python", "Sécurité", "DevOps", "Cryptographie"],
  },
];

export const values: InfoCard[] = [
  {
    icon: "fa-lightbulb",
    title: "Innovation",
    text: "Nous repoussons constamment les limites de la cryptanalyse avec des approches novatrices.",
  },
  {
    icon: "fa-users",
    title: "Collaboration",
    text: "La force de notre équipe réside dans notre capacité à travailler ensemble vers un objectif commun.",
  },
  {
    icon: "fa-book-open",
    title: "Éducation",
    text: "Nous croyons fermement au partage des connaissances et à la démocratisation de la cryptographie.",
  },
  {
    icon: "fa-shield-halved",
    title: "Sécurité",
    text: "La protection des données et la sécurité informatique sont au cœur de toutes nos préoccupations.",
  },
];
