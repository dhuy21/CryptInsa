// ===== SUBSTITUTION FREQUENCY ANALYSIS - JAVASCRIPT SIMPLIFIÉ ===== //

// Alphabet français
const FRENCH_ALPHABET = 'abcdefghijklmnopqrstuvwxyz ,.';

// Variables globales
let FRENCH_FREQUENCIES = {};
let cipherFrequencies = {};
let currentMapping = {};
let analyzedText = '';

// Initialisation
document.addEventListener('DOMContentLoaded', async function() {
    setupEventListeners();
    loadCipherTextFromStorage();
    try {
        FRENCH_FREQUENCIES = await window.frenchFrequencies();
        initializeFrenchChart();
    } catch (error) {
        console.error('Erreur lors du chargement des fréquences françaises:', error);
    }
});

// ===== INITIALISATION ===== //
function setupEventListeners() {
    document.getElementById('refreshAnalysis').addEventListener('click', loadCipherTextFromStorage);
    document.getElementById('nextStep').addEventListener('click', nextStep);
}
// ===== NEXT STEP ===== //
function nextStep() {    
    window.location.href = '/substitution_dechiffre';

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
    
    
    // Lancer l'analyse
    analyzeCipherText(cipherText);
    return true;
}

// ===== ANALYSE DU TEXTE ===== //
function analyzeCipherText(text) {
    if (!text || text.trim().length === 0) {
        showNotification('Aucun texte à analyser', 'error');
        return;
    }

    const cleanText = text;
    if (cleanText.length < 20) {
        showNotification('Texte trop court pour une analyse fiable (minimum 20 caractères)', 'error');
        return;
    }

    // Afficher le texte dans la preview
    const previewText = cleanText
    document.getElementById('cipherPreview').innerHTML = `<span title="Texte complet: ${cleanText}">${previewText}</span>`;
    
    // Nettoyer le texte pour l'analyse
    analyzedText = cleanText.toLowerCase().replace(/[^a-z ,.]/g, '');
    
    if (analyzedText.length === 0) {
        showNotification('Aucune lettre trouvée dans le texte', 'error');
        return;
    }
    
    // Calculer les fréquences
    cipherFrequencies = calculateFrequencies(analyzedText);
    
    // Mettre à jour l'affichage
    drawCipherChart();
    updateStats();
    generateSuggestedMatches();
    
    showNotification(`Analyse terminée: ${analyzedText.length} lettres analysées`, 'success');
}

function calculateFrequencies(text) {
    const frequencies = {};
    const totalLetters = text.length;
    
    // Initialiser toutes les lettres à 0
    for (let letter of FRENCH_ALPHABET) {
        frequencies[letter] = 0;
    }
    
    // Compter les occurrences
    for (let char of text) {
        if (frequencies.hasOwnProperty(char)) {
            frequencies[char]++;
        }
    }
    
    // Convertir en pourcentages
    for (let letter in frequencies) {
        frequencies[letter] = (frequencies[letter] / totalLetters) * 100;
    }
    
    return frequencies;
}

// ===== GRAPHIQUES HTML/CSS (NO CANVAS) ===== //
function drawCipherChart() {
    const chartBars = document.getElementById('cipherBars');
    
    // Trier les lettres par fréquence
    const sortedLetters = Object.entries(cipherFrequencies)
        .filter(([, freq]) => freq > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 30); // Limiter à 30 pour plus de clarté
    
    if (sortedLetters.length === 0) {
        chartBars.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🔒</div>
                <div class="empty-message">Aucun texte chiffré analysé</div>
            </div>
        `;
        return;
    }
    
    const maxFreq = Math.max(...sortedLetters.map(([, freq]) => freq));
    
    // Générer les barres HTML
    chartBars.innerHTML = sortedLetters.map(([letter, frequency]) => {
        const widthPercent = (frequency / maxFreq) * 100;
        return `
            <div class="chart-bar" data-letter="${letter}" data-frequency="${frequency}">
                <div class="bar-letter">${letter.toUpperCase()}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${widthPercent}%">
                        <div class="bar-inner-value">${frequency.toFixed(1)}%</div>
                    </div>
                </div>
                <div class="bar-value">${frequency.toFixed(1)}%</div>
            </div>
        `;
    }).join('');
    
    // Ajouter l'interactivité
    addChartInteractivity();
}

// ===== FONCTIONS UTILITAIRES POUR GRAPHIQUES HTML ===== //
// Les anciennes fonctions canvas ont été remplacées par du HTML/CSS pur

function initializeFrenchChart() {
    const chartBars = document.getElementById('frenchBars');
    
    const sortedFrench = Object.entries(FRENCH_FREQUENCIES)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 27); // Limiter à 27 pour plus de clarté
    
    const maxFreq = Math.max(...sortedFrench.map(([, freq]) => freq));
    
    // Générer les barres HTML pour le français
    chartBars.innerHTML = sortedFrench.map(([letter, frequency], index) => {
        const widthPercent = (frequency / maxFreq) * 100;
        return `
            <div class="chart-bar" data-letter="${letter}" data-frequency="${frequency}" data-rank="${index + 1}">
                <div class="bar-letter">${letter.toUpperCase()}</div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${widthPercent}%">
                        <div class="bar-inner-value">${frequency.toFixed(1)}%</div>
                    </div>
                </div>
                <div class="bar-value">${frequency.toFixed(1)}%</div>
            </div>
        `;
    }).join('');
    
    // Ajouter l'interactivité
    addChartInteractivity();
}

// ===== INTERACTIVITÉ DES GRAPHIQUES HTML ===== //
function addChartInteractivity() {
    const cipherBars = document.querySelectorAll('#cipherBars .chart-bar');
    const frenchBars = document.querySelectorAll('#frenchBars .chart-bar');
    
    // Ajouter interactivité aux barres chiffrées
    cipherBars.forEach(bar => {
        addBarInteractivity(bar, 'cipher');
    });
    
    // Ajouter interactivité aux barres françaises
    frenchBars.forEach(bar => {
        addBarInteractivity(bar, 'french');
    });
}

function addBarInteractivity(bar, type) {
    const tooltip = createTooltip();
    const letter = bar.dataset.letter;
    const frequency = parseFloat(bar.dataset.frequency);
    const rank = bar.dataset.rank;
    
    // Hover effects
    bar.addEventListener('mouseenter', (e) => {
        bar.style.transform = 'translateX(5px) scale(1.02)';
        bar.style.filter = 'brightness(1.2)';
        
        const barInfo = {
            letter,
            frequency,
            type,
            rank,
            color: type === 'cipher' ? '#00ff88' : '#ff6b6b'
        };
        
        showTooltip(tooltip, e.clientX, e.clientY, barInfo);
    });
    
    bar.addEventListener('mouseleave', () => {
        bar.style.transform = '';
        bar.style.filter = '';
        hideTooltip(tooltip);
    });
    
    bar.addEventListener('mousemove', (e) => {
        const barInfo = {
            letter,
            frequency,
            type,
            rank,
            color: type === 'cipher' ? '#00ff88' : '#ff6b6b'
        };
        
        showTooltip(tooltip, e.clientX, e.clientY, barInfo);
    });
    
    // Click effects
    bar.addEventListener('click', () => {
        if (type === 'cipher') {
            highlightLetter(letter);
            showNotification(`Lettre ${letter.toUpperCase()} sélectionnée (${frequency.toFixed(1)}%)`, 'info');
        }
        
        // Animation de clic
        bar.style.transform = 'translateX(5px) scale(0.95)';
        setTimeout(() => {
            bar.style.transform = 'translateX(5px) scale(1.02)';
        }, 150);
    });
}

function createTooltip() {
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        tooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(20, 20, 30, 0.95));
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.2s ease;
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
            backdrop-filter: blur(10px);
        `;
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

function showTooltip(tooltip, x, y, barInfo) {
    const rankText = barInfo.rank ? `<div style="color: #999999; font-size: 11px;">Rang: #${barInfo.rank}</div>` : '';
    
    tooltip.innerHTML = `
        <div style="font-size: 18px; margin-bottom: 6px; text-align: center;">
            <strong style="color: ${barInfo.color}; text-shadow: 0 0 8px ${barInfo.color}50;">${barInfo.letter.toUpperCase()}</strong>
        </div>
        <div style="color: #cccccc; text-align: center; margin-bottom: 4px;">
            Fréquence: <strong style="color: white;">${barInfo.frequency.toFixed(2)}%</strong>
        </div>
        ${rankText}
        <div style="color: #999999; font-size: 12px; margin-top: 6px; text-align: center; border-top: 1px solid rgba(255,255,255,0.2); padding-top: 4px;">
            ${barInfo.type === 'cipher' ? '🔒 Texte chiffré' : ' Référence française'}
        </div>
    `;
    
    // Position tooltip with better placement
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    let left = x + 15;
    let top = y - 10;
    
    // Adjust if tooltip goes off screen
    if (left + 200 > viewportWidth) {
        left = x - 215;
    }
    if (top - 100 < 0) {
        top = y + 15;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
    tooltip.style.opacity = '1';
    tooltip.classList.add('show');
}

function hideTooltip(tooltip) {
    tooltip.style.opacity = '0';
    tooltip.classList.remove('show');
}

// Fonction getBarAtPosition supprimée - remplacée par l'interactivité directe des barres HTML

function highlightLetter(letter) {
    // Surligner temporairement dans les correspondances suggérées
    const matches = document.querySelectorAll('.match-cipher');
    matches.forEach(match => {
        if (match.textContent.toLowerCase() === letter.toLowerCase()) {
            match.parentElement.style.background = 'rgba(0, 255, 136, 0.2)';
            match.parentElement.style.transform = 'scale(1.05)';
            setTimeout(() => {
                match.parentElement.style.background = '';
                match.parentElement.style.transform = '';
            }, 1000);
        }
    });
}

function updateStats() {
    const letterCount = analyzedText.length;
    const uniqueCount = Object.values(cipherFrequencies).filter(freq => freq > 0).length;
    
    document.getElementById('cipherLetterCount').textContent = letterCount;
    document.getElementById('cipherUniqueCount').textContent = uniqueCount;
}

// ===== CORRESPONDANCES SUGGÉRÉES ===== //
function generateSuggestedMatches() {
    if (!Object.keys(cipherFrequencies).length) return;
    
    const sortedCipher = Object.entries(cipherFrequencies)
        .filter(([, freq]) => freq > 0)
        .sort((a, b) => b[1] - a[1]);
    
    const sortedFrench = Object.entries(FRENCH_FREQUENCIES)
        .sort((a, b) => b[1] - a[1]);
    
    const container = document.getElementById('suggestedMatches');
    container.innerHTML = '';
    
    const maxMatches = Math.min(sortedCipher.length, 29);
    
    for (let i = 0; i < maxMatches; i++) {
        if (i < sortedFrench.length) {
            const [cipherLetter, cipherFreq] = sortedCipher[i];
            const [frenchLetter, frenchFreq] = sortedFrench[i];
            
            const confidence = calculateConfidence(cipherFreq, frenchFreq);
            const match = createMatchItem(cipherLetter, frenchLetter, confidence);
            container.appendChild(match);
        }
    }
    generateAutoMapping();
}
function generateAutoMapping() {
    if (!Object.keys(cipherFrequencies).length) {
        showNotification('Analysez d\'abord un texte chiffré', 'error');
        return;
    }
    
    const sortedCipher = Object.entries(cipherFrequencies)
        .filter(([, freq]) => freq > 0)
        .sort((a, b) => b[1] - a[1]);
    
    const sortedFrench = Object.entries(FRENCH_FREQUENCIES)
        .sort((a, b) => b[1] - a[1]);
    
    currentMapping = {};
    
    const maxMappings = Math.min(sortedCipher.length, sortedFrench.length);
    
    for (let i = 0; i < maxMappings; i++) {
        const cipherLetter = sortedCipher[i][0];
        const frenchLetter = sortedFrench[i][0];
        currentMapping[cipherLetter] = frenchLetter;
    }
    
    showNotification('Mapping automatique généré', 'success');
}

function saveMappingToStorage() {
    localStorage.setItem('mapping', JSON.stringify(currentMapping));
}

function createMatchItem(cipherLetter, frenchLetter, confidence) {
    const item = document.createElement('div');
    item.className = 'match-item';
    item.title = `Confiance: ${confidence}%`;
    
    item.innerHTML = `
        <span class="match-cipher">${cipherLetter.toUpperCase()}</span>
        <span class="match-arrow">→</span>
        <span class="match-clear">${frenchLetter.toUpperCase()}</span>
        <span class="match-confidence">${confidence}%</span>
    `;
    
    item.addEventListener('click', () => {
        applyMatch(cipherLetter, frenchLetter);
        showNotification(`Correspondance ${cipherLetter.toUpperCase()} → ${frenchLetter.toUpperCase()} appliquée`, 'success');
    });
    
    return item;
}

function calculateConfidence(cipherFreq, frenchFreq) {
    const diff = Math.abs(cipherFreq - frenchFreq);
    const maxFreq = Math.max(cipherFreq, frenchFreq);
    const similarity = Math.max(0, 100 - (diff / maxFreq) * 100);
    return Math.round(similarity);
}



// ===== NOTIFICATIONS ===== //
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : 'info'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}




