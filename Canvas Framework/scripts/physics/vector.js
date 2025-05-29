class Vector {
    static zero = new Vector(0, 0);
    static up = new Vector(0, 1);
    static left = new Vector(-1, 0)
    static down = new Vector(0, -1);
    static right = new Vector(1, 0);
    constructor (x=0, y=0) {
        this.x = x;
        this.y = y;
    };
    set (vector) {
        this.x = vector.x;
        this.y = vector.y;
        return this;
    };
    get angle () {
        return Math.atan2(this.y, this.x);
    };
    set angle (angle) {
        this.setAngle(angle);
        return this;
    };
    setAngle (angle) {
        this.set(this.rotate(angle - this.angle));
        return this;
    };
    get scaler () {
        return Math.sqrt(this.x**2 + this.y**2);
    }
    set scaler (scaler) {
        this.setScaler(scaler);
        return this;
    };
    setScaler (scaler) {
        if(this.scaler == 0) {return this;};
        this.set(this.scale(scaler / this.scaler));
        return this;
    };
    clamp (scaler) {
        if(this.scaler > scaler) {this.setScaler(scaler)};
        return this;
    };
    getDistTo (vector) {
        return this.subtract(vector).scaler;
    };
    lerp (vector, scaler) {
        return new Vector(Math.lerp(this.x, vector.x, scaler), Math.lerp(this.y, vector.y, scaler));
    };
    flipX () {
        return new Vector(-this.x, this.y);
    };
    flipY () {
        return new Vector(this.x, -this.y);
    };
    reflect () {
        return new Vector(-this.x, -this.y);
    };
    invert () {
        return new Vector(1 / this.x, 1 / this.y);
    };
    translate (vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };
    subtract (vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    };
    translatePolar (scaler, angle) {
        return this.translate(new Vector(scaler, 0).rotate(angle));
    };
    rotate (angle) {
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);
        return new Vector(this.x * cosAngle - this.y * sinAngle, this.y * cosAngle + this.x * sinAngle)
    };
    scale (scaler) {
        return new Vector(this.x * scaler, this.y * scaler);
    };
    scaleByVector (vector) {
        return new Vector(this.x * vector.x, this.y * vector.y);
    };
    dotProduct (vector) {
        return this.x * vector.x + this.y * vector.y;
    };
    moveTowards (vector, scaler) {
        return this.translate(vector.subtract(this).setScaler(scaler));
    };
    moveTowardsClamped (vector, scaler) {
        return this.moveTowards(vector, Math.min(scaler, this.getDistTo(vector)));
    };
    worldToScreen (cam) {
        return this.subtract(cam.pos).rotate(cam.angle).scale(cam.zoom).flipY().translate(new Vector(screen.width / 2, screen.height / 2));
    };
    screenToWorld (cam) {
        return this.subtract(new Vector(screen.width / 2, screen.height / 2)).flipY().scale(1 / cam.zoom).rotate(0 - cam.angle).translate(cam.pos);
    };
};