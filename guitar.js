require('d3')
require('tone')

// clear the svg
d3.selectAll("svg > *").remove();
// set up tone synth
const synth = new tone.Synth().toDestination();
// used for rendering and as a base for offset
const lowestNote = "E2";

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
const STANDARD_TUNING = [4, 11, 7, 2, 9, 4]; // E(4) A(9) D(2) G(7) B(11) E(4) in reverse order (low to high)

/*
 * Muic helpers
 */

/**
 * Returns the note at a given string and fret position
 * @param {number} stringIdx - 0-based string index (0 = lowest E string)
 * @param {number} fret - fret number (0 = open string)
 * @return {string} Note name with octave
 */
function getNoteAtPosition(stringIdx, fret) {
  const openStringNote = STANDARD_TUNING[stringIdx];
  const noteIdx = (openStringNote + fret) % 12;
  const octave = Math.floor((openStringNote + fret) / 12) + 2 + Math.floor((5 - stringIdx) / 2);
  return NOTES[noteIdx] + octave;
}

/**
 * Checks if the given interval is a half step
 * @param {Object} interval - Interval object from Forge model
 * @return {boolean} True if half step, false otherwise
 */
function isHalfStep(interval) {
    return interval.hs._id == 1;
}

/**
 * Gets the color for a specific interval type
 * @param {Object} interval - Interval object from Forge model
 * @return {string} CSS color string
 */
function getIntervalColor(interval) {
  if (isHalfStep(interval)) {
    return "#e74c3c"; // Red for half-steps
  } else {
    return "#2980b9"; // Blue for whole-steps
  }
}

/**
 * Gets a descriptive label for an interval
 * @param {Object} interval - Interval object from Forge model
 * @return {string} Label description
 */
function getIntervalLabel(interval) {
  if (isHalfStep(interval)) {
    return "H (" + interval.hs._id + ")";
  } else {
    return "W (" + interval.hs._id + ")";
  }
}

/**
 * Calculates the tuning for each string based on intervals from the model
 * @param {Object[]} strings - Array of String objects from the Forge model
 * @return {number[]} Array of note indices for each string
 */
function calculateStringTuning(strings) {
  // Start with the lowest string (E)
  const tuning = [4]; // E note index
  
  // Calculate each subsequent string based on intervals
  // Perfect fourth is 5 half steps, Major third is 4 half steps
  for (let i = 1; i < 6; i++) {
    const interval = (i === 2) ? 4 : 5; // Major third between strings 2-3, Perfect fourth elsewhere
    const prevString = tuning[i-1];
    tuning.push((prevString + interval) % 12);
  }
  
  return tuning;
}

/*
 * DRAWING FUNCTIONS
 */

/**
 * Draws the guitar fretboard
 * @param {number[]} tuning - Array of note indices for each string
 */
function drawFretboard(tuning) {
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
    d3.select(svg)
      .append("text")
      .attr("x", FRETBOARD_LEFT + (i - 0.5) * FRET_SPACING)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 30)
      .attr("text-anchor", "middle")
      .text(i);
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

  // Draw strings with calculated tuning
  for (let i = 0; i < STRING_COUNT; i++) {
    const y = FRETBOARD_TOP + i * STRING_SPACING;
    
    d3.select(svg)
      .append("line")
      .attr("x1", FRETBOARD_LEFT)
      .attr("y1", y)
      .attr("x2", FRETBOARD_LEFT + FRETBOARD_WIDTH)
      .attr("y2", y)
      .attr("stroke", "#aaa")
      .attr("stroke-width", 2 + (STRING_COUNT - i) * 0.4);
      
    // String name/note based on calculated tuning
    const stringNote = NOTES[tuning[i]];
    d3.select(svg)
      .append("text")
      .attr("x", FRETBOARD_LEFT - 20)
      .attr("y", y + 5)
      .attr("text-anchor", "middle")
      .text(stringNote);
  }
  
  // Draw a legend explaining the string tuning intervals
  const legend = d3.select(svg)
    .append("g")
    .attr("transform", `translate(${FRETBOARD_LEFT}, ${FRETBOARD_TOP - 80})`);
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 0)
    .attr("font-weight", "bold")
    .text("String Tuning:");
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .text("Perfect 4th between all strings (5 half steps)");
    
  legend.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .text("except Major 3rd between strings 2-3 (4 half steps)");
}

/**
 * Draw the intervals at the appropriate positions on the fretboard
 * @param {Object[]} strings - Array of String objects from the Forge model
 */
function drawIntervals(strings) {
  // Create a legend for interval types
  const legend = d3.select(svg)
    .append("g")
    .attr("transform", `translate(${FRETBOARD_LEFT}, ${FRETBOARD_TOP - 60})`);
    
  legend.append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#2980b9");
    
  legend.append("text")
    .attr("x", 25)
    .attr("y", 15)
    .text("Whole Step (2)");
    
  legend.append("rect")
    .attr("x", 150)
    .attr("y", 0)
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#e74c3c");
    
  legend.append("text")
    .attr("x", 175)
    .attr("y", 15)
    .text("Half Step (1)");

  // For each string in the model
  for (const string of strings) {
    // Get the index of the string (from the Guitar.strings relation)
    let stringIndex = null;
    for (let i = 1; i <= 6; i++) {
      if (Guitar0.strings[i.toString()] === string) {
        stringIndex = i;
        break;
      }
    }
    
    if (stringIndex === null) continue;
    
    // Get the y position for this string
    const y = FRETBOARD_TOP + (stringIndex - 1) * STRING_SPACING;
    
    // For each fret on this string
    for (let fretNum = 1; fretNum <= 12; fretNum++) {
      const interval = string.frets[fretNum.toString()];
      if (!interval) continue;
      
      const x = FRETBOARD_LEFT + (fretNum - 0.5) * FRET_SPACING;
      
      // Draw interval marker
      d3.select(svg)
        .append("circle")
        .attr("cx", x)
        .attr("cy", y)
        .attr("r", 12)
        .attr("fill", getIntervalColor(interval))
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("cursor", "pointer")
        .on("click", () => {
          // Play the note when clicked
          const note = getNoteAtPosition(stringIndex - 1, fretNum);
          synth.triggerAttackRelease(note, "8n");
        })
        .append("title")
        .text(`${getIntervalLabel(interval)}\nNote: ${getNoteAtPosition(stringIndex - 1, fretNum)}`);
    }
    
    // Mark the starting note for the scale on this string
    const startInterval = string.stringStart.start;
    let startFret = null;
    
    // Find which fret corresponds to the start interval
    for (let fretNum = 1; fretNum <= 12; fretNum++) {
      if (string.frets[fretNum.toString()] === startInterval) {
        startFret = fretNum;
        break;
      }
    }
    
    if (startFret !== null) {
      const startX = FRETBOARD_LEFT + (startFret - 0.5) * FRET_SPACING;
      
      // Draw a special marker for the start of the scale
      d3.select(svg)
        .append("circle")
        .attr("cx", startX)
        .attr("cy", y)
        .attr("r", 15)
        .attr("fill", "none")
        .attr("stroke", "gold")
        .attr("stroke-width", 3);
    }
  }
}

/**
 * Displays a summary of the model
 * @param {Object[]} strings - Array of String objects from the Forge model
 */
function displayModelSummary(strings) {
  // Count the types of intervals on each string
  const summary = strings.map(string => {
    let wholeSteps = 0;
    let halfSteps = 0;
    
    for (let fret = 1; fret <= 12; fret++) {
      const interval = string.frets[fret.toString()];
      
      if (!isHalfStep(interval)) wholeSteps++;
      else if (isHalfStep(interval)) halfSteps++;
    }
    
    return { wholeSteps, halfSteps };
  });
  
  // Display summary at the bottom
  d3.select(svg)
    .append("text")
    .attr("x", FRETBOARD_LEFT)
    .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 60)
    .attr("font-weight", "bold")
    .text("Guitar Model Summary:");
    
  const stringNames = ["E (low)", "A", "D", "G", "B", "E (high)"];
  
  for (let i = 0; i < summary.length; i++) {
    const { wholeSteps, halfSteps } = summary[i];
    d3.select(svg)
      .append("text")
      .attr("x", FRETBOARD_LEFT)
      .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 80 + i * 20)
      .text(`String ${i+1} (${stringNames[i]}): ${wholeSteps} whole steps, ${halfSteps} half steps`);
  }
  
  // Count total intervals
  const totalW = summary.reduce((sum, s) => sum + s.wholeSteps, 0);
  const totalH = summary.reduce((sum, s) => sum + s.halfSteps, 0);
  
  d3.select(svg)
    .append("text")
    .attr("x", FRETBOARD_LEFT)
    .attr("y", FRETBOARD_TOP + FRETBOARD_HEIGHT + 80 + summary.length * 20)
    .attr("font-weight", "bold") 
    .text(`Total: ${totalW} whole steps, ${totalH} half steps`);
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
  const strings = String.atoms(true);
  
  // Calculate string tuning based on intervals
  const tuning = calculateStringTuning(strings);
  
  // Draw the basic fretboard with the calculated tuning
  drawFretboard(tuning);
  
  // Draw the intervals on the fretboard
  drawIntervals(strings);
  
  // Display summary of the model
  displayModelSummary(strings);
  
  // Title for the visualization
  d3.select(svg)
    .append("text")
    .attr("x", SVG_WIDTH / 2)
    .attr("y", 50)
    .attr("text-anchor", "middle")
    .attr("font-size", "24px")
    .attr("font-weight", "bold")
    .text("Guitar Scale Model Visualization");
    
  console.log("Guitar model visualization complete");
}

// Call the main visualization function
visualizeGuitar();