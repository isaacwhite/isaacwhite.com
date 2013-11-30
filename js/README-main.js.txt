
    
    * NOTES
    *
    * 1. Take an angle, transform it
    *   ANY ANGLE -> could be any number at all
    *   a. mod it against 360 to remove extra rotations
    *   b. if it is negative, add 360 to it to make it positive
    *   c. Optionally, we can constrain the angle to 180 degrees at this point.
    *       should we?
    *   d. Let's not constrain at this point. 
    *      When we set rotation we'll mod the actual angle against 180 to constrain. 
           It actually doesn't matter if we constrain at this point. Let's just say it is constrained for simplicity's sake.
    * 3. Based on the input angle, figure out which card should be primary
    *    There won't be a way to tell when we are rotating to the left or the right
    *    since we are ensuring taht all angles are positive. This means an offset methodology just won't work
    *    All rotation angles with this system will use the standard mathematical model for angles to be better
    *    compatible with sin/cos/tan models. This means that the primary card will be placed at 90degrees, and
    *    and subsequent cards will be added in a counterclockwise motion. 

         to work with the offset model, we should map cards statically to an extra 10 degrees.
         So [0]100 -> [1]120 -> [2]140 -> [3]160 -> [4]180 -> [5]20 -> [6]40 etc.
         At this stage, we'll have to account for the fact that the card could be left of 90 (ie  80 < x < 100)
         This means that we'll probably want to take a count of the offset for the current positioning system from the default
         offsets should be allowed as any value between -10 < x < 10, but not beyond this.
         In the mathematical model, offsets are actually 0 to -20, rather than a range that intersects 0
         So the system is being fed an input angle of 0, which should actually map to an offsettable angle of 10
         This will allow us to position cards by default at set angles, and then just provide an offset to shift the slider so it looks proper
         This may mean that just as we calculate z indexes, we should also calculate angles at the same time that can act as base angles
         This also should simplify things because no adding is necessary, the same offset is used each time.
         So this means that the current card can be determined by adding 10 to the input angle, modding it against 180, and dividing that against the range.

         eg. 0 -> 10/range = .5 -> Math.floor (((angle + 10) mod 180 )/ range) so 169 -> 179 mod 180 = 179 / angle = 8.95 -> floor = 8
         so when we take an angle to determine the active card, we add 10 and follow the previous rule
         the offset is also determined by adding 10 to the angle modded against 20.


         revised algorithm:
         Take an input angle. Mod it against 180. (and correct negatives) This is our angleAdj1
         Calculate offset. add 10 to angleAdj1, mod it against 180. This is angleAdj2. angleAdj2 mod range, when negated, is equal to the offset. 
         Now divide angleAdj2 by the range, and take the floor of the result. This is our start index.
         Iterate over the children modding by the number of children after moving to the next, for the children array length (touch everything once)
         As we were mapping z indexes previously, also use a map of angle values, which should be values constrained within 180. We'll want to space everything
         by the angle range we can calculate, and shift everything left (increase) by half the angle range, which for 9 is 10 but could be another number.
         Remember, we don't start from an angle 0, we actually start from the angle 90 (in the regular trig angle system), and continuing increasing by range
         while modding against 180.
         Once we have a value for each position, we'll only need to worry about mapping it and setting the offset.

         How will the offset work exactly?
         =================================
         A start angle is provided between 0 <= x < 360. We will mod this angle against the angleRange of a card.
         This should provide a value between 0 <= offset < 20(sample value).
         At this point it could be noted that it may make sense to actually use 10 as the middle value for the offset, which means the set angles
         that are calculated for objects at the begining should be half of angle value left (more) than where they normally will be.
         This means that since we are using the standard mathematical angle system, we'll actually have to SUBTRACT whatever our offset value is.
         So, our standard calculated values will actually be 
         [0]100 -> [1]120 -> [2]140 -> [3]160 -> [4]180 -> [5]20 -> [6]40
         and we'll map our offset to (-)10 if mod 20 on requested angle is equal to 0.
         If mod 20 on requested angle is anywhere from 10 <= x < 20, we'll actually subtract 10 from it and call that the offset
         So for example, 179 mod 20 is 19, which maps to offset of -9, which from 100 would result in a value of 91, which is actually what we want.
         On the other side of things, we'll take the offset value and add 10 to it. So if 0 <= x < 10, offset is actaully equal to (-)(offset+10)
         For example, an angle provided as 3 -> 3 mod 20 = 3, so offset -> (-)13, which from a standard 100 degree starting point would result in a math
         angle of 87 degrees, which is also what we want. Based on these calculations, our angle systems look like this:
         170 -> offset = 0, 100 c0
         171 -> offset = -1, 99 c0
         172 -> offset = -2, 98 c0
         173 -> offset = -3, 97 c0
         174 -> offset = -4, 96 c0
         175 -> offset = -5, 95 c0
         176 -> offset = -6, 94 c0
         177 -> offset = -7, 93 c0
         178 -> offset = -8, 92 c0
         179 -> offset = -9, 91 c0
         0 -> offset = -10, 90 c0
         1 -> offset = -11, 89 c0
         2 -> offset = -12, 88 c0
         3 -> offset = -13, 87 c0
         4 -> offset = -14, 86 c0
         5 -> offset = -15, 85 c0
         6 -> offset = -16, 84 c0
         7 -> offset = -17, 83 c0
         8 -> offset = -18, 82 c0
         9 -> offset = -19, 81 c0
         10 -> offset = 0, 100 c1
         11 -> offset = -1, 99 c1
         12 -> offset = -2, 98 c1
         etc.

    * 4. From this card, map the z-indexes as we position cards
    * 5. Function returns