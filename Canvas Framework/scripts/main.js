let screen = document.getElementById('screen');
screen.x = screen.getBoundingClientRect().left;
screen.y = screen.getBoundingClientRect().top;
let ctx = screen.getContext("2d");

function lerp (n, min=0, max=1) {
    return min*(1-n) + max*(n);
};
function invLerp (n, min=0, max=1) {
    return (n-min)/(max-min);
};

function resizeCanvas () {
    screen.width = document.documentElement.clientWidth - 4;
    screen.height = document.documentElement.clientHeight - 4;
};
resizeCanvas();

// Optimizations
let useQuadtree = true;
let useCulling = true;

// Debugging
let drawCollisionBlocks = false;
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
    entity.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5).scale(5);
};

// Generate objects
for(let i = 0; i < 30; i++) {
    let entity = new Entity(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), 50);
    entityManager.initEntity(entity);
    entity.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5).scale(5);
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
let line1 = new Line(new Vector(2000, 0), new Vector(1000, 1000));
let circle1 = new Circle(new Vector(), 500);
let player = new PhysEntity(new Vector(), 100);
player.friction = 0.95;
entityManager.initEntity(player);

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
    ctx.clearRect(0, 0, screen.width, screen.height);

    cam.update();
    
    input.updateWorldMouse();

    if(!paused) {
        entityManager.updateEntities();
    };
    entityManager.renderEntities(cam);

    if(drawCollisionBlocks) {
        entityManager.collisionBlock.render(cam);
    };

    // remove this later
    cam.target = player;
    let playerMove = new Vector(input.getBindState('moveRight') - input.getBindState('moveLeft'), input.getBindState('moveUp') - input.getBindState('moveDown'));
    playerMove.angle = playerMove.rotate(0 - cam.angle).angle;
    playerMove.scaler = (1/10) * delta;
    player.vel = player.vel.translate(playerMove);
    draw.drawImage('barodev', player.pos.worldToScreen(cam), player.collider.size.scale(cam.zoom));
    // remove this later
    circle1.pos = input.mouse.worldPos;
    circle1.render(cam, 5 * cam.zoom);
    line1.render(cam, 5 * cam.zoom);
    if(circle1.isColliding(line1)) {
        let point = new Point(collision.lineCircleIntersection(line1, circle1));
        point.render(cam, 15 * cam.zoom, '#FF00FF');
    };

    // Edge
    draw.width = edgeWidth * cam.zoom;
    draw.color = '#151515';
    let pos = new Vector();
    draw.lineStroke(pos.translate(edge.scale(0.5)).worldToScreen(cam), pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), true);
    draw.lineStroke(pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), pos.translate(edge.scale(0.5)).worldToScreen(cam), true);

    draw.color = 'white';
    draw.circleFill(input.mouse.pos, 5);

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

requestAnimationFrame(main);

input.onBindDown['togglePause'] = function () {
    paused = !paused;
};

input.onBindDown['help'] = function () {
    windowWasOutOfFocus = true;
    let text = '';
    for(let index in input.keyBinds) {
        if(index != '') {
            text = text + '[' + input.keyBinds[index] + '] = ' + index + ';\n';
        };
    };
    window.alert(text);
};

window.onresize = () => {
    resizeCanvas();
};

window.addEventListener('keydown', (event) => {
    if(event.code == 'Space') {
        input.setKeyDown(event.code);
    } else {
        input.setKeyDown(event.key);
    };
});

window.addEventListener('keyup', (event) => {
    if(event.code == 'Space') {
        input.setKeyUp(event.code);
    } else {
        input.setKeyUp(event.key);
    };
});

window.addEventListener('mousedown', (event) => {
    input.setKeyDown('mouse');
});

window.addEventListener('mouseup', (event) => {
    input.setKeyUp('mouse');
});

window.addEventListener('mousemove', (event) => {
    input.updateMouse(event);
});

window.addEventListener('wheel', (event) => {
    cam.zoomVel += (cam.zoom/200) * event.deltaY * -0.02;

    input.updateMouse(event);
});

window.addEventListener("visibilitychange", (event) => {
    if(document.hidden) {
        noLoop = true;
    } else {
        noLoop = false;
        windowWasOutOfFocus = true;
        requestAnimationFrame(main);
    };
});