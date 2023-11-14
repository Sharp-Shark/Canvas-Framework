class Entity {
    constructor (pos, radius) {
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.friction = 1;
    };
    update(delta) {
        this.updatePhysics(delta);
    };
    updatePhysics (delta) {
    };
};

class PhysEntity extends Entity {
    constructor (pos, radius) {
        super(Entity);
        this.pos = pos;
        this.vel = new Vector();
        this.radius = radius || 10;
        this.friction = 1;
    };
    updatePhysics (delta) {
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
            if(entity != this) {
                if(this.pos.translate(entity.pos.reflect()).scaler < (this.radius + entity.radius)) {
                    // Velocity
                    let vel = Math.max(1 / 100, this.vel.scaler + entity.vel.scaler);
                    this.vel = new Vector(0, 0).moveTowards(this.pos.subtract(entity.pos), vel / 2);
                    entity.vel = new Vector(0, 0).moveTowards(this.pos.subtract(entity.pos), vel / -2);
                    // Position
                    let overlap = (this.radius + entity.radius) - this.pos.translate(entity.pos.reflect()).scaler;
                    let oldPos = this.pos;
                    this.pos = this.pos.translatePolar(overlap / 2, this.pos.subtract(entity.pos).angle);
                    entity.pos = entity.pos.translatePolar(overlap / -2, oldPos.subtract(entity.pos).angle);
                };
            };
        };
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
        // Apply friction
        this.vel = this.vel.scale(this.friction);
    };
};

class Lines {

};

// Quadtrees
class CollisionBlock {
    static entityCap = 3;
    constructor (pos, size, parent, corner) {
        this.parent = parent;
        this.corner = corner;
        this.size = size || parent.size.scale(1/2);
        this.pos = pos || parent.pos.translate(this.size.scale(1/2).scaleByVector(this.corner));
        this.collisionBlocks = [];
        this.entities = [];
    };
    update (delta) {
        if(this.parent != undefined) {
            this.size = this.parent.size.scale(1/2);
            this.pos = this.parent.pos.translate(this.size.scale(1/2).scaleByVector(this.corner));
        };
        let entitiesToCheck;
        if(this.parent != undefined) {
            entitiesToCheck = this.parent.entities;
        } else {
            entitiesToCheck = entityManager.entities;
        };
        this.entities = [];
        for(let entity of entitiesToCheck) {
            if((Math.abs(entity.pos.x - this.pos.x) < this.size.x/2) && (Math.abs(entity.pos.y - this.pos.y) < this.size.y/2)) {
                this.entities.push(entity);
            };
        };
        for(let collisionBlock of this.collisionBlocks) {
            collisionBlock.update(delta);
        };
        if((this.entities.length > CollisionBlock.entityCap) && (this.size.scaler > 50)) {
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
    };
    findBlocksCollidingWithEntity (entity) {
        let collisionBlocks = [];
        if((Math.abs(entity.pos.x - this.pos.x) < this.size.x/2 + entity.radius) && (Math.abs(entity.pos.y - this.pos.y) < this.size.y/2 + entity.radius)) {
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
    render (delta) {
        if(this.collisionBlocks.length == 0) {
            ctx.lineWidth = 5;
            ctx.strokeStyle = 'rgb(50,60,70)';
            ctx.beginPath();
            draw.line(this.pos.translate(this.size.scale(0.5)).worldToScreen(cam), this.pos.translate(this.size.scale(0.5).flipX()).worldToScreen(cam));
            draw.line(this.pos.translate(this.size.scale(0.5).flipX()).worldToScreen(cam), this.pos.translate(this.size.scale(0.5).reflect()).worldToScreen(cam));
            draw.line(this.pos.translate(this.size.scale(0.5).reflect()).worldToScreen(cam), this.pos.translate(this.size.scale(0.5).flipY()).worldToScreen(cam));
            draw.line(this.pos.translate(this.size.scale(0.5).flipY()).worldToScreen(cam), this.pos.translate(this.size.scale(0.5)).worldToScreen(cam));
            ctx.stroke();
        } else {
            for(let collisionBlock of this.collisionBlocks) {
                collisionBlock.render();
            };
        };
    };
};

class entityManager {
    static initQueue = [];
    static deleteQueue = [];
    static entities = [];
    static collisionBlock = new CollisionBlock(new Vector(), new Vector(1600, 800));
    static initEntity (entity) {
        this.initQueue.push(entity);
    };
    static deleteEntity (entity) {
        this.deleteQueue.push(entity);
    };
    static updateEntities (delta) {
        // Apply delete queue
        for(let entity of entityManager.deleteQueue) {
            for(let index in entityManager.entities) {
                if(entity == entityManager.entities[index]) {
                    entityManager.entities.splice(index, 1);
                };
            };
        };
        entityManager.deleteQueue = [];

        // Apply init queue
        for(let entity of entityManager.initQueue) {
            entityManager.entities.push(entity);
        };
        entityManager.initQueue = [];

        // Pre-loop
        let furthestX = 100;
        let furthestY = 100;
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
    static renderEntities (delta) {
        if(input.getBindState('showQuadtree')) {entityManager.collisionBlock.render(delta);};
        for(let entity of this.entities) {
            if(useCulling){if(!cam.isEntityVisible(entity)) {continue;};};
            draw.color = 'yellow';
            if(entityManager.entities[0] == entity) {
                draw.color = 'red';
            };
            draw.circleFill(entity.pos.worldToScreen(cam), entity.radius * cam.zoom);
        };
    };
};