class Camera extends PhysEntity {
    constructor (pos) {
        super(PhysEntity);
        this.pos = pos;
        this.vel = new Vector();
        this.angle = 0;
        this.angleVel = 0;
        this.zoom = 1;
        this.zoomVel = 0;
    };
    updatePhysics (delta) {
        let move = new Vector(input.getBindState('moveRight') - input.getBindState('moveLeft'), input.getBindState('moveDown') - input.getBindState('moveUp'));
        move.angle = move.rotate(0 - this.angle).angle;
        move.scaler = (1/10) / this.zoom * delta;

        // Move red circle instead of camera if whatever key that was binded to "control" is being held (and move camera to red circle)
        if(input.getBindState('control') && (entityManager.entities[0] != undefined)) {
            move.scaler = (1/5) * delta;
            entityManager.entities[0].vel = entityManager.entities[0].vel.translate(move.flipY().scale(0.02));
            move = new Vector();
            cam.pos = entityManager.entities[0].pos.flipY();
        };

        this.vel = this.vel.translate(move);
        this.angleVel += (1/3000) * (input.getBindState('rotateClock') - input.getBindState('rotateCounter')) * delta;
        this.zoomVel += (1/4000) * this.zoom * (input.getBindState('zoomIn') - input.getBindState('zoomOut')) * delta;

        this.pos = this.pos.translate(this.vel.scale(delta));
        this.angle = this.angle + this.angleVel * delta;
        this.zoom = Math.max(this.zoom + this.zoomVel * delta, 0.001);

        this.vel = this.vel.scale(0.9 ** delta);
        this.angleVel = this.angleVel * 0.8 ** delta;
        this.zoomVel = this.zoomVel * 0.9 ** delta;
    };
    isEntityVisible (entity) {
        let pos = entity.pos.worldToScreen(this);
        if(Math.abs(pos.x - screen.width/2) - entity.radius * this.zoom < screen.width/2 && Math.abs(pos.y - screen.height/2) - entity.radius * this.zoom < screen.height/2) {
            return true;
        };
        return false;
    };
};