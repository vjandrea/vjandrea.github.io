---
layout: post
title: gma.canbus.hardkey
date: 2018-12-09 23:36 +0100
---

In the last rows of `api_test.lua` there are two methods that use the function `gma.canbus.hardkey(code, press, hold)`.
This function emulates actions on physical keys on the console.

It is advisable to "unpress" the button after every stroke, i.e.:
````
gma.canbus.hardkey(54, true, false)
gma.canbus.hardkey(54, false, false)
````
eventually adding a `gma.sleep()` with a short delay between.

The key codes discovered so far are listed below, one remains unknown.
````
   1:
   2:
   3: Ch Pg +
   4: Ch Pg -
   5: Fd Pg +
   6: Fd Pg -
   7: Bt Pg +
   8: Bt Pg -
   9: Pause [large]
  10: Go - [large]
  11: Go + [large]
  12: X1
  13: X2
  14: X3
  15: X4
  16: X5
  17: X6
  18: X7
  19: X8
  20: X9
  21: X10
  22: X11
  23: X12
  24: X13
  25: X14
  26: X15
  27: X16
  28: X17
  29: X18
  30: X19
  31: X20
  32: List
  33: User 1
  34: User 2
  35:
  36: U1
  37: U2
  38: U3
  39: U4
  40: ⦿ ("Nipple")
  41: Fix
  42: Select
  43: Off
  44: Temp
  45: Top
  46: On
  47: <<<
  48: Learn
  49: >>>
  50: Go - [small]
  51: Pause [small]
  52: Go + [small]
  53: Oops
  54: Esc
  55: Edit
  56: Goto
  57: Update
  58: Time
  59: Store
  60: Blind
  61: Freeze
  62: Prvw [Preview]
  63: Assign
  64: Align
  65: B.O. [Blackout]
  66: View
  67: Effect
  68: MA
  69: Delete [Delete]
  70: Page
  71: Macro
  72: Preset
  73: Copy
  74: Sequ [Sequence]
  75: Cue
  76: Exec [Executor]
  77:
  78:
  79:
  80:
  81:
  82: Channel
  83: Fixture
  84: Group
  85: Move
  86: 0 [Numeric]
  87: 1 [Numeric]
  88: 2 [Numeric]
  89: 3 [Numeric]
  90: 4 [Numeric]
  91: 5 [Numeric]
  92: 6 [Numeric]
  93: 7 [Numeric]
  94: 8 [Numeric]
  95: 9 [Numeric]
  96: + [Plus]
  97: - [Minus]
  98: . [Dot]
  99: Full
 100: Highlt [Highlight]
 101: Solo
 102: Thru
 103: If
 104: At
 105: Clear
 106: Please
 107: Up
 108: Set
 109: Prev [Previous]
 110: Next
 111: Down
 112:
 113:
 114:
 115:
 116: Help
 117: Backup
 118: Setup
 119: Tools
 120: V1
 121: V2
 122: V3
 123: V4
 124: V5
 125: V6
 126: V7
 127: V8
 128: V9
 129: V10
 130:
 131:
 132:
 133:
 134:
 135:
 136:
 137:
 138:
 139:
 140:
 141:
 142:
 143:
 144:
 145:
 146:
 147:
 148:
 149:
 150:
 151:
 152:
 153:
 154:
≥155: Pause [large]
````
The only undiscovered code corresponds to `Backg [Background]`. Since `Backg` has no function, we might only guess it among the unassigned keycodes.
