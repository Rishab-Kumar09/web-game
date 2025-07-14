const GAME_CONFIG = {
    canvas: {
        width: 1024,
        height: 576
    },
    fighter: {
        width: 80,      // Adjusted for better proportions
        height: 160,    // Adjusted for better proportions
        speed: 6,       // Slightly reduced for better control
        jumpForce: -18, // Adjusted jump height
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