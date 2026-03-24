// UI Elements
const logBox = document.getElementById("logBox");
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

// Configuration
let isTraining = true;
const aiBrain = new brain.NeuralNetwork({ hiddenLayers: [10, 10], activation: 'leaky-relu' });

// ==========================================
// 1. DATA GENERATION (Expanded)
// ==========================================
function generateTrainingData() {
    let flashcards = [];
    
    // Pattern: [TopL, TopM, TopR, MidL, MidM, MidR, BotL, BotM, BotR]
    // Value: 1 = Human(X), -1 = AI(O), 0 = Empty

    // STRATEGY: Center & Corners
    // 1. Open Center
    flashcards.push({ input:[0,0,0, 0,0,0, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] });
    
    // 2-9. Human plays any Edge or Corner -> AI takes Center
    flashcards.push({ input:[1,0,0, 0,0,0, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,1,0, 0,0,0, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // TM
    flashcards.push({ input:[0,0,1, 0,0,0, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,0,0, 1,0,0, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // ML
    flashcards.push({ input:[0,0,0, 0,0,1, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // MR
    flashcards.push({ input:[0,0,0, 0,0,0, 1,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // BL
    flashcards.push({ input:[0,0,0, 0,0,0, 0,1,0], output:[0,0,0, 0,1,0, 0,0,0] }); // BM
    flashcards.push({ input:[0,0,0, 0,0,0, 0,0,1], output:[0,0,0, 0,1,0, 0,0,0] }); // BR

    // 10-13. Human plays Center -> AI takes a Corner (4 symmetric variants)
    flashcards.push({ input:[0,0,0, 0,1,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,0,0, 0,1,0, 0,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,0,0, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // BL
    flashcards.push({ input:[0,0,0, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // BR

    // 14-17. Counter Diagonal Traps (Human opposite corners, AI center) -> AI takes Edge
    flashcards.push({ input:[1,0,0, 0,-1,0, 0,0,1], output:[0,1,0, 0,0,0, 0,0,0] }); // TM
    flashcards.push({ input:[0,0,1, 0,-1,0, 1,0,0], output:[0,1,0, 0,0,0, 0,0,0] }); // TM
    flashcards.push({ input:[1,0,0, 0,-1,0, 0,0,1], output:[0,0,0, 1,0,0, 0,0,0] }); // ML
    flashcards.push({ input:[0,0,1, 0,-1,0, 1,0,0], output:[0,0,0, 0,0,1, 0,0,0] }); // MR

    // 18-21. Counter V-Traps (Human adjacent edges) -> AI takes Corner between them
    flashcards.push({ input:[0,1,0, 1,0,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,1,0, 0,0,1, 0,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,0,0, 1,0,0, 0,1,0], output:[0,0,0, 0,0,0, 1,0,0] }); // BL
    flashcards.push({ input:[0,0,0, 0,0,1, 0,1,0], output:[0,0,0, 0,0,0, 0,0,1] }); // BR

    // 22-25. Opposite Edges (Human plays top/bottom or left/right) -> AI takes corner
    flashcards.push({ input:[0,1,0, 0,-1,0, 0,1,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,1,0, 0,-1,0, 0,1,0], output:[0,0,1, 0,0,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,0,0, 1,-1,1, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,0,0, 1,-1,1, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // BL

    // 26-33. Corner + Opposite Edge (Human Corner + Non-adjacent Edge) -> AI blocks the V trap
    flashcards.push({ input:[1,0,0, 0,-1,1, 0,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // Block TR
    flashcards.push({ input:[0,0,1, 1,-1,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // Block TL
    flashcards.push({ input:[0,0,0, 0,-1,1, 1,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Block BR
    flashcards.push({ input:[0,0,0, 1,-1,0, 0,0,1], output:[0,0,0, 0,0,0, 1,0,0] }); // Block BL
    flashcards.push({ input:[1,0,0, 0,-1,0, 0,1,0], output:[0,0,0, 0,0,0, 1,0,0] }); // Block BL
    flashcards.push({ input:[0,0,1, 0,-1,0, 0,1,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Block BR
    flashcards.push({ input:[0,1,0, 0,-1,0, 1,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // Block TL
    flashcards.push({ input:[0,1,0, 0,-1,0, 0,0,1], output:[0,0,1, 0,0,0, 0,0,0] }); // Block TR

    // 34-37. AI Center Opening (AI has center, Human takes corner) -> AI takes opposite corner
    flashcards.push({ input:[1,0,0, 0,-1,0, 0,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // BR
    flashcards.push({ input:[0,0,1, 0,-1,0, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // BL
    flashcards.push({ input:[0,0,0, 0,-1,0, 1,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,0,0, 0,-1,0, 0,0,1], output:[1,0,0, 0,0,0, 0,0,0] }); // TL

    // 38-41. AI Center, Human Edge -> AI takes adjacent corner to threaten
    flashcards.push({ input:[0,1,0, 0,-1,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,0,0, 1,-1,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,0,0, 0,-1,1, 0,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,0,0, 0,-1,0, 0,1,0], output:[0,0,0, 0,0,0, 1,0,0] }); // BL

    // 42-45. AI Double Corner Offensive (Setting up a trap)
    flashcards.push({ input:[-1,0,0, 0,1,0, 0,0,0], output:[0,0,-1, 0,0,0, 0,0,0] }); // AI takes TR
    flashcards.push({ input:[-1,0,0, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, -1,0,0] }); // AI takes BL
    flashcards.push({ input:[0,0,-1, 0,1,0, 0,0,0], output:[-1,0,0, 0,0,0, 0,0,0] }); // AI takes TL
    flashcards.push({ input:[0,0,-1, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 0,0,-1] }); // AI takes BR

    // 46-49. Knight Move Defenses (Human edge + adjacent corner)
    flashcards.push({ input:[1,1,0, 0,-1,0, 0,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // TR
    flashcards.push({ input:[0,1,1, 0,-1,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,0,0, 0,-1,0, 1,1,0], output:[0,0,0, 0,0,0, 0,0,1] }); // BR
    flashcards.push({ input:[0,0,0, 0,-1,0, 0,1,1], output:[0,0,0, 0,0,0, 1,0,0] }); // BL

    // 50-53. Edge-Corner trap prevention (Human has adjacent edge & corner side)
    flashcards.push({ input:[1,0,0, 1,-1,0, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // BL
    flashcards.push({ input:[0,0,1, 0,-1,1, 0,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // BR
    flashcards.push({ input:[0,0,0, 1,-1,0, 1,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // TL
    flashcards.push({ input:[0,0,0, 0,-1,1, 0,0,1], output:[0,0,1, 0,0,0, 0,0,0] }); // TR

    // 54-57. Safe center continuation rules (Center is taken, defending from corner attacks)
    flashcards.push({ input:[1,0,0, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Human TL+C -> AI BR
    flashcards.push({ input:[0,0,1, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // Human TR+C -> AI BL
    flashcards.push({ input:[0,0,0, 0,1,0, 1,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // Human BL+C -> AI TR
    flashcards.push({ input:[0,0,0, 0,1,0, 0,0,1], output:[1,0,0, 0,0,0, 0,0,0] }); // Human BR+C -> AI TL

    // 58-60. Safe center continuation rules (Center is taken, defending from edge attacks)
    flashcards.push({ input:[0,1,0, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 0,1,0] }); // Block BM
    flashcards.push({ input:[0,0,0, 1,1,0, 0,0,0], output:[0,0,0, 0,0,1, 0,0,0] }); // Block MR
    flashcards.push({ input:[0,0,0, 0,1,1, 0,0,0], output:[0,0,0, 1,0,0, 0,0,0] }); // Block ML

    // =========================================================
    // 61-90. URGENT BLOCKS (Mid-game scenarios forcing the AI to block)
    // =========================================================
    
    // Row 1 Blocks
    flashcards.push({ input:[1,1,0, 0,-1,0, 0,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // Block TR
    flashcards.push({ input:[1,0,1, 0,-1,0, 0,0,0], output:[0,1,0, 0,0,0, 0,0,0] }); // Block TM
    flashcards.push({ input:[0,1,1, 0,-1,0, 0,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // Block TL

    // Row 2 Blocks
    flashcards.push({ input:[0,-1,0, 1,1,0, 0,0,0], output:[0,0,0, 0,0,1, 0,0,0] }); // Block MR
    flashcards.push({ input:[0,0,0, 1,0,1, 0,-1,0], output:[0,0,0, 0,1,0, 0,0,0] }); // Block MM
    flashcards.push({ input:[0,-1,0, 0,1,1, 0,0,0], output:[0,0,0, 1,0,0, 0,0,0] }); // Block ML

    // Row 3 Blocks
    flashcards.push({ input:[0,-1,0, 0,0,0, 1,1,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Block BR
    flashcards.push({ input:[0,0,-1, 0,0,0, 1,0,1], output:[0,0,0, 0,0,0, 0,1,0] }); // Block BM
    flashcards.push({ input:[-1,0,0, 0,0,0, 0,1,1], output:[0,0,0, 0,0,0, 1,0,0] }); // Block BL

    // Col 1 Blocks
    flashcards.push({ input:[1,0,-1, 1,0,0, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // Block BL
    flashcards.push({ input:[1,0,0, 0,0,-1, 1,0,0], output:[0,0,0, 1,0,0, 0,0,0] }); // Block ML
    flashcards.push({ input:[0,0,-1, 1,0,0, 1,0,0], output:[1,0,0, 0,0,0, 0,0,0] }); // Block TL

    // Col 2 Blocks
    flashcards.push({ input:[0,1,0, 0,1,0, -1,0,0], output:[0,0,0, 0,0,0, 0,1,0] }); // Block BM
    flashcards.push({ input:[0,1,0, -1,0,0, 0,1,0], output:[0,0,0, 0,1,0, 0,0,0] }); // Block MM
    flashcards.push({ input:[-1,0,0, 0,1,0, 0,1,0], output:[0,1,0, 0,0,0, 0,0,0] }); // Block TM

    // Col 3 Blocks
    flashcards.push({ input:[-1,0,1, 0,0,1, 0,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Block BR
    flashcards.push({ input:[0,0,1, -1,0,0, 0,0,1], output:[0,0,0, 0,0,1, 0,0,0] }); // Block MR
    flashcards.push({ input:[-1,0,0, 0,0,1, 0,0,1], output:[0,0,1, 0,0,0, 0,0,0] }); // Block TR

    // Diagonal 1 Blocks
    flashcards.push({ input:[1,0,-1, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Block BR
    flashcards.push({ input:[1,0,0, -1,0,0, 0,0,1], output:[0,0,0, 0,1,0, 0,0,0] }); // Block MM
    flashcards.push({ input:[-1,0,0, 0,1,0, 0,0,1], output:[1,0,0, 0,0,0, 0,0,0] }); // Block TL

    // Diagonal 2 Blocks
    flashcards.push({ input:[0,-1,1, 0,1,0, 0,0,0], output:[0,0,0, 0,0,0, 1,0,0] }); // Block BL
    flashcards.push({ input:[0,0,1, -1,0,0, 1,0,0], output:[0,0,0, 0,1,0, 0,0,0] }); // Block MM
    flashcards.push({ input:[0,-1,0, 0,1,0, 1,0,0], output:[0,0,1, 0,0,0, 0,0,0] }); // Block TR

    // 6 Extra Distracted Mid-Game Blocks (AI has a piece somewhere else but must focus on the block)
    flashcards.push({ input:[1,1,0, 0,0,0, 0,-1,0], output:[0,0,1, 0,0,0, 0,0,0] }); // Focus Block TR
    flashcards.push({ input:[1,0,1, 0,0,0, 0,-1,0], output:[0,1,0, 0,0,0, 0,0,0] }); // Focus Block TM
    flashcards.push({ input:[0,1,1, 0,0,0, 0,-1,0], output:[1,0,0, 0,0,0, 0,0,0] }); // Focus Block TL
    flashcards.push({ input:[0,0,0, -1,0,0, 1,1,0], output:[0,0,0, 0,0,0, 0,0,1] }); // Focus Block BR
    flashcards.push({ input:[0,0,0, -1,0,0, 1,0,1], output:[0,0,0, 0,0,0, 0,1,0] }); // Focus Block BM
    flashcards.push({ input:[0,0,0, -1,0,0, 0,1,1], output:[0,0,0, 0,0,0, 1,0,0] }); // Focus Block BL

    
    const lines = [
        [0,1,2], [3,4,5], [6,7,8], // Rows
        [0,3,6], [1,4,7], [2,5,8], // Cols
        [0,4,8], [2,4,6]           // Diags
    ];

    lines.forEach(line => {
        let [a, b, c] = line;
        // Learn to BLOCK (If Human has 2 in a row)
        [[a,b,c], [a,c,b], [b,c,a]].forEach(([p1, p2, target]) => {
            let block = [0,0,0, 0,0,0, 0,0,0];
            block[p1] = 1; block[p2] = 1;
            let out = [0,0,0, 0,0,0, 0,0,0];
            out[target] = 1;
            flashcards.push({ input: block, output: out });
        });
        // Learn to WIN (If AI has 2 in a row)
        [[a,b,c], [a,c,b], [b,c,a]].forEach(([p1, p2, target]) => {
            let win = [0,0,0, 0,0,0, 0,0,0];
            win[p1] = -1; win[p2] = -1;
            let out = [0,0,0, 0,0,0, 0,0,0];
            out[target] = 1;
            flashcards.push({ input: win, output: out });
        });
    });

    return flashcards;
}

// ==========================================
// 2. VISUALIZATION & LOGGING
// ==========================================
function logThought(message) {
    const p = document.createElement("p");
    p.innerHTML = message;
    logBox.appendChild(p);
    logBox.scrollTop = logBox.scrollHeight;
}

function drawSmallBoard(arr, isOutput = false) {
    const sym = (v) => v === 1 ? '<span style="color:var(--x-color)">X</span>' : (v === -1 ? '<span style="color:var(--o-color)">O</span>' : '·');
    const outSym = (v) => v > 0.5 ? '🎯' : '·';
    
    let boardHTML = `<div style="display:grid; grid-template-columns:repeat(3,12px); gap:2px; font-family:monospace; background:#eee; padding:4px; border-radius:3px;">`;
    arr.forEach(val => {
        boardHTML += `<span>${isOutput ? outSym(val) : sym(val)}</span>`;
    });
    boardHTML += `</div>`;
    return boardHTML;
}

// ==========================================
// 3. ASYNC TRAINING (The "No-Freeze" Logic)
// ==========================================
async function startNeuralTraining() {
    const data = generateTrainingData();
    logThought(`<b>🚀 Initializing Brain Scan...</b>`);
    
    // Show cards one by one
    for (let i = 0; i < data.length; i++) {
        const card = data[i];
        const cardUI = `
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:5px;">
                <small>Card #${i+1}</small> ${drawSmallBoard(card.input)} 
                <span>➡️</span> ${drawSmallBoard(card.output, true)}
            </div>
        `;
        logThought(cardUI);
        
        // Pause every 5 cards to let the UI refresh
        if (i % 5 === 0) await new Promise(r => setTimeout(r, 10));
    }

    logThought(`<b>🧠 Deep Learning in progress...</b> (500 iterations)`);
    
    // Running training in a timeout ensures the "Loading" status renders first
    setTimeout(() => {
        aiBrain.train(data, { iterations: 500, errorThresh: 0.01 });
        logThought(`✅ <b>Training Complete!</b> Board is active.`);
        statusElement.innerText = "Your turn (X)";
        isTraining = false;
    }, 100);
}

// ==========================================
// 4. GAME ENGINE
// ==========================================
class TicTacToe {
    constructor() { this.reset(); }
    reset() {
        this.board = Array(9).fill(0); // 1D array is easier for Neural Nets
        this.currentPlayer = 1; // 1 = X, 2 = O
        this.isGameOver = false;
    }
    makeMove(index) {
        if (this.isGameOver || this.board[index] !== 0) return false;
        this.board[index] = this.currentPlayer === 1 ? 1 : -1;
        this.currentPlayer = 3 - this.currentPlayer;
        return true;
    }
    checkWinner() {
        const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
        for (let line of lines) {
            const [a, b, c] = line;
            if (this.board[a] !== 0 && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
                return this.board[a] === 1 ? "X" : "O";
            }
        }
        return this.board.includes(0) ? null : "Draw";
    }
}

const game = new TicTacToe();

function handleMove(index) {
    if (isTraining || game.currentPlayer !== 1 || game.isGameOver) return;

    if (game.makeMove(index)) {
        updateUI();
        const result = game.checkWinner();
        if (!result) {
            statusElement.innerText = "AI is thinking...";
            setTimeout(aiMove, 600);
        } else {
            endGame(result);
        }
    }
}

function aiMove() {
    const input = [...game.board];
    logThought(`🔍 <b>AI Analyzing Board:</b> [${input.join(', ')}]`);
    
    const prediction = aiBrain.run(input);
    
    // Find the best available move
    let bestScore = -1;
    let bestMove = -1;
    
    for (let i = 0; i < 9; i++) {
        if (game.board[i] === 0 && prediction[i] > bestScore) {
            bestScore = prediction[i];
            bestMove = i;
        }
    }

    if (bestMove !== -1) {
        const conf = Math.round(bestScore * 100);
        logThought(`🤖 <b>AI Choice:</b> Cell ${bestMove} (${conf}% confidence)`);
        game.makeMove(bestMove);
        updateUI();
        
        const result = game.checkWinner();
        if (result) endGame(result);
        else statusElement.innerText = "Your turn (X)";
    }
}

function updateUI() {
    boardElement.innerHTML = '';
    game.board.forEach((val, i) => {
        const cell = document.createElement('div');
        cell.className = `cell ${val === 1 ? 'x taken' : (val === -1 ? 'o taken' : '')}`;
        cell.innerText = val === 1 ? 'X' : (val === -1 ? 'O' : '');
        cell.onclick = () => handleMove(i);
        boardElement.appendChild(cell);
    });
}

function endGame(result) {
    game.isGameOver = true;
    statusElement.innerText = result === "Draw" ? "It's a Draw!" : `${result} Wins!`;
    logThought(result === "Draw" ? "⚖️ Match ended in a draw." : `🏆 Winner: ${result}`);
}

function resetGame() {
    if (isTraining) return;
    game.reset();
    logBox.innerHTML = '';
    logThought("🔄 Game Reset.");
    updateUI();
    statusElement.innerText = "Your turn (X)";
}

// Init
updateUI();
startNeuralTraining();