import type { Lang } from "./messages";

export type GlossaryEntry = {
  term: string;
  text: string;
};

export type HelpText = {
  pageTitle: string;
  title: string;
  subtitle: string;
  introTitle: string;
  intro: string;
  learnTitle: string;
  learn: string[];
  caesarTitle: string;
  principle: string;
  caesarPrinciple: string;
  exampleTitle: string;
  originalLabel: string;
  cipherLabel: string;
  howTo: string;
  caesarSteps: string[];
  substitutionTitle: string;
  substitutionPrinciple: string;
  substitutionSteps: string[];
  tipLabel: string;
  tip: string;
  attackTitle: string;
  attackPrinciple: string;
  attackHow: string[];
  attackProcess: string;
  attackSteps: string[];
  glossaryTitle: string;
  glossary: GlossaryEntry[];
  backToTop: string;
};

const fr: HelpText = {
  pageTitle: "Aide - CryptInsa",
  title: "Guide d'utilisation - CryptInsa",
  subtitle: "Apprenez la cryptographie par substitution et son analyse étape par étape",
  introTitle: "Introduction à CryptInsa",
  intro: "CryptInsa est une application pédagogique interactive qui vous permet de découvrir les principes de la cryptographie par substitution et de comprendre comment ces chiffrements peuvent être attaqués.",
  learnTitle: "Que pouvez-vous apprendre ?",
  learn: [
    "Le fonctionnement des chiffrements César",
    "Comment créer vos propres chiffrements par substitution",
    "Les techniques d'analyse de fréquences",
    "Comment casser un chiffrement par substitution",
  ],
  caesarTitle: "Chiffrement de César",
  principle: "Principe",
  caesarPrinciple: "Le chiffrement de César est l'un des plus anciens chiffrements connus. Il consiste à décaler chaque lettre de l'alphabet d'un nombre fixe de positions.",
  exampleTitle: "Exemple avec un décalage de 3 :",
  originalLabel: "Texte original :",
  cipherLabel: "Texte chiffré :",
  howTo: "Comment utiliser :",
  caesarSteps: [
    "Ouvrez la page Chiffre César",
    "Écrivez dans la zone Message",
    "Réglez Décalage de 0 à 28",
    "Lisez le résultat dans Chiffré",
    "Inverser échange les deux zones",
  ],
  substitutionTitle: "Chiffrement par substitution",
  substitutionPrinciple: "Ce chiffrement remplace chaque lettre de l'alphabet par une autre lettre selon une table de substitution personnalisée.",
  substitutionSteps: [
    "Visitez la page Substitution",
    "Entrez votre texte à chiffrer",
    "Définissez votre alphabet de substitution ou utilisez celui généré",
    "Observez le résultat du chiffrement",
    "Sauvegardez le texte chiffré pour l'analyse",
  ],
  tipLabel: "Conseil :",
  tip: "Utilisez des textes suffisamment longs (50+ caractères) pour une analyse de fréquences efficace.",
  attackTitle: "Attaque par substitution",
  attackPrinciple: "Cette fonctionnalité vous permet de casser un chiffrement par substitution en utilisant l'analyse de fréquences et la reconnaissance de motifs.",
  attackHow: [
    "Allez sur la page Attaque par substitution",
    "Collez un texte chiffré par substitution",
    "Lancez l'attaque automatique",
    "Observez les étapes de déchiffrement",
    "Analysez les correspondances proposées",
    "Ajustez manuellement si nécessaire",
  ],
  attackProcess: "Étapes de l'attaque :",
  attackSteps: [
    "Analyse des fréquences des lettres",
    "Identification des motifs répétitifs",
    "Correspondance avec le français",
    "Proposition de déchiffrement",
  ],
  glossaryTitle: "Glossaire",
  glossary: [
    { term: "Chiffrement", text: "Processus de transformation d'un texte lisible en texte secret." },
    { term: "Déchiffrement", text: "Processus inverse qui retrouve le texte original à partir du texte chiffré." },
    { term: "Clé", text: "Information secrète nécessaire pour chiffrer ou déchiffrer un message." },
    { term: "Cryptanalyse", text: "Science qui étudie les méthodes pour casser les chiffrements." },
    { term: "Substitution", text: "Remplacement de chaque lettre par une autre selon une règle définie." },
    { term: "Fréquence", text: "Nombre d'occurrences d'une lettre dans un texte, exprimé en pourcentage." },
  ],
  backToTop: "Retour en haut",
};

const en: HelpText = {
  pageTitle: "Help - CryptInsa",
  title: "User guide - CryptInsa",
  subtitle: "Learn substitution cryptography and how to analyse it step by step",
  introTitle: "Introduction to CryptInsa",
  intro: "CryptInsa is an interactive teaching application. It shows how substitution ciphers work and how they can be attacked.",
  learnTitle: "What can you learn?",
  learn: [
    "How the Caesar cipher works",
    "How to build your own substitution cipher",
    "Frequency-analysis techniques",
    "How to break a substitution cipher",
  ],
  caesarTitle: "Chiffre César",
  principle: "Principle",
  caesarPrinciple: "The Caesar cipher is one of the oldest known ciphers. It shifts every letter of the alphabet by a fixed number of positions. The tool page stays in French.",
  exampleTitle: "Example with a shift of 3:",
  originalLabel: "Original text:",
  cipherLabel: "Ciphertext:",
  howTo: "How to use it:",
  caesarSteps: [
    "Open Chiffre César",
    "Type in the box labeled Message",
    "Set Décalage from 0 to 28",
    "Read the result under Chiffré",
    "Inverser swaps the two boxes",
  ],
  substitutionTitle: "Substitution",
  substitutionPrinciple: "This cipher replaces each letter with another letter according to a substitution table. The tool page stays in French.",
  substitutionSteps: [
    "Open Substitution",
    "Type in Texte à chiffrer",
    "Use Table de Substitution, or the buttons Aléatoire, Identité, Inversé and Atbash",
    "Read Texte chiffré",
    "Keep the ciphertext for analysis",
  ],
  tipLabel: "Tip:",
  tip: "Use a text of at least 50 characters so frequency analysis has enough data.",
  attackTitle: "Attaque par substitution",
  attackPrinciple: "This tool breaks a substitution cipher with frequency analysis and pattern recognition. The tool page stays in French.",
  attackHow: [
    "Open Attaque par Substitution",
    "Paste the ciphertext in Texte Chiffré",
    "Press LANCER L'ATTAQUE when the text has at least 50 characters",
    "Watch the decryption steps",
    "Review the proposed letter matches",
    "Adjust a match by hand if needed",
  ],
  attackProcess: "Attack steps:",
  attackSteps: [
    "Letter frequency analysis",
    "Repeated pattern detection",
    "Matching against French",
    "Proposed decryption",
  ],
  glossaryTitle: "Glossary",
  glossary: [
    { term: "Encryption", text: "Turning readable text into secret text." },
    { term: "Decryption", text: "Recovering the original text from ciphertext." },
    { term: "Key", text: "The secret information needed to encrypt or decrypt a message." },
    { term: "Cryptanalysis", text: "The study of methods for breaking ciphers." },
    { term: "Substitution", text: "Replacing each letter with another according to a fixed rule." },
    { term: "Frequency", text: "How often a letter appears in a text, shown as a percentage." },
  ],
  backToTop: "Back to top",
};

export const helpText: Record<Lang, HelpText> = { fr, en };
