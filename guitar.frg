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
    stringStart: one Interval,
    stringPos: one Int // for visualizer, cleaner
}

sig PlayedNote {
    string: one String,
    fret: one Int
}

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

        Guitar.strings[f] = s => s.stringPos = f
    }
}

pred validNote {
    all p: PlayedNote, s: String, f: Int | {
        p.string = s and p.fret = f => s.frets[f] = p.string.stringStart
    }

    all disj p1, p2: PlayedNote | {
        p1.string != p2.string
        p1.fret != p2.fret
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
    
    // Intervals between strings (perfect 4ths and major 3rds) 
    all s1, s2: String | {
        add[s1.stringPos, 1] = s2.stringPos => {
            s1.stringPos = 2 => s1.stringStart.next.next.next.next = s2.stringStart else s1.stringStart.next.next.next.next.next = s2.stringStart
        }
    }
}

wellformedRun: run {
    wellformed
    westernInterval
    standardTuning
    validNote
} for 1 Guitar, 5 Int, exactly 12 Interval, 6 String, 3 PlayedNote
