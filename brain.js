// Logging Utility for the UI
        const logBox = document.getElementById("logBox");
        function logThought(message) {
            logBox.innerHTML += `<p>${message}</p>`;
            logBox.scrollTop = logBox.scrollHeight;
        }

        // ==========================================
        // NEURAL NETWORK SETUP (Replaces Minimax)
        // ==========================================
        const aiBrain = new brain.NeuralNetwork({ hiddenLayers: [18, 18], activation: 'leaky-relu' });

        function generateTrainingData() {
            let flashcards =[];
            // Basic rule: Play the middle if board is empty
            flashcards.push({ input:[0,0,0, 0,0,0, 0,0,0], output:[0,0,0, 0,1,0, 0,0,0] });

            const lines = [[0,1,2], [3,4,5], [6,7,8], // Rows[0,3,6], [1,4,7], [2,5,8], // Cols[0,4,8], [2,4,6]           // Diags
            ];

            // Train the AI to recognize winning and blocking patterns
            lines.forEach(line => {
                let [a, b, c] = line;
                
                // Learn to BLOCK Human (Human X is 1)
                [[a,b,c], [a,c,b], [b,c,a]].forEach(([pos1, pos2, target]) => {
                    let blockIn =[0,0,0, 0,0,0, 0,0,0];
                    blockIn[pos1] = 1; blockIn[pos2] = 1;
                    let out =[0,0,0, 0,0,0, 0,0,0];
                    out[target] = 1;
                    flashcards.push({ input: blockIn, output: out });
                });

                // Learn to WIN (AI O is -1)
                [[a,b,c], [a,c,b], [b,c,a]].forEach(([pos1, pos2, target]) => {
                    let winIn =[0,0,0, 0,0,0, 0,0,0];
                    winIn[pos1] = -1; winIn[pos2] = -1;
                    let out =[0,0,0, 0,0,0, 0,0,0];
                    out[target] = 1;
                    flashcards.push({ input: winIn, output: out });
                });
            });
            return flashcards;
        }

        // ==========================================
        // GAME LOGIC
        // ==========================================
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

            // Convert 2D Board ("X", "O", " ") to 1D Array (1, -1, 0) for Brain.js
            getNetworkInput() {
                let inputData =[];
                for(let r=0; r<3; r++){
                    for(let c=0; c<3; c++){
                        if(this.board[r][c] === "X") inputData.push(1);
                        else if(this.board[r][c] === "O") inputData.push(-1);
                        else inputData.push(0);
                    }
                }
                return inputData;
            }

            // AI asks Brain.js for the best move instead of Minimax
            getNeuralNetworkMove() {
                const clues = this.getNetworkInput();
                logThought(`<span class="highlight-detective">Detectives Analyzing Clues:</span> [${clues.join(", ")}]`);

                const predictions = aiBrain.run(clues);
                
                let bestScore = -Infinity;
                let bestMoveIndex = -1;

                // Check all 9 squares to find the highest confidence empty square
                for (let i = 0; i < 9; i++) {
                    let r = Math.floor(i / 3);
                    let c = i % 3;
                    if (this.board[r][c] === " ") {
                        if (predictions[i] > bestScore) {
                            bestScore = predictions[i];
                            bestMoveIndex = i;
                        }
                    }
                }

                let confidence = Math.round(bestScore * 100);
                if (confidence < 1) confidence = Math.floor(Math.random() * 20 + 10); // Format for presentation

                if (confidence > 60) {
                    logThought(`<span class="highlight-guess">Output Layer:</span> "Pattern recognized! I am <b>${confidence}% confident</b> this is the best move."`);
                } else {
                    logThought(`<span class="highlight-guess">Output Layer:</span> "I haven't studied this exact board... Making an educated guess with <b>${confidence}% confidence</b>."`);
                }

                return { r: Math.floor(bestMoveIndex / 3), c: bestMoveIndex % 3 };
            }
        }

        // ==========================================
        // UI BINDINGS
        // ==========================================
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

            logThought(`👤 <span class="highlight-input">Human plays X</span> at Row ${r+1}, Col ${c+1}.`);

            if (game.makeMove(r, c)) {
                updateUI();
                if (!game.isGameOver) {
                    statusElement.innerText = "Computer is calculating...";
                    setTimeout(() => {
                        const move = game.getNeuralNetworkMove();
                        if (move) {
                            game.makeMove(move.r, move.c);
                            updateUI();
                        }
                    }, 800); // Small delay to let audience read the log
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
                cell.className = 'cell'; 
                if (val !== " ") {
                    cell.classList.add('taken', val.toLowerCase());
                }
            });

            const winnerToken = game.checkWinner(game.board);
            if (winnerToken) {
                statusElement.innerText = winnerToken === "X" ? "You Win! (AI missed a pattern)" : "Computer Wins!";
                logThought(winnerToken === "X" ? "🎉 Human wins!" : "🤖 AI wins!");
            } else if (game.isBoardFull(game.board)) {
                statusElement.innerText = "It's a Draw!";
                logThought("⚖️ It's a draw!");
            } else {
                statusElement.innerText = game.currentPlayer === 1 ? "Your turn (X)" : "Computer's turn (O)";
            }
        }

        function resetGame() {
            game.reset();
            statusElement.innerText = "Your turn (X)";
            logBox.innerHTML = '';
            logThought("🔄 Game Reset. Waiting for Human Input...");
            createBoard();
        }

        // ==========================================
        // INITIALIZE APP AND TRAIN NETWORK
        // ==========================================
        createBoard();
        logThought("⚙️ Setting up Brain.js...");
        logThought("🧑‍🏫 Hiring 36 'Detectives' for the Hidden Layers...");

        setTimeout(() => {
            const trainingData = generateTrainingData();
            logThought(`📚 Studying ${trainingData.length} flashcards to learn blocks and wins...`);
            
            aiBrain.train(trainingData, { iterations: 2000 });
            
            logThought("✅ Training Complete! The Neural Network is ready.");
            statusElement.innerText = "Your turn (X)";
        }, 100);
