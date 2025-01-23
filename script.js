document.addEventListener('DOMContentLoaded', function() {
    // Elemente abrufen
    const rasurProWocheSlider = document.getElementById('rasurProWocheSlider');
    const rasurProWocheInput = document.getElementById('rasurProWocheInput');
    const minutenProRasurSlider = document.getElementById('minutenProRasurSlider');
    const minutenProRasurInput = document.getElementById('minutenProRasurInput');
    const klingenHaltbarkeitSlider = document.getElementById('klingenHaltbarkeitSlider');
    const klingenHaltbarkeitInput = document.getElementById('klingenHaltbarkeitInput');
    const timeframeToggle = document.getElementById('timeframeToggle');
    const monthlyResults = document.getElementById('monthlyResults');
    const yearlyResults = document.getElementById('yearlyResults');

    const monthlyLabel = document.querySelector('.toggle-label[data-timeframe="monthly"]');
    const yearlyLabel = document.querySelector('.toggle-label[data-timeframe="yearly"]');

    // Initial state
    monthlyLabel.classList.add('active');

    // Event Listener für Synchronisation zwischen Slider und Textfeld
    function syncInputs(slider, input) {
        let isSliding = false;
        let activeElements = new Set();

        slider.addEventListener('mousedown', () => {
            isSliding = true;
        });

        window.addEventListener('mouseup', () => {
            if (isSliding) {
                isSliding = false;
                // Entferne alle aktiven Highlights
                activeElements.forEach(element => {
                    element.classList.remove('active-highlight');
                });
                activeElements.clear();
            }
        });

        slider.addEventListener('input', () => {
            input.value = slider.value;
            berechneErgebnisse(isSliding, activeElements);
        });

        input.addEventListener('input', () => {
            slider.value = input.value;
            berechneErgebnisse(false, activeElements);
        });
    }

    syncInputs(rasurProWocheSlider, rasurProWocheInput);
    syncInputs(minutenProRasurSlider, minutenProRasurInput);
    syncInputs(klingenHaltbarkeitSlider, klingenHaltbarkeitInput);

    // Neue Funktionalität für Plus/Minus Buttons
    document.querySelectorAll('.button-control').forEach(button => {
        button.addEventListener('click', function() {
            const inputType = this.dataset.input;
            const isIncrease = this.classList.contains('increase');
            const slider = document.getElementById(`${inputType}Slider`);
            const input = document.getElementById(`${inputType}Input`);
            
            let currentValue = parseInt(input.value);
            const min = parseInt(input.min);
            const max = parseInt(input.max);
            
            if (isIncrease && currentValue < max) {
                currentValue++;
            } else if (!isIncrease && currentValue > min) {
                currentValue--;
            }
            
            input.value = currentValue;
            slider.value = currentValue;
            berechneErgebnisse();
        });
    });

    // Neue Funktionalität für Mausrad-Scrollen
    document.querySelectorAll('.input-group').forEach(group => {
        group.addEventListener('wheel', function(event) {
            event.preventDefault(); // Verhindert das Scrollen der Seite
            
            // Finde die relevanten Elemente in dieser input-group
            const input = group.querySelector('input[type="number"]');
            const slider = group.querySelector('input[type="range"]');
            
            if (!input || !slider) return;
            
            let currentValue = parseInt(input.value);
            const min = parseInt(input.min);
            const max = parseInt(input.max);
            
            // Scrollrichtung bestimmen (nach oben = -1, nach unten = 1)
            const direction = event.deltaY > 0 ? -1 : 1;
            
            // Neuen Wert berechnen
            let newValue = currentValue + direction;
            
            // Wert innerhalb der Grenzen halten
            newValue = Math.min(Math.max(newValue, min), max);
            
            // Werte aktualisieren
            input.value = newValue;
            slider.value = newValue;
            
            berechneErgebnisse();
        }, { passive: false }); // passive: false erlaubt preventDefault()
    });

    // Funktion zum Aktualisieren der Labels
    function updateLabels(isYearly) {
        if (isYearly) {
            yearlyLabel.classList.add('active');
            monthlyLabel.classList.remove('active');
        } else {
            monthlyLabel.classList.add('active');
            yearlyLabel.classList.remove('active');
        }
    }

    // Event Listener für Labels
    monthlyLabel.addEventListener('click', function() {
        timeframeToggle.checked = false;
        updateLabels(false);
        monthlyResults.classList.remove('hidden');
        yearlyResults.classList.add('hidden');
    });

    yearlyLabel.addEventListener('click', function() {
        timeframeToggle.checked = true;
        updateLabels(true);
        monthlyResults.classList.add('hidden');
        yearlyResults.classList.remove('hidden');
    });

    // Update den bestehenden Toggle Event Listener
    timeframeToggle.addEventListener('change', function() {
        updateLabels(this.checked);
        if (this.checked) {
            monthlyResults.classList.add('hidden');
            yearlyResults.classList.remove('hidden');
        } else {
            monthlyResults.classList.remove('hidden');
            yearlyResults.classList.add('hidden');
        }
    });

    function berechneErgebnisse(isSliding = false, activeElements = new Set()) {
        // Werte aus den Eingabefeldern holen
        const rasurProWoche = parseInt(rasurProWocheInput.value);
        const minutenProRasur = parseInt(minutenProRasurInput.value);
        const klingenHaltbarkeit = parseInt(klingenHaltbarkeitInput.value);

        // Berechnungen
        const rasurProMonat = rasurProWoche * 4.345; // durchschnittliche Anzahl Wochen pro Monat
        const zeitProMonat = rasurProMonat * minutenProRasur;
        
        const rasurenProKlinge = klingenHaltbarkeit * (rasurProWoche / 7);
        const klingenProMonat = rasurProMonat / rasurenProKlinge;
        const kostenProMonat = klingenProMonat * 2; // 2 Euro pro Klinge

        // Rasierschaum Berechnungen
        const schaumProRasur = 20; // ml pro Rasur
        const schaumKostenPro20ml = 0.24; // Euro pro 20ml
        const schaumKostenProMonat = rasurProMonat * schaumKostenPro20ml;

        // Neue Berechnungen
        const zeitProJahr = zeitProMonat * 12;
        const gesamtKostenProMonat = kostenProMonat + schaumKostenProMonat;
        const gesamtKostenProJahr = gesamtKostenProMonat * 12;

        const klingenKostenProJahr = kostenProMonat * 12;
        const schaumKostenProJahr = schaumKostenProMonat * 12;

        // Funktion zum Aktualisieren eines Elements mit Highlight-Effekt
        function updateWithHighlight(elementId, newValue) {
            const element = document.getElementById(elementId);
            const oldValue = element.textContent;
            element.textContent = newValue;
            
            if (oldValue !== newValue) {
                const container = element.closest('.result-box');
                
                if (isSliding) {
                    container.classList.add('active-highlight');
                    activeElements.add(container);
                } else {
                    container.classList.remove('active-highlight');
                    container.classList.remove('highlight');
                    void container.offsetWidth;
                    container.classList.add('highlight');
                }
            }
        }

        // Ergebnisse anzeigen mit Highlight-Effekt
        // Monatliche Werte
        updateWithHighlight('zeitProMonat', Math.round(zeitProMonat) + ' Minuten');
        updateWithHighlight('kostenProMonat', kostenProMonat.toFixed(2) + ' €');
        updateWithHighlight('schaumKostenProMonat', schaumKostenProMonat.toFixed(2) + ' €');
        updateWithHighlight('gesamtKostenProMonat', gesamtKostenProMonat.toFixed(2) + ' €');
        
        // Jährliche Werte
        updateWithHighlight('zeitProJahr', Math.round(zeitProJahr / 60) + ' Stunden');
        updateWithHighlight('kostenProJahr', klingenKostenProJahr.toFixed(2) + ' €');
        updateWithHighlight('schaumKostenProJahr', schaumKostenProJahr.toFixed(2) + ' €');
        updateWithHighlight('gesamtKostenProJahr', gesamtKostenProJahr.toFixed(2) + ' €');
    }

    // Initial berechnen
    berechneErgebnisse();
}); 