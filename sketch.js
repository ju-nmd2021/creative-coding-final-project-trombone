// Video reference: https://www.youtube.com/watposeIo-DIOkNVg&ab_channel=TheCodingTrain

let video;
let videoTwo;
let poseNet;
let pose;
let face;
let faceDetections;
let faceReady = false;
// let faceTrack;
// let facePoints = [];

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
  videoTwo = createCapture(VIDEO);
  video.hide();
  videoTwo.hide();
  poseNet = ml5.poseNet(video, modelLoaded);
  poseNet.on("pose", gotPoses);
  // const faceOptions = {
  //   withLandmarks: true,
  //   withExpressions: false,
  //   withDescriptors: false,
  // };
  // faceTrack = ml5.faceApi(videoTwo, faceOptions, faceApiLoaded);
  face = ml5.facemesh(videoTwo, facemeshLoaded);
  face.on("predict", gotFace);
}

// Does something when PoseNet is loaded
function modelLoaded() {
  console.log("PoseNet is ready!");
}

// Puts the poses from PoseNet in the variable "pose"
function gotPoses(poses) {
  // console.log(poses);
  if (poses.length) {
    pose = poses[0].pose;
    // Confidence score here?
  }
}

// function faceApiLoaded() {
//   console.log("faceApi is ready!");
//   faceTrack.detect(gotFace);
// }

function gotFace(result) {
  // if (error) {
  //   console.log("faceApi error");
  // }
  faceDetections = result;
  console.log(faceDetections);
  faceReady = true;

  // facepoints = result;
  // // console.log(facepoints);
  // faceReady = true;
  // faceTrack.detect(gotFace);
}

function facemeshLoaded() {
  console.log("facemesh is ready!");
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

// from https://editor.p5js.org/tlsaeger/sketches/bGBDeBsVv
function drawKeypoints() {
  if (faceDetections.length) {
    ellipse(
      faceDetections[0].annotations.lipsLowerInner[5][0],
      faceDetections[0].annotations.lipsLowerInner[5][1],
      10
    );
    ellipse(
      faceDetections[0].annotations.lipsUpperInner[5][0],
      faceDetections[0].annotations.lipsUpperInner[5][1],
      10
    );

    //Now we can really draw the keypoints by looping trough the array
    // for (let i = 0; i < keypoints.length; i += 1) {
    //   const [x, y, z] = keypoints[i];

    //   //We set  the colorMode to HSB in the beginning this will help us now. We can use fixed values for hue and saturation. Then we convert the values from the z axis, they range from about -70 to 70, to range from 100 to 0, so we can use them as third argument for the brightness.
    //   fill(0);
    //   //Finally we draw the ellipse at the x/y coordinates which Facemesh provides to us
    //   ellipse(x, y, 10);
    // }
  }
}

// https://editor.p5js.org/ima_ml/sketches/fCsz7tb6w
function drawFacePoints() {
  if (facepoints.length) {
    console.log(facepoints[0]);
    // console.log(facepoints[0].parts.mouth);

    ellipse(facepoints[0].parts.mouth[3].x, facepoints[0].parts.mouth[3].y, 10);
    ellipse(facepoints[0].parts.mouth[9].x, facepoints[0].parts.mouth[9].y, 10);
  }
}

function draw() {
  background(220);
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);

  if (faceReady) {
    drawKeypoints();
    //drawFacePoints();
  }
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
    synthOne.set({ detune: wristDist * 2 });

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
