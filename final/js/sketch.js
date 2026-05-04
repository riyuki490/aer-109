// -----------------------------------
// SLASHER CHASE GAME - p5.js
// One or more enemy images follow the mouse.
// If any of them touches the cursor, the game ends.
// A random door appears on screen.
// Clicking the door refreshes the page
// so it feels like entering a new area.
// When the cursor hovers over the door,
// a white border appears around it.
// The floor and ripple colors also
// randomize on each refresh.
// The chaser speed also randomizes
// between slow, medium, and fast.
// The number of chasers also randomizes
// with weighted odds.
// -----------------------------------

// Stores the background color
let bgColor;

// Stores a list of possible floor colors
let floorColors = [];

// Stores the currently selected floor color
let currentFloorColor;

// Stores enemy images
let img1, img2, img3, img4;

// Stores the running-guy cursor GIF
let cursorImg;

// Stores door images
let door1, door2, door3;

// Stores all current chasers
let killers = [];

// Stores the current door object
let door;

// Keeps track of whether the player has lost
let gameOver = false;

// Stores ripples/trails
let ripples = [];

// Stores the mouse position from the previous frame
// so we can tell whether the mouse is moving
let lastMouseX = 0;
let lastMouseY = 0;

function preload() {
    // Load all killer images before the sketch starts
    img1 = loadImage("images/chucky.gif");
    img2 = loadImage("images/ghost.gif");
    img3 = loadImage("images/jason.gif");
    img4 = loadImage("images/leather.gif");

    // Load the running guy GIF that will replace the cursor
    cursorImg = loadImage("images/fear.gif");

    // Load all three door PNGs
    door1 = loadImage("images/door.png");
    door2 = loadImage("images/door2.png");
    door3 = loadImage("images/door3.png");
}

function setup() {
    // Create a canvas that fills the whole browser window
    createCanvas(windowWidth, windowHeight);

    // Build the list of possible floor colors
    // Includes:
    // - the original dark red
    // - greens inspired by your first palette
    // - purples/darks inspired by your second palette
    floorColors = [
        color(30, 0, 0),      // original dark red
        color(153, 0, 0),     // deeper red from palette 1
        color(0, 69, 63),     // teal green
        color(0, 48, 43),     // dark green-teal
        color(130, 149, 106), // muted sage
        color(109, 132, 86),  // darker olive green
        color(167, 83, 81),   // dusty red from palette 2
        color(94, 0, 78),     // deep magenta purple
        color(31, 32, 65),    // dark indigo
        color(47, 0, 32),     // dark plum
        color(32, 33, 34)     // charcoal
    ];

    // Pick one floor color randomly each refresh
    currentFloorColor = random(floorColors);

    // Set the scene background color to the chosen floor color
    bgColor = currentFloorColor;

    // Draw images from their center point instead of top-left corner
    imageMode(CENTER);

    // Create the chasers when the sketch starts
    spawnKiller();

    // Create one random door when the sketch starts
    spawnDoor();

    // Hide the normal system cursor
    // We do this because we are drawing our own cursor image instead
    noCursor();

    // Save the starting mouse position
    // This helps us detect movement later
    lastMouseX = mouseX;
    lastMouseY = mouseY;
}

function draw() {
    // Clear the screen every frame with the background color
    background(bgColor);

    // Check whether the mouse moved since the last frame
    let mouseMovedNow = mouseX !== lastMouseX || mouseY !== lastMouseY;

    // If the mouse is moving, add ripples automatically
    // frameCount % 3 keeps ripples from spawning too often
    if (mouseMovedNow && frameCount % 3 === 0) {
        ripples.push({
            x: mouseX,
            y: mouseY,
            radius: 20,
            alpha: 120
        });
    }

    // Update stored mouse position for the next frame
    lastMouseX = mouseX;
    lastMouseY = mouseY;

    // Draw ripple effects behind everything else
    drawRipples();

    // Draw the door on screen
    drawDoor();

    // If the game is over, show the game-over screen and stop normal gameplay
    if (gameOver) {
        drawGameOverScreen();

        // Still draw the running cursor image during game over
        drawCursor();
        return;
    }

    // Move all chasers toward the mouse
    updateKiller();

    // Draw all chasers
    drawKiller();

    // Draw the running-guy cursor image
    drawCursor();

    // Check whether any chaser has touched the cursor
    checkGameOver();
}

function spawnKiller() {
    // Clear out any old chasers first
    killers = [];

    // Use weighted odds for how many chasers appear
    // 60% chance = 1 chaser
    // 25% chance = 2 chasers
    // 15% chance = 3 chasers
    let roll = random();
    let numKillers;

    if (roll < 0.60) {
        numKillers = 1;
    } else if (roll < 0.85) {
        numKillers = 2;
    } else {
        numKillers = 3;
    }

    // Create that many chasers
    for (let i = 0; i < numKillers; i++) {
        // Pick a random edge of the screen to spawn from
        let side = floor(random(4));

        // Variables for the starting position
        let startX, startY;

        if (side === 0) {
            // Spawn off the left side
            startX = -200;
            startY = random(height);
        } else if (side === 1) {
            // Spawn off the right side
            startX = width + 200;
            startY = random(height);
        } else if (side === 2) {
            // Spawn off the top
            startX = random(width);
            startY = -200;
        } else {
            // Spawn off the bottom
            startX = random(width);
            startY = height + 200;
        }

        // Put all images into an array
        let imgs = [img1, img2, img3, img4];

        // Randomly choose one slasher image for this chaser
        let chosenImg = random(imgs);

        // Create three possible speed styles for the chaser
        let chaseTypes = [
            {
                // Slow but intimidating
                name: "slow",
                easing: 0.002,
                drag: 0.93
            },
            {
                // Medium pace
                name: "medium",
                easing: 0.005,
                drag: 0.90
            },
            {
                // Fast chaser
                name: "fast",
                easing: 0.015,
                drag: 0.87
            }
        ];

        // Randomly choose one speed type for this chaser
        let chosenType = random(chaseTypes);

        // Add this chaser to the array
        killers.push({
            // Starting x position
            x: startX,

            // Starting y position
            y: startY,

            // Horizontal speed
            vx: 0,

            // Vertical speed
            vy: 0,

            // Randomized chase behavior
            easing: chosenType.easing,
            drag: chosenType.drag,

            // Save the speed type name
            speedType: chosenType.name,

            // The chosen slasher image
            img: chosenImg,

            // Randomize the size a little so groups do not look too identical
            size: random(150, 210)
        });
    }
}

function spawnDoor() {
    // Put all door images into an array
    let doorImgs = [door1, door2, door3];

    // Randomly choose one door look
    let chosenDoor = random(doorImgs);

    // Create the door object
    door = {
        // Keep the door away from the outer edges a little
        x: random(120, width - 120),
        y: random(120, height - 120),

        // Store the chosen image
        img: chosenDoor,

        // Width of the door on screen
        size: 140
    };
}

function updateKiller() {
    // Update every chaser in the array
    for (let k of killers) {
        // Find how far away the mouse is from this chaser on the x-axis
        let dx = mouseX - k.x;

        // Find how far away the mouse is from this chaser on the y-axis
        let dy = mouseY - k.y;

        // Turn that distance into acceleration toward the mouse
        let ax = dx * k.easing;
        let ay = dy * k.easing;

        // Add acceleration into velocity
        k.vx += ax;
        k.vy += ay;

        // Apply drag so movement feels smoother and less instant
        k.vx *= k.drag;
        k.vy *= k.drag;

        // Update the chaser's position
        k.x += k.vx;
        k.y += k.vy;
    }
}

function drawKiller() {
    // Draw every chaser
    for (let k of killers) {
        // Keep the image proportions correct
        let aspect = k.img.height / k.img.width;

        // Draw the chaser image centered at its x and y position
        image(k.img, k.x, k.y, k.size, k.size * aspect);
    }
}

function drawDoor() {
    // Only draw if the door exists
    if (door && door.img) {
        // Keep the image proportions correct
        let aspect = door.img.height / door.img.width;

        // Figure out the door's height based on its width
        let doorHeight = door.size * aspect;

        // If the cursor is hovering over the door,
        // draw a large white border around it
        if (isMouseOverDoor()) {
            push();

            // No fill so only the border shows
            noFill();

            // White outline
            stroke(255);

            // Thick border
            strokeWeight(6);

            // Center-based rectangle around the door
            rectMode(CENTER);

            // Draw border slightly bigger than the door image
            rect(door.x, door.y, door.size + 30, doorHeight + 30);

            pop();
        }

        // Draw the door image centered at its x and y position
        image(door.img, door.x, door.y, door.size, doorHeight);
    }
}

function isMouseOverDoor() {
    // If there is no door yet, return false
    if (!door || !door.img) {
        return false;
    }

    // Measure distance between the cursor and the center of the door
    let d = dist(mouseX, mouseY, door.x, door.y);

    // This controls how close the cursor must be
    // to count as hovering over the door
    let hoverDistance = 70;

    // Return true if the cursor is close enough
    return d < hoverDistance;
}

function checkGameOver() {
    // This value decides how close a chaser has to get before you lose
    let hitDistance = 60;

    // Check every chaser
    for (let k of killers) {
        // Measure distance between this chaser and the cursor
        let d = dist(k.x, k.y, mouseX, mouseY);

        // If any chaser reaches the cursor, end the game
        if (d < hitDistance) {
            gameOver = true;
            return;
        }
    }
}

function drawCursor() {
    // Draw the running guy GIF at the mouse position
    // This replaces the old crosshair cursor

    // Only draw if the GIF loaded properly
    if (cursorImg) {
        // Keep the GIF's original proportions
        let aspect = cursorImg.height / cursorImg.width;

        // Controls how large the cursor GIF appears
        let size = 80;

        // Draw the running guy centered on the mouse position
        image(cursorImg, mouseX, mouseY, size, size * aspect);
    }
}

function drawGameOverScreen() {
    // Dark transparent overlay on top of the scene
    fill(0, 180);
    noStroke();
    rect(0, 0, width, height);

    // Main "GAME OVER" text
    fill(255, 0, 0);
    textAlign(CENTER, CENTER);
    textSize(64);
    text("GAME OVER", width / 2, height / 2 - 30);

    // Smaller restart instruction text
    fill(255);
    textSize(24);
    text("Press R to restart", width / 2, height / 2 + 30);

    // Still draw all chasers on screen for dramatic effect
    drawKiller();
}

function mousePressed() {
    // Only allow door clicking if the game is not over
    if (!gameOver && isMouseOverDoor()) {
        // Refresh the page to create a new random area feeling
        window.location.reload();
    }
}

function drawRipples() {
    // Loop backwards so fading ripples can be removed safely
    for (let i = ripples.length - 1; i >= 0; i--) {
        // Store the current ripple
        let r = ripples[i];

        // No fill inside the ripple circles
        noFill();

        // Thickness of ripple outlines
        strokeWeight(2);

        // Build ripple colors from the chosen floor color
        // Light ripple = brighter version of the floor color
        let light = color(
            clampColor(red(currentFloorColor) + 80),
            clampColor(green(currentFloorColor) + 80),
            clampColor(blue(currentFloorColor) + 80),
            r.alpha
        );

        // Shadow ripple = darker version of the floor color
        let shadow = color(
            clampColor(red(currentFloorColor) - 60),
            clampColor(green(currentFloorColor) - 60),
            clampColor(blue(currentFloorColor) - 60),
            r.alpha
        );

        // Draw outer darker rings
        stroke(shadow);
        ellipse(r.x, r.y, r.radius - 10, r.radius - 10);
        ellipse(r.x, r.y, r.radius + 10, r.radius + 10);

        // Draw middle lighter ring
        stroke(light);
        ellipse(r.x, r.y, r.radius, r.radius);

        // Make the ripple grow
        r.radius += 5;

        // Make the ripple fade out
        r.alpha -= 4;

        // Remove it once fully invisible
        if (r.alpha <= 0) {
            ripples.splice(i, 1);
        }
    }
}

function clampColor(value) {
    // Keep color values inside the valid range 0 to 255
    return constrain(value, 0, 255);
}

function keyPressed() {
    // If the player presses R after losing, restart the game
    if (key === 'r' || key === 'R') {
        restartGame();
    }
}

function restartGame() {
    // Reset the game-over state
    gameOver = false;

    // Clear old ripples
    ripples = [];

    // Pick a new random floor color
    currentFloorColor = random(floorColors);
    bgColor = currentFloorColor;

    // Spawn fresh chasers
    spawnKiller();

    // Spawn a fresh random door
    spawnDoor();
}

function windowResized() {
    // Resize the canvas if the browser window changes size
    resizeCanvas(windowWidth, windowHeight);

    // Reposition the door so it stays safely inside the new canvas size
    spawnDoor();
}