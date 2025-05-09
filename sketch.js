// Hand Pose Detection with ml5.js
// https://thecodingtrain.com/tracks/ml5js-beginners-guide/ml5/hand-pose

let video;
let handPose;
let hands = [];
let bullets = []; // 存儲子彈的數組

function preload() {
  // Initialize HandPose model with flipped video input
  handPose = ml5.handPose({ flipped: true });
}

function mousePressed() {
  console.log(hands);
}

function gotHands(results) {
  hands = results;
}

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO, { flipped: true });
  video.hide();

  // Start detecting hands
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0);

  // Ensure at least one hand is detected
  if (hands.length > 0) {
    for (let hand of hands) {
      if (hand.confidence > 0.1) {
        // Loop through keypoints and draw circles
        for (let i = 0; i < hand.keypoints.length; i++) {
          let keypoint = hand.keypoints[i];

          // Color-code based on left or right hand
          if (hand.handedness == "Left") {
            fill(255, 0, 255);
          } else {
            fill(255, 255, 0);
          }

          noStroke();
          circle(keypoint.x, keypoint.y, 16);
        }

        // Detect "shooting" gesture
        let indexFinger = hand.keypoints.find(k => k.name === "index_finger_tip");
        let thumb = hand.keypoints.find(k => k.name === "thumb_tip");
        let wrist = hand.keypoints.find(k => k.name === "wrist");

        if (indexFinger && thumb && wrist) {
          let distance = dist(indexFinger.x, indexFinger.y, thumb.x, thumb.y);

          // If the index finger is extended and thumb is close to wrist, simulate shooting
          if (distance > 50) {
            // Add a bullet starting from the index finger tip
            bullets.push({
              x: indexFinger.x,
              y: indexFinger.y,
              vx: 5, // Bullet velocity
              vy: 0,
              life: 30 // Bullet lifespan
            });
          }
        }
      }
    }
  }

  // Update and draw bullets
  for (let i = bullets.length - 1; i >= 0; i--) {
    let bullet = bullets[i];
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
    bullet.life--;

    // Draw bullet
    fill(255, 0, 0);
    noStroke();
    circle(bullet.x, bullet.y, 10);

    // Create explosion effect when bullet life ends
    if (bullet.life <= 0) {
      for (let j = 0; j < 10; j++) {
        let angle = random(TWO_PI);
        let speed = random(2, 5);
        bullets.push({
          x: bullet.x,
          y: bullet.y,
          vx: cos(angle) * speed,
          vy: sin(angle) * speed,
          life: 10
        });
      }
      bullets.splice(i, 1); // Remove the bullet
    }
  }
}
