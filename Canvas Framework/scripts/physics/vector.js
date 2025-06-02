// 2D Vector
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
        return this.subtract(cam.pos).rotate(0 - cam.angle).scale(cam.zoom).flipY().translate(new Vector(screen.width / 2, screen.height / 2));
    };
    screenToWorld (cam) {
        return this.subtract(new Vector(screen.width / 2, screen.height / 2)).flipY().scale(1 / cam.zoom).rotate(cam.angle).translate(cam.pos);
    };
};

//   Affine Transformation
// | xToX | yToX | offsetX |
// | xToY | yToY | offsetY |
// |   0  |   0  |    1    |
class Transform {
    static identity = new Transform(1, 0, 0, 0, 1 ,0);
    static flipX = new Transform(-1, 0, 0, 0, 1, 0);
    static flipY = new Transform(1, 0, 0, 0, -1 ,0);
    static reflect = new Transform(-1, 0, 0, 0, -1, 0);
    static i = new Transform(0, -1, 0, 1, 0, 0);
    constructor (xToX=1, yToX=0, x=0, xToY=0, yToY=1, y=0) {
        this.xToX = xToX;
        this.yToX = yToX;
        this.x = x;
        this.xToY = xToY;
        this.yToY = yToY;
        this.y = y;
    };
    static translate (vector) {
        return new Transform(
            1, 0, vector.x,
            0, 1, vector.y
        );
    };
    static subtract (vector) {
        return new Transform(
            1, 0, -vector.x,
            0, 1, -vector.y
        );
    };
    static scale (scaler) {
        return new Transform(
            scaler, 0, 0,
            0, scaler, 0
        );
    };
    static rotate (angle) {
        let cosAngle = Math.cos(angle);
        let sinAngle = Math.sin(angle);
        return new Transform(
            cosAngle, -sinAngle, 0,
            sinAngle, cosAngle, 0
        );
    };
    static worldToScreen (cam) {
        let T = Transform.translate(new Vector(screen.width / 2, screen.height / 2))
        .compose(Transform.flipY)
        .compose(Transform.scale(cam.zoom))
        .compose(Transform.rotate(cam.angle))
        .compose(Transform.subtract(cam.pos));
        return T.apply(this);
    };
    static screenToWorld (cam) {
        let T = Transform.subtract(new Vector(screen.width / 2, screen.height / 2))
        .compose(Transform.rotate(0 - cam.angle))
        .compose(Transform.scale(1 / cam.zoom))
        .compose(Transform.flipY)
        .compose(Transform.translate(cam.pos));
        return T.apply(this);
    };
    compose (transform) {
        return new Transform(
            this.xToX * transform.xToX + this.yToX * transform.xToY, // xToX
            this.yToX * transform.yToY + this.xToX * transform.yToX, // yToX
            this.x + this.xToX * transform.x + this.yToX * transform.y, // x
            this.xToY * transform.xToX + this.yToY * transform.xToY, // xToY
            this.yToY * transform.yToY + this.xToY * transform.yToX, // yToY
            this.y + this.xToY * transform.x + this.yToY * transform.y, // y
        );
    };
    add (transform) {
        return new Transform(
            this.xToX + transform.xToX, this.yToX + transform.yToX, this.x + transform.x,
            this.xToY + transform.xToY, this.yToY + transform.yToY, this.y + transform.y,
        );
    };
    pow (n) {
        let T = Transform.identity;
        for(let i = 0; i < n; i++) {
            T = T.compose(this);
        };
        return T;
    };
    apply (vector) {
        return new Vector(
            this.xToX * vector.x + this.yToX * vector.y + this.x,
            this.xToY * vector.x + this.yToY * vector.y + this.y
        );
    };
};

// Scales, Rotates and then Offsets
class Anchor {
    constructor (pos, size, angle) {
        this.pos = pos;
        this.size = size;
        this.angle = angle;
    };
    get transform () {
        let cosAngle = Math.cos(this.angle);
        let sinAngle = Math.sin(this.angle);
        let T = new Transform(
            cosAngle * this.size.x, -sinAngle * this.size.y, this.pos.x,
            sinAngle * this.size.x, cosAngle * this.size.y, this.pos.y
        );
        return T;
    };
    compose (anchor) {
        return new Anchor(
            this.apply(anchor.pos),
            anchor.size.rotate(anchor.angle).scaleByVector(this.size), // this line is incorrect when the angle of the anchor is not equal to 0
            this.angle + anchor.angle,
        );
    };
    apply (vector) {
        return vector.scaleByVector(this.size).rotate(this.angle).translate(this.pos);
    };
};