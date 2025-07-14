const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = GAME_CONFIG.canvas.width;
canvas.height = GAME_CONFIG.canvas.height;

const player1 = new Fighter({
    position: { x: 200, y: 100 },
    velocity: { x: 0, y: 0 },
    color: '#ff4444',
    facing: 'right'
});

const player2 = new Fighter({
    position: { x: 700, y: 100 },
    velocity: { x: 0, y: 0 },
    color: '#4444ff',
    facing: 'left'
});

const keys = {
    a: { pressed: false },
    d: { pressed: false },
    w: { pressed: false },
    ArrowLeft: { pressed: false },
    ArrowRight: { pressed: false },
    ArrowUp: { pressed: false }
};

let gameOver = false;

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

    return rectangularCollision(attackBox, defenderBox);
}

function animate() {
    window.requestAnimationFrame(animate);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update players
    player1.update(ctx, player2);
    player2.update(ctx, player1);

    // Player 1 movement
    player1.velocity.x = 0;
    if (keys.a.pressed) {
        player1.velocity.x = -GAME_CONFIG.fighter.speed;
    } else if (keys.d.pressed) {
        player1.velocity.x = GAME_CONFIG.fighter.speed;
    }

    // Player 2 movement
    player2.velocity.x = 0;
    if (keys.ArrowLeft.pressed) {
        player2.velocity.x = -GAME_CONFIG.fighter.speed;
    } else if (keys.ArrowRight.pressed) {
        player2.velocity.x = GAME_CONFIG.fighter.speed;
    }

    // Detect attacks
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
}

// Event listeners
window.addEventListener('keydown', (event) => {
    if (!gameOver) {
        switch (event.code) {
            // Player 1 controls
            case GAME_CONFIG.controls.player1.left:
                keys.a.pressed = true;
                break;
            case GAME_CONFIG.controls.player1.right:
                keys.d.pressed = true;
                break;
            case GAME_CONFIG.controls.player1.jump:
                if (player1.velocity.y === 0) {
                    player1.velocity.y = GAME_CONFIG.fighter.jumpForce;
                }
                break;
            case GAME_CONFIG.controls.player1.attack:
                player1.attack();
                break;

            // Player 2 controls
            case GAME_CONFIG.controls.player2.left:
                keys.ArrowLeft.pressed = true;
                break;
            case GAME_CONFIG.controls.player2.right:
                keys.ArrowRight.pressed = true;
                break;
            case GAME_CONFIG.controls.player2.jump:
                if (player2.velocity.y === 0) {
                    player2.velocity.y = GAME_CONFIG.fighter.jumpForce;
                }
                break;
            case GAME_CONFIG.controls.player2.attack:
                player2.attack();
                break;
        }
    }
});

window.addEventListener('keyup', (event) => {
    switch (event.code) {
        // Player 1 controls
        case GAME_CONFIG.controls.player1.left:
            keys.a.pressed = false;
            break;
        case GAME_CONFIG.controls.player1.right:
            keys.d.pressed = false;
            break;

        // Player 2 controls
        case GAME_CONFIG.controls.player2.left:
            keys.ArrowLeft.pressed = false;
            break;
        case GAME_CONFIG.controls.player2.right:
            keys.ArrowRight.pressed = false;
            break;
    }
});

// Start the game
animate(); 