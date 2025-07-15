class Fighter {
    constructor({ position, velocity, color, facing, characterType }) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.facing = facing;
        this.characterType = characterType || 'Warrior';
        this.width = 50;
        this.height = 100;
        this.isAttacking = false;
        this.isSpecialAttacking = false;
        this.attackBox = {
            width: 100,
            height: 50
        };
        this.specialAttackBox = {
            width: 150,
            height: 60
        };
        this.health = 100;
        this.animationFrame = 0;
        this.isMoving = false;
        this.specialCooldown = 0;
        this.specialCooldownMax = 300; // 5 seconds at 60fps
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.lastAttackTime = 0;
        this.comboWindow = 500; // 500ms window to continue combo
    }

    draw(ctx) {
        // Base dimensions
        const headRadius = 15;
        const bodyLength = 40;
        const limbLength = 30;
        
        // Calculate center position
        const centerX = this.position.x + this.width / 2;
        const baseY = this.position.y + this.height - 10; // Anchor to feet
        
        // Calculate all body part positions from bottom up
        const feetY = baseY;
        const hipY = feetY - limbLength;
        const shoulderY = hipY - bodyLength;
        const headY = shoulderY - headRadius;
        
        // Apply movement animation
        const bounceOffset = this.isMoving ? Math.abs(Math.sin(this.animationFrame * 0.1)) * 3 : 0;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 3; // Thicker lines for better visibility
        
        // Draw legs with walking animation
        const legSwing = this.isMoving ? Math.sin(this.animationFrame * 0.1) * 0.3 : 0;
        
        // Left leg
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(
            centerX - Math.sin(legSwing - 0.2) * limbLength * (this.facing === 'right' ? 1 : -1),
            feetY
        );
        ctx.stroke();
        
        // Right leg
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(
            centerX + Math.sin(legSwing + Math.PI) * limbLength * (this.facing === 'right' ? 1 : -1),
            feetY
        );
        ctx.stroke();

        // Draw body
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(centerX, hipY);
        ctx.stroke();
        
        // Draw head with fill
        ctx.beginPath();
        ctx.arc(centerX, headY, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        // Draw arms with attack animation
        let armSwing;
        if (this.isSpecialAttacking) {
            armSwing = Math.sin(this.animationFrame * 0.3) * 0.7;
        } else if (this.isAttacking) {
            armSwing = Math.sin(this.animationFrame * 0.2) * 0.5;
        } else {
            armSwing = this.isMoving ? Math.sin(this.animationFrame * 0.1) * 0.2 : 0;
        }
        
        // Left arm (or right arm if facing left)
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(
            centerX - Math.sin(armSwing + (this.facing === 'right' ? 0 : Math.PI)) * limbLength * (this.facing === 'right' ? 1 : -1),
            shoulderY + Math.cos(armSwing) * limbLength
        );
        ctx.stroke();
        
        // Right arm (or left arm if facing left)
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(
            centerX + Math.sin(armSwing + (this.facing === 'right' ? Math.PI : 0)) * limbLength * (this.facing === 'right' ? 1 : -1),
            shoulderY + Math.cos(armSwing) * limbLength
        );
        ctx.stroke();

        // Attack box (visible when attacking)
        if (this.isAttacking) {
            ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            const attackX = this.facing === 'right' ? this.position.x + this.width : this.position.x - this.attackBox.width;
            ctx.fillRect(attackX, this.position.y + this.height * 0.3, this.attackBox.width, this.attackBox.height);
        }
        
        // Special attack box (visible when special attacking)
        if (this.isSpecialAttacking) {
            ctx.fillStyle = this.getSpecialAttackColor();
            const specialAttackX = this.facing === 'right' ? this.position.x + this.width : this.position.x - this.specialAttackBox.width;
            ctx.fillRect(specialAttackX, this.position.y + this.height * 0.25, this.specialAttackBox.width, this.specialAttackBox.height);
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

        // Update animation state
        this.isMoving = Math.abs(this.velocity.x) > 0;
        this.animationFrame++;
        
        // Update special cooldown
        if (this.specialCooldown > 0) {
            this.specialCooldown--;
        }
        
        // Reset combo if window has expired
        const now = Date.now();
        if (now - this.lastAttackTime > this.comboWindow && this.comboCount > 0) {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
    }

    attack() {
        this.isAttacking = true;
        const now = Date.now();
        if (now - this.lastAttackTime < this.comboWindow) {
            this.comboCount = (this.comboCount + 1) % 3; // Cycle through 3 combo levels
            this.comboMultiplier = Math.min(1.5, 1 + (this.comboCount * 0.2)); // Increase damage up to 1.5x
        } else {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        this.lastAttackTime = now;
        setTimeout(() => {
            this.isAttacking = false;
        }, 100);
    }

    specialAttack() {
        if (this.specialCooldown > 0) return; // Cannot use special if on cooldown
        
        this.isSpecialAttacking = true;
        this.specialCooldown = this.specialCooldownMax;
        const now = Date.now();
        if (now - this.lastAttackTime < this.comboWindow) {
            this.comboCount = (this.comboCount + 1) % 3; // Cycle through 3 combo levels
            this.comboMultiplier = Math.min(1.5, 1 + (this.comboCount * 0.2)); // Increase damage up to 1.5x
        } else {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        this.lastAttackTime = now;
        setTimeout(() => {
            this.isSpecialAttacking = false;
        }, 200);
    }

    getSpecialAttackColor() {
        switch (this.characterType) {
            case 'Warrior':
                return 'rgba(255, 100, 0, 0.7)'; // Fiery orange
            case 'Ninja':
                return 'rgba(100, 100, 255, 0.7)'; // Electric blue
            case 'Samurai':
                return 'rgba(100, 255, 100, 0.7)'; // Energy green
            default:
                return 'rgba(255, 255, 0, 0.7)'; // Yellow default
        }
    }

    takeHit(isSpecial = false) {
        const baseDamage = isSpecial ? 20 : 10;
        this.health -= baseDamage * (isSpecial ? 1 : this.comboMultiplier);
        if (this.health < 0) this.health = 0;
        // Reset combo on hit taken
        this.comboCount = 0;
        this.comboMultiplier = 1;
    }
} 