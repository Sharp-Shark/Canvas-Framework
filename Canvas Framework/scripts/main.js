let screen = document.getElementById('screen');
screen.x = screen.getBoundingClientRect().left;
screen.y = screen.getBoundingClientRect().top;
let ctx = screen.getContext("2d");

function resizeCanvas () {
    screen.width = document.documentElement.clientWidth - 4;
    screen.height = document.documentElement.clientHeight - 4;
};
resizeCanvas();

// Optimizations
let useQuadtree = true;
let useCulling = true;

// Debugging
let drawQuadtree = false;
let drawColliders = true;

// Define entityManager
let entityManager = new EntityManager();

// Define camera
let cam = new Camera(new Vector());

// Edge
let edge = new Vector(1_000, 1_000);
edge = edge.scale(15);
let edgeWidth = 200;

// Generate objects
for(let i = 0; i < 30; i++) {
    let entity = new PhysEntity(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), 50);
    entityManager.initEntity(entity);
    entity.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5).setScaler(2);
};

// Generate objects
for(let i = 0; i < 30; i++) {
    let entity = new Entity(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), 200);
    entityManager.initEntity(entity);
};

// Stops main loop
let noLoop = false;
let windowWasOutOfFocus = false;

// Time keeping
let paused = false;
let previousTime = 0;
let frame = 0;
let delta = 0;
let deltaMultiplier = 1;

// remove this later
let player = new PhysEntity(new Vector(), 100);
player.friction = 0.95;
entityManager.initEntity(player);
let length1 = 500;
let length2 = 500;

// remove this later
let silly = false;

let entityX
// line 1
entityX = new Entity(new Vector(), 0);
entityManager.initEntity(entityX);
entityX.collider = new Line(new Vector(1200, 800), new Vector(2800, -800), entityX);
// line 2
entityX = new Entity(new Vector(), 0);
entityManager.initEntity(entityX);
entityX.collider = new Line(new Vector(-1200, -800), new Vector(-2800, 800), entityX);
// line 3
entityX = new Entity(new Vector(), 0);
entityManager.initEntity(entityX);
entityX.collider = new Line(new Vector(-1200, -800), new Vector(-800, -2400), entityX);
// line 4
entityX = new Entity(new Vector(), 0);
entityManager.initEntity(entityX);
entityX.collider = new Line(new Vector(-800, -2400), new Vector(0, -4000), entityX);
// line 5
entityX = new Entity(new Vector(), 0);
entityManager.initEntity(entityX);
entityX.collider = new Line(new Vector(1200, 800), new Vector(400, 800), entityX);

let direction = 1;

// Main function
function main (time) {
    if(time - previousTime > 1000) {
        windowWasOutOfFocus = true;
    };
    if(windowWasOutOfFocus) {
        previousTime = time - 1/60;
        windowWasOutOfFocus = false;
        requestAnimationFrame(main);
        return;
    };
    delta = time - previousTime;
    delta = delta * deltaMultiplier;
    previousTime = time;

    // clear screen
    ctx.clearRect(0, 0, screen.width, screen.height);
    // disable anti-aliasing for pixelated look on lowres images
    ctx.imageSmoothingEnabled = false;

    cam.update();
    
    input.updateWorldMouse();

    if(!paused) {
        entityManager.updateEntities();
    };
    entityManager.renderEntities(cam);

    if(drawQuadtree) {
        entityManager.collisionBlock.render(cam);
    };

    // player movement
    cam.target = player;
    if(!paused) {
        let playerMove = new Vector(input.getBindState('moveRight') - input.getBindState('moveLeft'), input.getBindState('moveUp') - input.getBindState('moveDown'));
        playerMove.angle = playerMove.rotate(0 - cam.angle).angle;
        playerMove.scaler = (1/10) * delta;
        player.vel = player.vel.translate(playerMove);
    };
    // raycast
    let raycast = new Line(player.pos, input.mouse.worldPos);
    raycast.render(cam, 5 * cam.zoom);
    for(let entity of entityManager.entities) {
        if(entity != player && entity.collider.isColliding(raycast)) {
            let intersectionPos = raycast.getIntersection(entity.collider, true);
            let point = new Point(intersectionPos);
            point.render(cam, 15 * cam.zoom, '#00FFFF');
        };
    };
    // player render
    draw.filters['hue-rotate'] = frame / 40;
    draw.applyFilters();
    draw.drawImage('jerry', player.pos.worldToScreen(cam), player.collider.size.scale(cam.zoom), frame / 100);
    draw.filters = {};
    draw.applyFilters();

    // user interaction
    input.update();

    // Edge
    draw.width = edgeWidth * cam.zoom;
    draw.color = '#151515';
    let pos = new Vector();
    draw.lineStroke(pos.translate(edge.scale(0.5)).worldToScreen(cam), pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), pos.translate(edge.scale(0.5)).worldToScreen(cam), true);

    // Cursor
    draw.color = 'white';
    draw.circleFill(input.mouse.pos, 5);

    // Text
    let spacing = 1;
    draw.color = 'white';
    draw.fillText('Press [H] for Help.', 24, 'left', new Vector(10, 30 * spacing)); spacing++;
    if(paused) {
        draw.fillText('PAUSED', 24 * 2, 'center', new Vector(screen.width / 2, screen.height / 2 + 24 / 2));
    };

    gui.update();

    frame++;
    if(!noLoop) {requestAnimationFrame(main);};
};

window.onresize = () => {
    resizeCanvas();
};

window.addEventListener("visibilitychange", (event) => {
    if(document.hidden) {
        noLoop = true;
    } else {
        noLoop = false;
        windowWasOutOfFocus = true;
        requestAnimationFrame(main);
    };
});

requestAnimationFrame(main);