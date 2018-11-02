---
layout: post
title: Agenda in the command line
---
# *Agenda*

shortcut: **ag**{:.cmd}

key: **Macro**{:.key}**Macro**{:.key}**Macro**{:.key}

**Assign**{:.cmd} **Agenda**{:.cmd} X \<parameter\>

An agenda item must already exist to be modified with Assign, so we should start with: **Store Agenda**{:.cmd} 1

The agenda index is progressive, so it's not possible to start from an arbitrary number.  

**Store Agenda**{:.cmd} 99 _will return an error (Error 16 # RESIZE FORBIDDEN) if there aren't at least 98 items already in the agenda_.

To verify the number of agenda items, use **List Agenda**{:.cmd}

### Parameters

  **/Start**
  > Absolute

  > Dawn

  > Sunrise

  > Sunset

  > Dusk

  **/Time** = *use the _h_m_s syntax without quotes, like:* **Assign**{:.cmd} **Agenda**{:.cmd} 1 /Time=1h15m

> **The hh/mm/ss syntax shown in the manual doesn't work**{:.rednote}

> Relative times set for Dawn, Sunrise, Sunset, Dusk allow a maximum difference of 1 hour.

> To enter a negative relative time just add a dash: **Assign**{:.cmd} **Agenda**{:.cmd} 1 /Time=-20m

  **/Duration** = *use the _h_m_s syntax without quotes, like:* **Assign**{:.cmd} **Agenda**{:.cmd} 1 /Duration=1h

> **The hh/mm/ss syntax shown in the manual doesn't work**{:.rednote}

  **/Repeat**
  > None

  > Daily

  > Weekly

  > Monthly

  > Annually :  **Doesn't work**{:.rednote}

  > Daily each month : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="daily each month"

  > Weekly each month : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="weekly each month"

  > Daily each year : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="daily each year"

  > Weekly each year : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="weekly each year"

  > Monthly each year : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="monthly each year"

  > Every 2nd day : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="every 2nd day"

  > Every 3rd day : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="every 3rd day"

  > Every 4th day : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="every 4th day"

  > Every 5th day : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="every 5th day"

  > Every 6th day : use quotes: **Assign Agenda**{:.cmd} 1 /Repeat="every 6th day"

  **/CMD** = ""

  **/Info** = ""

  **/First** = "mm/dd/yyyy"

  **/Last** = "mm/dd/yyyy"

# *Export and Import*

**Export Agenda**{:.cmd} * "(filename)"

**Import**{:.cmd} "(filename)" **At Agenda**{:.cmd} 1
