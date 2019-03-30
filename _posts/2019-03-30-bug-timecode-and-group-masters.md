---
layout: post
title: 'BUG: Timecode and Group Masters'
date: 2019-03-30 15:09 +0100
---
Timecode shows don't handle correctly Group Masters

This bug has been verified in version 3.6.1.1

To demonstrate this, I created two fixture groups, Vipers and Dimmers, and created two Group Masters in Negative mode.
Then I stored two executors with the Dimmer value at full.
I recorded a timecoded show using the internal generator and edited the values in text mode.
- At 1s: both Group Masters at 100%
- At 4s: both Group Masters at 0%
You can see that the two Group Masters stop at 1%, and in the Fixture Sheet we can see that the minimum value is 1.1%.

<video width="1360" height="804" autoplay loop>
  <source src="https://vjandrea.github.io/assets/bug_timecode_group_masters.mp4" type="video/mp4" />
  Your browser does not support the video tag.
</video>
