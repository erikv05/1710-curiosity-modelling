#lang forge/froglet

one sig Guitar {
    strings: pfunc Int -> String
}

sig Interval {
    pos: one Int,
    next: one Interval
}

sig String {
    frets: pfunc Int -> Interval,
    stringStart: one Interval
}

// pred diatonic {
//     // # of steps between each interval
//     #W = 5
//     #H = 2  
//     // next of half step can't be half step
//     all h1: H, h2: H | h1.next != h2 and h1.next.next != h2
  
// }

pred wellformed {
    // Guitars must have exactly 6 strings
    #Guitar.strings = 6

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

        // Ensure fret map to next interval corretly
        all i, j: Int | {
            j = add[i, 1] and i >= 1 and i <= 11 => next[s.frets[i]] = s.frets[j]
        }
    }
}

pred westernInterval {
    #Interval = 12
    all s: Interval | {
        one next[s] // Must have next
        s.pos >= 1 and s.pos <= 12 // Must be in range [1, 12]
    }     
    
    all disj s1, s2: Interval | {
        s1.pos != s2.pos
        add[s1.pos, 1] = s2.pos => next[s1] = s2
        s1.pos = 12 and s2.pos = 1 => next[s1] = s2
    }

}

// Ensures standard tuning for a 6-string guitar
// We could experiment with different tunings later
pred standardTuning {
    // Start rules
    all s: String | one s.stringStart
    
    // Ensure interval between strings (perfect 4th and major 3rd)
    all s1, s2: String | {
        // Find the strings' numeric positions
        all i, j: Int | {
            Guitar.strings[i] = s1 and Guitar.strings[j] = s2 and add[i, 1] = j => {
                // Major 3rd between 2nd and 3rd strings (4 half steps)
                i = 2 => {
                    let s1Int = s1.stringStart,
                        s2Int = s2.stringStart |
                        s1Int.next.next.next.next = s2Int
                } else {
                    // Perfect 4th (5 half steps) between all other adjacent strings
                    let s1Int = s1.stringStart,
                        s2Int = s2.stringStart |
                        s1Int.next.next.next.next.next = s2Int
                }
            }
        }
    }
}

wellformedRun: run {
    wellformed
    westernInterval
    standardTuning
} for 1 Guitar, 5 Int, exactly 12 Interval, 6 String
