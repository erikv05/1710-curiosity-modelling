#lang forge/froglet

one sig Guitar {
    strings: pfunc Int -> String
}

sig Interval {
    hs: one Int,
    next: one Interval
}

sig String {
    frets: pfunc Int -> Interval,
    stringStart: one Start
}

sig Start {
    start: one Interval,
    offset: one Int
}

pred tuned {
    // Each string starts at a note
    // TODO: note enum? eg. abstract sig Note {nextNote: one Note}
                                        //one sig A, Bb, B, C, Cs, D, Ds, E, F, Fs, G, Gs extends Note {}
    all s: String | some s.stringStart

    // Intervals are cyclic for the specified note domain
    all s: String, i: Int, f: Interval | {
        s.frets[i] = f and i >= 1 and i < 7 and some s.frets[add[i,1]] =>
            f.next = s.frets[add[i,1]]
    }

    // Intervals are on one united cycle
    all i1, i2: Interval | {
        i1 != i2 => reachable[i2, i1, next]
    }

    // strings shouldn't start on the same note
    // MODIFY: string.fret[7].next = next string.stringStart note
    all s1, s2: String | s1 != s2 => s1.stringStart.start != s2.stringStart.start

}

pred wellformed {
    // Guitars must have exactly 6 strings
    #Guitar.strings = 6

    // All strings must have 7 frets
    all s: String | #s.frets = 7

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
        // No frets at post < 1 or > 7
        some s.frets[f] => f >= 1 and f <= 7

        // All positions between [1, 7] have frets
        f >= 1 and f <= 7 => some s.frets[f]
    }
}

wellformedRun: run {
    wellformed
    tuned
} for 1 Guitar, 42 Interval, 7 Int, 6 String, 6 Start
