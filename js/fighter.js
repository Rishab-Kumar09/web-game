class Fighter {
    constructor({ position, velocity, color, facing, characterType }) {
        this.position = position;
        this.velocity = velocity;
        this.color = color;
        this.facing = facing;
        this.characterType = characterType || 'Warrior';
        this.width = 20;  // Slimmer for realism
        this.height = 100;
        this.isAttacking = false;
        this.isSpecialAttacking = false;
        this.isBlocking = false;
        this.isHitStunned = false;
        this.stunTimer = 0;
        this.stamina = 100;
        this.staminaRegenRate = 0.5;
        this.attackBox = { width: 80, height: 40 };
        this.specialAttackBox = { width: 120, height: 50 };
        this.health = 100;
        this.animationFrame = 0;
        this.isMoving = false;
        this.specialCooldown = 0;
        this.specialCooldownMax = 180; // 3 seconds
        this.comboCount = 0;
        this.comboMultiplier = 1;
        this.lastAttackTime = 0;
        this.comboWindow = 400; // Tighter for fast combos
        this.rageMode = false;
    }

    draw(ctx) {
        this.animationFrame++;
        const animSpeed = 0.15; // Slower for realism
        const bounce = Math.sin(this.animationFrame * animSpeed) * 2;
        const swing = Math.sin(this.animationFrame * animSpeed * 2) * 0.4;

        // Center and base
        const centerX = this.position.x + this.width / 2;
        const baseY = this.position.y + this.height;
        const hipY = baseY - 60 + (this.isMoving ? bounce : 0);
        const shoulderY = hipY - 40;
        const headY = shoulderY - 15 + (this.isHitStunned ? Math.random() * 2 - 1 : 0); // Shake on stun

        ctx.strokeStyle = this.rageMode ? '#ff0000' : this.color; // Red in rage mode
        ctx.lineWidth = 4;
        ctx.fillStyle = this.color;

        // Head
        ctx.beginPath();
        ctx.arc(centerX, headY, 12, 0, Math.PI * 2);
        ctx.fill();

        // Body
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(centerX, hipY);
        ctx.stroke();

        // Legs with walk cycle
        const legLength = 30;
        const legSwing = this.isMoving ? swing : 0;
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(centerX - 10 * (this.facing === 'right' ? 1 : -1), baseY);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, hipY);
        ctx.lineTo(centerX + (10 + legSwing * 15) * (this.facing === 'right' ? 1 : -1), baseY);
        ctx.stroke();

        // Arms with attack animation
        const armLength = 35;
        let armAngle = this.isAttacking ? 1.2 : (this.isMoving ? swing : 0);
        if (this.isSpecialAttacking) armAngle = 1.5 + Math.sin(this.animationFrame * 0.3);
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(centerX + Math.cos(armAngle) * armLength * (this.facing === 'right' ? 1 : -1), shoulderY + Math.sin(armAngle) * armLength);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(centerX, shoulderY);
        ctx.lineTo(centerX + Math.cos(armAngle + Math.PI) * armLength * (this.facing === 'right' ? 1 : -1), shoulderY + Math.sin(armAngle + Math.PI) * armLength);
        ctx.stroke();

        // Attack boxes with effects
        if (this.isAttacking || this.isSpecialAttacking) {
            ctx.fillStyle = this.isSpecialAttacking ? this.getSpecialAttackColor() : 'rgba(255, 255, 0, 0.4)';
            const box = this.isSpecialAttacking ? this.specialAttackBox : this.attackBox;
            const x = this.facing === 'right' ? this.position.x + this.width : this.position.x - box.width;
            ctx.fillRect(x, shoulderY, box.width, box.height);
        }

        // Block shield
        if (this.isBlocking) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
            ctx.fillRect(this.position.x - 10, this.position.y, this.width + 20, this.height);
        }
    }

    update(opponent) {
        // Gravity and movement
        this.velocity.y += 0.4; // Lighter gravity for floatier jumps
        this.position.y += this.velocity.y;
        this.position.x += this.velocity.x;
        this.velocity.x *= 0.98; // Friction for smoother stops

        // Stun and rage
        if (this.stunTimer > 0) this.stunTimer--;
        this.isHitStunned = this.stunTimer > 0;
        if (this.health < 30 && !this.rageMode) this.rageMode = true;

        // Stamina regen
        this.stamina = Math.min(100, this.stamina + this.staminaRegenRate);

        // Animation and combo update
        this.isMoving = Math.abs(this.velocity.x) > 0.5 || Math.abs(this.velocity.y) > 0.5;
        this.animationFrame++;
        const now = Date.now();
        if (now - this.lastAttackTime > this.comboWindow) {
            this.comboCount = 0;
            this.comboMultiplier = 1;
        }
        if (this.specialCooldown > 0) this.specialCooldown--;
    }

    attack() {
        if (this.stamina < 10) return;
        this.isAttacking = true;
        this.stamina -= 10;
        const now = Date.now();
        this.comboCount++;
        this.comboMultiplier = Math.min(2, 1 + this.comboCount * 0.2);
        this.lastAttackTime = now;
        setTimeout(() => this.isAttacking = false, 150);
    }

    specialAttack() {
        if (this.specialCooldown > 0 || this.stamina < 30) return;
        this.isSpecialAttacking = true;
        this.stamina -= 30;
        this.specialCooldown = this.specialCooldownMax;
        setTimeout(() => this.isSpecialAttacking = false, 250);
    }

    takeHit(isSpecial = false, attacker) {
        if (this.isBlocking) {
            this.health -= (isSpecial ? 5 : 2); // Reduced damage when blocking
            return;
        }
        const baseDamage = isSpecial ? 15 : 8;
        this.health -= baseDamage * (this.rageMode ? 0.8 : 1) * attacker.comboMultiplier;
        this.stunTimer = isSpecial ? 20 : 10; // Brief stun
        this.velocity.x = (attacker.facing === 'right' ? 5 : -5) * (isSpecial ? 2 : 1); // Knockback
        if (this.health < 0) this.health = 0;
        this.comboCount = 0;
        this.comboMultiplier = 1;
    }

    block() {
        this.isBlocking = true;
        this.stamina -= 0.2; // Drains stamina while blocking
    }

    stopBlock() {
        this.isBlocking = false;
    }

    getSpecialAttackColor() {
        return this.characterType === 'Warrior' ? 'rgba(255, 100, 0, 0.7)' :
               this.characterType === 'Ninja' ? 'rgba(0, 100, 255, 0.7)' :
               'rgba(0, 255, 100, 0.7)';
    }
} 