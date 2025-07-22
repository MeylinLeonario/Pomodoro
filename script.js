const timerDisplay = document.getElementById("timer");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const bars = document.querySelectorAll(".bar");
const quoteDisplay = document.getElementById("quote");
const music = document.getElementById("backgroundMusic");
const bell = document.getElementById("bellSound");


const quotes = [
  "Focus and finish strong 💪",
  "One step at a time 🧠",
  "Discipline over motivation 🎯",
  "Breathe. Begin. Become. 🌱",
  "You’ve got this 💥",
  "Create what didn’t exist before 🔧",
  "The future is yours to program 🖥️"
];

let countdown;
let remainingTime = 0;

// 👉 Esta función actualiza el texto del reloj
function updateDisplay() {
  const m = String(Math.floor(remainingTime / 60)).padStart(2, "0");
  const s = String(remainingTime % 60).padStart(2, "0");
  timerDisplay.textContent = `${m}:${s}`;
}

function startTimer() {
  clearInterval(countdown);

  // Validación básica para no iniciar si el tiempo es 0
  if (remainingTime === 0) {
    alert("Selecciona una duración antes de iniciar 🍅");
    return;
  }

  // Mostrar frase motivadora
  const newQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.textContent = newQuote;

  if (music && document.getElementById("musicToggle").checked) {
    music.play();
  }
  


  let initialDuration = remainingTime; // guardamos el tiempo original

    countdown = setInterval(() => {
    if (remainingTime > 0) {
        remainingTime--;
        updateDisplay(); // actualiza pantalla
        if (remainingTime === 3 && bell.paused) {
          bell.play(); // ¡campanita 3 segundos antes!
        }
    } else {
        clearInterval(countdown);
        if (music) {
          music.pause();
          music.currentTime = 0;
        }
        quoteDisplay.textContent = "Time’s up! 🎉";
        registerCompletion(Math.round(initialDuration / 60));
    }
    }, 1000);
}

function pauseTimer() {
  clearInterval(countdown);
  if (music) music.pause();
}

// Cambio de duración con los botones de arriba
bars.forEach(bar => {
  bar.addEventListener("click", () => {
    clearInterval(countdown);
    if (music) {
      music.pause();
      music.currentTime = 0;
    }
    remainingTime = parseInt(bar.dataset.time) * 60;
    updateDisplay();
    quoteDisplay.textContent = "Ready when you are! 🚀";
  });
});

startBtn.addEventListener("click", startTimer);
pauseBtn.addEventListener("click", pauseTimer);

const historySection = document.getElementById("history");
const countDisplay = document.getElementById("count");
const historyList = document.getElementById("list");

let dailyHistory = JSON.parse(localStorage.getItem("dailyHistory") || "{}");

updateHistoryDisplay();

function updateHistoryDisplay() {
  historyList.innerHTML = "";
  countDisplay.textContent = Object.values(dailyHistory).flat().length;

  const sortedDates = Object.keys(dailyHistory).sort().reverse();

  sortedDates.forEach(date => {
    const readableDate = new Date(date + "T00:00:00").toLocaleDateString("es-CL", {
      weekday: "long",
      day: "numeric",
      month: "long",
      timeZone: "America/Santiago"
    });


    const dateTitle = document.createElement("li");
    dateTitle.textContent = `🗓️ ${readableDate.charAt(0).toUpperCase() + readableDate.slice(1)}:`;
    dateTitle.style.fontWeight = "bold";
    historyList.appendChild(dateTitle);

    dailyHistory[date].forEach(entry => {
      const li = document.createElement("li");
      li.textContent = ` - ${entry}`;
      historyList.appendChild(li);
    });
  });
}


// Cuando finaliza un pomodoro
function registerCompletion(durationMinutes) {
  const now = new Date();
  const dateKey = now.toISOString().split("T")[0]; // formato: 2025-06-01
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const entry = `${durationMinutes} min – ${time}`;

  if (!dailyHistory[dateKey]) {
    dailyHistory[dateKey] = [];
  }
  dailyHistory[dateKey].push(entry);
  localStorage.setItem("dailyHistory", JSON.stringify(dailyHistory));

  updateHistoryDisplay();
}

const showHistoryBtn = document.getElementById("showHistoryBtn");
const closeHistoryBtn = document.getElementById("closeHistoryBtn");
const pomodoroView = document.getElementById("pomodoroView");

showHistoryBtn.addEventListener("click", () => {
  pomodoroView.style.display = "none";
  historySection.style.display = "block";
});

closeHistoryBtn.addEventListener("click", () => {
  historySection.style.display = "none";
  pomodoroView.style.display = "block";
});
