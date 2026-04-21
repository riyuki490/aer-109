
// let canvas;
// let xPos = 0;
// let yPos = 0;
// let easing = .01;

// function setup() {
//     canvas = createCanvas(windowWidth, windowHeight);
//     canvas.position(0, 0);
//     canvas.style("z-index", -2);

// }


// function windowResized() {
//     resizeCanvas(windowWidth, windowHeight);
// }

// function preload() {
//     img1 = loadImage("images/knife.png");
//     img2 = loadImage("images/bouncing-goose.gif");
// }

// function draw() {
//     clear();
//     xPos = xPos + ((mouseX - xPos) * easing);
//     yPos = yPos + ((mouseY - yPos) * easing);

//     drawThing(xPos, yPos);
// }

// function mouseMoved() {

// }

// function drawThing(_x, _y) {


//     image(img1, _x, _y, 200, 100);
//     image(img2, _x + 300, _y - 300, 200, 100);

// }



// // --------

// var radius = 2;
// var x;
// var y;
// var water;
// var waterLight;
// var waterShadow; 
// let xPos = 0;
// let yPos = 0;
// let easing = .01;

// function setup() {
//   var cnv = createCanvas(windowWidth, windowHeight);
//   cnv.style('display', 'block');
//   water = color(136,221,221);
//   background(water);
//     x = windowWidth/2;
//     y = windowHeight/2;
// }

// function preload() {
//     img1 = loadImage("images/knife.png");
//     img2 = loadImage("images/bouncing-goose.gif");
// }

// function draw() {
//   // water = color(136,221,221,50);
//   background(136,221,221,10);
//   frameRate(15);
//   noFill();
//   strokeWeight((windowWidth/100)+(random(3,2+(mouseY-mouseX)/20)));
//   radius+=10;
//   if (radius < windowWidth)  {
//   waterLight = color(195,238,238, (windowWidth/1.5-radius));
//     waterShadow = color(106,213,213, (windowWidth/3-radius));

//   stroke(waterShadow);
//   ellipse(x, y, radius-20, radius-20);
//   ellipse(x, y, radius+20, radius+20);

//   radius += (random(((mouseX)/6), ((windowWidth-mouseX)/6)));
//   stroke(waterLight);
//   ellipse(x, y, radius, radius);

//   //     clear();
//     xPos = xPos + ((mouseX - xPos) * easing);
//     yPos = yPos + ((mouseY - yPos) * easing);

//     drawThing(xPos, yPos);
//   }


// }

// function windowResized() {
//   var cnv = createCanvas(windowWidth, windowHeight);
//   cnv.style('display', 'block');
//   water = color(136,221,221);
//   background(water);
//   radius = 5;
//     x = mouseX;
//     y = mouseY;
//   draw();

// }

// function mousePressed() {
//   water = color(136,221,221,70);
//   background(water);
//   radius = 5;
//   x = mouseX;
//     y = mouseY;
//   draw();
// }

// function mouseDragged() {
//   water = color(136,221,221,80);
//   background(water);
//   radius = 2;
//   x = mouseX;
//     y = mouseY;
//   draw();
// }

// // function mouseMoved() {

// // }


// function drawThing(_x, _y) {


//     image(img1, _x, _y, 200, 100);
//     image(img2, _x + 300, _y - 300, 200, 100);

// }


// -----------------------------------

// Main environment + assets
let water;
let img1, img2, img3;

// Stores all ripple objects (each click creates one)
let ripples = [];

// Stores all duck agents
let ducks = [];

function preload() {
    // Load images before the sketch runs
    img1 = loadImage("images/knife.png");
    img2 = loadImage("images/bouncing-goose.gif");
    img3 = loadImage("images/smug-goose.gif");
}

function setup() {
    // Create full-screen canvas
    createCanvas(windowWidth, windowHeight);

    // Base water color (pond background)
    water = color(136, 221, 221);

    // Draw images from their center instead of top-left
    imageMode(CENTER);

    // Spawn a few ducks at the start
    for (let i = 0; i < 100; i++) {
        spawnDuck();
    }
}

function draw() {
    // Reset the screen each frame to the pond color
    background(water);

    // ---------------------------
    // RIPPLE SYSTEM
    // ---------------------------

    // Loop backwards so we can safely remove faded ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
        let r = ripples[i];

        noFill();
        strokeWeight(3);

        // Light + shadow colors with fading transparency
        let waterLight = color(255, 255, 255, r.alpha);
        let waterShadow = color(0, 150, 200, r.alpha);

        // Draw layered ripple rings
        stroke(waterShadow);
        ellipse(r.x, r.y, r.radius - 20, r.radius - 20);
        ellipse(r.x, r.y, r.radius + 20, r.radius + 20);

        stroke(waterLight);
        ellipse(r.x, r.y, r.radius, r.radius);

        // Expand ripple outward
        r.radius += 6;

        // Fade ripple over time
        r.alpha -= 2;

        // Remove ripple once fully transparent
        if (r.alpha <= 0) {
            ripples.splice(i, 1);
        }
    }

    // ---------------------------
    // DUCK MOVEMENT SYSTEM
    // ---------------------------

    for (let d of ducks) {
        // Each duck follows the mouse with a slight offset
        let targetX = mouseX + d.offsetX;
        let targetY = mouseY + d.offsetY;

        // Calculate acceleration toward target
        let ax = (targetX - d.x) * d.easing;
        let ay = (targetY - d.y) * d.easing;

        // Add acceleration to velocity
        d.vx += ax;
        d.vy += ay;

        // Apply drag (slows movement, creates "water resistance")
        d.vx *= 0.99;
        d.vy *= 0.99;

        // Update position using velocity
        d.x += d.vx;
        d.y += d.vy;

        // Draw this duck
        drawThing(d);
    }
}

function mousePressed() {
    // Create a new ripple at the mouse position
    ripples.push({
        x: mouseX,
        y: mouseY,
        radius: 20,
        alpha: 180
    });
}

function mouseDragged() {
    // While dragging, add ripples every few frames
    // so the screen does not get overloaded too fast
    if (frameCount % 2 === 0) {
        ripples.push({
            x: mouseX,
            y: mouseY,
            radius: 20,
            alpha: 120
        });
    }
}

function spawnDuck() {
    // Pick a random edge of the screen
    let side = floor(random(4));
    let startX, startY;

    if (side === 0) {
        // Left side
        startX = -200;
        startY = random(height);
    } else if (side === 1) {
        // Right side
        startX = width + 200;
        startY = random(height);
    } else if (side === 2) {
        // Top
        startX = random(width);
        startY = -200;
    } else {
        // Bottom
        startX = random(width);
        startY = height + 200;
    }

    // Randomly assign an image to this duck
    let imgs = [img1, img2, img3];
    let chosenImg = random(imgs);

    // Create a new duck object
    ducks.push({
        x: startX,
        y: startY,

        // Velocity (used for smooth drifting movement)
        vx: 0,
        vy: 0,

        // How strongly it moves toward the mouse (lower = slower)
        easing: random(0.00005, 0.0001),

        // Offset so ducks don't overlap exactly
        offsetX: random(-120, 120),
        offsetY: random(-120, 120),

        // Assigned image for this duck
        img: chosenImg,

        // Base display size for the image width
        size: random(70, 110)
    });
}

function drawThing(d) {
    // Keep original image proportions when drawing
    let aspect = d.img.height / d.img.width;

    // Width comes from d.size, height adjusts automatically
    image(d.img, d.x, d.y, d.size, d.size * aspect);
}

function windowResized() {
    // Adjust canvas if window size changes
    resizeCanvas(windowWidth, windowHeight);
}