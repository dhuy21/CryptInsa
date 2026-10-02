// JavaScript pour le chiffrement par substitution - Table horizontale
const EXAMPLE_TEXT =[ "Tant  qu il  existera par le fait des lois et des " +
"moeurs une damnation sociale créant artificiellement en pleine civilisation des enfers et compliquant " +
"d une fatalité humaine la destinée qui est divine tant " +
"que  les  trois  problèmes  du  siècle,  la  dégradation  de  " +
"l homme par le prolétariat, la déchéance de la femme " +
"par  la  faim,  l atrophie  de  l enfant  par  la  nuit,  ne " +
"seront pas résolus tant que, dans de certaines " +
"régions,  l asphyxie sociale sera possible en d autres " +
"termes, et a un point de vue plus étendu encore, tant " +
"qu il y aura sur la terre ignorance et misère, des livres " +
"de la nature de celui ci pourront ne pas être inutiles", 

"M. l eveque, pour avoir converti son carrosse en " +
"aumones,  n en faisait pas moins ses tournees.  C est " +
"un  diocèse  fatigant  que  celui  de  Digne.  Il  a  fort  peu " +
"de  plaines,  beaucoup  de  montagnes,  presque  pas  de routes,  on  l a  vu  tout  aa  l heure,  trente deux  cures,  quarante  et  un  vicariats  et  deux  cent  quatre vingt" +
"cinq succursales. Visiter tout cela, c est une affaire. M. " +
"l eveque en venait a bout. Il allait a pied quand c est " +
"dans le voisinage, en carriole dans la plaine, en cacolet  dans  la  montagne.  Les  deux  vieilles  femmes " +
"l accompagnaient. Quand le trajet  etait trop penible " +
"pour elles, il allait seul. Un jour il arriva a Senez qui est une ancienne ville " +
"episcopale, monte sur un ane. Sa bourse, fort a sec " +
"dans  ce  moment, ne lui avait pas permis d autre " +
"equipage. Le  maire  de  la  ville  vint  le  recevoir  a  la " +
"porte de l eveche et le regarde descendre de son ane " +
"avec des yeux scandalises. Quelques bourgeois riaient " +
"autour  de  lui. Monsieur le maire, dit l eveque, et " +
"messieurs les bourgeois, je vois ce qui vous " +
"scandalise,  vous  trouvez  que  c est  bien  de  l orgueil  a " +
"un  pauvre  pretre  de  monter  une  monture  qui  a  ete " +
"celle de Jesus Christ. Je l ai fait par necessite, je vous " +
"assure, non par vanite.  Dans  ces  tournes  il  etait  " +
"indulgent  et  doux,  et " +
"pretchait moins qu il ne causait. Il n allait jamais " +
"chercher bien loin ses raisonnements et ses modeles. " +
"Aux habitants d un pays il cite l exemple du pays " +
"voisin. Dans les cantons ou on etait dur pour les " +
"necessiteux, il disait  Voyez les gens de Briancon. " +
"Ils ont donne aux indigents, aux veuves et aux " +
"orphelins le droit de faire faucher leurs prairies trois  " +
"jours avant tous les autres. Ils leur rebattissent " +
"gratuitement leurs maisons quand elles sont en " +
"ruines. Aussi est ce un pays beni de Dieu. Durant " +
"tout un siecle de cent ans, il n y a pas eu un meurtrier.", 

"Je suis un exemple de texte pour le chiffrement par substitution. " +
"Je suis un exemple de texte pour le chiffrement par substitution. " +
"Je suis un exemple de texte pour le chiffrement par substitution. " +
"Je suis un exemple de texte pour le chiffrement par substitution. "];

let currentMapping = {};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Substitution cipher page loaded');
    
    // Initialiser la table de substitution horizontale
    initializeHorizontalTable();
    
    // Gestionnaires d'événements
    setupEventListeners();
    
    // Générer une table aléatoire par défaut
    generateRandomMapping();
});

function initializeHorizontalTable() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ,.';
    
    // Conteneur des lettres originales
    const originalContainer = document.getElementById('originalLetters');
    originalContainer.innerHTML = '';
    
    // Conteneur des flèches
    const arrowsContainer = document.getElementById('arrowsContainer');
    arrowsContainer.innerHTML = '';
    
    // Conteneur des inputs de substitution
    const inputsContainer = document.getElementById('substitutionInputs');
    inputsContainer.innerHTML = '';
    
    // Générer les éléments pour chaque lettre
    for (let i = 0; i < alphabet.length; i++) {
        const letter = alphabet[i];
        
        // Lettre originale
        const originalDiv = document.createElement('div');
        originalDiv.className = 'original-letter';
        originalDiv.textContent = letter;
        originalContainer.appendChild(originalDiv);
        
        // Flèche
        const arrowDiv = document.createElement('div');
        arrowDiv.className = 'mapping-arrow';
        arrowDiv.textContent = '↓';
        arrowsContainer.appendChild(arrowDiv);
        
        // Input de substitution
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'substitution-input';
        input.maxLength = 1;
        input.id = `sub-${letter}`;
        input.value = letter; // Valeur par défaut = identité
        input.addEventListener('input', handleSubstitutionInput);
        input.addEventListener('focus', function() {
            this.select();
        });
        inputsContainer.appendChild(input);
        
        // Initialiser le mapping
        currentMapping[letter] = letter;
    }
    
    console.log('Horizontal substitution table initialized');
}

function handleSubstitutionInput(event) {
    const input = event.target;
    const originalLetter = input.id.replace('sub-', '');
    const tempLetter = currentMapping[originalLetter];
    const value = input.value.toUpperCase();
    
    // Validation de l'entrée
    if (value && !/^[A-Z ,.]$/.test(value)) {
        input.classList.add('invalid');
        setTimeout(() => input.classList.remove('invalid'), 500);
        input.value = currentMapping[originalLetter] || '';
        return;
    }
    if (value && Object.values(currentMapping).includes(value) && currentMapping[originalLetter] !== value) {
        input.classList.add('invalid');
        setTimeout(() => input.classList.remove('invalid'), 500);
        input.value = currentMapping[originalLetter] || '';
        return;
    }
    
    // Mise à jour du mapping
    if (value) {
        input.value = value;
        currentMapping[originalLetter] = value;
        const originalDivs = document.querySelectorAll('.original-letter');
        originalDivs.forEach(div => {
            if (div.textContent === value) {
                div.classList.remove('highlighted');
            }
        });
    } else {
        currentMapping[originalLetter] = '';
        const originalDivs = document.querySelectorAll('.original-letter');
        originalDivs.forEach(div => {
            if (div.textContent === tempLetter) {
                div.classList.add('highlighted');
            }
        });
    }
    
    // Mise à jour du chiffrement en temps réel
    updateEncryption();
}

function setupEventListeners() {
    // Bouton génération aléatoire
    const generateBtn = document.getElementById('generateRandom');
    if (generateBtn) {
        generateBtn.addEventListener('click', generateRandomMapping);
    }
    
    // Boutons de clés prédéfinies
    document.querySelectorAll('[data-key]').forEach(btn => {
        btn.addEventListener('click', function() {
            const keyType = this.getAttribute('data-key');
            const keyword = this.getAttribute('data-keyword');
            
            if (keyType === 'keyword' && keyword) {
                applyKeywordMapping(keyword);
            } else {
                applyPredefinedKey(keyType);
            }
        });
    });
    
    // Zone de texte d'entrée
    const inputText = document.getElementById('inputText');
    if (inputText) {
        inputText.addEventListener('input', updateEncryption);
        inputText.addEventListener('paste', function() {
            setTimeout(updateEncryption, 10);
        });
    }
    
    // Boutons d'action
    setupActionButtons();
    
    // Exemples mini
    setupMiniExamples();
}

function generateRandomMapping() {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ,.';
    const shuffled = alphabet.split('').sort(() => Math.random() - 0.5);
    
    // Animation de génération
    const inputs = document.querySelectorAll('.substitution-input');
    
    // Phase 1: Animation de mélange
    inputs.forEach((input, index) => {
        setTimeout(() => {
            input.style.transform = 'scale(1.1)';
            input.style.background = '#fff3cd';
            
            // Animation de changement rapide
            let counter = 0;
            const animationInterval = setInterval(() => {
                const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
                input.value = randomLetter;
                counter++;
                
                if (counter >= 10) {
                    clearInterval(animationInterval);
                    // Valeur finale
                    input.value = shuffled[index];
                    currentMapping[alphabet[index]] = shuffled[index];
                    
                    // Reset styling
                    setTimeout(() => {
                        input.style.transform = 'scale(1)';
                        input.style.background = 'white';
                    }, 200);
                }
            }, 50);
            
        }, index * 30);
    });
    
    // Mise à jour finale après animation
    setTimeout(() => {
        updateEncryption();
        console.log('Random mapping generated:', currentMapping);
    }, inputs.length * 30 + 600);
}

function applyPredefinedKey(keyType) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ,.';
    let newMapping = {};
    
    switch (keyType) {
        case 'identity':
            for (let i = 0; i < alphabet.length; i++) {
                newMapping[alphabet[i]] = alphabet[i];
            }
            break;
            
        case 'reverse':
            for (let i = 0; i < alphabet.length; i++) {
                newMapping[alphabet[i]] = alphabet[alphabet.length - 1 - i];
            }
            break;
            
        case 'atbash':
            for (let i = 0; i < alphabet.length; i++) {
                newMapping[alphabet[i]] = i < 26 ? alphabet[25 - i] : alphabet[i];
            }
            break;
    }
    
    applyMapping(newMapping, keyType);
}

function applyKeywordMapping(keyword) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ,.';
    
    // Nettoyer le mot-clé
    const cleanKeyword = keyword.replace(/[^A-Z ,.]/g, '');
    if (!cleanKeyword) return;
    
    // Créer l'alphabet de substitution avec le mot-clé
    const uniqueKeyword = [...new Set(cleanKeyword)].join('');
    const remainingLetters = alphabet.split('').filter(letter => !uniqueKeyword.includes(letter));
    const substitutionAlphabet = uniqueKeyword + remainingLetters.join('');
    
    let newMapping = {};
    for (let i = 0; i < alphabet.length; i++) {
        newMapping[alphabet[i]] = substitutionAlphabet[i];
    }
    
    applyMapping(newMapping, `keyword: ${keyword}`);
}

function applyMapping(mapping, description) {
    const inputs = document.querySelectorAll('.substitution-input');
    
    // Animation d'application
    inputs.forEach((input, index) => {
        setTimeout(() => {
            const originalLetter = input.id.replace('sub-', '');
            input.style.transform = 'scale(1.1)';
            input.style.background = '#d4edda';
            
            setTimeout(() => {
                input.value = mapping[originalLetter];
                currentMapping[originalLetter] = mapping[originalLetter];
                
                setTimeout(() => {
                    input.style.transform = 'scale(1)';
                    input.style.background = 'white';
                }, 100);
            }, 50);
        }, index * 15);
    });
    
    // Mise à jour finale
    setTimeout(() => {
        updateEncryption();
        console.log(`Applied ${description}:`, currentMapping);
    }, inputs.length * 15 + 200);
}

function updateEncryption() {
    const inputText = document.getElementById('inputText');
    if (inputText) {
    inputText.value = inputText.value
        .replace(/œ/g, 'oe') // Remplacer œ par oe
        .replace(/Œ/g, 'OE') // Remplacer Œ par OE
        .normalize('NFD') // Decompose accented characters
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
        .toLowerCase()
        .replace(/[^a-z.,]/g, ' ')
        .replace(/\s+/g, ' ');
        }
    const outputText = document.getElementById('outputText');
    const inputLength = document.getElementById('inputLength');
    const outputLength = document.getElementById('outputLength');
    // Vérifier si une correspondance est manquante
    for (let key in currentMapping) {
        if (!currentMapping[key]) {
            // Afficher une alerte ou indiquer une erreur si besoin
            outputText.value = '';
            if (outputLength) outputLength.textContent = '0';
            return;
        }
    }
    if (!inputText || !outputText) return;
    
    const text = inputText.value.toUpperCase();
    let encrypted = '';
    
    for (let char of text) {
        if (currentMapping[char]) {
            encrypted += currentMapping[char];
        } else {
            encrypted += char; // Conserver les caractères non-alphabétiques
        }
    }
    
    outputText.value = encrypted;
    
    // Mise à jour des statistiques
    if (inputLength) inputLength.textContent = inputText.value.length;
    if (outputLength) outputLength.textContent = encrypted.length;
}

function setupActionButtons() {
    // Effacer le texte
    const clearBtn = document.getElementById('clearText');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            const inputText = document.getElementById('inputText');
            if (inputText) {
                inputText.value = '';
                updateEncryption();
                inputText.focus();
            }
        });
    }
    
    // Coller du texte
    const pasteBtn = document.getElementById('pasteText');
    if (pasteBtn) {
        pasteBtn.addEventListener('click', async function() {
            try {
                const text = await navigator.clipboard.readText();
                const inputText = document.getElementById('inputText');
                if (inputText) {
                    inputText.value = text;
                    updateEncryption();
                }
            } catch (err) {
                console.log('Impossible de coller:', err);
                // Fallback pour navigateurs non compatibles
                const inputText = document.getElementById('inputText');
                if (inputText) {
                    inputText.focus();
                    inputText.select();
                }
            }
        });
    }
    
    // Copier le résultat
    const copyBtn = document.getElementById('copyToClipboard');
    const copyResultBtn = document.getElementById('copyResult');
    
    [copyBtn, copyResultBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', async function() {
                const outputText = document.getElementById('outputText');
                if (outputText && outputText.value) {
                    try {
                        await navigator.clipboard.writeText(outputText.value);
                        // Animation de succès
                        const icon = this.querySelector('i');
                        if (icon) {
                            const originalClass = icon.className;
                            icon.className = 'fas fa-check';
                            this.style.background = 'linear-gradient(135deg, #00b894, #00a085)';
                            
                            setTimeout(() => {
                                icon.className = originalClass;
                                this.style.background = '';
                            }, 1500);
                        }
                    } catch (err) {
                        console.log('Impossible de copier:', err);
                        outputText.select();
                    }
                }
            });
        }
    });

    //Generer un exemple de texte
    const exampleTextBtn = document.getElementById('exampleText');
    if (exampleTextBtn) {
        exampleTextBtn.addEventListener('click', function() {
            const randomIndex = Math.floor(Math.random() * EXAMPLE_TEXT.length);
            const text = EXAMPLE_TEXT[randomIndex];
            const inputText = document.getElementById('inputText');
            if (inputText) {
                inputText.value = text;
                updateEncryption();
            }
        });
    }

    //Déchiffrer par attaque
    const decryptTextBtn = document.getElementById('decryptText');
    if (decryptTextBtn) {
        decryptTextBtn.addEventListener('click', function() {
            //Sauvegarder le plaintext dans local storage
            const inputText = document.getElementById('inputText');
            localStorage.setItem('plaintext', inputText.value);
            localStorage.setItem('ciphertext', outputText.value);
            if (inputText.value.length > 0) {
            //Rediriger vers la page de déchiffrement
            window.location.href = '/substitution_attaque';
            }else{
                alert('Veuillez entrer un texte à déchiffrer');
            }
        });
    }
}

function setupMiniExamples() {
    document.querySelectorAll('.example-item').forEach(item => {
        item.addEventListener('click', function() {
            const text = this.getAttribute('data-text');
            const keyType = this.getAttribute('data-key');
            
            if (text && keyType) {
                // Appliquer la clé
                applyPredefinedKey(keyType);
                
                // Mettre le texte d'exemple après un délai
                setTimeout(() => {
                    const inputText = document.getElementById('inputText');
                    if (inputText) {
                        inputText.value = text;
                        updateEncryption();
                        
                        // Animation de highlight
                        this.style.background = 'rgba(255, 215, 0, 0.3)';
                        setTimeout(() => {
                            this.style.background = 'rgba(255, 255, 255, 0.1)';
                        }, 1000);
                    }
                }, 500);
            }
        });
    });
}
