class Fighter {
    constructor({ position, velocity, color = 'red', facing = 'right' }) {
        this.position = position;
        this.velocity = velocity;
        this.width = GAME_CONFIG.fighter.width;
        this.height = GAME_CONFIG.fighter.height;
        this.health = GAME_CONFIG.fighter.maxHealth;
        this.color = color;
        this.facing = facing;
        this.isAttacking = false;
        this.attackBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            width: 100,
            height: 50
        };
    }

    draw(ctx) {
        // Draw fighter body
        ctx.fillStyle = this.color;
        ctx.fillRect(this.position.x, this.position.y, this.width, this.height);

        // Draw attack box when attacking
        if (this.isAttacking) {
            ctx.fillStyle = 'yellow';
            const attackX = this.facing === 'right' 
                ? this.position.x + this.width 
                : this.position.x - this.attackBox.width;
            ctx.fillRect(
                attackX,
                this.position.y + this.height * 0.3,
                this.attackBox.width,
                this.attackBox.height
            );
        }
    }

    update(ctx) {
        this.draw(ctx);

        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        // Apply gravity
        if (this.position.y + this.height + this.velocity.y >= GAME_CONFIG.canvas.height) {
            this.velocity.y = 0;
            this.position.y = GAME_CONFIG.canvas.height - this.height;
        } else {
            this.velocity.y += GAME_CONFIG.fighter.gravity;
        }

        // Keep fighter within canvas bounds
        if (this.position.x < 0) this.position.x = 0;
        if (this.position.x + this.width > GAME_CONFIG.canvas.width) {
            this.position.x = GAME_CONFIG.canvas.width - this.width;
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