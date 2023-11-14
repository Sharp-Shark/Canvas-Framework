// Handles some of the input logic

class input {
    static mouse = {pos: new Vector(), worldPos: new Vector(), down: false};
    static keyStates = {};
    static keybinds = {
        'moveUp': 'w',
        'moveDown': 's',
        'moveRight': 'd',
        'moveLeft': 'a',
        'rotateClock': 'q', // rotate camera clockwise
        'rotateCounter': 'e', // rotate camera counterclockwise
        'zoomIn': 'z', // increase camera zoom level (+)
        'zoomOut': 'x', // decrease camera zoom level (-)
        'create': 'c', // hold to create entities continuously - to create a single entity just click
        'delete': 'v', // delete entities at mouse cursor
        'teleport': 't', // hold to teleport red circle to mouse
        'control': 'space', // hold to control red circle (camera will be centered on it and you can use WASD to move it)
        'showQuadtree': 'b', // hold to show quadtrees
        'toggleQuadtree': 'p', // toggles between using and not using quadtrees
        'toggleCulling': 'f', // toggles culling (doesn't render objects out of camera view)
        '': ''
    };
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
        return this.isKeyDown(this.keybinds[bind]);
    };
    static isKeyDown(key) {
        if(this.keyStates[key.toLowerCase()]) {return true;};
        return false;
    };
    static setKeyDown(key) {
        this.keyStates[key.toLowerCase()] = true;
    };
    static setKeyUp(key) {
        this.keyStates[key.toLowerCase()] = false;
    };
};