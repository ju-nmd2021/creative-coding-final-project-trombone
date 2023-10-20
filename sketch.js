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
let poseNetModelLoadedStatus = false;
let faceMeshLoadedStatus = false;
let synthIsPlaying = false;

let reverb = new Tone.Freeverb(0.5).toDestination();
let vibrato = new Tone.Vibrato(3, 0.3).connect(reverb);
let drumsVolume = new Tone.Volume(-17).toDestination();

const dateData = new Date();

let synthOne = new Tone.PolySynth({
  oscillator: {
    type: "sine",
  },
  detune: 0,
}).connect(vibrato);

function setup() {
  createCanvas(window.innerWidth, 480);
  angleMode(DEGREES);
  textSize(80);
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
  face = ml5.facemesh(videoTwo, facemeshLoaded);
  face.on("predict", gotFace);
}

// Does something when PoseNet is loaded
function modelLoaded() {
  poseNetModelLoadedStatus = true;
  console.log("PoseNet is ready!");
}

// Puts the poses from PoseNet in the variable "pose"
function gotPoses(poses) {
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
  faceMeshLoadedStatus = true;
  console.log("facemesh is ready!");
}

// Starts Tone.js when clicking the screen
window.addEventListener("click", function () {
  setNewPossibleChordLengths();
  setPianoMood();
  Tone.Transport.start();
  Tone.start();
});

// Play and Change volume depending on mouth opening
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
        // console.log("Trombone-on my brother!");
        synthOne.triggerAttack(["C3"]);

        synthIsPlaying = true;
      } else if (verticalLipDist / horizontalLipDist < 0.1 && synthIsPlaying) {
        // console.log("Trombone be gone!");
        synthOne.triggerRelease(["C3"]);
        synthIsPlaying = false;
      }

      // Set volume depending on how open the mouth is
      synthOne.volume.value = 10 * (verticalLipDist / horizontalLipDist) - 10;
    }
  }
}

// Video tutorial reference: https://www.youtube.com/watch?v=xBQef0fs-_Q&ab_channel=ShaiUI
let synthPiano = new Tone.PolySynth({
  volume: -15,
}).toDestination();
let playerKick = new Tone.Player(
  "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/505/kick.mp3"
).connect(drumsVolume);
let playerSnare = new Tone.Player(
  "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/505/snare.mp3"
).connect(drumsVolume);
let playerHihat = new Tone.Player(
  "https://cdn.jsdelivr.net/gh/Tonejs/Tone.js/examples/audio/505/hh.mp3"
).connect(drumsVolume);

// Reduce some latency
Tone.context.latencyHint = "fastest";

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
);

// Diatonic chords
const pianoChordsMajor = [
  // C major
  [
    ["C3", "E3", "G3"],
    ["D3", "F3", "A3"],
    ["E3", "G3", "B3"],
    ["F3", "A3", "C3"],
    ["G3", "B3", "D3"],
    ["A3", "C3", "E3"],
  ],
  // D major
  [
    ["D2", "F#3", "A3"],
    ["E3", "G3", "B3"],
    ["F#3", "A3", "C#3"],
    ["G3", "B3", "D4"],
    ["A2", "C#3", "E3"],
    ["B3", "D3", "F#3"],
  ],
  // E major
  [
    ["B3", "G#3", "E3"],
    ["C#3", "A3", "F#3"],
    ["D#3", "B3", "G#3"],
    ["E3", "C#3", "A3"],
    ["F#3", "D#3", "B3"],
    ["G#3", "E3", "C#3"],
  ],
  // F major
  [
    ["D3", "F#3", "A3"],
    ["E3", "G3", "B3"],
    ["F#3", "A3", "C#3"],
    ["G3", "B3", "D3"],
    ["A3", "C#3", "E3"],
    ["B3", "D3", "F#3"],
  ],
  // G major
  [
    ["D4", "B3", "G3"],
    ["A3", "C4", "E4"],
    ["B3", "D4", "F#4"],
    ["C4", "E4", "G4"],
    ["D4", "F#4", "A4"],
    ["E4", "G3", "B3"],
  ],
];

const pianoChordsMinor = [
  // C minor
  [
    ["G2", "Eb3", "C3"],
    ["Ab2", "F3", "D3"],
    ["Bb2", "G3", "Eb3"],
    ["C2", "Ab3", "F3"],
    ["D2", "Bb3", "G3"],
    ["Eb2", "C3", "Ab3"],
  ],
  // D minor
  [
    ["A3", "F3", "D3"],
    ["Bb3", "G3", "E3"],
    ["C3", "A3", "F3"],
    ["D3", "Bb3", "G3"],
    ["E3", "C3", "A3"],
    ["F3", "D3", "Bb3"],
  ],
  // E minor
  [
    ["B3", "G3", "E3"],
    ["C3", "A3", "F#3"],
    ["D3", "B3", "G3"],
    ["E3", "C3", "A3"],
    ["F#3", "D3", "B3"],
    ["G3", "E3", "C3"],
  ],
  // F minor
  [
    ["C3", "Ab3", "F3"],
    ["Db3", "Bb3", "G3"],
    ["Eb3", "C3", "Ab3"],
    ["F3", "Db3", "Bb3"],
    ["G3", "Eb3", "C3"],
    ["Ab3", "F3", "Db3"],
  ],
  // G minor
  [
    ["G3", "Bb3", "D4"],
    ["A3", "C4", "Eb4"],
    ["Bb3", "D4", "F4"],
    ["C4", "Eb4", "G4"],
    ["D4", "F4", "A3"],
    ["Eb3", "G3", "Bb3"],
  ],
];
const pianoChordsJazz = [
  // Jazzy chords from: https://www.openstudiojazz.com/5-easy-jazz-piano-chords-that-sound-great
  [
    ["C3", "E3", "A3", "D4", "G4"],
    ["C3", "Eb3", "Bb3", "D4", "F4"],
    ["C3", "E3", "Bb3", "D4", "G4"],
    ["C3", "E3", "Bb3", "D4", "F#4"],
    ["C3", "E3", "Bb3", "D#4", "G4"],
  ],
];

// Variables that can influence the mood
let moodData = {
  currentDate: dateData.getDate(), // Todays date
  currentTime: dateData.getHours(), // The current hour
  fourCountsPlayed: 0, // How many four counts have been played
  possiblChordLengths: ["16n", "8n", "4n", "2n"],
  chordLengthsToPlay: [],
  chordLengthsSwitch: 0,
  chordLengthsSwitchCounter: 0,
  lowNotesWristDist: 230, // Maximum wrist distance for a not to qualify as low
  highNotesWristDist: 400, // Minmum wrist distance for a not to qualify as high
  lowNotesPlayTime: 0, // How long has "low" "trombone" notes been played
  highNotesPlayTime: 0, // How long has "high" "trombone" notes been played
  minimumBpm: 60,
  maximumBpm: 120,
  tempoChange: 1,
};

// Variables that effect the pianos playing
let pianoMood = {
  currentChord: 0,
  chordReps: 3,
  chordTimesPlayed: 0,
  chords: pianoChordsMinor[0],
  chordProg: [0, 1, 3, 4],
  chordLength: "16n",
  chordProgReps: 4,
  chordProgTimesPlayed: 0,
  chordBeatPlay: 4,
};

function setBaseBpm() {
  return moodData.minimumBpm + moodData.currentDate;
}

function mostPlayedNotes() {
  if (moodData.lowNotesPlayTime === moodData.highNotesPlayTime) {
    return;
  } else if (moodData.lowNotesPlayTime > moodData.highNotesPlayTime) {
    return "low";
  } else if (moodData.lowNotesPlayTime < moodData.highNotesPlayTime) {
    return "high";
  }
}

// Return "major" or "minor", chance depending on time of day.
// Higher chance of major early in the day and a small chance to return "jazzy"
function playMajorOrMinor() {
  if (Math.floor(Math.random() * 100) === 1) {
    return "jazzy";
  }
  const randomHour = Math.floor(Math.random() * 24);
  if (randomHour > moodData.currentTime) {
    return "major";
  } else {
    return "minor";
  }
}

function setNewPossibleChordLengths() {
  moodData.chordLengthsSwitchCounter = 0;
  moodData.chordLengthsSwitch = 10 + Math.floor(Math.random() * 21);
  moodData.chordLengthsToPlay = [];
  for (let i = 0; i < moodData.possiblChordLengths.length; i++) {
    moodData.chordLengthsToPlay.push(
      moodData.possiblChordLengths[
        Math.floor(Math.random() * moodData.possiblChordLengths.length)
      ]
    );
  }
  console.log(
    "switching possible chordlengths to: " + moodData.chordLengthsToPlay
  );
}

function setPianoMood() {
  console.log("Setting piano mood");

  // BPM
  let newBpm = Tone.Transport.bpm.value;
  if (mostPlayedNotes() == "low") {
    newBpm -= moodData.tempoChange;
  } else if (mostPlayedNotes() == "high") {
    newBpm += moodData.tempoChange;
  }
  if (newBpm < moodData.minimumBpm) {
    newBpm = moodData.minimumBpm;
  } else if (newBpm > moodData.maximumBpm) {
    newBpm = moodData.maximumBpm;
  }
  Tone.Transport.bpm.value = newBpm;

  // Chord repetitions
  let newChordReps = 1 + floor(noise(0.4 * moodData.fourCountsPlayed) * 4);
  pianoMood.chordReps = newChordReps;

  // What collection of chords to draw on
  if (playMajorOrMinor() == "major") {
    // Pick random array from pianoChordsMajor
    pianoMood.chords =
      pianoChordsMajor[Math.floor(Math.random() * pianoChordsMajor.length)];
  } else if (playMajorOrMinor() == "minor") {
    pianoMood.chords =
      pianoChordsMinor[Math.floor(Math.random() * pianoChordsMinor.length)];
  } else if (playMajorOrMinor() == "jazzy") {
    pianoMood.chords = pianoChordsJazz[0];
  }

  // Chord progression
  let newChordProg = [];
  const nrOfChords = 1 + Math.floor(Math.random() * 4);
  for (let i = 0; i < nrOfChords; i++) {
    newChordProg.push(Math.floor(Math.random() * pianoMood.chords.length));
  }
  pianoMood.chordProg = newChordProg;

  // ChordLength
  // Every time fourCountPlayed has reached x * fourLengthsSwitch: change what chord lengths can be played
  // prettier-ignore
  if (moodData.chordLengthsSwitchCounter >= moodData.chordLengthsSwitch) {
    setNewPossibleChordLengths();
  }
  pianoMood.chordLength =
    moodData.chordLengthsToPlay[
      Math.floor(Math.random() * moodData.chordLengthsToPlay.length)
    ];

  // Reset chordProgTimesPlayd and set new chordProgReps
  pianoMood.chordProgTimesPlayed = 0;

  // For how many four-counts should the chord progression be played
  let newChordProgReps = 0;
  if (pianoMood.highNotesPlayTime > pianoMood.lowNotesPlayTime) {
    newChordProgReps += 4;
  } else if (pianoMood.highNotesPlayTime < pianoMood.lowNotesPlayTime) {
    newChordProgReps += 2;
  }
  newChordProgReps += Math.floor(Math.random() * 4);
  if (newChordProgReps % 2 != 0) {
    newChordProgReps++;
  }
  pianoMood.chordProgReps = newChordProgReps;

  // On what beats should the piano play: first, first and third, or all four.
  let newChordBeatPlay = Math.floor(Math.random() * 3) + 1;
  if (newChordBeatPlay == 3) {
    newChordBeatPlay = 4;
  }
  pianoMood.chordBeatPlay = newChordBeatPlay;
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

// Every chord repetition
function lastPianoChord() {
  pianoMood.chordProgTimesPlayed++;
  // If the piano has played chords for the set amout of repetitions: change playstyle
  if (pianoMood.chordProgTimesPlayed >= pianoMood.chordProgReps) {
    setPianoMood();
  }
}

// Play the piano and change how it is played after it has playd a certain amout of repetitions
let sequencePiano = new Tone.Sequence(
  (time, note) => {
    if (note === 1) {
      playPiano();
      if (pianoMood.chordBeatPlay === 1) {
        lastPianoChord();
      }
    }
    if (note === 2) {
      if (pianoMood.chordBeatPlay === 4) {
        playPiano();
      }
    }
    if (note === 3) {
      if (pianoMood.chordBeatPlay === 2) {
        playPiano();
        lastPianoChord();
      } else if (pianoMood.chordBeatPlay === 4) {
        playPiano();
      }
    }
    if (note === 4) {
      if (pianoMood.chordBeatPlay === 4) {
        playPiano();
        lastPianoChord();
      }
      // Record playing data for future "mood" changes
      moodData.fourCountsPlayed++;
      moodData.chordLengthsSwitchCounter++;
    }
  },
  [1, 2, 3, 4],
  "8n"
);

// set base BPM
Tone.Transport.bpm.value = setBaseBpm();

function draw() {
  textFont("Comic Neue");
  background(220);
  translate(width - (width - 640) / 2, 0);
  scale(-1, 1);
  if (poseNetModelLoadedStatus && faceMeshLoadedStatus) {
    image(video, 0, 0);
    if (Tone.Transport.state != "started") {
      push();
      strokeWeight(0);
      fill(200, 200, 200, 200);
      rect(-width, 0, width * 2, height);
      pop();
      push();
      translate(width, 0);
      scale(-1, 1);
      text("Click to start", width / 2 - 100, height / 2 + 20);
      pop();
    }
  } else {
    push();
    translate(width, 0);
    scale(-1, 1);
    text("Loading", width / 2, height / 2 + 20);
    pop();
  }

  if (Tone.Transport.state === "started") {
    // Start drums and piano
    sequenceDrums.start();
    sequencePiano.start();
    // Set initial piano mood
  }

  if (faceReady) {
    playTrombone();
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

    synthOne.set({ detune: wristDist * 2 });

    // Record playing data for future "mood" changes
    if (synthIsPlaying) {
      if (wristDist <= moodData.lowNotesWristDist) {
        moodData.lowNotesPlayTime++;
      } else if (wristDist >= moodData.highNotesWristDist) {
        moodData.highNotesPlayTime++;
      }
    }

    if (Tone.Transport.state === "started") {
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
    }

    // Draws ellipses on wrists
    // fill(255, 0, 0);
    // ellipse(leftWrist.x, leftWrist.y, 30);
    // fill(0, 255, 0);
    // ellipse(rightWrist.x, rightWrist.y, 30);
  }
}
