function rectangularCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function updateHealthBar(player, healthBarId) {
    const healthBar = document.getElementById(healthBarId);
    const healthPercentage = (player.health / GAME_CONFIG.fighter.maxHealth) * 100;
    healthBar.style.setProperty('--health-percentage', `${healthPercentage}%`);
}

function determineWinner(player1, player2, gameStatus) {
    let message = '';
    if (player1.health === player2.health) {
        message = 'Tie!';
    } else if (player1.health > player2.health) {
        message = 'Player 1 Wins!';
    } else {
        message = 'Player 2 Wins!';
    }
    gameStatus.innerHTML = message;
} 