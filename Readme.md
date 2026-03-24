# 🧠 Tic-Tac-Toe: Neural Network vs. Minimax AI

A purely client-side Tic-Tac-Toe web application featuring two distinct Artificial Intelligence opponents. You can play against a mathematically perfect traditional algorithm, or watch a Neural Network train directly in your browser and learn from its mistakes in real-time.

## ✨ Features

* **Two Distinct Game Modes:**
  * **Classic Minimax AI (`index.html`):** Uses the classic recursive Minimax algorithm. It calculates every possible future move. It is mathematically unbeatable—the best you can hope for is a draw.
  * **Neural Network AI (`brain.html`):** Built using [Brain.js](https://github.com/BrainJS/brain.js). The AI is trained in the browser upon loading using a "flashcard" pattern recognition approach.
* **Live Thought Logging:** The Neural Network mode features a visual terminal that logs the AI's training process, board analysis, and confidence percentages for its moves.
* **Asynchronous Training:** The Neural Net trains on hundreds of scenarios in a non-blocking background task, ensuring the browser doesn't freeze or hang.
* **Adaptive Learning:** If you manage to trick the Neural Network and win, it immediately takes a snapshot of the board, realizes its mistake, generates new flashcards to patch the weakness, and dynamically retrains itself in half a second.

## 🚀 How the Neural Network Works

Unlike Minimax (which brute-forces the future), the Neural Network recognizes **patterns**. 

1. **The Dataset:** On load, the game generates around 150 "flashcards" representing different board states (traps, knight-moves, V-traps, center-control).
2. **Priorities:** The AI is mathematically weighted to prioritize **Blocking** (1.0 weight) over **Winning** (0.8 weight), making it heavily defensive.
3. **Continuous Evolution:** If you beat the AI, the `learnFromMistake()` function fires. It captures the board state from the turn *before* it lost, injects the correct blocking move into its brain, and runs a rapid 150-iteration micro-training session. **It will never fall for the exact same trick twice.**

## 🛠️ Technologies Used

* **HTML5 & CSS3:** For a clean, modern, responsive UI.
* **Vanilla JavaScript:** Game logic and DOM manipulation.
* **[Brain.js](https://brain.js.org/):** A GPU-accelerated library for Neural Networks in JavaScript.

## 📂 File Structure

```text
📦 Tic-Tac-Toe-AI
 ┣ 📜 index.html        # Entry point: Classic Game UI
 ┣ 📜 tictactoe.css     # Styling for the Classic Game
 ┣ 📜 tictactoe.js      # Minimax AI logic and Classic Game engine
 ┣ 📜 brain.html        # Neural Network Game UI
 ┣ 📜 brain.css         # Styling and Thought-Log UI for the Neural mode
 ┗ 📜 brain.js          # Brain.js integration, dataset generation, and adaptive learning