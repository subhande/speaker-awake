// Keep-alive renderer script with dynamic interval + start/stop + state persistence + audio selection

let intervalSeconds = 5;
let count = 0;
let timerId = null;
let isRunning = false;
let isInitialized = false;
let selectedAudio = 'empty'; // Default to empty audio

// Audio instances for both types
const audioFiles = {
  empty: new Audio('assets/empty.mp3'),
  ping: new Audio('assets/ping.mp3')
};

// DOM references
const statusEl = document.getElementById('status');
const sliderEl = document.getElementById('intervalSlider');
const intervalValueEl = document.getElementById('intervalValue');
const startBtn = document.getElementById('startButton');
const stopBtn = document.getElementById('stopButton');
const quitBtn = document.getElementById('quitButton');
const audioRadios = document.querySelectorAll('input[name="audioType"]');

// Helper function to get current audio object
function getCurrentAudio() {
  return audioFiles[selectedAudio];
}

// Helper function to clear any existing timer
function clearExistingTimer() {
  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }
}

// Helper function to start the timer (ensures only one timer exists)
function startTimer() {
  clearExistingTimer(); // Always clear any existing timer first
  if (isRunning) {
    timerId = setInterval(playAudio, intervalSeconds * 1000);
  }
}

// State persistence functions
function saveState() {
  const state = {
    intervalSeconds,
    count,
    isRunning,
    selectedAudio,
    lastSaveTime: Date.now()
  };
  localStorage.setItem('audioKeepaliveState', JSON.stringify(state));
}

function loadState() {
  try {
    const savedState = localStorage.getItem('audioKeepaliveState');
    if (savedState) {
      const state = JSON.parse(savedState);
      intervalSeconds = state.intervalSeconds || 5;
      count = state.count || 0;
      isRunning = state.isRunning || false;
      selectedAudio = state.selectedAudio || 'empty';

      // Update UI with saved values
      sliderEl.value = intervalSeconds;
      intervalValueEl.innerText = intervalSeconds;

      // Set the correct radio button
      const radioToCheck = document.querySelector(`input[name="audioType"][value="${selectedAudio}"]`);
      if (radioToCheck) {
        radioToCheck.checked = true;
      }

      // Update button states based on isRunning
      startBtn.disabled = isRunning;
      stopBtn.disabled = !isRunning;

      if (isRunning) {
        // Calculate how much time has passed and adjust count if needed
        const timePassed = Date.now() - (state.lastSaveTime || 0);
        const intervalsPassedWhileAway = Math.floor(timePassed / (intervalSeconds * 1000));
        count += intervalsPassedWhileAway;

        const audioType = selectedAudio === 'empty' ? 'silent' : 'ping';
        statusEl.innerText = `🔄 Resumed ${audioType} audio keepalive (${count}). Next play in ${intervalSeconds}s.`;

        // Only start timer if not already running and we're initializing for the first time
        if (!isInitialized) {
          startTimer();
        }
      } else {
        statusEl.innerText = 'Stopped.';
        clearExistingTimer(); // Make sure no timer is running when stopped
      }
    } else {
      // No saved state, set default values
      intervalSeconds = 5;
      selectedAudio = 'empty';
      sliderEl.value = intervalSeconds;
      intervalValueEl.innerText = intervalSeconds;
      document.querySelector('input[name="audioType"][value="empty"]').checked = true;
    }
  } catch (error) {
    console.error('Error loading saved state:', error);
    // Fallback to defaults on error
    intervalSeconds = 5;
    selectedAudio = 'empty';
    sliderEl.value = intervalSeconds;
    intervalValueEl.innerText = intervalSeconds;
    document.querySelector('input[name="audioType"][value="empty"]').checked = true;
  }
}

// Handle audio selection change
audioRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    if (radio.checked) {
      selectedAudio = radio.value;
      saveState();

      // Update status message if running
      if (isRunning) {
        const audioType = selectedAudio === 'empty' ? 'silent' : 'ping';
        statusEl.innerText = `🔄 Switched to ${audioType} audio. Playing every ${intervalSeconds}s.`;
      }
    }
  });
});

// Update displayed slider value and save state
sliderEl.addEventListener('input', () => {
  intervalSeconds = Number(sliderEl.value);
  intervalValueEl.innerText = intervalSeconds;
  saveState();

  // If running, restart the timer with new interval
  if (isRunning) {
    startTimer(); // This will clear the old timer and start a new one
  }
});

// This does the actual play + status update
function playAudio() {
  count++;
  const audio = getCurrentAudio();
  audio.currentTime = 0;
  audio.play()
    .then(() => {
      const audioType = selectedAudio === 'empty' ? 'Silent' : 'Ping';
      statusEl.innerText =
        `✅ ${audioType} audio played (${count}). Next play in ${intervalSeconds}s to keep your speaker awake.`;
      saveState(); // Save state after each play
    })
    .catch(err => {
      statusEl.innerText =
        `❌ Couldn't play audio: ${err.message}. Press Start to try again.`;
      saveState();
    });
}

// Start the loop: play now + schedule interval
startBtn.addEventListener('click', () => {
  // Always stop any existing timer first
  clearExistingTimer();

  isRunning = true;
  startBtn.disabled = true;
  stopBtn.disabled = false;
  count = 0;
  saveState();
  playAudio();
  startTimer();
});

// Stop the loop
stopBtn.addEventListener('click', () => {
  isRunning = false;
  clearExistingTimer();
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusEl.innerText = 'Stopped.';
  saveState();
});

// Quit the app
quitBtn.addEventListener('click', () => {
  // Clear the running state and timer when quitting
  isRunning = false;
  clearExistingTimer();
  saveState();
  // Send quit command to main process
  window.electronAPI?.quit();
});

// Auto-save state periodically while running
setInterval(() => {
  if (isRunning) {
    saveState();
  }
}, 5000); // Save every 5 seconds

// Load saved state when the page loads (only once)
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  isInitialized = true; // Mark as initialized after first load
});

// Update UI state when window becomes visible, but don't restart timers
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && isInitialized) {
    // Only update UI state, don't restart timers
    try {
      const savedState = localStorage.getItem('audioKeepaliveState');
      if (savedState) {
        const state = JSON.parse(savedState);

        // Update UI elements to reflect current state
        if (state.isRunning !== undefined) {
          startBtn.disabled = state.isRunning;
          stopBtn.disabled = !state.isRunning;
        }

        if (state.intervalSeconds) {
          intervalSeconds = state.intervalSeconds;
          sliderEl.value = intervalSeconds;
          intervalValueEl.innerText = intervalSeconds;
        }

        if (state.selectedAudio) {
          selectedAudio = state.selectedAudio;
          const radioToCheck = document.querySelector(`input[name="audioType"][value="${selectedAudio}"]`);
          if (radioToCheck) {
            radioToCheck.checked = true;
          }
        }

        if (state.count !== undefined) {
          count = state.count;
        }
      }
    } catch (error) {
      console.error('Error syncing state on visibility change:', error);
    }
  }
});
