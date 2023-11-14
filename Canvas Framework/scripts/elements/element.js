class Element {
    constructor (name, pos, size) {
        this.eType = 'element';
        this.name = name;
        this.pos = pos;
        this.size = size;

        this.elements = [];
        this.data = {};

        this.active = false;
    };
    update () {
        if(this.active) {return;};
        this.update()
    };
    render() {
        this.renderBg();
        this.renderTxt();
    };
};

class elementManager {
    static elements = [];

};