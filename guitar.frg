#lang forge/froglet

one sig Guitar {
    strings: pfunc Int -> String
}

abstract sig Interval {
    hs: one Int,
    next: one Interval
}

sig W extends Interval {}
sig H extends Interval {}

sig String {
    frets: pfunc Int -> Interval,
    stringStart: one Start
}

sig Start {
    start: one Interval,
    offset: one Int
}

pred diatonic {
    // # of steps between each interval
    #W = 5
    #H = 2  
    // next of half step can't be half step
    all h1: H, h2: H | h1.next != h2 and h1.next.next != h2
  
}

pred wellformed {
    // Guitars must have exactly 6 strings
    #Guitar.strings = 6

    // For visualization
    all s: W | s.hs = 2
    all s: H | s.hs = 1

    // All strings must have 12 frets
    all s: String | #s.frets = 12

    // Strings mapping logic
    all i: Int {
        // Backwards direction: no strings
        some Guitar.strings[i] => i >= 1
        some Guitar.strings[i] => i <= 6

        // Forwards direction: all good indices must contain strings
        (i >= 1 and i <= 6) => some Guitar.strings[i]

        // Must actually map to different strings/frets
        all j: Int | {
            (i != j) and some Guitar.strings[i] and some Guitar.strings[j] => (Guitar.strings[i] != Guitar.strings[j])
        }
    }
    
    // Fret mapping logic
    all s: String, f: Int | {
        // No frets at post < 1 or > 12
        some s.frets[f] => f >= 1 and f <= 12

        // All positions between [1, 12] have frets
        f >= 1 and f <= 12 => some s.frets[f]
    }

    // Interval rules
    (sum s: Interval | s.hs) = 12
    all s1, s2: Interval | reachable[s1, s2, next]
    all s: Interval | one next[s]

    // Start rules
    all s: String | one s.stringStart
    // Ensure interval between strings (perfect 4th and major 3rd)
    all s1, s2: String | {
        // Find the strings' numeric positions
        some i, j: Int | {
            Guitar.strings[i] = s1 and Guitar.strings[j] = s2 and i+1 = j => {
                // Major 3rd between 2nd and 3rd strings
                i = 2 => {
                    // Major 3rd is 4 half steps
                    let s1Start = s1.stringStart.start, 
                            s2Start = s2.stringStart.start,
                            s1Off = s1.stringStart.offset,
                            s2Off = s2.stringStart.offset |
                            ((s1Off + sum[s1Start, s2Start] + 4) % 12) = s2Off
                } else {
                    // Perfect 4th (5 half steps) between all other adjacent strings
                    let s1Start = s1.stringStart.start, 
                            s2Start = s2.stringStart.start,
                            s1Off = s1.stringStart.offset,
                            s2Off = s2.stringStart.offset |
                            ((s1Off + sum[s1Start, s2Start] + 5) % 12) = s2Off
                }
            }
        }
    }

}


wellformedRun: run {
    wellformed
    diatonic
} for 1 Guitar, 7 Interval, 5 Int, 2 H, 7 W, 6 String, 6 Start
