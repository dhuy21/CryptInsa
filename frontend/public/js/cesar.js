// === VARIABLES GLOBALES ===
let currentShift = 0; // Commencer avec décalage 1 (position neutre)
let isRotating = false;
let startAngle = 0;
let currentAngle = 0;
let mode = 'encrypt'; // 'encrypt' ou 'decrypt'

// === ALPHABET FRANÇAIS ===
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_,.';

// === ÉLÉMENTS DOM ===
const elements = {
    wheelInner: null,
    wheelHandle: null,
    cesarMode: null,
    cesarKey: null,
    cesarKeySlider: null,
    inputText: null,
    outputText: null,
    inputLabel: null,
    outputLabel: null,
    processBtn: null,
    processButtonText: null,
    clearBtn: null,
    swapBtn: null,
    copyBtn: null,
    currentShiftSpan: null,
    originalLetter: null,
    cipherLetter: null,
    transformIcon: null,
    originalAlphabet: null,
    cipherAlphabet: null,
    highlightOriginal: null,
    highlightCipher: null,
    highlightShift: null,
    quickKeys: null,
    exampleCards: null,
    mouseUpUpdate: null
}

// === INITIALISATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    setupEventListeners();
    updateWheel(currentShift);
    updateInterface();
});

// === INITIALISATION DES ÉLÉMENTS DOM ===
function initializeElements() {
    elements.wheelInner = document.getElementById('wheelInner');
    elements.wheelHandle = document.getElementById('wheelHandle');
    elements.cesarMode = document.getElementById('cesarMode');
    elements.cesarKey = document.getElementById('cesarKey');
    elements.cesarKeySlider = document.getElementById('cesarKeySlider');
    elements.inputText = document.getElementById('inputText');
    elements.outputText = document.getElementById('outputText');
    elements.processBtn = document.getElementById('processText');
    elements.processButtonText = document.getElementById('processButtonText');
    elements.clearBtn = document.getElementById('clearText');
    elements.swapBtn = document.getElementById('cesarMode');
    elements.copyBtn = document.getElementById('copyResult');
    elements.currentShiftSpan = document.getElementById('currentShift');
    elements.originalLetter = document.getElementById('originalLetter');
    elements.cipherLetter = document.getElementById('cipherLetter');
    elements.transformIcon = document.getElementById('transformIcon');
    elements.originalAlphabet = document.getElementById('originalAlphabet');
    elements.cipherAlphabet = document.getElementById('cipherAlphabet');
    elements.highlightOriginal = document.getElementById('highlightOriginal');
    elements.highlightCipher = document.getElementById('highlightCipher');
    elements.highlightShift = document.getElementById('highlightShift');
    elements.quickKeys = document.querySelectorAll('.quick-key');
    elements.exampleCards = document.querySelectorAll('.example-card');
    elements.inputLabel = document.getElementById('inputLabel');
    elements.outputLabel = document.getElementById('outputLabel');
    // Debug: vérifier si le bouton delete est trouvé
    console.log('Clear button found:', elements.clearBtn);
    elements.cesarMode.value = 'encrypt'; // Initialiser le mode par défaut
    elements.inputLabel.textContent = 'Message';
    elements.outputLabel.textContent = 'Chiffré';
}

// === CONFIGURATION DES ÉVÉNEMENTS ===
function setupEventListeners() {
    // Roue rotative - Souris
    if (elements.wheelInner) {
        elements.wheelInner.addEventListener('mousedown', startRotation);
        document.addEventListener('mousemove', rotate);
        document.addEventListener('mouseup', stopRotation);
    }
    if (elements.wheelHandle) {
        elements.wheelHandle.addEventListener('mousedown', startRotation);
    }

    // Roue rotative - Touch (mobile)
    if (elements.wheelInner) {
        elements.wheelInner.addEventListener('touchstart', startRotationTouch, { passive: false });
        document.addEventListener('touchmove', rotateTouch, { passive: false });
        document.addEventListener('touchend', stopRotation);
    }
    if (elements.wheelHandle) {
        elements.wheelHandle.addEventListener('touchstart', startRotationTouch, { passive: false });
    }


    // Contrôles
    if (elements.cesarMode) {
        elements.cesarMode.addEventListener('change', handleModeChange);
    }
    if (elements.cesarKey) {
        elements.cesarKey.addEventListener('input', handleKeyChange);
    }
   

    // Boutons d'action
    if (elements.processBtn) {
        elements.processBtn.addEventListener('click', processText);
    }
    if (elements.clearBtn) {
        elements.clearBtn.addEventListener('click', clearText);
    }
    if (elements.swapBtn) {
        elements.swapBtn.addEventListener('click', swapTexts);
    }
    if (elements.copyBtn) {
        elements.copyBtn.addEventListener('click', copyResult);
    }

    // Texte en temps réel
    if (elements.inputText) {
        elements.inputText.addEventListener('input', processTextRealTime);
    }

    // Clés rapides
    if (elements.quickKeys) {
        elements.quickKeys.forEach(key => {
            key.addEventListener('click', () => {
                const keyValue = parseInt(key.getAttribute('data-key'));
                setShift(keyValue);
            });
        });
    }

    // Exemples
    if (elements.exampleCards) {
        elements.exampleCards.forEach(card => {
            card.addEventListener('click', () => {
                const text = card.getAttribute('data-text');
                const key = parseInt(card.getAttribute('data-key'));
                const cardMode = card.getAttribute('data-mode');
                
                elements.inputText.value = text;
                setShift(key);
                if (cardMode !== mode && elements.cesarMode) {
                    elements.cesarMode.value = cardMode;
                    handleModeChange();
                }
            });
        });
    }
}

// === ROTATION DE LA ROUE - SOURIS ===
function startRotation(e) {
    e.preventDefault();
    isRotating = true;
    
    const rect = elements.wheelInner.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    elements.wheelInner.style.cursor = 'grabbing';
}

function rotate(e) {
    if (!isRotating) return;
    e.preventDefault();
    
    const rect = elements.wheelInner.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const currentMouseAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    const deltaAngle = currentMouseAngle - startAngle;
    
    // Convertir l'angle en décalage (29 lettres = 360°)
    // Inverser le sens pour que la roue suive le mouvement de la souris
    const deltaShift = Math.round((-deltaAngle * 29) / (2 * Math.PI));
    const newShift = Math.max(0, Math.min(28, currentShift + deltaShift));
    
    if (newShift !== currentShift) {
        setShift(newShift);
        startAngle = currentMouseAngle;
    }
}

function stopRotation() {
    isRotating = false;
    elements.wheelInner.style.cursor = 'grab';
}

// === ROTATION DE LA ROUE - TOUCH ===
function startRotationTouch(e) {
    e.preventDefault();
    if (e.touches.length !== 1) return;
    
    isRotating = true;
    const touch = e.touches[0];
    
    const rect = elements.wheelInner.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    startAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
}

function rotateTouch(e) {
    if (!isRotating || e.touches.length !== 1) return;
    e.preventDefault();
    
    const touch = e.touches[0];
    const rect = elements.wheelInner.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const currentTouchAngle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX);
    const deltaAngle = currentTouchAngle - startAngle;
    
    // Inverser le sens pour que la roue suive le mouvement tactile
    const deltaShift = Math.round((-deltaAngle * 29) / (2 * Math.PI));
    const newShift = Math.max(0, Math.min(28, currentShift + deltaShift));
    
    if (newShift !== currentShift) {
        setShift(newShift);
        startAngle = currentTouchAngle;
    }
}

// === GESTION DU DÉCALAGE ===
function setShift(shift) {
    currentShift = shift;
    updateWheel(shift);
    updateControls(shift);
    updateInterface();
    
    // Chiffrement en temps réel quand la roue tourne
    processTextRealTime();
}

function updateWheel(shift) {
    // Rotation de la roue intérieure (360° / 29 lettres = 13.333° par lettre)
    // Rotation négative pour que le décalage visuel corresponde au chiffrement
    const rotation = -(shift * 360) / 29;
    elements.wheelInner.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
    
    // Mise à jour de l'indicateur - correction du calcul de correspondance
    const originalLetter = 'A';
    const originalIndex = 0; // Position de 'A' dans l'alphabet
    const cipherIndex = (originalIndex + shift) % 29;
    const cipherLetter = ALPHABET[cipherIndex];
    elements.originalLetter.textContent = originalLetter;
    elements.cipherLetter.textContent = cipherLetter;
}

function updateControls(shift) {
    if (elements.cesarKey) {
        elements.cesarKey.value = shift;
    }
    if (elements.currentShiftSpan) {
        elements.currentShiftSpan.textContent = shift;
    }
    
    // Mise à jour des clés rapides
    if (elements.quickKeys) {
        elements.quickKeys.forEach(key => {
            const keyValue = parseInt(key.getAttribute('data-key'));
            key.classList.toggle('active', keyValue === shift);
        });
    }
}

function updateInterface() {
    if (elements.cesarMode) {
        mode = elements.cesarMode.value;
    }
    
    // Mise à jour du bouton et de l'icône
    if (elements.processButtonText) {
        if (mode === 'encrypt') {
            elements.processButtonText.textContent = 'Chiffrer';
        } else {
            elements.processButtonText.textContent = 'Déchiffrer';
        }
    }
    
    if (elements.transformIcon) {
        if (mode === 'encrypt') {
            elements.transformIcon.className = 'fas fa-arrow-down';
        } else {
            elements.transformIcon.className = 'fas fa-arrow-up';
        }
    }
    
    // Mise à jour des exemples en temps réel - correction du calcul
    const originalExample = 'A';
    const exampleOriginalIndex = 0; // Position de 'A' dans l'alphabet
    const exampleCipherIndex = (exampleOriginalIndex + currentShift) % 29;
    const cipherExample = ALPHABET[exampleCipherIndex];
    if (elements.highlightOriginal) {
        elements.highlightOriginal.textContent = originalExample;
    }
    if (elements.highlightCipher) {
        elements.highlightCipher.textContent = cipherExample;
    }
    if (elements.highlightShift) {
        elements.highlightShift.textContent = currentShift;
    }
}

// === GESTION DES ÉVÉNEMENTS DE CONTRÔLE ===
function handleModeChange() {
    updateInterface();
    processTextRealTime();
}

function handleKeyChange() {
    const shift = parseInt(elements.cesarKey.value);
    if (shift >= 0 && shift <= 26) {
        setShift(shift);
    }
}

// === CHIFFREMENT EN TEMPS RÉEL ===
async function processTextRealTime() {
    const inputText = elements.inputText.value.trim();
    if (!inputText) {
        elements.outputText.value = '';
        return;
    }

    try {
        if (mode === 'encrypt') {
            await cesarEncryptText();
        } else {
            await cesarDecryptText();
        }
    } catch (error) {
        console.error('Erreur lors du chiffrement en temps réel:', error);
        elements.outputText.value = 'Erreur de connexion au serveur';
    }
}

function normalizeForCesar(text) {
    return text
        .replace(/œ/g, 'oe')
        .replace(/Œ/g, 'OE')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z.,]/g, ' ')
        .replace(/\s+/g, ' ');
}

// === CHIFFREMENT CÔTÉ SERVEUR ===
async function cesarEncryptText() {
    // Check if cesar function is available
    if (typeof window.cesar !== 'function') {
        console.error('Cesar function not available. Make sure flask.js is loaded.');
        elements.outputText.value = 'Fonction cesar non disponible';
        return;
    }
    
    try {
        const result = await window.cesar(normalizeForCesar(elements.inputText.value), currentShift);
        // window.cesar() renvoie un objet avec une propriété encrypted
        const encryptedText = result.encrypted;
        console.log("encryptedText:", encryptedText);
        elements.outputText.value = encryptedText;
    } catch (error) {
        console.error('Erreur lors du chiffrement serveur:', error);
        elements.outputText.value = 'Erreur de chiffrement';
    }
}

// === DÉCHIFFREMENT CÔTÉ SERVEUR ===
async function cesarDecryptText() {
    // Check if cesarDecrypt function is available
    if (typeof window.cesarDecrypt !== 'function') {
        console.error('CesarDecrypt function not available. Make sure flask.js is loaded.');
        elements.outputText.value = 'Fonction cesarDecrypt non disponible';
        return;
    }
    
    try {
        const result = await window.cesarDecrypt(normalizeForCesar(elements.inputText.value), currentShift);
        // window.cesarDecrypt() renvoie un objet avec une propriété decrypted
        const decryptedText = result.decrypted || result.result;
        console.log("decryptedText:", decryptedText);
        elements.outputText.value = decryptedText;
    } catch (error) {
        console.error('Erreur lors du déchiffrement serveur:', error);
        elements.outputText.value = 'Erreur de déchiffrement';
    }
}

// === AUTRES FONCTIONS ===
function clearText() {
    if (elements.inputText) {
        elements.inputText.value = '';
    }
    if (elements.outputText) {
        elements.outputText.value = '';
    }
    showNotification('Texte effacé.', 'info');
}

function swapTexts() {
    const inputValue = elements.inputText.value;
    const outputValue = elements.outputText.value;
    
    elements.inputText.value = outputValue;
    elements.outputText.value = inputValue;
    
    // Inverser le mode
    const newMode = (mode === "encrypt" ? "decrypt" : "encrypt");
    elements.cesarMode.value = newMode;
    elements.inputLabel.textContent = (newMode === "encrypt" ? 'Message' : 'Chiffré');
    elements.outputLabel.textContent = (newMode === "encrypt" ? 'Chiffré' : 'Message');
    handleModeChange();
    
    showNotification('Textes inversés.', 'info');
}

async function copyResult() {
    try {
        await navigator.clipboard.writeText(elements.outputText.value);
        showNotification('Résultat copié dans le presse-papiers !', 'success');
        
        // Animation du bouton
        elements.copyBtn.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            elements.copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        }, 1000);
    } catch (error) {
        // Fallback pour les navigateurs plus anciens
        elements.outputText.select();
        document.execCommand('copy');
        showNotification('Résultat copié !', 'success');
    }
}

// === NOTIFICATIONS ===
let notificationTimeout = null;

function showNotification(message, type = 'info') {
    // Annuler le timeout précédent s'il existe
    if (notificationTimeout) {
        clearTimeout(notificationTimeout);
        notificationTimeout = null;
    }
    
    // Supprimer toutes les notifications existantes immédiatement
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.style.animation = 'slideOut 0.2s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 200);
    });
    
    // Attendre un petit délai pour que l'animation de sortie se termine
    setTimeout(() => {
        // Créer la nouvelle notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        // Styles pour la notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${getNotificationColor(type)};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: 500;
            max-width: 300px;
            animation: slideIn 0.3s ease;
            pointer-events: auto;
        `;
        
        document.body.appendChild(notification);
        
        // Permettre à l'utilisateur de fermer la notification en cliquant dessus
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
            if (notificationTimeout) {
                clearTimeout(notificationTimeout);
                notificationTimeout = null;
            }
        });
        
        // Supprimer après 3 secondes
        notificationTimeout = setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
            notificationTimeout = null;
        }, 3000);
    }, 250);
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

function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        error: '#e74c3c',
        warning: '#f39c12',
        info: '#3498db'
    };
    return colors[type] || '#3498db';
}

// === ANIMATIONS CSS POUR LES NOTIFICATIONS ===
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(notificationStyles);

// === FONCTIONS UTILITAIRES ===
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debounce pour le traitement en temps réel
const debouncedProcessText = debounce(processTextRealTime, 300);

// === RACCOURCIS CLAVIER ===
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter pour traiter le texte
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        processText();
    }
    
    // Ctrl/Cmd + Delete pour effacer
    if ((e.ctrlKey || e.metaKey) && e.key === 'Delete') {
        e.preventDefault();
        clearText();
    }
    
    // Ctrl/Cmd + Shift + S pour inverser
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        swapTexts();
    }
    
    // Flèches pour changer le décalage
    if (e.target === elements.inputText || e.target === elements.outputText) {
        if (e.ctrlKey && e.key === 'ArrowUp') {
            e.preventDefault();
            setShift(Math.min(25, currentShift + 1));
        } else if (e.ctrlKey && e.key === 'ArrowDown') {
            e.preventDefault();
            setShift(Math.max(1, currentShift - 1));
        }
    }
});

// === EXPORT DES FONCTIONS PRINCIPALES ===
window.CesarWheel = {
    setShift,
    processText,
    clearText,
    swapTexts,
    getCurrentShift: () => currentShift,
    getMode: () => mode
};

// === FONCTIONS DE CHIFFREMENT/DÉCHIFFREMENT ===
async function processText() {
    const inputText = elements.inputText.value.trim();
    if (!inputText) {
        showNotification('Veuillez entrer du texte à traiter.', 'warning');
        return;
    }

    try {
        if (mode === 'encrypt') {
            await cesarEncryptText();
        } else {
            await cesarDecryptText();
        }
        showNotification('Traitement réussi !', 'success');
    } catch (error) {
        console.error('Erreur lors du traitement:', error);
        showNotification('Erreur lors du traitement du texte.', 'error');
    }
}
//Fin du chiffrement de cesa    r
//Il faut ajouter des estapes pour comprendre le chiffrement de cesar