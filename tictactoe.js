class TicTacToe {
    constructor() {
        this.reset();
    }

    reset() {
        this.board = Array.from({ length: 3 }, () => Array(3).fill(" "));
        this.currentPlayer = 1; // 1 = Human (X), 2 = Computer (O)
        this.isGameOver = false;
    }

    makeMove(row, col) {
        if (this.isGameOver || this.board[row][col] !== " ") return false;
        
        this.board[row][col] = this.currentPlayer === 1 ? "X" : "O";
        if (this.checkWinner(this.board) || this.isBoardFull(this.board)) {
            this.isGameOver = true;
        } else {
            this.currentPlayer = 3 - this.currentPlayer;
        }
        return true;
    }

    // Modified checkWinner to accept a board state for recursion
    checkWinner(board) {
        for (let i = 0; i < 3; i++) {
            if (board[i][0] !== " " && board[i][0] === board[i][1] && board[i][1] === board[i][2]) return board[i][0];
            if (board[0][i] !== " " && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return board[0][i];
        }
        if (board[0][0] !== " " && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[0][0];
        if (board[0][2] !== " " && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[0][2];
        return null;
    }

    isBoardFull(board) {
        return board.every(row => row.every(cell => cell !== " "));
    }

    // --- Minimax Logic ---
    minimax(board, depth, isMaximizing) {
        let result = this.checkWinner(board);
        if (result === "O") return 10 - depth;
        if (result === "X") return depth - 10;
        if (this.isBoardFull(board)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (board[r][c] === " ") {
                        board[r][c] = "O";
                        let score = this.minimax(board, depth + 1, false);
                        board[r][c] = " ";
                        bestScore = Math.max(score, bestScore);
                    }
                }
            }
            return bestScore;
        } else {
            let bestScore = Infinity;
            for (let r = 0; r < 3; r++) {
                for (let c = 0; c < 3; c++) {
                    if (board[r][c] === " ") {
                        board[r][c] = "X";
                        let score = this.minimax(board, depth + 1, true);
                        board[r][c] = " ";
                        bestScore = Math.min(score, bestScore);
                    }
                }
            }
            return bestScore;
        }
    }

    getBestMove() {
        let bestScore = -Infinity;
        let move;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                if (this.board[r][c] === " ") {
                    this.board[r][c] = "O";
                    let score = this.minimax(this.board, 0, false);
                    this.board[r][c] = " ";
                    if (score > bestScore) {
                        bestScore = score;
                        move = { r, c };
                    }
                }
            }
        }
        return move;
    }
}

const game = new TicTacToe();
const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');

function createBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = r;
            cell.dataset.col = c;
            cell.addEventListener('click', () => handleMove(r, c));
            boardElement.appendChild(cell);
        }
    }
}

function handleMove(r, c) {
    if (game.currentPlayer !== 1 || game.isGameOver) return;

    if (game.makeMove(r, c)) {
        updateUI();
        if (!game.isGameOver) {
            statusElement.innerText = "Computer is calculating...";
            setTimeout(() => {
                const move = game.getBestMove();
                if (move) {
                    game.makeMove(move.r, move.c);
                    updateUI();
                }
            }, 500);
        }
    }
}

function updateUI() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const r = cell.dataset.row;
        const c = cell.dataset.col;
        const val = game.board[r][c];
        cell.innerText = val;
        cell.className = 'cell'; // reset classes
        if (val !== " ") {
            cell.classList.add('taken', val.toLowerCase());
        }
    });

    const winnerToken = game.checkWinner(game.board);
    if (winnerToken) {
        statusElement.innerText = winnerToken === "X" ? "You Win! (Wait, how?)" : "Computer Wins!";
    } else if (game.isBoardFull(game.board)) {
        statusElement.innerText = "It's a Draw!";
    } else {
        statusElement.innerText = game.currentPlayer === 1 ? "Your turn (X)" : "Computer's turn (O)";
    }
}

function resetGame() {
    game.reset();
    statusElement.innerText = "Your turn (X)";
    createBoard();
}

createBoard();
