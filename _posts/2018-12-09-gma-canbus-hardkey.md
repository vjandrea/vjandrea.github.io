---
layout: post
title: gma.canbus.hardkey
---

In the last rows of `api_test.lua` there are two methods that use the function `gma.canbus.hardkey(code, press, hold)`.
This function emulates actions on physical keys on the console.

The key codes discovered so far are listed below, some are still unknown.

````
   1:
   2:
   3: Ch Pg +
   4: Ch Pg -
   5: Fd Pg +
   6: Fd Pg -
   7: Bt Pg +
   8: Bt Pg -
   9: Macro: DefGoPause
  10: Macro: DefGoBack
  11: Macro: DefGoForward
  12: TA_X0  pressed=1   ViewButton 11.1
  13: TA_X1  pressed=1   ViewButton 11.2
  14: TA_X2  pressed=1   ViewButton 11.3
  15: TA_X3  pressed=1   ViewButton 11.4
  16: TA_X4  pressed=1   ViewButton 11.5
  17: TA_X5  pressed=1   ViewButton 11.6
  18: TA_X6  pressed=1   ViewButton 11.7
  19: TA_X7  pressed=1   ViewButton 11.8
  20: TA_X8  pressed=1   ViewButton 11.9
  21: TA_X9  pressed=1   VIewButton 11.10
  22: TA_X10 pressed=1   VIewButton 11.11
  23: TA_X11 pressed=1   VIewButton 11.12
  24: TA_X12 pressed=1   VIewButton 11.13
  25: TA_X13 pressed=1   VIewButton 11.14
  26: TA_X14 pressed=1   VIewButton 11.15
  27: TA_X15 pressed=1   VIewButton 11.16
  28: TA_X16 pressed=1   VIewButton 11.17
  29: TA_X17 pressed=1   VIewButton 11.18
  30: TA_X18 pressed=1   VIewButton 11.19
  31: TA_X19 pressed=1   ViewButton 11.20
  32: List
  33: User 1
  34: User 2
  35:
  36:
  37:
  38:
  39:
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
  50: Go-
  51: Pause
  52: Go
  53: Oops
  54: Esc
  55: Edit
  56: Goto
  57: Update
  58: Time
  59: Store
  60:
  61: Freeze
  62: Preview
  63: Assign
  64: Align
  65: B.O. (Blackout)
  66: View
  67: Effect
  68: MA
  69: Delete
  70: Page
  71: Macro
  72: Preset
  73: Copy
  74: Sequence
  75: Cue
  76: Executor
  77:
  78:
  79:
  80:
  81:
  82: Channel
  83: Fixture
  84: Group
  85: Move
  86: 0
  87: 1
  88: 2
  89: 3
  90: 4
  91: 5
  92: 6
  93: 7
  94: 8
  95: 9
  96: +
  97: -
  98: .
  99: Full
 100: Highlight
 101: Solo
 102: Thru
 103: If
 104: At
 105: Clear
 106: Please
 107: Up
 108: Set
 109: Prev
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
 120: ViewButton 1.1 /screen=2
 121: ViewButton 1.2 /screen=2
 122: ViewButton 1.3 /screen=2
 123: ViewButton 1.4 /screen=2
 124: ViewButton 1.5 /screen=2
 125: ViewButton 1.6 /screen=2
 126: ViewButton 1.7 /screen=2
 127: ViewButton 1.8 /screen=2
 128: ViewButton 1.9 /screen=2
 129: ViewButton 1.10 /screen=2
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
 155 and higher: Macro DefGoPause
````
