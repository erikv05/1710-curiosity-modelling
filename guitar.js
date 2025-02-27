require('d3')
require('tone')

// clear the svg
d3.selectAll("svg > *").remove();
// set up tone synth
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
const FRET_MARKER_POSITIONS = [3, 5, 7, 9, 12]; // Frets that typically have markers
const NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

/*
 * Music helpers
 */

/**
 * Converts a note index (0-11) to a note name
 * @param {number} index - Note index from 0 (C) to 11 (B)
 * @return {string} Note name
 */
function indexToNote(index) {
  return NOTES[index % 12];
}

/**
 * Gets note name and octave at a specific fret position
 * @param {number} startNoteIndex - Index of the open string note
 * @param {number} fret - Fret number
 * @param {number} stringIndex - String index (1-based, from top to bottom)
 * @return {string} Note name with octave
 */
function getNoteAtPosition(startNoteIndex, fret, stringIndex) {
  const noteIndex = (startNoteIndex + fret) % 12;
  // Calculate octave (approximation)
  const baseOctave = 2 + Math.floor((6 - stringIndex) / 2);
  const octaveShift = Math.floor((startNoteIndex + fret) / 12);
  return NOTES[noteIndex] + (baseOctave + octaveShift);
}

/**
 * Draws the guitar fretboard
 * @param {Object[]} strings - Array of String objects from the Forge model
 */
function drawFretboard(strings) {
  // Draw fretboard background
  d3.select(svg)
    .append("rect")
    .attr("x", FRETBOARD_LEFT)
    .attr("y", FRETBOARD_TOP)
    .attr("width", FRETBOARD_WIDTH)
    .attr("height", FRETBOARD_HEIGHT)
    .attr("fill", "#d5a06e")
    .attr("stroke", "black");

  // Draw frets
  for (let i = 0; i <= FRET_COUNT; i++) {
    const x = FRETBOARD_LEFT + i * FRET_SPACING;
    
    // Draw fret line (except for "nut" at position 0)
    if (i > 0) {
      d3.select(svg)
        .append("line")
        .attr("x1", x)
        .attr("y1", FRETBOARD_TOP)
        .attr("x2", x)
        .attr("y2", FRETBOARD_TOP + FRETBOARD_HEIGHT)
        .attr("stroke", "#888")
        .attr("stroke-width", i === 0 ? 5 : 2);
    }
    
    // Draw fret number
    if (i > 0) {
      d3.select(svg)
        .append("text")
        .attr("x", FRETBOARD_LEFT + (i - 0.5) * FRET_SPACING)
        .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 30)
        .attr("text-anchor", "middle")
        .text(i);
    }
  }
  
  // Draw fret markers
  for (const pos of FRET_MARKER_POSITIONS) {
    const x = FRETBOARD_LEFT + (pos - 0.5) * FRET_SPACING;
    const y = FRETBOARD_TOP + FRETBOARD_HEIGHT / 2;
    
    // For the 12th fret, draw double dots
    if (pos === 12) {
      d3.select(svg)
        .append("circle")
        .attr("cx", x)
        .attr("cy", y - 30)
        .attr("r", 8)
        .attr("fill", "#ccc");
        
      d3.select(svg)
        .append("circle")
        .attr("cx", x)
        .attr("cy", y + 30)
        .attr("r", 8)
        .attr("fill", "#ccc");
    } else {
      d3.select(svg)
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 8)
        .attr("fill", "#ccc");
    }
  }

  // Draw strings with open string notes
  for (let i = 0; i < strings.length; i++) {
    const stringIndex = i + 1;
    const y = FRETBOARD_TOP + i * STRING_SPACING;
    
    d3.select(svg)
      .append("line")
      .attr("x1", FRETBOARD_LEFT)
      .attr("y1", y)
      .attr("x2", FRETBOARD_LEFT + FRETBOARD_WIDTH)
      .attr("y2", y)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2 + (STRING_COUNT - i) * 0.4);
    
    // Get the starting note position for this string
    const string = strings[i];
    const openStringInterval = string.stringStart;
    const openStringNote = getOpenStringNote(openStringInterval, stringIndex); // Added stringIndex parameter
    
    // String name/note label for open string
    d3.select(svg)
      .append("text")
      .attr("x", FRETBOARD_LEFT - 20)
      .attr("y", y + 5)
      .attr("text-anchor", "middle")
      .attr("font-weight", "bold")
      .text(openStringNote);
  }
  
  // Draw tuning legend
  const legend = d3.select(svg)
    .append("g")
    .attr("transform", `translate(${FRETBOARD_LEFT}, ${FRETBOARD_TOP - 80})`);
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("font-weight", "bold")
    .text("Guitar String Tuning:");
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .text("Perfect 4th between all strings (5 half steps)");
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .text("except Major 3rd between strings 3-2 (4 half steps)");
}

/**
 * Determines the open string note based on the interval
 * @param {Object} interval - Starting interval for the string
 * @param {number} stringIndex - The 1-based index of the string
 * @return {string} Note name
 */
function getOpenStringNote(interval, stringIndex) {
  const openStringPos = interval.pos._id;
  const openNoteIndex = openStringPos - 1;
  const baseOctave = 2 + Math.floor((6 - stringIndex) / 2);
  return NOTES[openNoteIndex % 12] + baseOctave;
}


/**
 * Draws playable frets on the fretboard
 * @param {Object[]} strings - Array of String objects from the Forge model
 */
function drawPlayableFrets(strings, playedNotes) {
  // Create a lookup map for played notes to efficiently check if a note is played
  const playedNoteMap = {};
  playedNotes.forEach(note => {
    const stringId = note.string._id;
    const fretNum = note.fret._id;
    if (!playedNoteMap[stringId]) {
      playedNoteMap[stringId] = [];
    }
    playedNoteMap[stringId].push(fretNum);
  });
  
  // Store all played notes for the play button
  const playedNotesToPlay = [];
  
  // For each string in the model
  for (let i = 0; i < strings.length; i++) {
    const string = strings[i];
    const stringIndex = i + 1; // 1-based index for the string
    const y = FRETBOARD_TOP + i * STRING_SPACING; // Y position for the string
    
    // Get the starting note for this string
    const openStringInterval = string.stringStart;
    const openStringPos = openStringInterval.pos._id;
    const openNoteIndex = openStringPos - 1; // Assuming interval positions are 1-based
    
    // For each fret (including open string at position 0)
    for (let fret = 0; fret <= 12; fret++) {
      const x = FRETBOARD_LEFT + fret * FRET_SPACING - (fret === 0 ? FRET_SPACING/2 : 0);
      
      // Calculate the note at this fret position
      const noteAtFret = getNoteAtPosition(openNoteIndex, fret, stringIndex);
      
      // Check if this note is being played in the model
      const isPlayed = playedNoteMap[string._id] && playedNoteMap[string._id].includes(fret);
      
      if (isPlayed) {
        playedNotesToPlay.push(noteAtFret);
      }
      
      if (fret > 0) { // Don't draw circle for open string (fret 0)
        // Draw playable note marker
        d3.select(svg)
          .append("circle")
          .attr("cx", x - (fret === 0 ? 0 : FRET_SPACING/2))
          .attr("cy", y)
          .attr("r", 10)
          .attr("fill", isPlayed ? "#e74c3c" : "#2980b9") // Red for played notes, blue for others
          .attr("stroke", "black")
          .attr("stroke-width", isPlayed ? 2 : 1) // Thicker stroke for played notes
          .attr("cursor", "pointer")
          .attr("opacity", isPlayed ? 1.0 : 0.7) // Full opacity for played notes
          .on("click", () => {
            // Play the note when clicked
            synth.triggerAttackRelease(noteAtFret, "8n");
          })
          .append("title")
          .text(`Note: ${noteAtFret}${isPlayed ? " (Played in model)" : ""}`);
      } else {
        // For open string, just add click handler to the string label area
        d3.select(svg)
          .append("rect")
          .attr("x", FRETBOARD_LEFT - 40)
          .attr("y", y - 10)
          .attr("width", 40)
          .attr("height", 20)
          .attr("fill", isPlayed ? "rgba(231, 76, 60, 0.3)" : "transparent") // Light red background if played
          .attr("cursor", "pointer")
          .on("click", () => {
            // Play the open string note when clicked
            synth.triggerAttackRelease(noteAtFret, "8n");
          })
          .append("title")
          .text(`Open string: ${noteAtFret}${isPlayed ? " (Played in model)" : ""}`);
      }
    }
  }
  
  // Add a "Play Notes" button if there are played notes
  if (playedNotesToPlay.length > 0) {
    // Create a polyphonic synth for playing multiple notes
    const polySynth = new tone.PolySynth(tone.Synth).toDestination();
    
    // Add button 
    d3.select(svg)
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
        // Play all notes simultaneously
        polySynth.triggerAttackRelease(playedNotesToPlay, "4n");
      });
    
    // Add button label
    d3.select(svg)
      .append("text")
      .attr("x", FRETBOARD_LEFT + FRETBOARD_WIDTH - 50)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 70)
      .attr("text-anchor", "middle")
      .attr("fill", "white")
      .attr("font-weight", "bold")
      .attr("pointer-events", "none")
      .text("Play Notes");
    
    d3.select(svg)
      .append("text")
      .attr("x", FRETBOARD_LEFT)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 80)
      .attr("fill", "#e74c3c")
      .attr("font-weight", "bold")
      .text(`Highlighted notes from model: ${playedNotesToPlay.join(", ")}`);
  }
}

/**
 * Main viz function
 */
function visualizeGuitar() {
  // Make sure the SVG is sized appropriately
  d3.select(svg)
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);
    
  // Get all the strings from the model
  let strings = String.atoms(true);
  
  // Get all played notes from the model
  const playedNotes = PlayedNote.atoms(true);
  
  // Draw the basic fretboard
strings = [...strings].sort((a, b) => a.stringPos._id - b.stringPos._id);

// Draw the basic fretboard
drawFretboard(strings);
  
  // Draw playable frets, now incluting played notes
  drawPlayableFrets(strings, playedNotes);
  
  // Title for the visualization
  d3.select(svg)
    .append("text")
    .attr("x", SVG_WIDTH / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text("Guitar Fretboard Visualization");
    
  // Instructions
  d3.select(svg)
    .append("text")
    .attr("x", FRETBOARD_LEFT)
    .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 60)
    .attr("font-style", "italic")
    .text("Click on any fret or open string to play the note");
    
  console.log("Guitar visualization complete with", playedNotes.length, "played notes from model");
}

// Call the main visualization function
visualizeGuitar();
