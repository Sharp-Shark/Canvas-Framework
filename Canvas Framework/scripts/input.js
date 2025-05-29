class input {
    static mouse = {pos: new Vector(), worldPos: new Vector(), down: false};
    static keyStates = {};
    static keyDeltaStates = {};
    static keyBinds = {
        'moveUp': 'w',
        'moveDown': 's',
        'moveRight': 'd',
        'moveLeft': 'a',
        'rotateClock': 'z', // rotate camera clockwise
        'rotateCounter': 'x', // rotate camera counterclockwise
        'zoomIn': 'q', // increase camera zoom level (+)
        'zoomOut': 'e', // decrease camera zoom level (-)
        'help': 'h_down', // gets list of keybinds
        'togglePause': 'space_down', // toggle pause
        'spawnPhysEntity': 'mouse_down',
        '': ''
    };
    static keyBindFunctions = {};
    static updateMouse(event) {
        screenX = screen.getBoundingClientRect().left;
        screenY = screen.getBoundingClientRect().top;
        this.mouse.pos.x = event.clientX - screenX;
        this.mouse.pos.y = event.clientY - screenY;
    };
    static updateWorldMouse() {
        this.mouse.worldPos = this.mouse.pos.screenToWorld(cam);
    };
    static getBindState(bind) {
        let key = this.keyBinds[bind];
        if(key.slice(key.length - 3, key.length) == '_up') {
            key = this.keyBinds[bind].slice(0, key.length - 3);
            return this.keyDeltaStates[key] == -1;
        } else if(key.slice(key.length - 5, key.length) == '_down') {
            key = this.keyBinds[bind].slice(0, key.length - 5);
            return this.keyDeltaStates[key] == 1;
        } else {
            return this.isKeyDown(this.keyBinds[bind]);
        };
    };
    static isKeyDown(key) {
        if(this.keyStates[key.toLowerCase()]) {return true;};
        return false;
    };
    static setKeyDown(key) {
        if(key.toLowerCase() == 'mouse') {this.mouse.down = true};
        if(!this.isKeyDown(key.toLowerCase())) {
            this.keyDeltaStates[key.toLowerCase()] = 1;
        };
        this.keyStates[key.toLowerCase()] = true;
    };
    static setKeyUp(key) {
        if(key.toLowerCase() == 'mouse') {this.mouse.down = false};
        this.keyDeltaStates[key.toLowerCase()] = -1;
        this.keyStates[key.toLowerCase()] = false;
    };
    static update() {
        for(let bind in this.keyBindFunctions) {
            if(this.getBindState(bind)) {
                this.keyBindFunctions[bind]();
            };
        };

        this.keyDeltaStates = {};
    };
};

input.keyBindFunctions['spawnPhysEntity'] = function () {
    let radius = 50;
    let entity = new PhysEntity(player.pos.moveTowards(input.mouse.worldPos, player.radius + radius + 1), radius);
    entityManager.initEntity(entity);
    entity.vel = input.mouse.worldPos.subtract(player.pos).setScaler(3);
};

input.keyBindFunctions['togglePause'] = function () {
    paused = !paused;
};

input.keyBindFunctions['help'] = function () {
    windowWasOutOfFocus = true;
    let text = '';
    for(let index in input.keyBinds) {
        if(index != '') {
            text = text + '[' + input.keyBinds[index] + '] = ' + index + ';\n';
        };
    };
    window.alert(text);
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