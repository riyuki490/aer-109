
let canvas;
let xPos = 0;
let yPos = 0;
let easing = .01;

function setup() {
    canvas = createCanvas(windowWidth, windowHeight);
    canvas.position(0, 0);
    canvas.style("z-index", -2);
    // background(125);

}


function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    // background(100);
    clear();

xPos = xPos + ((mouseX - xPos) * easing);
yPos = yPos + ((mouseY -yPos) * easing);

    drawThing(xPos, yPos);
}

function mouseMoved() {
    // drawThing(mouseX - 50, mouseY+ 75);

}

function drawThing(_x, _y) {
    // strokeWeight(0);
    // fill(random(200, 255), random(200, 255), random(200, 255),);
    // ellipse(_x, _y, 30, 30);

    // draw eyeballs
    fill(255);
    ellipse(_x, _y, 30, 30);
    ellipse(_x - 20, _y + 5, 30, 30);

    // draw pupils
    fill(0);
    ellipse(_x +10, _y, 5, 5);
    ellipse(_x - 10, _y +5, 5, 5);

}