export const SUBSTITUTION_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ,.";

export const EXAMPLE_TEXTS = [
  "Tant  qu il  existera par le fait des lois et des moeurs une damnation sociale créant artificiellement en pleine civilisation des enfers et compliquant d une fatalité humaine la destinée qui est divine tant que  les  trois  problèmes  du  siècle,  la  dégradation  de  l homme par le prolétariat, la déchéance de la femme par  la  faim,  l atrophie  de  l enfant  par  la  nuit,  ne seront pas résolus tant que, dans de certaines régions,  l asphyxie sociale sera possible en d autres termes, et a un point de vue plus étendu encore, tant qu il y aura sur la terre ignorance et misère, des livres de la nature de celui ci pourront ne pas être inutiles",
  "M. l eveque, pour avoir converti son carrosse en aumones,  n en faisait pas moins ses tournees.  C est un  diocèse  fatigant  que  celui  de  Digne.",
  "Je suis un exemple de texte pour le chiffrement par substitution. ".repeat(4),
];

export type SubstitutionMap = Record<string, string>;

export function identityMapping(): SubstitutionMap {
  return Object.fromEntries(SUBSTITUTION_ALPHABET.split("").map((letter) => [letter, letter]));
}

export function reverseMapping(): SubstitutionMap {
  const letters = SUBSTITUTION_ALPHABET.split("");
  return Object.fromEntries(letters.map((letter, index) => [letter, letters[letters.length - 1 - index]]));
}

export function atbashMapping(): SubstitutionMap {
  const letters = SUBSTITUTION_ALPHABET.split("");
  return Object.fromEntries(letters.map((letter, index) => [letter, index < 26 ? letters[25 - index] : letter]));
}

export function randomMapping(): SubstitutionMap {
  const letters = SUBSTITUTION_ALPHABET.split("");
  const shuffled = [...letters].sort(() => Math.random() - 0.5);
  return Object.fromEntries(letters.map((letter, index) => [letter, shuffled[index]]));
}

export function normalizeSubstitution(text: string): string {
  return text
    .replace(/œ/g, "oe")
    .replace(/Œ/g, "OE")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z.,]/g, " ")
    .replace(/\s+/g, " ");
}

export function encryptWithMapping(text: string, mapping: SubstitutionMap): string {
  let encrypted = "";
  for (const char of text.toUpperCase()) {
    encrypted += mapping[char] ?? char;
  }
  return encrypted;
}
