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
const pianoChords = {
  // C major
  cMajChords: [
    ["C3", "E3", "G3"],
    ["D3", "F3", "A3"],
    ["E3", "G3", "B3"],
    ["F3", "A3", "C3"],
    ["G3", "B3", "D3"],
    ["A3", "C3", "E3"],
  ],
  // C minor
  cMinChords: [
    ["G2", "Eb3", "C3"],
    ["Ab2", "F3", "D3"],
    ["Bb2", "G3", "Eb3"],
    ["C2", "Ab3", "F3"],
    ["D2", "Bb3", "G3"],
    ["Eb2", "C3", "Ab3"],
  ],
  // D major
  dMajChords: [
    ["D2", "F#3", "A3"],
    ["E3", "G3", "B3"],
    ["F#3", "A3", "C#3"],
    ["G3", "B3", "D4"],
    ["A2", "C#3", "E3"],
    ["B3", "D3", "F#3"],
  ],
  // D minor
  dMinChords: [
    ["A3", "F3", "D3"],
    ["Bb3", "G3", "E3"],
    ["C3", "A3", "F3"],
    ["D3", "Bb3", "G3"],
    ["E3", "C3", "A3"],
    ["F3", "D3", "Bb3"],
  ],
  // E major
  eMajChords: [
    ["B3", "G#3", "E3"],
    ["C#3", "A3", "F#3"],
    ["D#3", "B3", "G#3"],
    ["E3", "C#3", "A3"],
    ["F#3", "D#3", "B3"],
    ["G#3", "E3", "C#3"],
  ],
  // E minor
  eMinChords: [
    ["B3", "G3", "E3"],
    ["C3", "A3", "F#3"],
    ["D3", "B3", "G3"],
    ["E3", "C3", "A3"],
    ["F#3", "D3", "B3"],
    ["G3", "E3", "C3"],
  ],
  // F major
  fMajChords: [
    ["D3", "F#3", "A3"],
    ["E3", "G3", "B3"],
    ["F#3", "A3", "C#3"],
    ["G3", "B3", "D3"],
    ["A3", "C#3", "E3"],
    ["B3", "D3", "F#3"],
  ],
  // F minor
  fMinChords: [
    ["C3", "Ab3", "F3"],
    ["Db3", "Bb3", "G3"],
    ["Eb3", "C3", "Ab3"],
    ["F3", "Db3", "Bb3"],
    ["G3", "Eb3", "C3"],
    ["Ab3", "F3", "Db3"],
  ],
  // Jazzy chords from: https://www.openstudiojazz.com/5-easy-jazz-piano-chords-that-sound-great
  jazzyChords: [
    ["C3", "E3", "A3", "D4", "G4"],
    ["C3", "Eb3", "Bb3", "D4", "F4"],
    ["C3", "E3", "Bb3", "D4", "G4"],
    ["C3", "E3", "Bb3", "D4", "F#4"],
    ["C3", "E3", "Bb3", "D#4", "G4"],
  ],
};

const dateData = new Date();

// Variables that can influence the mood
let moodData = {
  currentDate: dateData.getDate(), // Todays date
  currentTime: dateData.getHours(), // The current hour
  fourCountsPlayed: 0, // How many four counts have been played
  lowNotesWristDist: 200, // Maximum wrist distance for a not to qualify as low
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
  chords: pianoChords.dMajChords,
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

function setPianoMood() {
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

  // Probably don't need
  // pianoMood.currentChord = 0;
  // Get number from something

  // Chord repetitions
  let newChordReps = 1 + floor(noise(0.4 * moodData.fourCountsPlayed) * 4);
  pianoMood.chordReps = newChordReps;
  console.log(pianoMood.chordReps);
  // This migh be done in playPiano() first if-stack
  // chordTimesPlayd = 0;
  // chords = "scale of triads probably";
  // chordProg = "array of four numbersi inside the scale array chords";
  // chordLength = "between like 4n, 8n, and 16n  is probably best";
  // Reset chordProgTimesPlayd and set new chordProgReps
  // pianoMood.chordProgTimesPlayed = 0;
  // pianoMood.chordProgReps = "how many new reps";
  // pianoMood.chordBeatPlay = "1, 2 or 4?";
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

  // TestChord
  // synthPiano.triggerAttackRelease(["C3", "Eb3", "Bb3", "D4", "F4"], "4n");
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
    }
  },
  [1, 2, 3, 4],
  "8n"
);

// set base BPM
Tone.Transport.bpm.value = setBaseBpm();

function draw() {
  background(220);
  translate(width, 0);
  scale(-1, 1);
  image(video, 0, 0);

  if (Tone.Transport.state === "started") {
    sequenceDrums.start();
    sequencePiano.start();
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

    synthOne.set({ detune: wristDist * 3 });

    // Record playing data for future "mood" changes
    if (synthIsPlaying) {
      if (wristDist <= moodData.lowNotesWristDist) {
        moodData.lowNotesPlayTime++;
      } else if (wristDist >= moodData.highNotesWristDist) {
        moodData.highNotesPlayTime++;
      }
    }

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
