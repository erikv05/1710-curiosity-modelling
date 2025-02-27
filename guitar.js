require('d3');
require('tone');

// clear the svg
d3.selectAll("svg > *").remove();

// set up Tone synth
const synth = new tone.Synth().toDestination();

/*
 * Viz constants
 */
const SVG_WIDTH = 800;
const SVG_HEIGHT = 500;
const FRETBOARD_LEFT = 100;
const FRETBOARD_TOP = 100;
const FRETBOARD_WIDTH = 600;
const FRETBOARD_HEIGHT = 200;
const STRING_COUNT = 6;
const FRET_COUNT = 12;
const STRING_SPACING = FRETBOARD_HEIGHT / (STRING_COUNT - 1);
const FRET_SPACING = FRETBOARD_WIDTH / FRET_COUNT;
const FRET_MARKER_POSITIONS = [3, 5, 7, 9, 12];
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/*
 * Standard tuning mapping.
 * We assume that each String object has a property "stringPos._id" such that:
 *   stringPos 6 => Low E (E2)
 *   stringPos 5 => A2
 *   stringPos 4 => D3
 *   stringPos 3 => G3
 *   stringPos 2 => B3
 *   stringPos 1 => High E (E4)
 *
 * When drawing the fretboard we sort in ascending order so that the highest pitch (E4)
 * is at the top and the lowest pitch (E2) is at the bottom.
 */
function getOpenStringNote(string) {
  const tuning = {
    6: "E2",
    5: "A2",
    4: "D3",
    3: "G3",
    2: "B3",
    1: "E4"
  };
  return tuning[string.stringPos._id] || "E4";
}

/*
 * Given an open note (e.g. "E4") and a fret number, compute the note at that fret.
 */
function getNoteAtFret(openNote, fret) {
  const noteRegex = /^([A-G]#?)(\d)$/;
  const match = openNote.match(noteRegex);
  if (!match) return openNote;
  const openLetter = match[1];
  const openOctave = parseInt(match[2]);
  const openIndex = NOTES.indexOf(openLetter);
  const totalSemitones = openIndex + fret;
  const noteIndex = totalSemitones % 12;
  const octaveShift = Math.floor(totalSemitones / 12);
  return NOTES[noteIndex] + (openOctave + octaveShift);
}

/*
 * Draws the guitar fretboard background, frets, markers, and string labels.
 */
function drawFretboard(strings) {
  // Draw the fretboard background
  d3.select("svg")
    .append("rect")
    .attr("x", FRETBOARD_LEFT)
    .attr("y", FRETBOARD_TOP)
    .attr("width", FRETBOARD_WIDTH)
    .attr("height", FRETBOARD_HEIGHT)
    .attr("fill", "#d5a06e")
    .attr("stroke", "black");

  // Draw frets and fret numbers
  for (let i = 0; i <= FRET_COUNT; i++) {
    const x = FRETBOARD_LEFT + i * FRET_SPACING;
    if (i > 0) {
      d3.select("svg")
        .append("line")
        .attr("x1", x)
        .attr("y1", FRETBOARD_TOP)
        .attr("x2", x)
        .attr("y2", FRETBOARD_TOP + FRETBOARD_HEIGHT)
        .attr("stroke", "#888")
        .attr("stroke-width", 2);
    }
    if (i > 0) {
      d3.select("svg")
        .append("text")
        .attr("x", FRETBOARD_LEFT + (i - 0.5) * FRET_SPACING)
        .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 30)
        .attr("text-anchor", "middle")
        .text(i);
    }
  }

  // Draw fret markers (dots)
  for (const pos of FRET_MARKER_POSITIONS) {
    const x = FRETBOARD_LEFT + (pos - 0.5) * FRET_SPACING;
    const y = FRETBOARD_TOP + FRETBOARD_HEIGHT / 2;
    if (pos === 12) {
      // 12th fret gets two dots
      d3.select("svg")
        .append("circle")
        .attr("cx", x)
        .attr("cy", y - 30)
        .attr("r", 8)
        .attr("fill", "#ccc");
      d3.select("svg")
        .append("circle")
        .attr("cx", x)
        .attr("cy", y + 30)
        .attr("r", 8)
        .attr("fill", "#ccc");
    } else {
      d3.select("svg")
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 8)
        .attr("fill", "#ccc");
    }
  }

  // Sort strings in ascending order so that string 1 (E4) is at the top and string 6 (E2) is at the bottom
  const sortedStrings = [...strings].sort((a, b) => a.stringPos._id - b.stringPos._id);
  
  // Draw each string line and label it with its open note
  sortedStrings.forEach((string, i) => {
    const y = FRETBOARD_TOP + i * STRING_SPACING;
    d3.select("svg")
      .append("line")
      .attr("x1", FRETBOARD_LEFT)
      .attr("y1", y)
      .attr("x2", FRETBOARD_LEFT + FRETBOARD_WIDTH)
      .attr("y2", y)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2 + (STRING_COUNT - i) * 0.4);
      
    const openNote = getOpenStringNote(string);
    d3.select("svg")
      .append("text")
      .attr("x", FRETBOARD_LEFT - 20)
      .attr("y", y + 5)
      .attr("text-anchor", "end")
      .attr("font-weight", "bold")
      .text(openNote);
  });

  // Tuning legend
  const legend = d3.select("svg")
    .append("g")
    .attr("transform", `translate(${FRETBOARD_LEFT}, ${FRETBOARD_TOP - 80})`);
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("font-weight", "bold")
    .text("Guitar String Tuning (Standard): E2, A2, D3, G3, B3, E4");
}

/*
 * Draws the playable fret markers and adds click handlers to play notes.
 */
function drawPlayableFrets(strings, playedNotes) {
  // Create a lookup for played notes for quick checking
  const playedNoteMap = {};
  playedNotes.forEach(note => {
    const stringId = note.string._id;
    const fretNum = note.fret._id;
    if (!playedNoteMap[stringId]) {
      playedNoteMap[stringId] = [];
    }
    playedNoteMap[stringId].push(fretNum);
  });
  
  // Gather played note names for the "Play Notes" button
  const playedNotesToPlay = [];
  
  // Sort strings in ascending order so that string 1 (E4) is at the top and string 6 (E2) is at the bottom
  const sortedStrings = [...strings].sort((a, b) => a.stringPos._id - b.stringPos._id);
  
  sortedStrings.forEach((string, i) => {
    const y = FRETBOARD_TOP + i * STRING_SPACING;
    const openNote = getOpenStringNote(string);
    
    for (let fret = 0; fret <= FRET_COUNT; fret++) {
      // Compute x position; for open string (fret 0) we adjust so it sits left of the fretboard
      let x;
      if (fret === 0) {
        x = FRETBOARD_LEFT - 40;
      } else {
        x = FRETBOARD_LEFT + fret * FRET_SPACING - FRET_SPACING / 2;
      }
      
      // Determine the note at this fret
      const noteAtFret = getNoteAtFret(openNote, fret);
      
      // Check if this note is marked as played in the model
      const isPlayed = playedNoteMap[string._id] && playedNoteMap[string._id].includes(fret);
      if (isPlayed) {
        playedNotesToPlay.push(noteAtFret);
      }
      
      if (fret > 0) {
        // For fretted notes, draw a circle marker
        d3.select("svg")
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", 10)
          .attr("fill", isPlayed ? "#e74c3c" : "#2980b9")
          .attr("stroke", "black")
          .attr("stroke-width", isPlayed ? 2 : 1)
          .attr("cursor", "pointer")
          .attr("opacity", isPlayed ? 1.0 : 0.7)
          .on("click", () => {
            synth.triggerAttackRelease(noteAtFret, "8n");
          })
          .append("title")
          .text(`Note: ${noteAtFret}${isPlayed ? " (Played in model)" : ""}`);
      } else {
        // For the open string, add a clickable rectangle
        d3.select("svg")
          .append("rect")
          .attr("x", x)
          .attr("y", y - 10)
          .attr("width", 40)
          .attr("height", 20)
          .attr("fill", isPlayed ? "rgba(231, 76, 60, 0.3)" : "transparent")
          .attr("cursor", "pointer")
          .on("click", () => {
            synth.triggerAttackRelease(noteAtFret, "8n");
          })
          .append("title")
          .text(`Open string: ${noteAtFret}${isPlayed ? " (Played in model)" : ""}`);
      }
    }
  });
  
  // If any played notes exist, add a "Play Notes" button
  if (playedNotesToPlay.length > 0) {
    const polySynth = new Tone.PolySynth(Tone.Synth).toDestination();
    
    d3.select("svg")
      .append("rect")
      .attr("x", FRETBOARD_LEFT + FRETBOARD_WIDTH - 100)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 50)
      .attr("width", 100)
      .attr("height", 30)
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("fill", "#e74c3c")
      .attr("stroke", "black")
      .attr("cursor", "pointer")
      .on("click", () => {
        polySynth.triggerAttackRelease(playedNotesToPlay, "4n");
      });
      
    d3.select("svg")
      .append("text")
      .attr("x", FRETBOARD_LEFT + FRETBOARD_WIDTH - 50)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 70)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .text("Play Notes");
    
    d3.select("svg")
      .append("text")
      .attr("x", FRETBOARD_LEFT)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 80)
      .attr("fill", "#e74c3c")
      .attr("font-weight", "bold")
      .text(`Highlighted notes from model: ${playedNotesToPlay.join(", ")}`);
  }
}

/*
 * Main viz
 */
function visualizeGuitar() {
  // Size the SVG
  d3.select("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);
    
  // Get all strings and played notes from the model
  let strings = String.atoms(true);
  const playedNotes = PlayedNote.atoms(true);
  
  
  // Sort strings in ascending order so that string 1 (E4) is at the top and string 6 (E2) is at the bottom
  strings = [...strings].sort((a, b) => a.stringPos._id - b.stringPos._id);
  
  // Draw the fretboard and fretted markers
  drawFretboard(strings);
  drawPlayableFrets(strings, playedNotes);
  
  // Title and instructions
  d3.select("svg")
    .append("text")
    .attr("x", SVG_WIDTH / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text("Guitar Fretboard Visualization");
    
  d3.select("svg")
    .append("text")
    .attr("x", FRETBOARD_LEFT)
    .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 60)
    .attr("font-style", "italic")
    .text("Click on any fret or open string to play the note");
    
  console.log("Guitar visualization complete with", playedNotes.length, "played notes from model");
}

// Run the visualization
visualizeGuitar();
