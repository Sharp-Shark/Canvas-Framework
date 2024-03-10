class input {
    static mouse = {pos: new Vector(), worldPos: new Vector(), down: false};
    static keyStates = {};
    static keyBinds = {
        'moveUp': 'w',
        'moveDown': 's',
        'moveRight': 'd',
        'moveLeft': 'a',
        'rotateClock': 'z', // rotate camera clockwise
        'rotateCounter': 'x', // rotate camera counterclockwise
        'zoomIn': 'q', // increase camera zoom level (+)
        'zoomOut': 'e', // decrease camera zoom level (-)
        'help': 'h', // gets list of keybinds
        'togglePause': 'space' // toggle pause
    };
    static onBindDown = {};
    static onBindUp = {};
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
        return this.isKeyDown(this.keyBinds[bind]);
    };
    static isKeyDown(key) {
        if(this.keyStates[key.toLowerCase()]) {return true;};
        return false;
    };
    static setKeyDown(key) {
        for(let bind in this.onBindDown) {
            if((key.toLowerCase() == this.keyBinds[bind]) && !this.getBindState(bind)) {
                this.onBindDown[bind]();
            };
        };
        if(key.toLowerCase() == 'mouse') {this.mouse.down = true};
        this.keyStates[key.toLowerCase()] = true;
    };
    static setKeyUp(key) {
        for(let bind in this.onBindUp) {
            if((key.toLowerCase() == this.keyBinds[bind]) && !this.getBindState(bind)) {
                this.onBindUp[bind]();
            };
        };
        if(key.toLowerCase() == 'mouse') {this.mouse.down = false};
        this.keyStates[key.toLowerCase()] = false;
    };
};