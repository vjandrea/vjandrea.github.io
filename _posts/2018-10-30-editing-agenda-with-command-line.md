---
layout: post
title: Agenda editing
date: 2018-10-30 23:36 +0100
tags: command-line
---
# *Agenda*

shortcut: **ag**{:.cmd}

key: **Macro**{:.gma2-btn} **Macro**{:.gma2-btn} **Macro**{:.gma2-btn}

An agenda item must already exist to be modified with **Assign**, so we should start with: **\> Store Agenda 1**{:.gma2-cmd}

The agenda index is progressive, so it's not possible to store an arbitrary number.  

**\> Store Agenda 99**{:.gma2-cmd} _will return an error (Error 16 # RESIZE FORBIDDEN) if there aren't at least 98 items already in the agenda_.

To verify the number of agenda items, use **\> List Agenda**{:.gma2-cmd}

### Usage

**\> Assign Agenda X \<parameter\>**{:.gma2-cmd}

### Parameters

  **/Start**
  > Absolute

  > Dawn

  > Sunrise

  > Sunset

  > Dusk

  **/Time** = use the _h_m_s syntax without quotes, like: **\> Assign Agenda 1 /Time=1h15m**{:.gma2-cmd}

> **The hh/mm/ss syntax shown in the manual doesn't work**{:.rednote}

> Relative times set for Dawn, Sunrise, Sunset, Dusk allow a maximum difference of 1 hour.

> To enter a negative relative time just add a dash: **\> Assign Agenda 1 /Time=-20m**{:.gma2-cmd}

  **/Duration** = use the _h_m_s syntax without quotes, like: **\> Assign Agenda 1 /Duration=1h**{:.gma2-cmd}

> **The hh/mm/ss syntax shown in the manual doesn't work**{:.rednote}

  **/Repeat**
  > None

  > Daily

  > Weekly

  > Monthly

  > Annually :  **Doesn't work**{:.rednote} Use 'yearly' instead: **\> Assign Agenda 1 /Repeat=yearly**{:.gma2-cmd}

  > Daily each month : use quotes: **\> Assign Agenda 1 /Repeat="daily each month"**{:.gma2-cmd}

  > Weekly each month : use quotes: **\> Assign Agenda 1 /Repeat="weekly each month"**{:.gma2-cmd}

  > Daily each year : use quotes: **\> Assign Agenda 1 /Repeat="daily each year"**{:.gma2-cmd}

  > Weekly each year : use quotes: **\> Assign Agenda 1 /Repeat="weekly each year"**{:.gma2-cmd}

  > Monthly each year : use quotes: **\> Assign Agenda 1 /Repeat="monthly each year"**{:.gma2-cmd}

  > Every 2nd day : use quotes: **\> Assign Agenda 1 /Repeat="every 2nd day"**{:.gma2-cmd}

  > Every 3rd day : use quotes: **\> Assign Agenda 1 /Repeat="every 3rd day"**{:.gma2-cmd}

  > Every 4th day : use quotes: **\> Assign Agenda 1 /Repeat="every 4th day"**{:.gma2-cmd}

  > Every 5th day : use quotes: **\> Assign Agenda 1 /Repeat="every 5th day"**{:.gma2-cmd}

  > Every 6th day : use quotes: **\> Assign Agenda 1 /Repeat="every 6th day"**{:.gma2-cmd}

  **/CMD** = ""

  **/Info** = ""

  **/First** = "mm/dd/yyyy"

  **/Last** = "mm/dd/yyyy"

# *Export and Import*

**\> Export Agenda * "\<filename\>"**{:.gma2-cmd}

**\> Import "\<filename\>" At Agenda 1**{:.gma2-cmd}
