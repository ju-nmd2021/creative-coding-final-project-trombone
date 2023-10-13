// Video reference: https://www.youtube.com/watposeIo-DIOkNVg&ab_channel=TheCodingTrain

let video;
let videoTwo;
let poseNet;
let pose;
let face;
let faceDetections;
let faceReady = false;
let imageTromboneOne;
let imageTromboneTwo;

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
  angleMode(DEGREES);
  imageTromboneOne = loadImage("images/trombone_partOne_02.png");
  imageTromboneTwo = loadImage("images/trombone_partTwo_02.png");
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

function gotFace(result) {
  faceDetections = result;
  faceReady = true;
}

function facemeshLoaded() {
  console.log("facemesh is ready!");
}

// Starts Tone.js when clicking the screen
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

// Change volume depending on mouth opening
function playTrombone() {
  if (faceDetections.length) {
    // Draw face mouth points
    // ellipse(
    //   faceDetections[0].annotations.lipsLowerInner[5][0],
    //   faceDetections[0].annotations.lipsLowerInner[5][1],
    //   10
    // );
    // ellipse(
    //   faceDetections[0].annotations.lipsUpperInner[5][0],
    //   faceDetections[0].annotations.lipsUpperInner[5][1],
    //   10
    // );

    // ellipse(
    //   faceDetections[0].annotations.lipsUpperInner[0][0],
    //   faceDetections[0].annotations.lipsUpperInner[0][1],
    //   10
    // );
    // ellipse(
    //   faceDetections[0].annotations.lipsUpperInner[10][0],
    //   faceDetections[0].annotations.lipsUpperInner[10][1],
    //   10
    // );

    // Calculate lip point distances in facemesh
    verticalLipDist = dist(
      faceDetections[0].annotations.lipsLowerInner[5][0],
      faceDetections[0].annotations.lipsLowerInner[5][1],
      faceDetections[0].annotations.lipsUpperInner[5][0],
      faceDetections[0].annotations.lipsUpperInner[5][1]
    );
    horizontalLipDist = dist(
      faceDetections[0].annotations.lipsUpperInner[0][0],
      faceDetections[0].annotations.lipsUpperInner[0][1],
      faceDetections[0].annotations.lipsUpperInner[10][0],
      faceDetections[0].annotations.lipsUpperInner[10][1]
    );

    // Play and stop trombone synth depending on mouth open and close
    if (Tone.Transport.state === "started") {
      if (verticalLipDist / horizontalLipDist > 0.1 && !synthIsPlaying) {
        console.log("Trombone-on my brother!");
        synthOne.triggerAttack(["C3"]);

        synthIsPlaying = true;
      } else if (verticalLipDist / horizontalLipDist < 0.1 && synthIsPlaying) {
        synthOne.triggerRelease(["C3"]);
        synthIsPlaying = false;
        console.log("Trombone be gone!");
      }

      // Set volume depending on how open the mouth is
      synthOne.volume.value = 10 * (verticalLipDist / horizontalLipDist) - 10;
    }
  }
}

// Video tutorial reference: https://www.youtube.com/watch?v=xBQef0fs-_Q&ab_channel=ShaiUI
let synthDrumsState = false;
let synthPianoState = false;
let synthPiano = new Tone.PolySynth({
  volume: -20,
}).toDestination();
let playerKick = new Tone.Player(
  "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/505/kick.mp3"
).toDestination();
let playerSnare = new Tone.Player(
  "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/505/snare.mp3"
).toDestination();
let playerHihat = new Tone.Player(
  "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/505/hh.mp3"
).toDestination();

function playInstruments() {
  // if (!synthPianoState) {
  //   synthPianoState = true;
  //   synthPiano.triggerAttackRelease("C4", "4n");
  // }
  // if (!synthDrumsState) {
  //   synthDrumsState = true;
  //   playerHihat.start();
  // }
}

// Reduce some latency
Tone.context.latencyHint = "fastest";
// Tonejs beats per minute
Tone.Transport.bpm.value = 100;

// Drum sequencer
let sequenceDrums = new Tone.Sequence(
  (time, note) => {
    if (note === 1) {
      playerKick.start();
    }
    if (note === 3) {
      playerSnare.start();
    }
    playerHihat.start();
  },
  [1, 2, 3, 4],
  "8n"
).start();

// Chords (triads) in the C major scale
const cMajChords = [
  ["C3", "E3", "G3"],
  ["D3", "F3", "A3"],
  ["E3", "G3", "B3"],
  ["F3", "A3", "C3"],
  ["G3", "B3", "D3"],
  ["A3", "C3", "E3"],
];

// Variables that effect the pianos playing
let pianoMood = {
  currentChord: 0,
  chordReps: 2,
  chordTimesPlayed: 0,
  chords: cMajChords,
  chordProg: [0, 4, 5, 3],
  chordLength: "16n",
  chordProgReps: 4,
  chordProgTimesPlayed: 0,
  skipChord: 1,
};
function setPianoMood() {
  pianoMood.currentChord = 0;
  // Get number from something
  chordReps = "number";
  chordTimesPlayd = 0;
  chords = "scale of triads probably";
  chordProg = "array of four numbersi inside the scale array chords";
  chordLength = "between like 4n, 8n, and 16n  is probably best";
}

function playPiano() {
  // Piano chords plays the right amount of repetitions
  if (pianoMood.chordTimesPlayed >= pianoMood.chordReps) {
    pianoMood.currentChord++;
    if (pianoMood.currentChord >= pianoMood.chordProg.length) {
      pianoMood.currentChord = 0;
    }
    pianoMood.chordTimesPlayed = 0;
  }
  // Play chord
  synthPiano.triggerAttackRelease(
    pianoMood.chords[pianoMood.chordProg[pianoMood.currentChord]],
    pianoMood.chordLength
  );
  pianoMood.chordTimesPlayed++;
}

// Play the piano and change how it is played after it has playd a certain amout of repetitions
let sequencePiano = new Tone.Sequence(
  (time, note) => {
    if (note === 1) {
      playPiano();
    }
    if (note === 2) {
      playPiano();
    }
    if (note === 3) {
      playPiano();
    }
    if (note === 4) {
      playPiano();
      pianoMood.chordProgTimesPlayed++;
      if (pianoMood.chordProgTimesPlayed >= pianoMood.chordProgReps) {
        // setPianoMood()
        // Goes in setPianoMood I
      }
      console.log(pianoMood.chordProgTimesPlayed);
    }
  },
  [1, 2, 3, 4],
  "8n"
);

if (Tone.Transport.state === "started") {
  // sequenceDrums;
  // sequencePiano;
}

function draw() {
  background(220);
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);

  if (faceReady) {
    playTrombone();
  }

  if (Tone.Transport.state === "started") {
    sequencePiano.start();
  }

  // If posenet has got something then drawtrombone and detune trombone synth
  if (pose) {
    const leftWrist = pose.leftWrist;
    const rightWrist = pose.rightWrist;
    const wristDist = dist(
      leftWrist.x,
      leftWrist.y,
      rightWrist.x,
      rightWrist.y
    );
    const eyeDist = dist(
      pose.leftEye.x,
      pose.leftEye.y,
      pose.rightEye.x,
      pose.rightEye.y
    );
    const tromboneSize = eyeDist * 50;
    const wristAngle =
      90 - atan2(leftWrist.x - rightWrist.x, leftWrist.y - rightWrist.y);

    synthOne.set({ detune: wristDist * 3 });

    push();
    imageMode(CENTER);
    translate(leftWrist.x, leftWrist.y);
    rotate(wristAngle);
    image(imageTromboneOne, 0, 0, tromboneSize, tromboneSize / 7);
    pop();

    push();
    imageMode(CENTER);
    translate(rightWrist.x, rightWrist.y);
    rotate(wristAngle);

    image(imageTromboneTwo, 0, 0, tromboneSize, tromboneSize / 7);
    pop();

    // Draws ellipses on wrists
    // fill(255, 0, 0);
    // ellipse(leftWrist.x, leftWrist.y, 30);
    // fill(0, 255, 0);
    // ellipse(rightWrist.x, rightWrist.y, 30);
  }
}
