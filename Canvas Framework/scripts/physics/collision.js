class collision {
    static lineLine (line1, line2) {
        // Line-line collision taken from "https://www.jeffreythompson.org/collision-detection/line-line.php"
        let x1 = line1.pos.x;
        let x2 = line1.endPos.x;
        let y1 = line1.pos.y;
        let y2 = line1.endPos.y;
        let x3 = line2.pos.x;
        let x4 = line2.endPos.x;
        let y3 = line2.pos.y;
        let y4 = line2.endPos.y;
        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {
            return true;
        };
        return false;
    };

    // Returns the point that a line intersects with a line
    static lineLineIntersection (line1, line2, alwaysReturnPosition=false) {
        let x1 = line1.pos.x;
        let x2 = line1.endPos.x;
        let y1 = line1.pos.y;
        let y2 = line1.endPos.y;
        let x3 = line2.pos.x;
        let x4 = line2.endPos.x;
        let y3 = line2.pos.y;
        let y4 = line2.endPos.y;
        let uA = ((x4-x3)*(y1-y3) - (y4-y3)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        let uB = ((x2-x1)*(y1-y3) - (y2-y1)*(x1-x3)) / ((y4-y3)*(x2-x1) - (x4-x3)*(y2-y1));
        if ((uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) || alwaysReturnPosition) {
            return new Vector(x1 + (uA * (x2-x1)), y1 + (uA * (y2-y1)));
        };
    };

    static lineRect (line, rect) {
        let topLeft = rect.getRelative(new Vector(-1, 1));
        let topRight = rect.getRelative(new Vector(1, 1));
        let bottomRight = rect.getRelative(new Vector(1, -1));
        let bottomLeft = rect.getRelative(new Vector(-1, -1));
        // Do 4 line-line collisions with the rect's 4 edges
        if(collision.lineLine(line, new Line(topLeft, topRight))) {return true};
        if(collision.lineLine(line, new Line(topRight, bottomRight))) {return true};
        if(collision.lineLine(line, new Line(bottomRight, bottomLeft))) {return true};
        if(collision.lineLine(line, new Line(bottomLeft, topLeft))) {return true};
        return false;
    };

    // Returns the point that a line intersects with a rect
    static lineRectIntersection (line, rect) {
        let topLeft = rect.getRelative(new Vector(-1, 1));
        let topRight = rect.getRelative(new Vector(1, 1));
        let bottomRight = rect.getRelative(new Vector(1, -1));
        let bottomLeft = rect.getRelative(new Vector(-1, -1));
        // Do 4 line-line collisions with the rect's 4 edges
        let closestPosDistance
        let closestPos
        let pos
        pos = collision.lineLineIntersection(line, new Line(topLeft, topRight));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        pos = collision.lineLineIntersection(line, new Line(topRight, bottomRight));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        pos = collision.lineLineIntersection(line, new Line(bottomRight, bottomLeft));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        pos = collision.lineLineIntersection(line, new Line(bottomLeft, topLeft));
        if((pos != undefined) && ((closestPos == undefined) || (line.pos.getDistTo(pos) < closestPosDistance))) {
            closestPosDistance = line.pos.getDistTo(pos);
            closestPos = pos;
        };
        return closestPos;
    };

    static pointRect (point, rect) {
        if(Math.abs(rect.pos.x - point.pos.x) < rect.size.x/2 &&
        Math.abs(rect.pos.y - point.pos.y) < rect.size.y/2) {
            return true;
        } else {
            return false;
        };
    };

    static rectRect (rect1, rect2) {
        if(Math.abs(rect1.pos.x - rect2.pos.x) < (rect1.size.x + rect2.size.x)/2 &&
        Math.abs(rect1.pos.y - rect2.pos.y) < (rect1.size.y + rect2.size.y)/2) {
            return true;
        } else {
            return false;
        };
    };

    static rectCircle (rect, circle) {
        let topEdge = rect.getRelative(new Vector(0, 1));
        let bottomEdge = rect.getRelative(new Vector(0, -1));
        let rightEdge = rect.getRelative(new Vector(1, 0));
        let leftEdge = rect.getRelative(new Vector(-1, 0));

        // Create a new vector and thus, for example, "pos.x = ..." won't override the circle's X position
        let pos = new Vector(circle.pos.x, circle.pos.y);
        if(pos.x > rightEdge.x) {
            pos.x = rightEdge.x;
        } else if(pos.x < leftEdge.x) {
            pos.x = leftEdge.x;
        };
        if(pos.y > topEdge.y) {
            pos.y = topEdge.y;
        } else if(pos.y < bottomEdge.y) {
            pos.y = bottomEdge.y;
        };

        if(circle.pos.getDistTo(pos) < circle.radius) {
            return true;
        };
        return false;
    };

    static pointCircle (point, circle) {
        return point.pos.getDistTo(circle.pos) < circle.radius;
    };

    static circleCircle (circle1, circle2) {
        return circle1.pos.getDistTo(circle2.pos) < circle1.radius + circle2.radius;
    };
};

// NOTICE
// Lacks point-point and point-line since those are very niche
// If I ever need it, I could probably just make a circle at the point's position that has a very small radius
class Point {
    constructor (pos, parent) {
        this.type = 'point';
        this.relativePos = pos;
        this.size = new Vector(1, 1);
        this.parent = parent;
    };
    get pos () {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            return this.relativePos.scaleByVector(parentSize).translate(this.parent.pos);
        } else {
            return this.relativePos;
        };
    };
    set pos (pos) {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            this.relativePos = pos.subtract(this.parent.pos).scaleByVector(parentSize.invert());
        } else {
            this.relativePos = pos;
        };
        return this;
    };
    get size () {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            return this.relativeSize.scaleByVector(parentSize);
        } else {
            return this.relativeSize;
        };
    };
    set size (size) {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            this.relativeSize = size.scaleByVector(parentSize.invert());
        } else {
            this.relativeSize = size;
        };
        return this;
    };
    isColliding (other) {
        switch (other.type) {
            case 'rect' : return collision.pointRect(this, other);
            case 'circle' : return collision.pointCircle(this, other);
            default : return false;
        };
    };
    render (cam, radius=5, color='#FFFFFF') {
        draw.color = color;
        if(cam) {
            draw.circleFill(this.pos.worldToScreen(cam), radius);
        } else {
            draw.circleFill(this.pos, radius);
        };
    };
};

class Line extends Point {
    constructor (pos, endPos, parent) {
        super(Point);
        this.type = 'line';
        this.relativePos = pos;
        this.relativeEndPos = endPos;
        this.size = new Vector(1, 1);
        this.parent = parent;
    };
    get endPos () {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            return this.relativeEndPos.scaleByVector(parentSize).translate(this.parent.pos);
        } else {
            return this.relativeEndPos;
        };
    };
    set endPos (pos) {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            this.relativeEndPos = pos.subtract(this.parent.pos).scaleByVector(parentSize.invert());
        } else {
            this.relativeEndPos = pos;
        };
        return this;
    };
    isColliding (other) {
        switch (other.type) {
            case 'line' : return collision.lineLine(this, other);
            case 'rect' : return collision.lineRect(this, other);
            default : return false;
        };
    };
    getIntersection (other) {
        switch (other.type) {
            case 'line' : return collision.lineLineIntersection(this, other);
            case 'rect' : return collision.lineRectIntersection(this, other);
            default : return undefined;
        };
    };
    render (cam, width=5, color='#FFFFFF', cap=true) {
        draw.width = width;
        draw.color = color;
        if(cam) {
            draw.lineStroke(this.pos.worldToScreen(cam), this.endPos.worldToScreen(cam), cap);
        } else {
            draw.lineStroke(this.pos, this.endPos, cap);
        };
    };
};

class Rect extends Point {
    constructor (pos, size, parent) {
        super(Point);
        this.type = 'rect';
        this.relativePos = pos;
        this.relativeSize = size;
        this.parent = parent;
    };
    getRelative (vector) {
        return this.pos.translate(this.size.scaleByVector(vector).scale(0.5));
    };
    isColliding (other) {
        switch (other.type) {
            case 'point' : return collision.pointRect(other, this);
            case 'line' : return collision.lineRect(other, this);
            case 'rect' : return collision.rectRect(this, other);
            case 'circle' : return collision.rectCircle(this, other);
            default : return false;
        };
    };
    render (cam, width=5, color='#FFFFFF', cap=true) {
        draw.width = width;
        draw.color = color;
        let topLeft;
        let topRight;
        let bottomRight;
        let bottomLeft;
        if(cam) {
            topLeft = this.getRelative(new Vector(-1, 1)).worldToScreen(cam);
            topRight = this.getRelative(new Vector(1, 1)).worldToScreen(cam);
            bottomRight = this.getRelative(new Vector(1, -1)).worldToScreen(cam);
            bottomLeft = this.getRelative(new Vector(-1, -1)).worldToScreen(cam);

        } else {
            topLeft = this.getRelative(new Vector(-1, 1));
            topRight = this.getRelative(new Vector(1, 1));
            bottomRight = this.getRelative(new Vector(1, -1));
            bottomLeft = this.getRelative(new Vector(-1, -1));
        };
        draw.lineStroke(topLeft, topRight, cap);
        draw.lineStroke(topRight, bottomRight, cap);
        draw.lineStroke(bottomRight, bottomLeft, cap);
        draw.lineStroke(bottomLeft, topLeft, cap);
    };
};

// TO-DO
// Add proper line-circle instead of just giving the circle a rect and doing a line-rect on that rect
// Whenever proper line-circle is added, remove "this.rect" since that is all it does
class Circle extends Point {
    constructor (pos, radius, parent) {
        super(Point);
        this.type = 'circle';
        this.relativePos = pos;
        this.relativeRadius = radius;
        this.parent = parent;
        this.rect = new Rect(new Vector(), new Vector(1, 1), this);
    };
    get radius () {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            let parentRadius = this.parent.radius || (Math.min(parentSize.x, parentSize.y) / 2);
            return this.relativeRadius * parentRadius;
        } else {
            return this.relativeRadius;
        };
    };
    set radius (radius) {
        if(this.parent != undefined) {
            let parentSize = this.parent.size || new Vector(1, 1);
            let parentRadius = this.parent.radius || (Math.min(parentSize.x, parentSize.y) / 2);
            return this.relativeRadius / parentRadius;
        } else {
            this.relativeRadius = radius;
        };
        return this;
    };
    get relativeSize () {
        return new Vector(this.radius * 2, this.radius * 2);
    };
    set relativeSize (size) {
        this.relativeRadius = Math.min(size.x / 2, size.y / 2);
    };
    isColliding (other) {
        switch (other.type) {
            case 'point' : return collision.pointCircle(other, this);
            case 'line' : return collision.lineRect(other, this.rect);
            case 'rect' : return collision.rectCircle(other, this);
            case 'circle' : return collision.circleCircle(this, other);
            default : return false;
        };
    };
    render (cam, width=5, color='#FFFFFF') {
        draw.width = width;
        draw.color = color;
        if(cam) {
            draw.circleStroke(this.pos.worldToScreen(cam), this.radius * cam.zoom);
        } else {
            draw.circleStroke(this.pos, this.radius * cam.zoom);
        };
    };
};