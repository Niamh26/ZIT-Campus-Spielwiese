const questions = [
  {
    category: "Anatomie",
    question: "Welche Struktur umgibt Gehirn und Rückenmark als äußerste der drei Hirnhäute?",
    answers: ["Pia mater", "Arachnoidea", "Dura mater", "Fascia superficialis"],
    correct: 2,
    explanation: "Die Dura mater ist die äußerste Hirn- und Rückenmarkshaut. Darunter liegen Arachnoidea und Pia mater."
  },
  {
    category: "Anatomie",
    question: "Wo wird der größte Teil des Liquor cerebrospinalis gebildet?",
    answers: ["In den Plexus choroidei", "Im Kleinhirn", "In der Hypophyse", "In den Nasennebenhöhlen"],
    correct: 0,
    explanation: "Der Liquor wird überwiegend in den Plexus choroidei der Hirnventrikel gebildet."
  },
  {
    category: "Anatomie",
    question: "Welcher Knochen bildet das Kreuzbein?",
    answers: ["Os temporale", "Os sacrum", "Os sphenoidale", "Os occipitale"],
    correct: 1,
    explanation: "Das Kreuzbein heißt anatomisch Os sacrum und besteht beim Erwachsenen aus miteinander verschmolzenen Sakralwirbeln."
  },
  {
    category: "Anatomie",
    question: "Durch welche Öffnung tritt das Rückenmark aus der Schädelhöhle?",
    answers: ["Foramen ovale", "Foramen jugulare", "Foramen magnum", "Canalis opticus"],
    correct: 2,
    explanation: "Das Rückenmark geht am Foramen magnum in den Hirnstamm über."
  },
  {
    category: "Craniosacrales Modell",
    question: "Was beschreibt der Begriff „craniosacral“ wörtlich?",
    answers: ["Becken und Schulter", "Schädel und Kreuzbein", "Gehirn und Herz", "Wirbelsäule und Rippen"],
    correct: 1,
    explanation: "„Cranium“ bezeichnet den Schädel, „sacral“ bezieht sich auf das Kreuzbein."
  },
  {
    category: "Craniosacrales Modell",
    question: "Wie sollte der sogenannte craniosacrale Rhythmus fachlich korrekt eingeordnet werden?",
    answers: [
      "Als allgemein gesicherter Vitalparameter",
      "Als therapeutisches Modell beziehungsweise palpatorisches Konzept",
      "Als identisch mit dem Herzschlag",
      "Als identisch mit der Atemfrequenz"
    ],
    correct: 1,
    explanation: "Der Begriff gehört zum craniosacralen beziehungsweise cranial-osteopathischen Modell. Sein physiologischer Mechanismus und seine zuverlässige Messbarkeit sind wissenschaftlich nicht abschließend belegt."
  },
  {
    category: "Praxis",
    question: "Welche Haltung passt am besten zu einer sanften, klientenzentrierten Berührung?",
    answers: [
      "Möglichst starken Druck einsetzen",
      "Körperreaktionen vorgeben",
      "Einverständnis, Komfort und Rückmeldung beachten",
      "Jede Empfindung sofort diagnostisch deuten"
    ],
    correct: 2,
    explanation: "Informiertes Einverständnis, klare Kommunikation und die fortlaufende Rückmeldung der behandelten Person stehen im Mittelpunkt."
  },
  {
    category: "Sicherheit",
    question: "Was ist bei plötzlich auftretenden neurologischen Ausfällen wie Lähmung, Sprachstörung oder starkem ungewohntem Kopfschmerz richtig?",
    answers: [
      "Zunächst eine längere Entspannungsbehandlung durchführen",
      "Als Notfall medizinisch abklären lassen",
      "Nur mehr Wasser trinken",
      "Bis zum nächsten Kurstermin beobachten"
    ],
    correct: 1,
    explanation: "Plötzliche neurologische Symptome können ein medizinischer Notfall sein und benötigen unverzügliche professionelle Abklärung."
  },
  {
    category: "Evidenz",
    question: "Welche Aussage zur Wirksamkeitsforschung der Craniosacraltherapie ist am ausgewogensten?",
    answers: [
      "Sie ist für alle Erkrankungen eindeutig bewiesen",
      "Sie ist grundsätzlich wirkungslos und niemals Gegenstand weiterer Forschung",
      "Studien kommen zu unterschiedlichen Ergebnissen; neuere Reviews bewerten die belastbare Evidenz insgesamt als begrenzt oder unzureichend",
      "Einzelne Erfahrungsberichte beweisen die Wirksamkeit"
    ],
    correct: 2,
    explanation: "Es gibt positive Einzelstudien und Reviews, aber auch neuere systematische Auswertungen mit kritischer Gesamtbewertung. Deshalb sollten Nutzenversprechen zurückhaltend und transparent formuliert werden."
  },
  {
    category: "Berufsrolle",
    question: "Welche Formulierung ist gegenüber Klientinnen und Klienten angemessen?",
    answers: [
      "Diese Methode heilt Ihre Erkrankung sicher.",
      "Sie brauchen keine medizinische Behandlung mehr.",
      "Die Anwendung kann als ergänzendes Angebot verstanden werden; medizinische Beschwerden gehören fachgerecht abgeklärt.",
      "Nebenwirkungen und Grenzen müssen nicht angesprochen werden."
    ],
    correct: 2,
    explanation: "Eine verantwortungsvolle Kommunikation vermeidet Heilversprechen, benennt Grenzen und ersetzt notwendige medizinische Diagnostik nicht."
  }
];

let current = 0;
let score = 0;
let locked = false;

const counter = document.getElementById("counter");
const scoreEl = document.getElementById("score");
const progressBar = document.getElementById("progress-bar");
const category = document.getElementById("category");
const question = document.getElementById("question");
const answers = document.getElementById("answers");
const feedback = document.getElementById("feedback");
const nextBtn = document.getElementById("next-btn");
const quizCard = document.querySelector(".quiz-card");
const resultCard = document.getElementById("result-card");
const resultText = document.getElementById("result-text");
const restartBtn = document.getElementById("restart-btn");

function renderQuestion() {
  locked = false;
  const item = questions[current];
  counter.textContent = `Frage ${current + 1} von ${questions.length}`;
  scoreEl.textContent = `Punkte: ${score}`;
  progressBar.style.width = `${((current + 1) / questions.length) * 100}%`;
  category.textContent = item.category;
  question.textContent = item.question;
  feedback.hidden = true;
  nextBtn.hidden = true;
  answers.innerHTML = "";

  item.answers.forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.textContent = `${String.fromCharCode(65 + index)}) ${answer}`;
    button.addEventListener("click", () => selectAnswer(index));
    answers.appendChild(button);
  });
}

function selectAnswer(selectedIndex) {
  if (locked) return;
  locked = true;

  const item = questions[current];
  const buttons = [...answers.querySelectorAll(".answer-btn")];

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === item.correct) button.classList.add("correct");
  });

  if (selectedIndex === item.correct) {
    score += 1;
    scoreEl.textContent = `Punkte: ${score}`;
    feedback.innerHTML = `<strong>Richtig.</strong> ${item.explanation}`;
  } else {
    buttons[selectedIndex].classList.add("wrong");
    feedback.innerHTML = `<strong>Noch nicht ganz.</strong> ${item.explanation}`;
  }

  feedback.hidden = false;
  nextBtn.hidden = false;
  nextBtn.textContent = current === questions.length - 1 ? "Ergebnis anzeigen →" : "Nächste Frage →";
}

function showResult() {
  quizCard.hidden = true;
  resultCard.hidden = false;
  const percent = Math.round((score / questions.length) * 100);
  let message = "Ein guter Anfang – wiederhole das Quiz und festige die Grundlagen.";
  if (percent >= 80) message = "Sehr stark – du hast die Inhalte sicher eingeordnet.";
  else if (percent >= 60) message = "Gut gemacht – die Basis sitzt, einige Details dürfen noch nachreifen.";
  resultText.textContent = `${score} von ${questions.length} Punkten (${percent} %). ${message}`;
}

nextBtn.addEventListener("click", () => {
  if (current < questions.length - 1) {
    current += 1;
    renderQuestion();
  } else {
    showResult();
  }
});

restartBtn.addEventListener("click", () => {
  current = 0;
  score = 0;
  resultCard.hidden = true;
  quizCard.hidden = false;
  renderQuestion();
});

renderQuestion();
