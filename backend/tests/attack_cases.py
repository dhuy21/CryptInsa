"""Plaintexts already used in backend/test.py, each encrypted two ways."""

import random

from cryptage.cesar import cesar_encrypt

ALPHABET = "abcdefghijklmnopqrstuvwxyz ,."

TEXTS = {
    "long": (
        "elle ne trouve de reconfort que dans les lettres ecrites a son frere, "
        "porte disparu, qu elle glisse sous sa garde robe et qui disparaissent "
        "misterieusement. lorsqu elle recoit des reponses anonymes, elle y repond, "
        "sans savoir que leur auteur n est autre que son plus grand rival. alors "
        "qu un lien indefectible se noue entre eux, iris accepte une mission au "
        "front en tant que correspondante. dans un pays ou les humains ne sont que "
        "les pions de puissances divines, iris et roman se font la promesse de "
        "continuer a s ecrire. mais, confrontes aux horreurs de la guerre, leur "
        "avenir sera de plus en plus incertain."
    ),
    "ingenieur": (
        "le titre academique d ingenieur ou l exercice de la profession sont "
        "reglementes dans certains pays, a des degres divers."
    ),
    "exemple": "je suis un exemple de texte pour le chiffrement par substitution.",
}


def substitution(text, seed=42):
    shuffled = list(ALPHABET)
    random.Random(seed).shuffle(shuffled)
    table = dict(zip(ALPHABET, shuffled))
    return "".join(table[character] for character in text)


def cases():
    builders = {
        "cesar3": lambda text: cesar_encrypt(text, 3),
        "subst42": lambda text: substitution(text, 42),
    }
    for name, plaintext in TEXTS.items():
        for kind, build in builders.items():
            yield f"{name}/{kind}", plaintext, build(plaintext)
