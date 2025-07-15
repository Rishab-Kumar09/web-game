const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameUI = document.getElementById('gameUI');
const characterSelection = document.getElementById('characterSelection');
const startGameButton = document.getElementById('startGame');
const difficultySelection = document.getElementById('difficultySelection');

// Game state variables
let gameState = 'selection';
let selectedCharacters = { player1: null, player2: null };
let selectedStage = null;
let selectedMode = null;
let selectedDifficulty = null;
let player1, player2;
let isAIControlled = false;

// Match state variables
let currentRound = 1;
let maxRounds = 3; // Best of 3
let scores = { player1: 0, player2: 0 };
let isRoundOver = false;
let matchOver = false;

// Character data
const characters = {
    Warrior: { color: '#ff4444', name: 'Warrior' },
    Ninja: { color: '#4444ff', name: 'Ninja' },
    Samurai: { color: '#44ff44', name: 'Samurai' }
};

// Stage data
const stages = {
    Arena: { 
        backgroundColor: '#666',  // Lighter gray
        groundColor: '#888',
        details: function(ctx) {
            // Arena details like crowd or pillars
            ctx.fillStyle = '#777';
            ctx.fillRect(0, 0, canvas.width, 50); // Top border
            ctx.fillRect(0, canvas.height - 50, canvas.width, 50); // Bottom border
        }
    },
    Temple: { 
        backgroundColor: '#774400',  // Lighter brown
        groundColor: '#aa8855',
        details: function(ctx) {
            // Temple details like pillars or lanterns
            ctx.fillStyle = '#442200';
            ctx.fillRect(100, 100, 50, canvas.height - 150); // Left pillar
            ctx.fillRect(canvas.width - 150, 100, 50, canvas.height - 150); // Right pillar
        }
    },
    Forest: { 
        backgroundColor: '#337733',  // Lighter green
        groundColor: '#55aa55',
        details: function(ctx) {
            // Forest details like trees
            ctx.fillStyle = '#226622';
            ctx.fillRect(50, 50, 30, canvas.height - 100); // Left tree
            ctx.fillRect(canvas.width - 80, 50, 30, canvas.height - 100); // Right tree
        }
    }
};

// Difficulty settings for AI
const difficulties = {
    easy: { reactionTime: 60, attackChance: 0.3, specialChance: 0.1, moveChance: 0.5 },
    medium: { reactionTime: 40, attackChance: 0.5, specialChance: 0.2, moveChance: 0.7 },
    hard: { reactionTime: 20, attackChance: 0.7, specialChance: 0.3, moveChance: 0.9 }
};

// AI state variables
let aiReactionTimer = 0;
let aiAction = { move: false, attack: false, special: false, direction: 'none' };

// Function to handle character selection
function selectCharacter(playerNum, characterName) {
    selectedCharacters[`player${playerNum}`] = characterName;
    
    // Update UI
    document.getElementById(`player${playerNum}Selected`).textContent = characterName;
    
    // Remove selection highlight from other options
    const options = document.querySelectorAll(`#player${playerNum}Selection .character-option`);
    options.forEach(opt => {
        if (opt.dataset.character === characterName) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    // Enable start game button if all selections are made
    checkStartGameButton();
}

// Function to handle stage selection
function selectStage(stageName) {
    selectedStage = stageName;
    
    // Update UI
    document.getElementById('selectedStage').textContent = stageName;
    
    // Remove selection highlight from other options
    const options = document.querySelectorAll('.stage-option');
    options.forEach(opt => {
        if (opt.dataset.stage === stageName) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    // Enable start game button if all selections are made
    checkStartGameButton();
}

// Function to handle mode selection
function selectMode(modeName) {
    selectedMode = modeName;
    
    // Update UI
    document.getElementById('selectedMode').textContent = modeName.charAt(0).toUpperCase() + modeName.slice(1);
    
    // Remove selection highlight from other options
    const options = document.querySelectorAll('.mode-option');
    options.forEach(opt => {
        if (opt.dataset.mode === modeName) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    // Show difficulty selection if singleplayer is selected
    if (modeName === 'singleplayer') {
        difficultySelection.style.display = 'block';
    } else {
        difficultySelection.style.display = 'none';
        selectedDifficulty = null;
        document.getElementById('selectedDifficulty').textContent = 'Select a difficulty';
        const diffOptions = document.querySelectorAll('.difficulty-option');
        diffOptions.forEach(opt => opt.classList.remove('selected'));
    }
    
    // Enable start game button if all selections are made
    checkStartGameButton();
}

// Function to handle difficulty selection
function selectDifficulty(difficultyName) {
    selectedDifficulty = difficultyName;
    
    // Update UI
    document.getElementById('selectedDifficulty').textContent = difficultyName.charAt(0).toUpperCase() + difficultyName.slice(1);
    
    // Remove selection highlight from other options
    const options = document.querySelectorAll('.difficulty-option');
    options.forEach(opt => {
        if (opt.dataset.difficulty === difficultyName) {
            opt.classList.add('selected');
        } else {
            opt.classList.remove('selected');
        }
    });
    
    // Enable start game button if all selections are made
    checkStartGameButton();
}

// Function to check if all selections are made to enable start game button
function checkStartGameButton() {
    if (selectedCharacters.player1 && selectedCharacters.player2 && selectedStage && selectedMode) {
        if (selectedMode === 'singleplayer' && !selectedDifficulty) {
            startGameButton.disabled = true;
        } else {
            startGameButton.disabled = false;
        }
    } else {
        startGameButton.disabled = true;
    }
}

// Function to start the game
function startGame() {
    gameState = 'playing';
    characterSelection.style.display = 'none';
    canvas.style.display = 'block';
    gameUI.style.display = 'block';
    
    // Reset match state
    currentRound = 1;
    scores = { player1: 0, player2: 0 };
    isRoundOver = false;
    matchOver = false;
    updateRoundDisplay();
    updateScoreDisplay();
    
    // Set a default stage if none is selected
    if (!selectedStage) {
        selectedStage = 'Arena';
        document.getElementById('selectedStage').textContent = 'Arena';
    }
    
    // Initialize fighters based on selection
    player1 = new Fighter({
        position: { x: canvas.width * 0.2, y: canvas.height - 150 },
        velocity: { x: 0, y: 0 },
        color: characters[selectedCharacters.player1].color,
        facing: 'right',
        characterType: selectedCharacters.player1
    });
    
    player2 = new Fighter({
        position: { x: canvas.width * 0.8, y: canvas.height - 150 },
        velocity: { x: 0, y: 0 },
        color: characters[selectedCharacters.player2].color,
        facing: 'left',
        characterType: selectedCharacters.player2
    });
    
    // Update health bar labels with character names
    document.querySelector('#player1Selection + div span').textContent = selectedCharacters.player1;
    document.querySelector('#player2Selection + div span').textContent = selectedCharacters.player2;
    
    // Set AI control for single-player mode
    isAIControlled = selectedMode === 'singleplayer';
    if (isAIControlled) {
        aiReactionTimer = difficulties[selectedDifficulty].reactionTime;
    }
    
    // Debug log to confirm game start
    console.log('Game started with stage:', selectedStage, 'and characters:', selectedCharacters);
    
    // Start game loop
    gameLoop();
}

// Function to update round display
function updateRoundDisplay() {
    document.getElementById('roundInfo').textContent = `Round ${currentRound}`;
}

// Function to update score display
function updateScoreDisplay() {
    document.getElementById('player1Score').textContent = scores.player1;
    document.getElementById('player2Score').textContent = scores.player2;
}

// Function to reset round
function resetRound() {
    isRoundOver = false;
    player1 = new Fighter({
        position: { x: 200, y: canvas.height - 100 },
        velocity: { x: 0, y: 0 },
        color: characters[selectedCharacters.player1].color,
        facing: 'right',
        characterType: selectedCharacters.player1
    });
    player2 = new Fighter({
        position: { x: 600, y: canvas.height - 100 },
        velocity: { x: 0, y: 0 },
        color: characters[selectedCharacters.player2].color,
        facing: 'left',
        characterType: selectedCharacters.player2
    });
    updateHealthBar(player1, 'player1Health');
    updateHealthBar(player2, 'player2Health');
    document.getElementById('gameStatus').style.display = 'none';
}

// Function to check for match winner
function checkMatchWinner() {
    const winningScore = Math.ceil(maxRounds / 2);
    if (scores.player1 >= winningScore || scores.player2 >= winningScore) {
        matchOver = true;
        return true;
    }
    return false;
}

// Keyboard controls
const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false }
};

// Game loop
function gameLoop() {
    if (gameState !== 'playing') return;
    
    // Debug log to confirm game loop is running
    console.log('Game loop running, state:', gameState);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background based on selected stage
    if (selectedStage && stages[selectedStage]) {
        ctx.fillStyle = stages[selectedStage].backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw stage details
        stages[selectedStage].details(ctx);
        
        // Draw ground
        ctx.fillStyle = stages[selectedStage].groundColor;
        ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    } else {
        // Default background if no stage is selected
        ctx.fillStyle = '#333';  // Lighter default gray
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        console.log('No stage selected, defaulting to gray background');
    }
    
    // Update fighters
    player1.update(player2);
    player2.update(player1);
    
    // Apply boundary checks to keep fighters within canvas
    applyBoundaries(player1);
    applyBoundaries(player2);
    
    // AI control for Player 2 in single-player mode
    if (isAIControlled && !isRoundOver && !matchOver) {
        handleAIBehavior(player2, player1);
    }
    
    // Debug log positions before drawing
    console.log('Drawing player1 at', player1.position);
    console.log('Drawing player2 at', player2.position);
    
    // Draw fighters
    player1.draw(ctx);
    player2.draw(ctx);
    
    // Player 1 movement
    player1.velocity.x = 0;
    if (keys.a.pressed) {
        player1.velocity.x = -5;
        player1.facing = 'left';
    } else if (keys.d.pressed) {
        player1.velocity.x = 5;
        player1.facing = 'right';
    }
    if (keys.w.pressed && player1.velocity.y === 0) {
        player1.velocity.y = -10;
    }
    
    // Player 2 movement (only if not AI controlled)
    if (!isAIControlled) {
        player2.velocity.x = 0;
        if (keys.ArrowLeft.pressed) {
            player2.velocity.x = -5;
            player2.facing = 'left';
        } else if (keys.ArrowRight.pressed) {
            player2.velocity.x = 5;
            player2.facing = 'right';
        }
        if (keys.ArrowUp.pressed && player2.velocity.y === 0) {
            player2.velocity.y = -10;
        }
    }
    
    // Check for attack collisions
    if (checkAttackHit(player1, player2)) {
        player1.isAttacking = false;
        player2.takeHit(false);
        updateHealthBar(player2, 'player2Health');
        sounds.hit.play();
        if (player1.comboCount > 0) {
            displayComboFeedback(1, player1.comboCount);
            sounds.combo.play();
        }
    }
    
    if (checkAttackHit(player2, player1)) {
        player2.isAttacking = false;
        player1.takeHit(false);
        updateHealthBar(player1, 'player1Health');
        sounds.hit.play();
        if (player2.comboCount > 0) {
            displayComboFeedback(2, player2.comboCount);
            sounds.combo.play();
        }
    }
    
    // Check for special attack collisions
    if (checkSpecialAttackHit(player1, player2)) {
        player1.isSpecialAttacking = false;
        player2.takeHit(true);
        updateHealthBar(player2, 'player2Health');
        sounds.specialHit.play();
    }
    
    if (checkSpecialAttackHit(player2, player1)) {
        player2.isSpecialAttacking = false;
        player1.takeHit(true);
        updateHealthBar(player1, 'player1Health');
        sounds.specialHit.play();
    }
    
    // Check for game over (end of round)
    if (!isRoundOver && (player1.health <= 0 || player2.health <= 0)) {
        isRoundOver = true;
        // Update scores
        if (player1.health <= 0 && player2.health > 0) {
            scores.player2++;
        } else if (player2.health <= 0 && player1.health > 0) {
            scores.player1++;
        } else {
            // Double KO, no points awarded
        }
        updateScoreDisplay();
        determineWinner(player1, player2, document.getElementById('gameStatus'));
        sounds.gameOver.play();
        
        // Check if match is over
        if (checkMatchWinner()) {
            gameState = 'matchOver';
            setTimeout(endMatch, 2000);
        } else {
            // Move to next round
            currentRound++;
            updateRoundDisplay();
            setTimeout(resetRound, 2000);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

// Function to apply boundaries to a fighter
function applyBoundaries(fighter) {
    if (fighter.position.x < 0) fighter.position.x = 0;
    if (fighter.position.x + fighter.width > canvas.width) fighter.position.x = canvas.width - fighter.width;
    if (fighter.position.y + fighter.height > canvas.height) {
        fighter.position.y = canvas.height - fighter.height;
        fighter.velocity.y = 0;
    }
    if (fighter.position.y < 0) {
        fighter.position.y = 0;
        fighter.velocity.y = 0;
    }
}

// Function to handle AI behavior for Player 2
function handleAIBehavior(aiPlayer, opponent) {
    if (selectedDifficulty && difficulties[selectedDifficulty]) {
        const difficulty = difficulties[selectedDifficulty];
        aiReactionTimer--;
        
        if (aiReactionTimer <= 0) {
            // Reset reaction timer
            aiReactionTimer = difficulty.reactionTime;
            
            // Calculate distance to opponent
            const distance = Math.abs(aiPlayer.position.x - opponent.position.x);
            
            // Decide actions based on difficulty and distance
            if (distance < 100 && Math.random() < difficulty.attackChance) {
                aiAction.attack = true;
            } else if (distance < 200 && Math.random() < difficulty.specialChance && aiPlayer.specialCooldown === 0) {
                aiAction.special = true;
            } else if (Math.random() < difficulty.moveChance) {
                aiAction.move = true;
                aiAction.direction = opponent.position.x > aiPlayer.position.x ? 'right' : 'left';
            } else {
                aiAction.move = false;
                aiAction.attack = false;
                aiAction.special = false;
            }
        }
        
        // Execute AI actions
        aiPlayer.velocity.x = 0;
        if (aiAction.move) {
            if (aiAction.direction === 'right') {
                aiPlayer.velocity.x = 5;
                aiPlayer.facing = 'right';
            } else {
                aiPlayer.velocity.x = -5;
                aiPlayer.facing = 'left';
            }
        }
        if (aiAction.attack) {
            aiPlayer.attack();
            sounds.attack.play();
            aiAction.attack = false; // Reset action after execution
        }
        if (aiAction.special) {
            aiPlayer.specialAttack();
            sounds.specialAttack.play();
            aiAction.special = false; // Reset action after execution
        }
    }
}

// Function to check if an attack hits the opponent
function checkAttackHit(attacker, defender) {
    if (!attacker.isAttacking) return false;
    
    const attackBox = {
        x: attacker.facing === 'right' 
            ? attacker.position.x + attacker.width 
            : attacker.position.x - attacker.attackBox.width,
        y: attacker.position.y + attacker.height * 0.3,
        width: attacker.attackBox.width,
        height: attacker.attackBox.height
    };

    const defenderBox = {
        x: defender.position.x,
        y: defender.position.y,
        width: defender.width,
        height: defender.height
    };

    return (
        attackBox.x < defenderBox.x + defenderBox.width &&
        attackBox.x + attackBox.width > defenderBox.x &&
        attackBox.y < defenderBox.y + defenderBox.height &&
        attackBox.y + attackBox.height > defenderBox.y
    );
}

// Function to check if a special attack hits the opponent
function checkSpecialAttackHit(attacker, defender) {
    if (!attacker.isSpecialAttacking) return false;
    
    const attackBox = {
        x: attacker.facing === 'right' 
            ? attacker.position.x + attacker.width 
            : attacker.position.x - attacker.specialAttackBox.width,
        y: attacker.position.y + attacker.height * 0.25,
        width: attacker.specialAttackBox.width,
        height: attacker.specialAttackBox.height
    };

    const defenderBox = {
        x: defender.position.x,
        y: defender.position.y,
        width: defender.width,
        height: defender.height
    };

    return (
        attackBox.x < defenderBox.x + defenderBox.width &&
        attackBox.x + attackBox.width > defenderBox.x &&
        attackBox.y < defenderBox.y + defenderBox.height &&
        attackBox.y + attackBox.height > defenderBox.y
    );
}

// Function to update health bar UI
function updateHealthBar(player, elementId) {
    const healthBar = document.getElementById(elementId);
    healthBar.style.width = `${player.health}%`;
}

// Function to determine and display the winner
function determineWinner(player1, player2, statusElement) {
    statusElement.style.display = 'block';
    if (matchOver) {
        const winningScore = Math.ceil(maxRounds / 2);
        if (scores.player1 >= winningScore) {
            statusElement.textContent = `${selectedCharacters.player1} Wins the Match!`;
        } else if (scores.player2 >= winningScore) {
            statusElement.textContent = `${selectedCharacters.player2} Wins the Match!`;
        }
    } else {
        if (player1.health <= 0 && player2.health <= 0) {
            statusElement.textContent = 'Double KO!';
        } else if (player1.health <= 0) {
            statusElement.textContent = `${selectedCharacters.player2} Wins Round ${currentRound}!`;
        } else {
            statusElement.textContent = `${selectedCharacters.player1} Wins Round ${currentRound}!`;
        }
    }
}

// Function to display combo feedback
function displayComboFeedback(playerNum, comboCount) {
    const comboFeedback = document.createElement('div');
    comboFeedback.className = 'combo-feedback';
    comboFeedback.textContent = `${comboCount + 1} Hit Combo!`;
    comboFeedback.style.position = 'absolute';
    comboFeedback.style.color = playerNum === 1 ? '#ff4444' : '#4444ff';
    comboFeedback.style.fontSize = '20px';
    comboFeedback.style.fontWeight = 'bold';
    comboFeedback.style.top = `${playerNum === 1 ? 100 : 150}px`;
    comboFeedback.style.left = `${playerNum === 1 ? 100 : canvas.width - 200}px`;
    comboFeedback.style.opacity = '1';
    comboFeedback.style.transition = 'opacity 1s ease';
    document.querySelector('.game-ui').appendChild(comboFeedback);
    
    setTimeout(() => {
        comboFeedback.style.opacity = '0';
        setTimeout(() => {
            comboFeedback.remove();
        }, 1000);
    }, 500);
}

// Event listeners for keyboard controls
window.addEventListener('keydown', (event) => {
    if (gameState !== 'playing' || isRoundOver) return;
    
    switch (event.code) {
        // Player 1 controls
        case 'KeyA':
            keys.a.pressed = true;
            break;
        case 'KeyD':
            keys.d.pressed = true;
            break;
        case 'KeyW':
            keys.w.pressed = true;
            break;
        case 'KeyE': // Attack for Player 1
            player1.attack();
            sounds.attack.play();
            break;
        case 'KeyQ': // Special Attack for Player 1
            if (player1.specialCooldown === 0) {
                player1.specialAttack();
                sounds.specialAttack.play();
            }
            break;
        // Player 2 controls
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = true;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = true;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = true;
            break;
        case 'Enter': // Attack for Player 2
            player2.attack();
            sounds.attack.play();
            break;
        case 'Numpad0': // Special Attack for Player 2
            if (player2.specialCooldown === 0) {
                player2.specialAttack();
                sounds.specialAttack.play();
            }
            break;
    }
});

window.addEventListener('keyup', (event) => {
    if (gameState !== 'playing') return;
    
    switch (event.code) {
        // Player 1 controls
        case 'KeyA':
            keys.a.pressed = false;
            break;
        case 'KeyD':
            keys.d.pressed = false;
            break;
        case 'KeyW':
            keys.w.pressed = false;
            break;
        // Player 2 controls
        case 'ArrowLeft':
            keys.ArrowLeft.pressed = false;
            break;
        case 'ArrowRight':
            keys.ArrowRight.pressed = false;
            break;
        case 'ArrowUp':
            keys.ArrowUp.pressed = false;
            break;
    }
});

// Do not start the game loop here, it will be started after character selection
// gameLoop(); 