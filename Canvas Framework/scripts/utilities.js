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

function hexToRGB (hexUnprocessed) {
    let hex = hexUnprocessed.toLowerCase();
    let chars = {'0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15};
    let r = chars[hex[1]] * 16 + chars[hex[2]];
    let g = chars[hex[3]] * 16 + chars[hex[4]];
    let b = chars[hex[5]] * 16 + chars[hex[6]];
    return {'r': r, 'g': g, 'b': b};
};

function RGBToHex (RGB) {
    let chars = '0123456789ABCDEF';
    let hex = '#';
    hex = hex + chars[Math.floor(RGB.r / 16)] + chars[Math.round(RGB.r) % 16];
    hex = hex + chars[Math.floor(RGB.g / 16)] + chars[Math.round(RGB.g) % 16];
    hex = hex + chars[Math.floor(RGB.b / 16)] + chars[Math.round(RGB.b) % 16];
    return hex;
};

function lerpCorHexes (n, hex1, hex2) {
    let rgb1 = hexToRGB(hex1);
    let rgb2 = hexToRGB(hex2);
    let rgb = {'r': lerp(n, rgb1.r, rgb2.r), 'g': lerp(n, rgb1.g, rgb2.g), 'b': lerp(n, rgb1.b, rgb2.b)};
    return RGBToHex(rgb);
};