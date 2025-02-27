#lang forge/froglet

one sig Guitar {
    strings: pfunc Int -> String
}

sig Interval {
    next: one Interval
}

sig String {
    frets: pfunc Int -> Interval,
    stringStart: one Interval,
    order: one Int
}

pred tuned {
    // 6 strings in order
    all s: String, i: Int | {
        s.order >= 1 and s.order <= 6
        (i >= 1 and i <= 6) => some s.order
    }

    // Intervals form cycles within each string
    all s: String, i1, i2: Interval | {
        (some f1, f2: Int | s.frets[f1] = i1 and s.frets[f2] = i2 and i1 != i2) =>
            reachable[i2, i1, next]
}

    // Intervals are on one united cycle
    all i1, i2: Interval | {
        i1 != i2 => reachable[i2, i1, next]
    }

    // strings shouldn't start on the same note, should loop and next string starts in the middle of the previous string
    some s1, s2: String | {
        s2.order = add[s1.order, 1] => {
            s1.frets[3] = s2.stringStart
    }
  }

}

pred wellformed {
    // Guitars must have exactly 6 strings
    #Guitar.strings = 6

    // All strings must have 7 frets
    all s: String | #s.frets = 7

    // Strings mapping logic
    all i: Int {
        // Backwards direction: no strings
        some Guitar.strings[i] => i >= 1 and i <= 6

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

    //order enforcement
    all s: String | s.order >= 1 and s.order <= 6
    
    all i: Int, s: String | (i >= 1 and i <= 6) => s.order = i
}

wellformedRun: run {
    wellformed
    tuned
} for 1 Guitar, 42 Interval, 7 Int, 6 String
