const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Include Fighter class (assuming it's in a separate file)
// For now, we'll define it here for simplicity
class Fighter {
    constructor({ position, velocity, color, facing }) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.facing = facing;
        this.width = 50;
        this.height = 100;
        this.isAttacking = false;
        this.attackBox = {
            width: 100,
            height: 50
        };
        this.health = 100;
    }

    draw(ctx) {
        ctx.fillStyle = this.color;
        // Body
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        // Head
        ctx.fillRect(this.position.x + this.width / 2 - 10, this.position.y - 20, 20, 20);
        // Attack box (visible when attacking)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            const attackX = this.facing === 'right' ? this.position.x + this.width : this.position.x - this.attackBox.width;
            ctx.fillRect(attackX, this.position.y + this.height * 0.3, this.attackBox.width, this.attackBox.height);
        }
    }

    update(opponent) {
        // Apply gravity
        this.velocity.y += 0.5;
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;

        // Keep within canvas bounds
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > canvas.width) this.position.x = canvas.width - this.width;
        if (this.position.y + this.height > canvas.height) {
            this.position.y = canvas.height - this.height;
            this.velocity.y = 0;
        }
        if (this.position.y < 0) {
            this.position.y = 0;
            this.velocity.y = 0;
        }
    }

    attack() {
        this.isAttacking = true;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    takeHit() {
        this.health -= 10;
        if (this.health < 0) this.health = 0;
    }
}

// Initialize fighters
const player1 = new Fighter({
    position: { x: 200, y: canvas.height - 100 },
    velocity: { x: 0, y: 0 },
    color: '#ff4444',
    facing: 'right'
});

const player2 = new Fighter({
    position: { x: 600, y: canvas.height - 100 },
    velocity: { x: 0, y: 0 },
    color: '#4444ff',
    facing: 'left'
});

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update fighters
    player1.update(player2);
    player2.update(player1);
    
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
    
    // Player 2 movement
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
    
    // Check for attack collisions
    if (checkAttackHit(player1, player2)) {
        player1.isAttacking = false;
        player2.takeHit();
        updateHealthBar(player2, 'player2Health');
    }
    
    if (checkAttackHit(player2, player1)) {
        player2.isAttacking = false;
        player1.takeHit();
        updateHealthBar(player1, 'player1Health');
    }
    
    // Check for game over
    if (!gameOver && (player1.health <= 0 || player2.health <= 0)) {
        gameOver = true;
        determineWinner(player1, player2, document.getElementById('gameStatus'));
    }
    
    requestAnimationFrame(gameLoop);
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

// Function to update health bar UI
function updateHealthBar(player, elementId) {
    const healthBar = document.getElementById(elementId);
    healthBar.style.width = `${player.health}%`;
}

// Variable to track game over state
let gameOver = false;

// Function to determine and display the winner
function determineWinner(player1, player2, statusElement) {
    statusElement.style.display = 'block';
    if (player1.health <= 0 && player2.health <= 0) {
        statusElement.textContent = 'Double KO!';
    } else if (player1.health <= 0) {
        statusElement.textContent = 'Player 2 Wins!';
    } else {
        statusElement.textContent = 'Player 1 Wins!';
    }
}

// Event listeners for keyboard controls
window.addEventListener('keydown', (event) => {
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
            break;
    }
});

window.addEventListener('keyup', (event) => {
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

// Start the game loop
gameLoop(); 