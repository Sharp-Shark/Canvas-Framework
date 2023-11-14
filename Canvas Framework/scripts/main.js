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

// Edge
let edge = new Vector(40000, 20000);
let edgeWidth = 40;

// Generate objects
for(let i = 0; i < 3000; i++) {
    let entity = new PhysEntity(new Vector((Math.random() - 0.5) * edge.x, (Math.random() - 0.5) * edge.y), Math.random() * 90 + 10);
    entityManager.initEntity(entity);
    entity.vel = new Vector(Math.random() - 0.5, Math.random() - 0.5).setScaler(Math.random() * 2);
};

// Define camera
let cam = new Camera(new Vector());

let previousTime = 0;
let frame = 0;
function main (time) {
    delta = time - previousTime;
    previousTime = time;
    ctx.clearRect(0, 0, screen.width, screen.height);
    
    if(input.getBindState('delete')) {
        let closestEntity = undefined;
        let closestDist = 10 / cam.zoom;
        for(let entity of entityManager.entities) {
            let dist = entity.pos.getDistTo(input.mouse.worldPos) - entity.radius;
            if(dist <= closestDist) {
                closestEntity = entity;
                closestDist = dist;
            };
        };
        if(closestEntity != undefined) {
            entityManager.deleteEntity(closestEntity);
        };
    };
    if(input.getBindState('create')) {
        entityManager.initEntity(new PhysEntity(input.mouse.worldPos.translate(new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)), Math.random() * 90 + 10));
    };
    if(input.getBindState('teleport') && (entityManager.entities[0] != undefined)) {
        entityManager.entities[0].pos = input.mouse.worldPos;
    };

    cam.update(delta);
    
    input.updateWorldMouse();
    
    entityManager.updateEntities(delta);
    entityManager.renderEntities(delta);

    // Edge
    ctx.lineWidth = edgeWidth * cam.zoom;
    ctx.strokeStyle = 'grey';
    ctx.beginPath();
    let pos = new Vector();
    draw.line(pos.translate(edge.scale(0.5)).worldToScreen(cam), pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam));
    draw.line(pos.translate(edge.scale(0.5).flipX()).worldToScreen(cam), pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam));
    draw.line(pos.translate(edge.scale(0.5).reflect()).worldToScreen(cam), pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam));
    draw.line(pos.translate(edge.scale(0.5).flipY()).worldToScreen(cam), pos.translate(edge.scale(0.5)).worldToScreen(cam));
    ctx.stroke();

    draw.color = 'grey';
    draw.circleFill(new Vector().worldToScreen(cam), 10);

    draw.color = 'black';
    draw.circleFill(input.mouse.pos, 10);

    draw.color = 'white';
    draw.drawText('Quadtree: ' + useQuadtree, 24, 'left', new Vector(10, 30));
    draw.drawText('Culling: ' + useCulling, 24, 'left', new Vector(10, 60));

    frame++;
    requestAnimationFrame(main);
};

requestAnimationFrame(main);


window.onresize = () => {
    resizeCanvas();
};

window.addEventListener('keydown', (event) => {
    if((input.keybinds['toggleQuadtree'] == event.key.toLowerCase()) && !input.getBindState('toggleQuadtree')) {
        useQuadtree = !useQuadtree;
    };
    if((input.keybinds['toggleCulling'] == event.key.toLowerCase()) && !input.getBindState('toggleCulling')) {
        useCulling = !useCulling;
    };
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
    input.mouse.down = true;
    entityManager.initEntity(new PhysEntity(input.mouse.worldPos.translate(new Vector((Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5)), Math.random() * 90 + 10));
});

window.addEventListener('mouseup', (event) => {
    input.mouse.down = false;
});

window.addEventListener('mousemove', (event) => {
    input.updateMouse(event);
});