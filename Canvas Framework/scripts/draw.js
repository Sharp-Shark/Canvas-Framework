class draw {
    static width = 1;
    static color = 'black';
    static font = '"Lucida Console", "Courier New", monospace'
    static images = {};
    static filtersDefault = {
        'blur': 0, // in pixels
        'brightness': 1,
        'contrast': 1,
        'hue-rotate': 0, // in radians
        'invert': 0,
        'opacity': 1,
        'saturate': 1,
    };
    static filters = {};
    static clear () {
        ctx.clearRect(0, 0, screen.width, screen.height);
        //ctx.beginPath();
    };
    static circle (vector, radius) {
        ctx.arc(vector.x, vector.y, radius, 0, Math.PI*2);
    };
    static circleStroke (vector, radius) {
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        this.circle(vector, radius);
        ctx.stroke()
    };
    static circleFill (vector, radius) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        this.circle(vector, radius);
        ctx.fill();
    };
    static line (vectorStart, vectorEnd) {
        ctx.moveTo(vectorStart.x, vectorStart.y);
        ctx.lineTo(vectorEnd.x, vectorEnd.y);
    };
    static lineStroke (vectorStart, vectorEnd, cap=false) {
        ctx.lineWidth = this.width;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        this.line(vectorStart, vectorEnd);
        ctx.stroke();
        if(cap) {
            this.circleFill(vectorStart, this.width/2);
            this.circleFill(vectorEnd, this.width/2);
        };
    };
    static polyFill (vectors) {
        ctx.lineWidth = this.width;
        ctx.fillStyle = this.color;
        ctx.moveTo(vectors[0].x, vectors[0].y);
        ctx.beginPath();
        for(let vector of vectors) {
            ctx.lineTo(vector.x, vector.y);
        };
        ctx.fill();
    };
    static fillText (text, size, align, pos, angle=0) {
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.font = (size || 24) + 'px ' + this.font;
        ctx.textAlign = align || 'left';
        ctx.fillText(text, 0, 0);
        ctx.rotate(-angle);
        ctx.translate(-pos.x, -pos.y);
    };
    static loadImage (name, src) {
        let image = new Image();
        image.src = src;
        this.images[name] = image;
    };
    static drawImage (name, pos, size, angle=0) {
        ctx.translate(pos.x, pos.y);
        ctx.rotate(angle);
        ctx.drawImage(this.images[name], size.x / -2, size.y / -2, size.x, size.y);
        ctx.rotate(-angle);
        ctx.translate(-pos.x, -pos.y);
    };
    static applyFilters () {
        let build = '';
        for(let filter in draw.filters) {
            if (draw.filters[filter] != draw.filtersDefault[filter]) {
                build += filter + '(' + draw.filters[filter];
                if (filter == 'hue-rotate') {
                    build += 'rad';
                } else if (filter == 'blur') {
                    build += 'px';
                };
                build += ')';
            };
        };
        if (build == '') build = 'none';
        ctx.filter = build;
        return build
    };
};

draw.loadImage('barodev', 'barodev.png');
draw.loadImage('jerry', 'jerrypetersonfuckingpsycho.png');