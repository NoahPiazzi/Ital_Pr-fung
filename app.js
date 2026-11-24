/* ==========================================================================
   ESERCITARE IL PARLATO • Interaktive Lernfunktionen
   1. Prüfungs-Timer (1', 3', 5') im Header
   2. Vokabel-Suche & Topic-Suche
   3. Vokabel-Quiz-Modus (Deutsch ausblenden / aufdecken)
   4. Themen-Filter (für Pro o Contro)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initTimer();
  initVocabSearch();
  initQuizToggle();
  initTopicFilter();
});

/* --- 1. PRÜFUNGS-TIMER --- */
function initTimer() {
  const display = document.getElementById('timer-display');
  const startBtn = document.getElementById('timer-start');
  const resetBtn = document.getElementById('timer-reset');
  const presetBtns = document.querySelectorAll('[data-time]');

  if (!display) return;

  let defaultSeconds = 60;
  let remainingSeconds = 60;
  let intervalId = null;

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function render() {
    display.textContent = formatTime(remainingSeconds);
    if (remainingSeconds === 0) {
      display.classList.add('timer-finished');
    } else {
      display.classList.remove('timer-finished');
    }
  }

  function stopTimer() {
    if (intervalId !== null) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (startBtn) startBtn.textContent = 'Start';
  }

  function playBeep() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {
      // Audio-Fallback falls Browser blockiert
    }
  }

  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      stopTimer();
      defaultSeconds = parseInt(btn.getAttribute('data-time'), 10);
      remainingSeconds = defaultSeconds;
      render();
    });
  });

  if (startBtn) {
    startBtn.addEventListener('click', () => {
      if (intervalId !== null) {
        stopTimer();
        return;
      }
      if (remainingSeconds === 0) {
        remainingSeconds = defaultSeconds;
      }
      startBtn.textContent = 'Pause';
      intervalId = setInterval(() => {
        if (remainingSeconds > 0) {
          remainingSeconds--;
          render();
          if (remainingSeconds === 0) {
            stopTimer();
            playBeep();
          }
        }
      }, 1000);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      stopTimer();
      remainingSeconds = defaultSeconds;
      render();
    });
  }

  render();
}

/* --- 2. VOKABEL-SUCHE --- */
function initVocabSearch() {
  const searchInputs = document.querySelectorAll('[data-search-target]');
  searchInputs.forEach(input => {
    const targetSelector = input.getAttribute('data-search-target');
    input.addEventListener('input', () => {
      const query = input.value.trim().toLowerCase();
      const items = document.querySelectorAll(targetSelector);
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });
}

/* --- 3. QUIZ-MODUS (DEUTSCHE ÜBERSETZUNG VERSTECKEN) --- */
function initQuizToggle() {
  const toggleBtn = document.getElementById('quiz-toggle');
  const tableWrap = document.getElementById('vocab-table-wrap');

  if (!toggleBtn || !tableWrap) return;

  toggleBtn.addEventListener('click', () => {
    const isActive = tableWrap.classList.toggle('quiz-active');
    toggleBtn.classList.toggle('active', isActive);
    toggleBtn.textContent = isActive
      ? '👁️ Deutsch wieder einblenden'
      : '🧠 Quiz-Modus: Deutsch verdecken';

    // Reset individuell aufgedeckte Zeilen
    tableWrap.querySelectorAll('.vocab-de.revealed').forEach(cell => {
      cell.classList.remove('revealed');
    });
  });

  // Klick auf einzelne Zelle deckt diese beim Lernen auf
  tableWrap.addEventListener('click', (e) => {
    const cell = e.target.closest('.vocab-de');
    if (cell && tableWrap.classList.contains('quiz-active')) {
      cell.classList.toggle('revealed');
    }
  });
}

/* --- 4. KATEGORIE-FILTER FÜR PRO/CONTRO-KARTEN --- */
function initTopicFilter() {
  const filterBtns = document.querySelectorAll('[data-filter]');
  const cards = document.querySelectorAll('.topic-card');

  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const cardCat = card.getAttribute('data-category');
        if (cat === 'all' || cardCat === cat) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}