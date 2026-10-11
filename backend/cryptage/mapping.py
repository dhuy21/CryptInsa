from collections import defaultdict
from difflib import get_close_matches
from pathlib import Path
import copy
import cryptage.decrypt as decrypt
import unicodedata

DICT_PATH = Path(__file__).resolve().parent / "dict.txt"


def generer_pattern(mot):
    mapping = {}
    compteur = 1
    pattern = []
    for lettre in mot:
        if lettre not in mapping:
            mapping[lettre] = compteur
            compteur += 1
        pattern.append(str(mapping[lettre]))
    return "".join(pattern)

def charger_dictionnaire_complet(chemin_dict=None):
    """
    Construit deux dictionnaires :
    - DICO_PATTERN : mapping pattern isomorphique → ensemble de mots
    - DICO_LONGUEUR : mapping longueur → ensemble de mots
    """
    if chemin_dict is None:
        chemin_dict = DICT_PATH
    DICO_PATTERN = defaultdict(set)
    DICO_LONGUEUR = defaultdict(set)

    with open(chemin_dict, "r", encoding="utf-8") as f:
        mots = f.read().split()

    for mot in mots:
        mot = mot.lower()
        DICO_PATTERN[generer_pattern(mot)].add(mot)
        DICO_LONGUEUR[len(mot)].add(mot)

    return dict(DICO_PATTERN), dict(DICO_LONGUEUR)


DICO_PATTERN, DICO_LONGUEUR = charger_dictionnaire_complet() 


def enlever_accents(texte):
    texte_normalise = unicodedata.normalize('NFD', texte)
    texte_sans_accents = ''.join(c for c in texte_normalise if unicodedata.category(c) != 'Mn')
    return texte_sans_accents

def trouver_mots_correspondants(mot_chiffre):
    mot_chiffre_sans_accents = enlever_accents(mot_chiffre)
    pattern_recherche = generer_pattern(mot_chiffre_sans_accents)
    longueur_recherche = len(mot_chiffre_sans_accents)
    mots_correspondants = []
    
    mots_correspondants=(list(DICO_PATTERN.get(pattern_recherche, [])))

    return mots_correspondants, len(mots_correspondants)


def detecter_ponctuation(texte_chiffre: str, caractere_espace: str, score_seuil=0.95):
    """
    Détecte les caractères représentant le point et la virgule dans un texte chiffré.

    Args:
        texte_chiffre (str): Le texte chiffré.
        caractere_espace (str): Le caractère qui représente l'espace.
        score_seuil (float): Seuil de confiance pour identifier la ponctuation.

    Returns:
        dict: {'point': caractère ou None, 'virgule': caractère ou None}
    """
    if not texte_chiffre:
        return {'virgule': None, 'point': None}

    profils = defaultdict(lambda: {'avant_espace': 0, 'autre_position': 0})

    for i in range(len(texte_chiffre)):
        if i!= len(texte_chiffre)-1:
            char_actuel = texte_chiffre[i]
            char_suivant = texte_chiffre[i + 1]
        else:
            char_actuel = texte_chiffre[i]
            char_suivant = caractere_espace

        if char_actuel == caractere_espace:
            continue

        if char_suivant == caractere_espace:
            profils[char_actuel]['avant_espace'] += 1
        else:
            profils[char_actuel]['autre_position'] += 1

    # Calcul des scores
    candidats = []
    for char, profil in profils.items():
        score = profil['avant_espace']
        if profil['autre_position']>0:
            score=0
            profil['avant_espace']=0
        if profil['avant_espace']==0:
            score=0
        candidats.append({'char': char, 'freq': profil['avant_espace'], 'score': score})

    # Trier selon le score et la fréquence
    candidats = sorted(candidats, key=lambda x: (x['score'], x['freq']), reverse=True)

    point, virgule = None, None
    if candidats:
        point = candidats[0]['char']
        if len(candidats) > 1 and candidats[1]['score'] >= score_seuil:
            virgule = candidats[1]['char']

    if texte_chiffre[-1] == virgule:
        point, virgule = virgule, point

    return {'point': point, 'virgule': virgule}

def correction_apres_attaque(texte_chiffre, dictionnaire_traduction, dictionnaire_par_taille):
    lettre_espace_chiffre = None
    for k, v in dictionnaire_traduction.items():
        if v == " ":
            lettre_espace_chiffre = k
            break
    if not lettre_espace_chiffre:
        raise ValueError("Lettre représentant l'espace introuvable.")

    texte_dechiffre = decrypt.message_from_key(texte_chiffre, dictionnaire_traduction)
    mots_chiffres = texte_chiffre.split(lettre_espace_chiffre)
    mots_dechiffres = texte_dechiffre.split(" ")

    for mot_chiffre, mot_dechiffre in zip(mots_chiffres, mots_dechiffres):
        longueur = len(mot_dechiffre)
        mots_valides = dictionnaire_par_taille.get(longueur, set())

        if mot_dechiffre.lower() not in mots_valides:
            suggestion = get_correction_proche(mot_dechiffre.lower(), mots_valides)
            if suggestion:
                print(f"[🔍 Proposition] '{mot_dechiffre}' → '{suggestion}'")

                # Copie temporaire
                tentative = copy.deepcopy(dictionnaire_traduction)

                # Mise à jour temporaire
                conflit = False
                for c_chiffre, c_clair in zip(mot_chiffre, suggestion):
                    ancien = tentative.get(c_chiffre)
                    if ancien and ancien != c_clair:
                        conflit = True
                        break
                    tentative[c_chiffre] = c_clair
                if conflit:
                    continue  # ne pas appliquer cette tentative

                # Redéchiffrage global
                texte_test = decrypt.message_from_key(texte_chiffre, tentative)
                mots_test = texte_test.split(" ")

                # Vérifie si tous les mots sont valides
                tous_valides = all(
                    mot.lower() in dictionnaire_par_taille.get(len(mot), set())
                    for mot in mots_test
                )
                if tous_valides:
                    dictionnaire_traduction = tentative
                    print(f"Correction appliquée : {mot_dechiffre} → {suggestion}")
                else:
                    print(f"Correction rejetée : {mot_dechiffre} → {suggestion} (conflit)")
    return dictionnaire_traduction

def get_correction_proche(mot_invalide, liste_valides):
    # Utilise difflib pour trouver les mots valides les plus proches
    suggestions = get_close_matches(mot_invalide, liste_valides, n=1, cutoff=0.75)
    return suggestions[0] if suggestions else None



#pas encore fini 
def mapping_with_list(keys_sure,traduction,mot_chiffre):
    L= []
    D=[]
    potentials = []
    candidat = trouver_mots_correspondants(mot_chiffre)

    for i in range(len(mot_chiffre)):
        for lettre in keys_sure:
            if mot_chiffre[i]==lettre:
                L.append(i)
                D.append(lettre)
            
    Ln=[i for i in range(len(mot_chiffre)) if i not in L]

    for c in candidat[0]:
        test=True
        j=0
        for i in L:
            if test and len(c)>=i :
                if c[i] != traduction[D[j]]:
                    test=False
            j+=1
        if test:
            for j in Ln:
                if c[j] in traduction.values():
                    test=False
            if test:
                potentials.append(c)
    return potentials