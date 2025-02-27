#lang forge/froglet

open "guitar.frg"

------------------------------------------------------------------------

// Test suite for wellformed

example validStringCount is {wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    // Implicitly, Guitar.strings[1..6] are mapped to these six strings.
}

example smallStringCount is {not wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5
}

example bigBadStringCount is {not wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6 + `s7
}

example validFretCount is {wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    
    strings = `guitar -> (1 -> `s1 + 2 -> `s2 + 3 -> `s3 + 4 -> `s4 + 5 -> `s5 + 6 -> `s6)
    stringPos = `s1 -> 1 + `s2 -> 2 + `s3 -> 3 + `s4 -> 4 + `s5 -> 5 + `s6 -> 6
    stringStart = `s1 -> `i1 + `s2 -> `i7 + `s3 -> `i12 + `s4 -> `i5 + `s5 -> `i10 + `s6 -> `i3
    
    pos = `i1 -> 1 + `i2 -> 2 + `i3 -> 3 + `i4 -> 4 + `i5 -> 5 + `i6 -> 6 +
          `i7 -> 7 + `i8 -> 8 + `i9 -> 9 + `i10 -> 10 + `i11 -> 11 + `i12 -> 12
    
    next = `i1 -> `i2 + `i2 -> `i3 + `i3 -> `i4 + `i4 -> `i5 + `i5 -> `i6 +
           `i6 -> `i7 + `i7 -> `i8 + `i8 -> `i9 + `i9 -> `i10 + `i10 -> `i11 +
           `i11 -> `i12 + `i12 -> `i1
    
    frets = `s1 -> (1 -> `i1 + 2 -> `i2 + 3 -> `i3 + 4 -> `i4 + 5 -> `i5 + 
                   6 -> `i6 + 7 -> `i7 + 8 -> `i8 + 9 -> `i9 + 10 -> `i10 + 
                   11 -> `i11 + 12 -> `i12) +
            `s2 -> (1 -> `i7 + 2 -> `i8 + 3 -> `i9 + 4 -> `i10 + 5 -> `i11 + 
                   6 -> `i12 + 7 -> `i1 + 8 -> `i2 + 9 -> `i3 + 10 -> `i4 + 
                   11 -> `i5 + 12 -> `i6) +
            `s3 -> (1 -> `i12 + 2 -> `i1 + 3 -> `i2 + 4 -> `i3 + 5 -> `i4 + 
                   6 -> `i5 + 7 -> `i6 + 8 -> `i7 + 9 -> `i8 + 10 -> `i9 + 
                   11 -> `i10 + 12 -> `i11) +
            `s4 -> (1 -> `i5 + 2 -> `i6 + 3 -> `i7 + 4 -> `i8 + 5 -> `i9 + 
                   6 -> `i10 + 7 -> `i11 + 8 -> `i12 + 9 -> `i1 + 10 -> `i2 + 
                   11 -> `i3 + 12 -> `i4) +
            `s5 -> (1 -> `i10 + 2 -> `i11 + 3 -> `i12 + 4 -> `i1 + 5 -> `i2 + 
                   6 -> `i3 + 7 -> `i4 + 8 -> `i5 + 9 -> `i6 + 10 -> `i7 + 
                   11 -> `i8 + 12 -> `i9) +
            `s6 -> (1 -> `i3 + 2 -> `i4 + 3 -> `i5 + 4 -> `i6 + 5 -> `i7 + 
                   6 -> `i8 + 7 -> `i9 + 8 -> `i10 + 9 -> `i11 + 10 -> `i12 + 
                   11 -> `i1 + 12 -> `i2)
}

example validStringPositions is {wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    // Assume mapping: Guitar.strings[1]=`s1, …, Guitar.strings[6]=`s6
}

example uniqueStringMapping is {wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    // The distinct mapping of positions (1..6) to strings is assumed.
}

// Test suite for westernInterval

example twelveIntervals is {westernInterval} for {
    #Int = 5
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
}

example oneNextInterval is {westernInterval} for {
    #Int = 5
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // Mapping: i1.next=`i2, i2.next=`i3, …, i11.next=`i12, i12.next=`i1
}

example validIntervalPositions is {westernInterval} for {
    #Int = 5
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // Each interval’s pos is in [1,12].
}

example uniqueIntervalPositions is {westernInterval} for {
    #Int = 5
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // All intervals have different positions.
}

example consecutiveNextRelation is {westernInterval} for {
    #Int = 5
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // For any interval, if add(i.pos,1)=j, then interval.next is set accordingly.
}

example intervalWraparound is {westernInterval} for {
    #Int = 5
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // Enforce: if i.pos = 12 then i.next = interval with pos = 1.
}

// Test suite for standardTuning

example oneStartInterval is {standardTuning} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // Each string has exactly one starting interval (s.stringStart).
}

example perfectFourthTuning is {standardTuning and wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // For strings 1,3,4,5,6 (all except 2), ensure:
    // s[i].stringStart.next.next.next.next.next = s[i+1].stringStart.
}

example majorThirdTuning is {standardTuning and wellformed} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // Ensure: s2.stringStart.next.next.next.next = s3.stringStart.
}

// Test suite for combined

example allPredicatesSatisfiable is {
    wellformed
    westernInterval
    standardTuning
} for {
    #Int = 5
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    // Instance that simultaneously satisfies all predicates.
}

example fretIntervalLinking is {wellformed and westernInterval} for {
    #Int = 5
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    pos = `i1 -> 1 + `i2 -> 2 + `i3 -> 3 + `i4 -> 4 + `i5 -> 5 + 
          `i6 -> 6 + `i7 -> 7 + `i8 -> 8 + `i9 -> 9 + `i10 -> 10 + 
          `i11 -> 11 + `i12 -> 12
    next = `i1 -> `i2 + `i2 -> `i3 + `i3 -> `i4 + `i4 -> `i5 + `i5 -> `i6 +
           `i6 -> `i7 + `i7 -> `i8 + `i8 -> `i9 + `i9 -> `i10 + `i10 -> `i11 +
           `i11 -> `i12 + `i12 -> `i1
    frets = `s1 -> (1 -> `i1 + 2 -> `i2 + 3 -> `i3 + 4 -> `i4 + 5 -> `i5 + 
                   6 -> `i6 + 7 -> `i7 + 8 -> `i8 + 9 -> `i9 + 10 -> `i10 + 
                   11 -> `i11 + 12 -> `i12) +
            `s2 -> (1 -> `i7 + 2 -> `i8 + 3 -> `i9 + 4 -> `i10 + 5 -> `i11 + 
                   6 -> `i12 + 7 -> `i1 + 8 -> `i2 + 9 -> `i3 + 10 -> `i4 + 
                   11 -> `i5 + 12 -> `i6) +
            `s3 -> (1 -> `i12 + 2 -> `i1 + 3 -> `i2 + 4 -> `i3 + 5 -> `i4 + 
                   6 -> `i5 + 7 -> `i6 + 8 -> `i7 + 9 -> `i8 + 10 -> `i9 + 
                   11 -> `i10 + 12 -> `i11) +
            `s4 -> (1 -> `i5 + 2 -> `i6 + 3 -> `i7 + 4 -> `i8 + 5 -> `i9 + 
                   6 -> `i10 + 7 -> `i11 + 8 -> `i12 + 9 -> `i1 + 10 -> `i2 + 
                   11 -> `i3 + 12 -> `i4) +
            `s5 -> (1 -> `i10 + 2 -> `i11 + 3 -> `i12 + 4 -> `i1 + 5 -> `i2 + 
                   6 -> `i3 + 7 -> `i4 + 8 -> `i5 + 9 -> `i6 + 10 -> `i7 + 
                   11 -> `i8 + 12 -> `i9) +
            `s6 -> (1 -> `i3 + 2 -> `i4 + 3 -> `i5 + 4 -> `i6 + 5 -> `i7 + 
                   6 -> `i8 + 7 -> `i9 + 8 -> `i10 + 9 -> `i11 + 10 -> `i12 + 
                   11 -> `i1 + 12 -> `i2)

}

example validPlayedNotes is {wellformed} for {
    #Int = 5
    PlayedNote = `pn1
    Guitar = `guitar
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    strings = `guitar -> (1 -> `s1 + 2 -> `s2 + 3 -> `s3 + 4 -> `s4 + 5 -> `s5 + 6 -> `s6)
    stringPos = `s1 -> 1 + `s2 -> 2 + `s3 -> 3 + `s4 -> 4 + `s5 -> 5 + `s6 -> 6
    string = `pn1 -> `s1
    fret = `pn1 -> 5
    // This ensures pn1.fret is in [1,12] and pn1.string is one of the Guitar strings
}

example consecutiveFretIntervals is {wellformed and westernInterval} for {
    #Int = 5
    String = `s1 + `s2 + `s3 + `s4 + `s5 + `s6
    Interval = `i1 + `i2 + `i3 + `i4 + `i5 + `i6 + `i7 + `i8 + `i9 + `i10 + `i11 + `i12
    pos = `i1 -> 1 + `i2 -> 2 + `i3 -> 3 + `i4 -> 4 + `i5 -> 5 + 
          `i6 -> 6 + `i7 -> 7 + `i8 -> 8 + `i9 -> 9 + `i10 -> 10 + 
          `i11 -> 11 + `i12 -> 12
    next = `i1 -> `i2 + `i2 -> `i3 + `i3 -> `i4 + `i4 -> `i5 + `i5 -> `i6 +
           `i6 -> `i7 + `i7 -> `i8 + `i8 -> `i9 + `i9 -> `i10 + `i10 -> `i11 +
           `i11 -> `i12 + `i12 -> `i1
    frets = `s1 -> (1 -> `i1 + 2 -> `i2 + 3 -> `i3 + 4 -> `i4 + 5 -> `i5 + 
                   6 -> `i6 + 7 -> `i7 + 8 -> `i8 + 9 -> `i9 + 10 -> `i10 + 
                   11 -> `i11 + 12 -> `i12) +
            `s2 -> (1 -> `i7 + 2 -> `i8 + 3 -> `i9 + 4 -> `i10 + 5 -> `i11 + 
                   6 -> `i12 + 7 -> `i1 + 8 -> `i2 + 9 -> `i3 + 10 -> `i4 + 
                   11 -> `i5 + 12 -> `i6) +
            `s3 -> (1 -> `i12 + 2 -> `i1 + 3 -> `i2 + 4 -> `i3 + 5 -> `i4 + 
                   6 -> `i5 + 7 -> `i6 + 8 -> `i7 + 9 -> `i8 + 10 -> `i9 + 
                   11 -> `i10 + 12 -> `i11) +
            `s4 -> (1 -> `i5 + 2 -> `i6 + 3 -> `i7 + 4 -> `i8 + 5 -> `i9 + 
                   6 -> `i10 + 7 -> `i11 + 8 -> `i12 + 9 -> `i1 + 10 -> `i2 + 
                   11 -> `i3 + 12 -> `i4) +
            `s5 -> (1 -> `i10 + 2 -> `i11 + 3 -> `i12 + 4 -> `i1 + 5 -> `i2 + 
                   6 -> `i3 + 7 -> `i4 + 8 -> `i5 + 9 -> `i6 + 10 -> `i7 + 
                   11 -> `i8 + 12 -> `i9) +
            `s6 -> (1 -> `i3 + 2 -> `i4 + 3 -> `i5 + 4 -> `i6 + 5 -> `i7 + 
                   6 -> `i8 + 7 -> `i9 + 8 -> `i10 + 9 -> `i11 + 10 -> `i12 + 
                   11 -> `i1 + 12 -> `i2)
}
