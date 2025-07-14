const GAME_CONFIG = {
    canvas: {
        width: 1024,
        height: 576
    },
    fighter: {
        width: 100,     // Increased width for bigger stickman
        height: 200,    // Increased height for bigger stickman
        speed: 7,       // Kept the same speed
        jumpForce: -20, // Kept the same jump force
        gravity: 0.7,
        maxHealth: 100
    },
    controls: {
        player1: {
            left: 'KeyA',
            right: 'KeyD',
            jump: 'KeyW',
            attack: 'Space'
        },
        player2: {
            left: 'ArrowLeft',
            right: 'ArrowRight',
            jump: 'ArrowUp',
            attack: 'ShiftRight'
        }
    }
}; 