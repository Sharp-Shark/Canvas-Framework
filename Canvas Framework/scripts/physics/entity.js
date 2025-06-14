class Entity {
    constructor (pos, radius) {
        this.ID = entityManager.getNewID();
        this.type = 'Entity';
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.mass = this.radius;
        this.friction = 1;
        this.physicsType = 1; // 0 for uncollidable, 1 for static/kinematic and 2 for dynamic
        this.collider = new Circle(new Vector(), 1, this);
    };
    update (delta) {
        this.updateLogic(delta);
        this.updatePhysics(delta);
    };
    updateLogic (delta) {
    };
    updatePhysics (delta) {
    };
    render (cam) {
        draw.color = 'rgba(155, 155, 155, 0.8)';
        draw.circleFill(this.pos.worldToScreen(cam), this.radius * cam.zoom);
        if(drawColliders) {this.collider.render(cam, 10 * cam.zoom, '#FF00FF');};
    };
    onCollision (delta, entity, other) {
    };
};

class PhysEntity extends Entity {
    constructor (pos, radius) {
        super(Entity);
        this.type= 'PhysEntity';
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.mass = this.radius;
        this.physicsType = 2;
    };
    updatePhysics () {
        // Apply velocity
        this.pos = this.pos.translate(this.vel.scale(delta));
        // Border collision
        if(Math.abs(this.pos.x) + this.radius + edgeWidth/2 > edge.x/2) {
            this.pos.x = this.pos.x - (Math.abs(this.pos.x) + this.radius + edgeWidth/2 - edge.x/2) * (this.pos.x / Math.abs(this.pos.x));
            this.vel = this.vel.flipX().scale(this.friction);
        };
        if(Math.abs(this.pos.y) + this.radius + edgeWidth/2 > edge.y/2) {
            this.pos.y = this.pos.y - (Math.abs(this.pos.y) + this.radius + edgeWidth/2 - edge.y/2) * (this.pos.y / Math.abs(this.pos.y));
            this.vel = this.vel.flipY().scale(this.friction);
        };
        // Get entities to check collision with
        let entities = [];
        for(let collisionBlock of entityManager.collisionBlock.findBlocksCollidingWithEntity(this)) {
            for(let entity of collisionBlock.entities) {
                let isRepeat = false;
                for(let entity2 of entities) {
                    if(entity == entity2) {
                        isRepeat = true;
                        break;
                    };
                };
                if(isRepeat == false) {
                    entities.push(entity);
                };
            };
        };
        if(!useQuadtree) {
            entities = entityManager.entities;
        };
        // Check collision and solve collision
        for(let entity of entities) {
            if(this.physicsType < 2) {break;};
            if(entity != this) {
                if(this.collider.isColliding(entity.collider)) {
                    if(entity.physicsType == 1) {
                        if(entity.collider.type == 'line') {
                            let intersectionPos = this.collider.getIntersection(entity.collider);
                            this.pos = this.pos.translatePolar(this.radius - intersectionPos.subtract(this.pos).scaler,  this.pos.subtract(intersectionPos).angle);
                            let normal = entity.collider.pos.subtract(entity.collider.endPos).rotate(Math.PI / 2).setScaler(1);
                            this.vel = this.vel.subtract(normal.scale(this.vel.dotProduct(normal) * 2));
                        } else if(entity.collider.type == 'circle') {
                            // Velocity
                            let vel = this.vel.scaler;
                            this.vel = new Vector().moveTowards(this.pos.subtract(entity.pos), vel);
                            // Position
                            let overlap = (this.radius + entity.radius) - this.pos.translate(entity.pos.reflect()).scaler;
                            this.pos = this.pos.translatePolar(overlap, this.pos.subtract(entity.pos).angle);
                            this.onCollision(delta, entity, this);
                            entity.onCollision(delta, this, entity);
                        };
                    } else {
                        if(entity.collider.type == 'circle') {
                            // Velocity
                            let vel = this.vel.scaler * this.mass + entity.vel.scaler * entity.mass;
                            this.vel = new Vector().moveTowards(this.pos.subtract(entity.pos).subtract(entity.pos), vel / this.mass / 2);
                            entity.vel = new Vector().moveTowards(this.pos.subtract(entity.pos).subtract(this.pos), vel / entity.mass / -2);
                            // Position
                            let overlap = (this.radius + entity.radius) - this.pos.translate(entity.pos.reflect()).scaler;
                            let oldPos = this.pos;
                            this.pos = this.pos.translatePolar(overlap / 2, this.pos.subtract(entity.pos).angle);
                            entity.pos = entity.pos.translatePolar(overlap / -2, oldPos.subtract(entity.pos).angle);
                            this.onCollision(delta, entity, this);
                            entity.onCollision(delta, this, entity);
                        };
                    };
                };
            };
        };
        // Apply friction
        this.vel = this.vel.scale(this.friction ** delta);
    };
};

// Quadtree
class CollisionBlock {
    static entityCap = 3;
    static minimunSizeScaler = 500;
    constructor (pos, size, parent, corner) {
        this.parent = parent;
        this.corner = corner;
        this.size = size || parent.size.scale(1/2);
        this.pos = pos || parent.pos.translate(this.size.scale(1/2).scaleByVector(this.corner));
        this.collider = new Rect(new Vector(), new Vector(1, 1), this);
        this.collisionBlocks = [];
        this.entities = [];
    };
    update () {
        // If it has a parent, set size and pos to be relative to parent's
        this.updateBoundingBox();
        // Find which entities should be in the list of entities contained by this collision block
        this.updateEntitiesList();
        // update all children
        for(let collisionBlock of this.collisionBlocks) {
            collisionBlock.update(delta);
        };
        // if entities contained exceed
        if((this.entities.length > CollisionBlock.entityCap) && (this.size.scaler > CollisionBlock.minimunSizeScaler)) {
            this.divide();
        } else {
            this.collisionBlocks = [];
        };
    };
    divide () {
        if(this.collisionBlocks.length > 0) {return;};
        this.collisionBlocks.push(new CollisionBlock(undefined, undefined, this, new Vector(1, 1)));
        this.collisionBlocks.push(new CollisionBlock(undefined, undefined, this, new Vector(-1, 1)));
        this.collisionBlocks.push(new CollisionBlock(undefined, undefined, this, new Vector(1, -1)));
        this.collisionBlocks.push(new CollisionBlock(undefined, undefined, this, new Vector(-1, -1)));
        // Update entities list upon creation
        for(let collisionBlock of this.collisionBlocks) {
            collisionBlock.updateBoundingBox();
            collisionBlock.updateEntitiesList();
        };
    };
    updateBoundingBox () {
        if(this.parent != undefined) {
            this.size = this.parent.size.scale(1/2);
            this.pos = this.parent.pos.translate(this.size.scale(1/2).scaleByVector(this.corner));
        };
    };
    updateEntitiesList () {
        let entitiesToCheck;
        if(this.parent != undefined) {
            entitiesToCheck = this.parent.entities;
        } else {
            entitiesToCheck = entityManager.entities;
        };
        this.entities = [];
        for(let entity of entitiesToCheck) {
            if(entity.physicsType == 0) {continue;};
            if(entity.pos == undefined) {continue;};
            //if(collision.pointRect(entity, this.collider)) {
            if(this.collider.isColliding(entity.collider)) {
                this.entities.push(entity);
            };
        };
    };
    findBlocksCollidingWithEntity (entity) {
        let collisionBlocks = [];
        //if((Math.abs(entity.pos.x - this.pos.x) < this.size.x/2 + entity.radius) && (Math.abs(entity.pos.y - this.pos.y) < this.size.y/2 + entity.radius)) {
        if(this.collider.isColliding(entity.collider)) {
            if(this.collisionBlocks.length == 0) {
                collisionBlocks.push(this);
            } else {
                for(let collisionBlock of this.collisionBlocks) {
                    for(let CollisionBlock2 of collisionBlock.findBlocksCollidingWithEntity(entity)) {
                        collisionBlocks.push(CollisionBlock2);
                    };
                };
            };
        };
        return collisionBlocks;
    };
    render (cam) {
        if(this.collisionBlocks.length == 0) {
            this.collider.render(cam, 8 * cam.zoom, '#242424', true);
        } else {
            for(let collisionBlock of this.collisionBlocks) {
                collisionBlock.render(cam);
            };
        };
    };
};

class EntityManager {
    highestID = 0;
    freeIDs = [];
    initQueue = [];
    deleteQueue = [];
    entities = [];
    collisionBlock = new CollisionBlock(new Vector(), new Vector(1600, 800));
    getNewID () {
        if (this.freeIDs.length > 0) {
            return this.freeIDs.shift();
        };
        return this.highestID++;
    };
    initEntity (entity) {
        this.initQueue.push(entity);
    };
    deleteEntity (entity) {
        this.freeIDs.push(entity.ID);
        this.deleteQueue.push(entity);
    };
    updateEntities () {
        // Apply delete queue
        for(let entity of this.deleteQueue) {
            if(entity == cam.target) {
                cam.target = undefined;
            };
            for(let index in this.entities) {
                if(entity == this.entities[index]) {
                    // Delete the entity itself
                    this.entities.splice(index, 1);
                };
            };
        };
        this.deleteQueue = [];

        // Apply init queue
        for(let entity of this.initQueue) {
            this.entities.push(entity);
        };
        this.initQueue = [];

        // Pre-loop
        let furthestX = 1_000;
        let furthestY = 1_000;
        // Update loop
        for(let entity of this.entities) {
            entity.update(delta);
            // Find furthest out entitiy positions
            if(Math.abs(entity.pos.x) > furthestX) {
                furthestX = Math.abs(entity.pos.x);
            };
            if(Math.abs(entity.pos.y) > furthestY) {
                furthestY = Math.abs(entity.pos.y);
            };
        };
        // Update quadtree size
        this.collisionBlock.size = new Vector(furthestX * 2 + 1, furthestY * 2 + 1);
        // Quadtree logic
        this.collisionBlock.update();
    };
    renderEntities (cam) {
        for(let entity of this.entities) {
            if(useCulling) {if(!cam.isEntityVisible(entity)) {continue;};};
            entity.render(cam);
        };
    };
};