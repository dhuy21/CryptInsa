// === VARIABLES GLOBALES ===
let currentLanguage = 'french';
let cipherText = '';

// Alphabet français (avec espaces)
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';

// Exemple de texte chiffré pour la démonstration
const EXAMPLE_TEXT = "QHOV VBJA BHJ VB PEJM FBJA UB DIJOH ZBV DBJVPO BV VB PEJM UB ZIJM EJJFM MVJM EPJM EJJFM ZB DIBM POB NBJVDM";

// === ÉLÉMENTS DOM ===
const elements = {
    inputText: null,
    inputLength: null,
    letterCount: null,
    uniqueLetters: null,
    launchAttack: null
};

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    updateStats();
});

// === INITIALISATION DES ÉLÉMENTS DOM ===
function initializeElements() {
    elements.inputText = document.getElementById('inputText');
    elements.inputLength = document.getElementById('inputLength');
    elements.letterCount = document.getElementById('letterCount');
    elements.uniqueLetters = document.getElementById('uniqueLetters');
    elements.launchAttack = document.getElementById('launchAttack');
    inputText.value = localStorage.getItem('ciphertext');
}

// === INITIALISATION DE LA TABLE DE SUBSTITUTION ===
function initializeSubstitutionTable() {
    // Créer les lettres originales
    for (let i = 0; i < ALPHABET.length; i++) {
        const letter = ALPHABET[i];
        
        // Lettre originale
        const letterBox = document.createElement('div');
        letterBox.className = 'letter-box';
        letterBox.textContent = letter === ' ' ? '␣' : letter;
        letterBox.dataset.letter = letter;
        elements.originalLetters.appendChild(letterBox);
        
        // Flèche
        const arrow = document.createElement('div');
        arrow.className = 'arrow';
        arrow.innerHTML = '<i class="fas fa-arrow-down"></i>';
        elements.arrowsContainer.appendChild(arrow);
        
        // Input de substitution
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'substitution-input';
        input.maxLength = 1;
        input.dataset.original = letter;
        input.placeholder = letter === ' ' ? '␣' : letter;
        input.value = letter === ' ' ? ' ' : letter;
        elements.substitutionInputs.appendChild(input);
        
        // Initialiser la table
        substitutionTable[letter] = letter;
    }
}

// === CONFIGURATION DES ÉVÉNEMENTS ===
function setupEventListeners() {
    // Zone de texte
    elements.inputText.addEventListener('input', () => {
        updateStats();
        updateAttackButton();
    });
    
    // Boutons d'action

    
    // Bouton d'attaque
    elements.launchAttack.addEventListener('click', launchAttack);
    
    // Options de langue
    document.querySelectorAll('input[name="language"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            currentLanguage = e.target.value;
        });
    });
}

// === ACTIONS SUR LE TEXTE ===


// === STATISTIQUES ET MISE À JOUR ===
function updateStats() {
    const text = elements.inputText.value.toUpperCase();
    const totalChars = text.length;
    
    // Compter les lettres (sans espaces ni ponctuation)
    const letters = text.match(/[A-Z]/g) || [];
    const letterCount = letters.length;
    
    // Compter les lettres uniques
    const uniqueLetters = new Set(letters).size;
    
    elements.inputLength.textContent = totalChars;
    elements.letterCount.textContent = letterCount;
    elements.uniqueLetters.textContent = uniqueLetters;
    
    cipherText = text;
    
    // Sauvegarder automatiquement le texte dans localStorage
    if (text.trim()) {
        try {
            localStorage.setItem('cipherText', text);
        } catch (error) {
            // Erreur silencieuse
        }
    } else {
        localStorage.removeItem('cipherText');
    }
}

function updateAttackButton() {
    const text = elements.inputText.value.trim();
    const hasEnoughText = text.length > 50; // Minimum 50 caractères pour une analyse fiable
    
    elements.launchAttack.disabled = !hasEnoughText;
    
    if (hasEnoughText) {
        elements.launchAttack.querySelector('.attack-title').textContent = 'LANCER L\'ATTAQUE';
        elements.launchAttack.querySelector('.attack-subtitle').textContent = 'Analyse de Fréquences';
    } else {
        elements.launchAttack.querySelector('.attack-title').textContent = 'TEXTE TROP COURT';
        elements.launchAttack.querySelector('.attack-subtitle').textContent = 'Min. 50 caractères requis';
    }
}



// === LANCEMENT DE L'ATTAQUE ===
function launchAttack() {
    const currentText = elements.inputText.value.trim();
    
    if (!currentText) {
        showNotification('Aucun texte à analyser', 'error');
        return;
    }
    
    if (currentText.length < 50) {
        showNotification('Texte trop court pour une analyse fiable', 'warning');
        return;
    }
    
    // Forcer la mise à jour de cipherText
    cipherText = currentText.toUpperCase();
    
    // Sauvegarder les données pour la page d'analyse
    const attackData = {
        cipherText: cipherText,
        language: currentLanguage,
        timestamp: Date.now()
    };
    
    try {
        // Stocker dans localStorage pour la page suivante
        localStorage.setItem('attackData', JSON.stringify(attackData));
        localStorage.setItem('cipherText', cipherText);
    } catch (error) {
        showNotification('Erreur lors de la sauvegarde', 'error');
        return;
    }
    
    // Animation de lancement
    elements.launchAttack.innerHTML = `
        <div class="attack-icon">
            <i class="fas fa-spinner fa-spin"></i>
        </div>
        <div class="attack-text">
            <span class="attack-title">LANCEMENT...</span>
            <span class="attack-subtitle">Redirection en cours</span>
        </div>
    `;
    
    elements.launchAttack.disabled = true;
    
    // Redirection vers la page d'analyse
    setTimeout(async() => {
        // Sauvegarder dans localStorage
        localStorage.setItem('cipherText', cipherText);
        localStorage.setItem('attackData', JSON.stringify(attackData));
        
        // Redirection vers la page d'analyse de fréquences
        showNotification('Redirection vers l\'analyse de fréquences...', 'info');
        await window.startAttack(cipherText);
        window.location.href = 'substitution_annalyse';        
        // Restaurer le bouton après la simulation
        setTimeout(() => {
            elements.launchAttack.innerHTML = `
                <div class="attack-icon">
                    <i class="fas fa-rocket"></i>
                </div>
                <div class="attack-text">
                    <span class="attack-title">LANCER L'ATTAQUE</span>
                    <span class="attack-subtitle">Analyse de Fréquences</span>
                </div>
            `;
            elements.launchAttack.disabled = false;
        }, 2000);
    }, 1000);
}



// === NOTIFICATIONS ===
function showNotification(message, type = 'info') {
    // Supprimer les notifications existantes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// === STYLES POUR LES SUGGESTIONS ===
const suggestionStyles = document.createElement('style');
suggestionStyles.textContent = `
    .suggestions-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.02);
        border: 1px solid var(--border-color);
        border-radius: var(--border-radius);
    }
    
    .suggestions-section h4 {
        margin: 0 0 1rem 0;
        color: var(--primary-color);
    }
    
    .suggestions-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 0.8rem;
        margin-bottom: 1.5rem;
    }
    
    .suggestion-item {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.8rem;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        font-family: 'JetBrains Mono', monospace;
        font-size: 0.9rem;
    }
    
    .cipher-char, .plain-char {
        font-weight: 600;
        color: var(--text-primary);
    }
    
    .arrow {
        color: var(--accent-blue);
    }
    
    .apply-single {
        margin-left: auto;
        width: 24px;
        height: 24px;
        background: rgba(0, 255, 136, 0.1);
        border: 1px solid var(--primary-color);
        border-radius: 4px;
        color: var(--primary-color);
        cursor: pointer;
        transition: all var(--transition-normal);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
    }
    
    .apply-single:hover {
        background: var(--primary-color);
        color: var(--bg-dark);
    }
    
    .suggestions-actions {
        display: flex;
        gap: 1rem;
        justify-content: center;
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(suggestionStyles);
