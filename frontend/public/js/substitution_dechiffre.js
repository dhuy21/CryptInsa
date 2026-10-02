// Alphabet français complet
const FRENCH_ALPHABET = 'abcdefghijklmnopqrstuvwxyz ,.';
const ALPHABET_DISPLAY = FRENCH_ALPHABET.split('');

// Variables globales
let cipherFrequencies = {};
let currentMapping = {};
let analyzedText = '';
let is_finished = false;
let motChiffre = '';
let motTraduit = '';
let dataChiffre = [];
let currentDecryptedText = '';
let currentIndexData = 0;

// Variables pour l'animation d'électricité
let electricityActive = false;

// Variables pour l'animation de particules de loading
let loadingParticlesActive = false;

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadCipherTextFromStorage();
    loadOriginalTexts();
});

function setupEventListeners() {
    document.getElementById('copyResult').addEventListener('click', copyResult);
    document.getElementById('play').addEventListener('click', play);
    document.getElementById('nextWord').addEventListener('click', nextWord);
    document.getElementById('previousWord').addEventListener('click', previousWord);
}

//==PLAY==//
let attackInterval = null;
const ATTACK_POLL_MS = 3000;
const ATTACK_POLL_LIMIT = 20;
let attackPollCount = 0;

function attackIsFinal(steps) {
    return Array.isArray(steps)
        && steps.length > 0
        && steps[steps.length - 1].mot_chiffre === 'final';
}

function showCurrentStep() {
    if (!Array.isArray(dataChiffre) || dataChiffre.length === 0) {
        return;
    }
    if (currentIndexData < 0 || currentIndexData >= dataChiffre.length) {
        currentIndexData = 0;
    }
    const step = dataChiffre[currentIndexData];
    motChiffre = step.mot_chiffre;
    motTraduit = step.mot_traduit;
    currentMapping = step.dictionnaire;
    updateMappingDisplay();
    applyDecryption();
}

function finishPlay() {
    is_finished = true;
    if (attackInterval) {
        clearInterval(attackInterval);
        attackInterval = null;
    }
    const playButton = document.getElementById('play');
    playButton.disabled = false;
    playButton.innerHTML = '<i class="fas fa-play"></i> Commencer';
    stopElectricityAnimation();
    stopLoadingParticles();
}

async function refreshAttack() {
    dataChiffre = await window.updateAttack();
    if (!Array.isArray(dataChiffre)) {
        showNotification('Erreur lors de l\'analyse', 'error');
        finishPlay();
        return;
    }
    showCurrentStep();
    if (attackIsFinal(dataChiffre)) {
        finishPlay();
    }
}

async function play() {
    const cipherText = localStorage.getItem('cipherText');
    
    if (!cipherText) {
        showNotification('Aucun texte chiffré trouvé. Utilisez d\'abord la page d\'attaque.', 'error');
        return;
    }
    
    console.log('Begin Attack');
    
    const playButton = document.getElementById('play');
    playButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyse...';
    playButton.disabled = true;
    startElectricityAnimation();
    startLoadingParticles();
    is_finished = false;
    attackPollCount = 0;
    if (attackInterval) {
        clearInterval(attackInterval);
        attackInterval = null;
    }
    
    try {
        await refreshAttack();
        if (is_finished) {
            return;
        }
        attackInterval = setInterval(async () => {
            attackPollCount += 1;
            try {
                await refreshAttack();
                if (!is_finished && attackPollCount >= ATTACK_POLL_LIMIT) {
                    showNotification('Erreur lors de l\'analyse', 'error');
                    finishPlay();
                }
            } catch (error) {
                console.error('Erreur lors de la mise à jour:', error);
                showNotification('Erreur lors de l\'analyse', 'error');
                finishPlay();
            }
        }, ATTACK_POLL_MS);
    } catch (error) {
        console.error('Erreur lors du démarrage de l\'attaque:', error);
        showNotification('Erreur lors du démarrage de l\'analyse', 'error');
        finishPlay();
    }
}


//==NEXT WORD==//
function nextWord() {
    currentIndexData++;
    if (currentIndexData === dataChiffre.length) {
        showNotification('Comparaison avec le message clair', 'info');
    }
    if (currentIndexData > dataChiffre.length) {
        currentIndexData--;
        showNotification('Aucune analyse suivante disponible', 'info');
        return;
    }
    if (currentIndexData > 0 && currentIndexData < dataChiffre.length-1) {
        motChiffre = dataChiffre[currentIndexData].mot_chiffre;
        motTraduit = dataChiffre[currentIndexData].mot_traduit;
        currentMapping = dataChiffre[currentIndexData].dictionnaire;
        document.getElementById('motChiffreText').value = motChiffre;
        document.getElementById('motTraduitText').value = motTraduit;
    } else {
        document.getElementById('motChiffreText').value = '';
        document.getElementById('motTraduitText').value = '';
    }
    updateMappingDisplay();
    applyDecryption();
}

//==PREVIOUS WORD==//
function previousWord() {
    currentIndexData--;
    if (currentIndexData < 0) {
        currentIndexData ++;
        showNotification('Aucun analyse précédente disponible', 'info');
        return;
    }
    motChiffre = dataChiffre[currentIndexData].mot_chiffre;
    motTraduit = dataChiffre[currentIndexData].mot_traduit;
    currentMapping = dataChiffre[currentIndexData].dictionnaire;
    if (currentIndexData > 0 && currentIndexData < dataChiffre.length-1) {
        document.getElementById('motChiffreText').value = motChiffre;
        document.getElementById('motTraduitText').value = motTraduit;
    }
    else {
        document.getElementById('motChiffreText').value = '';
        document.getElementById('motTraduitText').value = '';
    }
    updateMappingDisplay();
    applyDecryption();
}
//--Comparaison de 2 dictionnaires--//
function compare() {
    const previousMapping = dataChiffre[currentIndexData - 1].dictionnaire;
    const currentMapping = dataChiffre[currentIndexData].dictionnaire;
    const differenceMapping = {};
    for (const key in previousMapping) {
        if (previousMapping[key] !== currentMapping[key]) {
            differenceMapping[key] = currentMapping[key];
        }
    }
    console.log(differenceMapping);
    return differenceMapping;
}


// ===== CHARGEMENT DES DONNÉES ===== //
function loadCipherTextFromStorage() {
    
    let cipherText = null;
    let source = '';
    
    // 1. Essayer localStorage cipherText
    cipherText = localStorage.getItem('cipherText');
    if (cipherText) {
        source = 'localStorage cipherText';
    }
    
    // 2. Essayer localStorage attackData (fallback)
    if (!cipherText) {
        const attackData = localStorage.getItem('attackData');
        if (attackData) {
            try {
                const data = JSON.parse(attackData);
                if (data.cipherText) {
                    cipherText = data.cipherText;
                    source = 'localStorage attackData';
                }
            } catch (e) {
                // Erreur silencieuse
            }
        }
    }
    
    // 3. Vérifier le résultat final
    if (!cipherText || cipherText.trim().length === 0) {
        showNotification('Aucun texte chiffré trouvé. Utilisez d\'abord la page d\'attaque.', 'error');
        return false;
    }
    return true;
}

// Nouvelle fonction pour charger les textes originaux
function loadOriginalTexts() {
    // Charger le texte chiffré original
    let cipherText = localStorage.getItem('cipherText');
    
    // Essayer aussi de récupérer depuis attackData
    const attackData = localStorage.getItem('attackData');
    if (attackData) {
        try {
            const data = JSON.parse(attackData);
            if (data.cipherText && !cipherText) {
                cipherText = data.cipherText;
            }
            if (data.plainText && !document.getElementById('originalPlainText').value) {
                document.getElementById('originalPlainText').value = data.plainText;
            }
        } catch (e) {
            console.log('Erreur lors du parsing des données d\'attaque:', e);
        }
    }
    
    if (cipherText) {
        document.getElementById('originalCipherText').value = cipherText;
        // Mettre à jour l'affichage du mapping (s'il y en a un)
        updateMappingDisplay();
    }
    
    // Charger le texte en clair original (si disponible)
    const plainText = localStorage.getItem('plaintext');
    if (plainText) {
        document.getElementById('originalPlainText').value = plainText;
    }
}

// ===== MAPPING ===== //
function loadMappingFromStorage() {
    const mapping = localStorage.getItem('mapping');
    if (mapping) {
        currentMapping = JSON.parse(mapping);
    }
    updateMappingDisplay();
}

function updateMappingDisplay() {
    // Alphabet chiffré (ligne du haut)
    const cipherContainer = document.getElementById('cipherAlphabet');
    if (cipherContainer) {
        cipherContainer.innerHTML = '';
        ALPHABET_DISPLAY.forEach(letter => {
            const letterBox = document.createElement('div');
            letterBox.className = 'alphabet-letter cipher';
            letterBox.textContent = letter.toUpperCase();
            cipherContainer.appendChild(letterBox);
        });
    }

    // Flèches
    const arrowsContainer = document.getElementById('arrowsRow');
    if (arrowsContainer) {
        arrowsContainer.innerHTML = '';
        ALPHABET_DISPLAY.forEach(() => {
            const arrow = document.createElement('div');
            arrow.className = 'arrow';
            arrow.textContent = '↓';
            arrowsContainer.appendChild(arrow);
        });
    }

    // Alphabet clair (ligne du bas)
    const clearContainer = document.getElementById('clearAlphabet');
    if (clearContainer) {
        clearContainer.innerHTML = '';
        ALPHABET_DISPLAY.forEach(letter => {
            const letterBox = document.createElement('div');
            letterBox.className = 'alphabet-letter';
            
            if (currentMapping[letter] ) {
                letterBox.textContent = currentMapping[letter].toUpperCase();
                letterBox.classList.add('clear');
            } else {
                letterBox.textContent = '?';
                letterBox.classList.add('empty');
            }
            
            clearContainer.appendChild(letterBox);
        });
    }
}





// ===== DÉCHIFFREMENT ===== //
function applyDecryption() {
    const cipherText = localStorage.getItem('cipherText') || '';
    

    const currentDecryptedText = decryptText(cipherText, currentMapping);
    console.log(currentDecryptedText);
    let comparedText = [];
    if (currentIndexData > 0 && currentIndexData < dataChiffre.length) {
        const previousMapping = dataChiffre[currentIndexData - 1].dictionnaire;
        const previousDecryptedText = decryptText(cipherText, previousMapping);
        console.log(previousDecryptedText);
        comparedText = compareTexts(currentDecryptedText, previousDecryptedText);
    } else if (currentIndexData === 0) 
    {
        comparedText = compareTexts(currentDecryptedText, cipherText);
    }
    else {
        comparedText = compareTexts(currentDecryptedText, document.getElementById('originalPlainText').value);
    }
    displayComparedText(comparedText);
    
    showNotification('Déchiffrement appliqué', 'success');
}

function decryptText(text, mapping) {
    return text.split('').map(char => {
        const lowerChar = char.toLowerCase();
        if (mapping[lowerChar]) {
            return char === char.toUpperCase() ? 
                mapping[lowerChar].toUpperCase() : 
                mapping[lowerChar];
        }
        return char;
    }).join('');
}

function updateLiveDecryption() {
        applyDecryption();
    }

// ===== COMPARAISON DE TEXTES ===== //
function compareTexts(decryptedText, originalPlainText) {
    const decrypted = decryptedText.toLowerCase();
    const original = originalPlainText.toLowerCase();
    const maxLength = Math.max(decrypted.length, original.length);
    
    let comparedChars = [];
    
    for (let i = 0; i < maxLength; i++) {
        const decryptedChar = decrypted[i] || '';
        const originalChar = original[i] || '';
        
        comparedChars.push({
            char: decryptedText[i] || '', // Garder la casse originale
            isCorrect: decryptedChar === originalChar,
            isMissing: i >= decrypted.length,
            isExtra: i >= original.length
        });
    }
    
    return comparedChars;
}

function displayComparedText(comparedChars) {
    const textarea = document.getElementById('decryptedText');
    const container = textarea.parentNode;
    
    // Créer un div pour afficher le texte avec coloration
    let coloredDiv = document.getElementById('coloredDecryptedText');
    if (!coloredDiv) {
        coloredDiv = document.createElement('div');
        coloredDiv.id = 'coloredDecryptedText';
        coloredDiv.className = 'colored-text-display';
        
        // Insérer après le textarea et le cacher
        container.insertBefore(coloredDiv, textarea.nextSibling);
        textarea.style.display = 'none';
    }
    
    // Construire le HTML avec les caractères colorés
    let html = '';
    comparedChars.forEach(charData => {
        const char = charData.char;
        
        if (charData.isCorrect) {
            // Caractère correct - vert
            html += `<span class="char-correct">${char === ' ' ? '&nbsp;' : char}</span>`;
        } else if (charData.isMissing) {
            // Caractère manquant - rouge avec glow
            html += `<span class="char-missing">_</span>`;
        } else if (charData.isExtra) {
            // Caractère en trop - orange avec glow
            html += `<span class="char-extra">${char === ' ' ? '&nbsp;' : char}</span>`;
        } else {
            // Caractère incorrect - rouge avec glow
            html += `<span class="char-incorrect">${char === ' ' ? '&nbsp;' : char}</span>`;
        }
    });
    
    coloredDiv.innerHTML = html;
    
    // Calculer les statistiques
    const correct = comparedChars.filter(c => c.isCorrect).length;
    const total = comparedChars.length;
    const accuracy = total > 0 ? ((correct / total) * 100).toFixed(1) : 0;
    
    // Afficher les statistiques
    let statsDiv = document.getElementById('comparisonStats');
    if (!statsDiv) {
        statsDiv = document.createElement('div');
        statsDiv.id = 'comparisonStats';
        statsDiv.className = 'comparison-stats';
        container.appendChild(statsDiv);
    }
    
    statsDiv.innerHTML = `
        <div class="stats-content">
            <span class="stat-item">
                <i class="fas fa-check-circle"></i>
                Précision: <strong>${accuracy}%</strong>
            </span>
            <span class="stat-item">
                <i class="fas fa-chart-bar"></i>
                ${correct}/${total} caractères corrects
            </span>
        </div>
    `;
}

// ===== UTILITAIRES ===== //
function applyMatch(cipherLetter, clearLetter) {
    currentMapping[cipherLetter] = clearLetter;
    updateMappingDisplay();
    updateLiveDecryption();
}

// ===== ANIMATION D'ÉLECTRICITÉ (PARTICULES SEULEMENT) ===== //
function startElectricityAnimation() {
    electricityActive = true;
    // Ne plus activer les bordures électriques de alphabetMapping
    // const alphabetMapping = document.getElementById('alphabetMapping');
    const energyDots = document.getElementById('energyDots');
    
    // Bordures électriques désactivées
    // if (alphabetMapping) {
    //     alphabetMapping.classList.add('electricity-active');
    // }
    
    // Garder seulement les particules d'énergie
    if (energyDots) {
        energyDots.classList.add('active');
    }
    
    console.log('Animation de particules d\'énergie démarrée (bordures désactivées)');
}

function stopElectricityAnimation() {
    electricityActive = false;
    // Ne plus désactiver les bordures électriques de alphabetMapping
    // const alphabetMapping = document.getElementById('alphabetMapping');
    const energyDots = document.getElementById('energyDots');
    
    // Bordures électriques désactivées
    // if (alphabetMapping) {
    //     alphabetMapping.classList.remove('electricity-active');
    // }
    
    // Arrêter seulement les particules d'énergie
    if (energyDots) {
        energyDots.classList.remove('active');
    }
    
    console.log('Animation de particules d\'énergie arrêtée');
}

// ===== ANIMATION DE PARTICULES DE LOADING ===== //
function startLoadingParticles() {
    loadingParticlesActive = true;
    const loadingOverlay = document.getElementById('loadingParticlesOverlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.add('active');
    }
    
    console.log('Animation de particules de loading démarrée');
}

function stopLoadingParticles() {
    loadingParticlesActive = false;
    const loadingOverlay = document.getElementById('loadingParticlesOverlay');
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('active');
    }
    
    console.log('Animation de particules de loading arrêtée');
}

function clearMapping() {
    currentMapping = {};
    updateMappingDisplay();
    document.getElementById('decryptedText').value = '';
    showNotification('Mapping réinitialisé', 'success');
}

function copyResult() {
    const textarea = document.getElementById('decryptedText');
    const coloredDiv = document.getElementById('coloredDecryptedText');
    
    let textToCopy = '';
    
    if (coloredDiv && coloredDiv.style.display !== 'none') {
        // Si on affiche le texte coloré, copier le texte brut
        textToCopy = coloredDiv.textContent || coloredDiv.innerText;
    } else {
        // Sinon copier depuis le textarea
        textToCopy = textarea.value;
    }
    
    // Utiliser l'API moderne clipboard si disponible
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification('Texte copié dans le presse-papiers', 'success');
        }).catch(() => {
            // Fallback vers l'ancienne méthode
            fallbackCopy(textToCopy);
        });
    } else {
        fallbackCopy(textToCopy);
    }
}

function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
    document.execCommand('copy');
    showNotification('Texte copié dans le presse-papiers', 'success');
    } catch (err) {
        showNotification('Erreur lors de la copie', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info') {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Styles inline pour la notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #00ff88, #00cc6a)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ff6b6b, #ee5a52)' : 
                   'linear-gradient(135deg, #4dabf7, #339af0)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 400px;
        font-weight: 500;
    `;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animation d'entrée
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 100);
    
    // Suppression automatique après 5 secondes
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
    
    // Permettre la fermeture au clic
    notification.addEventListener('click', () => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });
}