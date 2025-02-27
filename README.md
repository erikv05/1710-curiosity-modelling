# 1710 Curiosity Modelling Project

## Project Objective

This project models a guitar in standard tuning using Forge, representing the relationships between 6 strings and 12 frets, each spaced a half step apart tonally. It simulates the intervals and tunings according to standard tuning principles (e.g., perfect fourths, major thirds) and enables easy verification and testing of guitar configurations.

## Model Design and Visualization

- **Guitar Strings**: A guitar has 6 strings, each one with a specified a starting interval (the open string) and ascending fret positions
- **Intervals**: The intervals represent half steps between musical notes
- **Fret Mapping**: 12 frets are mapped to each string, and each string/fret intersection corresponds with a note

These design choices can be seen on the neck of a guitar in our custom visualization and audio component. 

## Signatures and Predicates

- **Guitar**: Maps indices to strings on a guitar. 
- **String**: Models each string on the guitar at an index, and its associated intervals and fret positions.
- **Interval**: Represents a half step between frets. 
- **Wellformed Predicate**: Checks that each string has the proper number of frets and intervals.
- **WesternInterval Predicate**: Ensures that the intervals between the strings follow Western musical interval rules. 
- **StandardTuning Predicate**: Ensures that the string-to-interval mappings align with standard guitar tuning (e.g., EADGBE). A major 3rd is programmed between strings 3 and 4, where the 4th half step on string 3 loops back to be the starting note of string 4, and similarly a perfect 5th, or 5 half steps, are programmed between the rest of the string pairs. 

## Testing
