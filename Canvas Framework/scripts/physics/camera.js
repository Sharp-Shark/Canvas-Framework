class Camera extends PhysEntity {
    constructor (pos) {
        super(PhysEntity);
        this.pos = pos;
        this.vel = new Vector();
        this.angle = 0;
        this.angleVel = 0;
        this.zoom = 1;
        this.zoomVel = 0;
        this.target = undefined;
        this.collider = new Rect(new Vector(), new Vector(1, 1), this);
    };
    get size () {
        let width = Math.abs(screen.width * Math.cos(this.angle)) + Math.abs(screen.height * Math.sin(this.angle));
        let height = Math.abs(screen.height * Math.cos(this.angle)) + Math.abs(screen.width * Math.sin(this.angle));
        return new Vector(width / this.zoom, height / this.zoom);
    };
    updatePhysics () {
        let move = new Vector(input.getBindState('moveRight') - input.getBindState('moveLeft'), input.getBindState('moveUp') - input.getBindState('moveDown'));
        move.angle = move.rotate(0 - this.angle).angle;
        move.scaler = (1/10) / this.zoom * delta;
        if(this.target != undefined) {move = new Vector();};

        this.vel = this.vel.translate(move);
        this.angleVel += (1/3000) * (input.getBindState('rotateClock') - input.getBindState('rotateCounter')) * delta;
        this.zoomVel += (1/4000) * this.zoom * (input.getBindState('zoomIn') - input.getBindState('zoomOut')) * delta;

        if(this.target != undefined) {
            this.pos = this.target.pos;
        };

        this.pos = this.pos.translate(this.vel.scale(delta));
        this.angle = this.angle + this.angleVel * delta;

        let oldMouseWorldPos = input.mouse.pos.screenToWorld(cam);
        this.zoom = Math.max(this.zoom + this.zoomVel * delta, 0.001);
        cam.pos = cam.pos.translate(oldMouseWorldPos.subtract(input.mouse.pos.screenToWorld(cam)));

        this.vel = this.vel.scale(0.9 ** delta);
        this.angleVel = this.angleVel * 0.8 ** delta;
        this.zoomVel = this.zoomVel * 0.9 ** delta;
    };
    isEntityVisible (entity) {
        if(this.collider.isColliding(entity.collider)) {
            return true;
        };
        return false;
    };
    render (name) {
        this.collider.render(cam, 10 * cam.zoom / this.zoom, '#FF00FF');
        draw.fillText(name, 48 * cam.zoom / this.zoom, 'left', this.collider.getRelative(new Vector(-1, 1)).translate(new Vector(0, 20 / this.zoom)).worldToScreen(cam), -cam.angle);
    };
};