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

// range [0, 2*Math.PI[
function limitAngle (angle) {
    return (angle < 0 ? Math.PI - angle : angle) % (Math.PI * 2);
};

function triangleIK (length1, length2, target, direction) {
    // length1 is the length of the first line segment
    // length2 is the length of the second line segment
    let distance = Math.max(Math.min(target.scaler, length1 + length2), Math.abs(length1 - length2));
    let angle = Math.acos((length1**2 + distance**2 - length2**2) / (2 * length1 * distance)) // a² = b² + c² - 2 * b * c * cos(x)
    let midpoint = new Vector(length1);
    // direction defines which way the midpoint bends
    midpoint = midpoint.rotate(target.angle + angle * direction);
    // to calculate endpoint do "midpoint.moveTowards(target, length2)"
    return midpoint;
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
    let playerMove = new Vector(input.getBindState('moveRight') - input.getBindState('moveLeft'), input.getBindState('moveUp') - input.getBindState('moveDown'));
    playerMove.angle = playerMove.rotate(0 - cam.angle).angle;
    playerMove.scaler = (1/10) * delta;
    player.vel = player.vel.translate(playerMove);
    // trig setup
    let O = player.pos;
    if(input.mouse.worldPos.x > player.pos.x) {
        direction = direction + (1/100) * delta;
        direction = Math.min(direction, 1);
    } else {
        direction = direction - (1/100) * delta;
        direction = Math.max(direction, -1);
    };
    let M = triangleIK(length1, length2, input.mouse.worldPos.subtract(player.pos), direction).translate(player.pos);
    let T = M.moveTowards(input.mouse.worldPos, length2);
    // trig render
    draw.width = 50 * cam.zoom;
    draw.color = '#FF00FF';
    draw.lineStroke(O.worldToScreen(cam), M.worldToScreen(cam), true);
    draw.lineStroke(M.worldToScreen(cam), T.worldToScreen(cam), true);
    // raycast
    let raycast = new Line(O, T);
    raycast.render(cam, 5 * cam.zoom);
    for(let entity of entityManager.entities) {
        if(entity != player && entity.collider.isColliding(raycast)) {
            let intersectionPos = raycast.getIntersection(entity.collider, true);
            let point = new Point(intersectionPos);
            point.render(cam, 15 * cam.zoom, '#00FFFF');
        };
    };
    // player render
    draw.drawImage('barodev', player.pos.worldToScreen(cam), player.collider.size.scale(cam.zoom));
    
    // silly static object creation
    if(input.mouse.down && silly) {
        silly = false;
        let radius = 50;
        let entity = new PhysEntity(player.pos.moveTowards(input.mouse.worldPos, player.radius + radius + 1), radius);
        entityManager.initEntity(entity);
        entity.vel = input.mouse.worldPos.subtract(player.pos).setScaler(5);
    } else {
        silly = !input.mouse.down;
    };

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

requestAnimationFrame(main);