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
  -- expected number of whole and half-steps
    #W = 5
    #H = 2  
  -- Half steps are separated
  -- We'll be able to express this much more consisely in Relational Forge,
  -- but for now, let's stick to Froglet. "No half step's successor or twice 
  -- successor is another half step"
    all h1: H, h2: H | h1.next != h2 and h1.next.next != h2
  
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
    }
}


wellformedRun: run {
    wellformed
    diatonic
} for 1 Guitar, 7 Interval, 5 Int, 2 H, 7 W, 6 String, 6 Start
