/**
 * LOGICA NAVBAR CON SCROLL
 * 
 * Funzionalità:
 * - Navbar visibile all'inizio
 * - Scompare quando si scrolla verso il basso
 * - Riappare quando si scrolla verso l'alto o si è vicini alla cima
 */

// Elementi DOM
const navbar = document.getElementById('navbar');

// Variabili di stato
let lastScrollY = window.scrollY; // Posizione dello scroll al frame precedente
let ticking = false; // Flag per throttle con requestAnimationFrame

// Configurazione
const AT_TOP_THRESHOLD = 100; // Pixel dalla cima per considerare "in cima"
const HIDE_AFTER_DOWN_PX = 50; // Pixel di scroll down prima di nascondere
const SHOW_AFTER_UP_PX = 30; // Pixel di scroll up prima di mostrare

/**
 * Gestisce la visibilità della navbar in base alla posizione dello scroll
 * @param {number} currentScrollY - Posizione attuale dello scroll
 */
function handleNavbarVisibility(currentScrollY) {
  const atTop = currentScrollY < AT_TOP_THRESHOLD;
  
  // Se siamo in cima, mostra sempre la navbar
  if (atTop) {
    navbar.classList.remove('nav-hidden');
    return;
  }
  
  // Calcola la differenza rispetto all'ultima posizione
  const scrollDelta = currentScrollY - lastScrollY;
  
  // Scroll verso il basso: nascondi la navbar
  if (scrollDelta > HIDE_AFTER_DOWN_PX) {
    navbar.classList.add('nav-hidden');
  }
  // Scroll verso l'alto: mostra la navbar
  else if (scrollDelta < -SHOW_AFTER_UP_PX) {
    navbar.classList.remove('nav-hidden');
  }
  
  // Aggiorna l'ultima posizione
  lastScrollY = currentScrollY;
}

/**
 * Handler per l'evento scroll
 * Usa requestAnimationFrame per ottimizzare le performance
 */
function onScroll() {
  // Se è già in corso un aggiornamento, non fare nulla (throttle)
  if (ticking) return;
  
  // Richiedi il prossimo frame di animazione
  requestAnimationFrame(() => {
    const currentScrollY = window.scrollY;
    handleNavbarVisibility(currentScrollY);
    ticking = false;
  });
  
  ticking = true;
}

/**
 * Inizializzazione
 * - Aggiunge il listener per l'evento scroll
 * - Opzionale: gestisce anche l'evento resize se necessario
 */
function init() {
  // Aggiunge il listener per lo scroll con { passive: true } per migliori performance
  window.addEventListener('scroll', onScroll, { passive: true });
  
  // Inizializza lo stato: mostra la navbar all'avvio
  navbar.classList.remove('nav-hidden');
  lastScrollY = window.scrollY;
  
  console.log('Navbar scroll logic initialized');
}

// Avvia l'inizializzazione quando il DOM è pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/**
 * NOTA ADATTABILITÀ:
 * 
 * Per integrare in un sito esistente:
 * 
 * 1. HTML:
 *    - Assicurati che la navbar abbia id="navbar"
 *    - Assicurati che il contenuto principale abbia padding-top >= altezza navbar
 * 
 * 2. CSS:
 *    - La navbar deve avere position: fixed
 *    - La classe .nav-hidden deve avere transform: translateY(-100%)
 *    - La navbar deve avere transition: transform 0.3s ease (o simile)
 * 
 * 3. JS:
 *    - Modifica AT_TOP_THRESHOLD se vuoi cambiare la soglia "in cima"
 *    - Modifica HIDE_AFTER_DOWN_PX per rendere più/meno sensibile la scomparsa
 *    - Modifica SHOW_AFTER_UP_PX per rendere più/meno sensibile la ricomparsa
 * 
 * 4. Altezza navbar:
 *    - Se la tua navbar ha un'altezza diversa da 80px:
 *      - Cambia padding-top in .main-content
 *      - Opzionalmente, calcola l'altezza dinamicamente in JS
 */
