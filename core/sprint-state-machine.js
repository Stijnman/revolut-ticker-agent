// sprint-state-machine.js
// Persistent State Machine + Loop Executor for Autonomous Sprint Progression

const SPRINT_QUEUE = [
  "Sprint 1: Foundation & Core Intelligence (AI Co-Pilot)",
  "Sprint 2: Smart Alert System",
  "Sprint 3: Expansion & Differentiation (News Sentiment + Multi-Broker)",
  "Sprint 4: Polish, Onboarding & Production Hardening"
];

let currentState = {
  currentSprint: null,
  queue: [...SPRINT_QUEUE],
  completedSprints: [],
  lastUpdated: null
};

// Load state from persistent storage (Chrome storage or file)
function loadState() {
  // In real extension: chrome.storage.local.get
  // For simulation: return in-memory state
  return currentState;
}

function saveState(newState) {
  currentState = { ...newState, lastUpdated: new Date().toISOString() };
  // In real extension: chrome.storage.local.set({ sprintState: currentState })
  console.log("📦 State saved:", currentState);
}

function getNextSprint() {
  const state = loadState();
  if (state.queue.length === 0) {
    return null; // All sprints completed
  }
  return state.queue[0];
}

function completeCurrentSprint(sprintName) {
  const state = loadState();
  
  if (state.currentSprint === sprintName) {
    state.completedSprints.push(sprintName);
    state.queue.shift(); // Remove completed sprint from queue
    state.currentSprint = null;
    saveState(state);
    
    console.log(`✅ Sprint completed: ${sprintName}`);
    
    // Trigger rule: on completion → start next sprint
    const nextSprint = getNextSprint();
    if (nextSprint) {
      startNextSprint(nextSprint);
    } else {
      console.log("🎉 ALL SPRINTS COMPLETED! Project ready for production.");
    }
  }
}

function startNextSprint(sprintName) {
  const state = loadState();
  state.currentSprint = sprintName;
  saveState(state);
  
  console.log(`🚀 Starting next sprint: ${sprintName}`);
  
  // Here the agent would call the actual sprint execution logic
  // For now, we simulate progression
  simulateSprintExecution(sprintName);
}

function simulateSprintExecution(sprintName) {
  console.log(`\n⚙️ Executing: ${sprintName}`);
  
  // Simulate work (in real system: actual development tasks)
  setTimeout(() => {
    console.log(`✅ ${sprintName} completed autonomously.`);
    completeCurrentSprint(sprintName);
  }, 2000);
}

// Initialize and start the loop if not already running
function initializeSprintLoop() {
  const state = loadState();
  
  if (!state.currentSprint && state.queue.length > 0) {
    const firstSprint = state.queue[0];
    startNextSprint(firstSprint);
  } else if (state.currentSprint) {
    console.log(`🔄 Resuming current sprint: ${state.currentSprint}`);
  } else {
    console.log("🏁 No sprints remaining in queue.");
  }
}

// Auto-start the loop when module loads
initializeSprintLoop();

// Export for use in other modules
if (typeof module !== 'undefined') {
  module.exports = {
    startNextSprint,
    completeCurrentSprint,
    getNextSprint,
    loadState
  };
}