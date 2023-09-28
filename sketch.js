// Video reference: https://www.youtube.com/watposeIo-DIOkNVg&ab_channel=TheCodingTrain

let video;
let poseNet;
let pose;

let reverb = new Tone.Freeverb(0.4).toDestination();
let vibrato = new Tone.Vibrato(3, 0.3).connect(reverb);

let synthOne = new Tone.PolySynth({
  oscillator: {
    type: "sine",
  },
  detune: 0,
}).connect(vibrato);

let synthTwo = new Tone.PolySynth({
  polyphony: 1,
  maxPolyphony: 1,
  volume: 0,
  detune: 0,
  voice: Tone.Synth,
}).toDestination();

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
}

// Puts the poses from PoseNet in the variable "pose"
function gotPoses(poses) {
  // console.log(poses);
  if (poses.length) {
    pose = poses[0].pose;
    // Confidence score here?
  }
}

// Does something when PoseNet is loaded
function modelLoaded() {
  console.log("PoseNet is ready!");
}

// Starts Tone.js
window.addEventListener("click", function () {
  Tone.Transport.start();
  Tone.start();
});

// Key-controlls
// "BUG" repeats keyDown
window.addEventListener("keydown", (event) => {
  if (event.key === "h") {
    synthTwo.triggerAttack("D4", "4n");
  }
});
window.addEventListener("keyup", (event) => {
  if (event.key === "h") {
    synthTwo.triggerRelease();
  }
});
window.addEventListener("keydown", (event) => {
  if (event.key === "s") {
    synthTwo.triggerRelease();
  }
});

let synthIsPlaying = false;

function draw() {
  background(220);
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);

  // if (Tone.Transport.state === "started" && !synthIsPlaying) {
  //   synthIsPlaying = true;

  //   synthTwo.triggerAttack(["C4", "D2"], "4n");
  // }
  if (pose) {
    // let eyeR = pose.rightEye;
    // let eyeL = pose.leftEye;
    // let eyeDistance = dist(eyeR.x, eyeR.y, eyeL.x, eyeL.y);
    // fill(255);
    // ellipse(pose.nose.x, pose.nose.y, eyeDistance);

    const leftWrist = pose.leftWrist;
    const rightWrist = pose.rightWrist;
    const wristDist = dist(
      leftWrist.x,
      leftWrist.y,
      rightWrist.x,
      rightWrist.y
    );
    synthOne.set({ detune: wristDist });

    if (Tone.Transport.state === "started") {
      if (leftWrist.confidence > 0.3 && !synthIsPlaying) {
        console.log("Trombone-on my brother!");
        synthOne.triggerAttack(["C3"]);
        synthIsPlaying = true;
      } else if (leftWrist.confidence < 0.3 && synthIsPlaying) {
        synthOne.triggerRelease(["C3"]);
        synthIsPlaying = false;
        console.log("Trombone away!");
      }
    }

    fill(255);
    // ellipse(pose.nose.x, pose.nose.y, eyeDistance);

    fill(255, 0, 0);
    ellipse(leftWrist.x, leftWrist.y, 30);
    fill(0, 255, 0);
    ellipse(rightWrist.x, rightWrist.y, 30);
  }
}
