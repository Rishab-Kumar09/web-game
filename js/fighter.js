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