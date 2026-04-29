// -----------------------------------
// SLASHER CHASE GAME - p5.js
// One enemy image follows the mouse.
// If it touches the cursor, the game ends.
// A random door appears on screen.
// Clicking the door refreshes the page
// so it feels like entering a new area.
// When the cursor hovers over the door,
// a white border appears around it.
// -----------------------------------

// Stores the background color
let bgColor;

// Stores enemy images
let img1, img2, img3, img4;

// Stores the running-guy cursor GIF
let cursorImg;

// Stores door images
let door1, door2, door3;

// Stores the single chaser object
let killer;

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

    // Set the background color
    // Dark red/black gives a more horror/slasher feeling
    bgColor = color(30, 0, 0);

    // Draw images from their center point instead of top-left corner
    imageMode(CENTER);

    // Create the single killer when the sketch starts
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

    // Move the killer toward the mouse
    updateKiller();

    // Draw the killer image
    drawKiller();

    // Draw the running-guy cursor image
    drawCursor();

    // Check whether the killer has touched the cursor
    checkGameOver();
}

function spawnKiller() {
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

    // Randomly choose one slasher image for this round
    let chosenImg = random(imgs);

    // Create the killer object
    killer = {
        // Starting x position
        x: startX,

        // Starting y position
        y: startY,

        // Horizontal speed
        vx: 0,

        // Vertical speed
        vy: 0,

        // Controls how strongly the killer is pulled toward the mouse
        // Higher number = faster/stronger chase
        easing: 0.005,

        // Drag keeps movement smooth instead of too floaty or too sharp
        drag: 0.90,

        // The chosen slasher image
        img: chosenImg,

        // Display width of the image
        size: 180
    };
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
    // Find how far away the mouse is from the killer on the x-axis
    let dx = mouseX - killer.x;

    // Find how far away the mouse is from the killer on the y-axis
    let dy = mouseY - killer.y;

    // Turn that distance into acceleration toward the mouse
    let ax = dx * killer.easing;
    let ay = dy * killer.easing;

    // Add acceleration into velocity
    killer.vx += ax;
    killer.vy += ay;

    // Apply drag so movement feels smoother and less instant
    killer.vx *= killer.drag;
    killer.vy *= killer.drag;

    // Update the killer's position
    killer.x += killer.vx;
    killer.y += killer.vy;
}

function drawKiller() {
    // Keep the image proportions correct
    let aspect = killer.img.height / killer.img.width;

    // Draw the killer image centered at its x and y position
    image(killer.img, killer.x, killer.y, killer.size, killer.size * aspect);
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
    // Measure distance between the killer and the cursor
    let d = dist(killer.x, killer.y, mouseX, mouseY);

    // This value decides how close the killer has to get before you lose
    // Increased a little since the cursor is now a bigger GIF
    let hitDistance = 60;

    // If the killer reaches the cursor, end the game
    if (d < hitDistance) {
        gameOver = true;
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

    // Still draw the killer on screen for dramatic effect
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

        // Red-tinted ripple colors for a horror look
        let light = color(255, 120, 120, r.alpha);
        let shadow = color(120, 0, 0, r.alpha);

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

    // Spawn a fresh killer
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