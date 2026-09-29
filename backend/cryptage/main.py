import cryptage.decrypt as decrypt
import cryptage.mapping as mapping


def append_step(steps, mot_chiffre, mot_traduit, dictionnaire):
    steps.append({
        "mot_chiffre": mot_chiffre,
        "mot_traduit": mot_traduit,
        "dictionnaire": dictionnaire.copy(),
    })

def etape1(message, steps):
    steps.clear()
    print("start 1")
    traduction = {}
    _, traduction = decrypt.decrypt_message(message)
    _,traduction_sur = decrypt.decrypt_message(message,30) # traduction vide
    espace,e=decrypt.make_traduction_sur(message)
    traduction_sur[espace[0]]=' '
    traduction[espace[0]]=' '
    traduction_sur[e[0]]='e'
    traduction[e[0]]='e'
    message_split=message.split(espace[0])
    ponctuation=mapping.detecter_ponctuation(message,espace[0])
    if ponctuation['point'] is not None:
        traduction[ponctuation['point']]="."
        traduction_sur[ponctuation['point']]="."
    if ponctuation['virgule'] is not None:
        traduction[ponctuation['virgule']]=","
        traduction_sur[ponctuation['virgule']]=","

    #Étape 1 : Enregistrement initial
    append_step(steps, "initial", "initial", traduction_sur)

    return traduction, traduction_sur, message_split, ponctuation

def etape2(message, traduction, traduction_sur, message_split, ponctuation, steps):
    print("start 2")
    traduction_test=traduction_sur.copy()
    for j in range(10):
        if j==1:
            if traduction_test==traduction_sur:
                print("teeeest")
                espace,e=decrypt.make_traduction_sur(message)
                traduction_sur[espace[0]]=' '
                traduction_sur[e[0]]='e'
                j=0
                espace_key=[k for k,v in traduction_sur.items() if v==' ']
                e_key=[k for k,v in traduction_sur.items() if v=='e']
                traduction_sur[espace_key[0]]='e'
                traduction_sur[e_key[0]]=' '
                message_split=message.split(e_key[0])
                ponc=[ k for k,v in traduction_sur.items() if v=='.' or v==',']
                for p in ponc:
                    traduction_sur[p]=None
                ponctuation=mapping.detecter_ponctuation(message,e_key[0])
                if ponctuation['point'] is not None:
                    traduction[ponctuation['point']]="."
                    traduction_sur[ponctuation['point']]="."
                if ponctuation['virgule'] is not None:
                    traduction[ponctuation['virgule']]=","
                    traduction_sur[ponctuation['virgule']]=","
        for i in range(len(message_split)):
            mot = message_split[i % len(message_split)]
            keys_sur = [k for k,v in traduction_sur.items() if v is not None and k in mot]
            lettre = None
            for char in keys_sur:
                if char in mot:
                    lettre=char
            if keys_sur != []:
                if decrypt.is_mot_sans_point(mot,ponctuation['point']) and decrypt.is_mot_sans_virgule(mot,ponctuation['virgule']):
                    mots_correspondants=mapping.mapping_with_list(keys_sur,traduction_sur,mot)
                    taille=len(mots_correspondants)
                else:
                    mots_correspondants=mapping.mapping_with_list(keys_sur,traduction_sur,mot[:-1])
                    taille=len(mots_correspondants)
            
            elif decrypt.is_mot_sans_point(mot,ponctuation['point']) and decrypt.is_mot_sans_virgule(mot,ponctuation['virgule']):
                mots_correspondants, taille = mapping.trouver_mots_correspondants(mot)
            else:
                mots_correspondants, taille = mapping.trouver_mots_correspondants(mot[:-1])
            traduction_sur_ref = traduction_sur.copy()
            if taille == 1:
                mot_traduit = mots_correspondants[0]
                traduction = decrypt.change_traduction_with_word(traduction, mot, mot_traduit)
                traduction_sur = decrypt.change_traduction_with_word(traduction_sur, mot, mot_traduit)
                if traduction_sur_ref != traduction_sur:
                    # Sauvegarde pour un mot trouvé
                    append_step(steps, mot, mot_traduit, traduction_sur)
            elif taille > 1:
                lettre_en_commun = decrypt.lettre_en_commun(mots_correspondants)
                if lettre_en_commun:
                    for lettre in lettre_en_commun:
                        traduction = decrypt.change_traduction_with_letter(traduction, mot[lettre[1]], lettre[0])
                        traduction_sur = decrypt.change_traduction_with_letter(traduction_sur, mot[lettre[1]], lettre[0])
                    if traduction_sur_ref != traduction_sur:
                        # Sauvegarde même s’il n’y a pas de mot unique
                        append_step(steps, mot, None, traduction_sur)
    message_clair=decrypt.message_from_key(message,traduction)
    liste_mots=message_clair.split(" ")
    print("traduction sur 2", traduction_sur)
    for i in range(0,len(liste_mots)):
        nouveau_mot=decrypt.check_mot(liste_mots[i],mapping.DICO_LONGUEUR)
        if nouveau_mot is not None:
            liste_mots[i]=nouveau_mot
    separateur=" "
    nouveau_message=separateur.join(liste_mots)
    append_step(steps, "final", "final", traduction)
    return traduction