---
layout: post
title: 'BUG: agenda export & import'
date: 2018-12-15 23:36 +0100
---
When we export the agenda to an XML file, in a case we lose data when reimporting.

This bug has been verified in version 3.6.1.1.

To demonstrate this I created a macro, that you can [download here](/assets/Agenda-bug-testing.xml)

BEWARE BECAUSE IT RESETS ANY EVENT IN YOUR AGENDA:

````
Delete Agenda *
Store Agenda 1 Thru 15
Assign Agenda 1 /Start=absolute
Assign Agenda 2 /Start=dawn
Assign Agenda 3 /Start=sunrise
Assign Agenda 4 /Start=sunset
Assign Agenda 5 /Start=dusk
Assign Agenda 1 Thru 5 /Time=12h34m56s
Assign Agenda 1 /Duration=1h
Assign Agenda 2 /Duration=1m
Assign Agenda 3 /Duration=1s
Assign Agenda 1 /Repeat=none
Assign Agenda 2 /Repeat=daily
Assign Agenda 3 /Repeat=weekly
Assign Agenda 4 /Repeat=annually # Described in the manual but does not work
Assign Agenda 5 /Repeat=yearly # Not in the manual but works
Assign Agenda 6 /Repeat="daily each month"
Assign Agenda 7 /Repeat="weekly each month"
Assign Agenda 8 /Repeat="daily each year"
Assign Agenda 9 /Repeat="weekly each year"
Assign Agenda 10 /Repeat="monthly each year"
Assign Agenda 11 /Repeat="every 2nd day"
Assign Agenda 12 /Repeat="every 3rd day"
Assign Agenda 13 /Repeat="every 4th day"
Assign Agenda 14 /Repeat="every 5th day"
Assign Agenda 15 /Repeat="every 6th day"
List Agenda # Show what we've done
Export Agenda * "agendatestexport"
Delete Agenda * # Reset the agenda before reimporting
List Agenda # Should throw an error because the agenda now is empty
Import "agendatestexport" At Agenda 1
List Agenda # Compare with the first List
````

With the first `List` we see:
````
          Start     Time      Duration  Repeat             CMD  Info  First  Last  
Agenda  1 Absolute  12:34:56   1:00:00  None
Agenda  2 Dawn       0:00:00   0:01:00  Daily
Agenda  3 Sunrise    0:00:00   0:00:01  Weekly
Agenda  4 Sunset     0:00:00   0:00:00  None
Agenda  5 Dusk       0:00:00   0:00:00  Yearly
Agenda  6 Absolute  12:34:56   0:00:00  Daily each month
Agenda  7 Absolute  12:34:56   0:00:00  Weekly each month
Agenda  8 Absolute  12:34:56   0:00:00  Daily each year
Agenda  9 Absolute  12:34:56   0:00:00  Weekly each year
Agenda 10 Absolute  12:34:56   0:00:00  Monthly each year
Agenda 11 Absolute  12:34:56   0:00:00  Every 2nd day
Agenda 12 Absolute  12:34:56   0:00:00  Every 3rd day
Agenda 13 Absolute  12:34:56   0:00:00  Every 4th day
Agenda 14 Absolute  12:34:56   0:00:00  Every 5th day
Agenda 15 Absolute  12:34:56   0:00:00  Every 6th day
````

While after reimporting from the xml file we see:
````
          Start     Time      Duration  Repeat             CMD  Info  First  Last  
Agenda  1 Absolute  12:34:56   1:00:00  None
Agenda  2 Dawn       0:00:00   0:01:00  Daily
Agenda  3 Sunrise    0:00:00   0:00:01  Weekly
Agenda  4 Sunset     0:00:00   0:00:00  None
Agenda  5 Dusk       0:00:00   0:00:00  Yearly
Agenda  6 Absolute  12:34:56   0:00:00  Daily each month
Agenda  7 Absolute  12:34:56   0:00:00  Weekly each month
Agenda  8 Absolute  12:34:56   0:00:00  Daily each month # "Daily each year" became "Daily each month"
Agenda  9 Absolute  12:34:56   0:00:00  Weekly each year
Agenda 10 Absolute  12:34:56   0:00:00  Monthly each year
Agenda 11 Absolute  12:34:56   0:00:00  Every 2nd day
Agenda 12 Absolute  12:34:56   0:00:00  Every 3rd day
Agenda 13 Absolute  12:34:56   0:00:00  Every 4th day
Agenda 14 Absolute  12:34:56   0:00:00  Every 5th day
Agenda 15 Absolute  12:34:56   0:00:00  Every 6th day
````
This happens because there's an error in the exported XML, where we see twice `"day_each_month"`.
(Please notice that the Agenda items index starts from 0, not from 1)
````xml
<Agenda index="5" repeat="day_each_month" date="0000-01-01T00:00:00" time="0" duration="0" special_time="absolute" />
<Agenda index="6" repeat="week_each_month" date="0000-01-01T00:00:00" time="0" duration="0" special_time="absolute" />
<Agenda index="7" repeat="day_each_month" date="0000-01-01T00:00:00" time="0" duration="0" special_time="absolute" />
<!--                      ^^^^^^^^^^^^^^ day_each_month instead of day_each_year                                  -->
````
This error is reflected in the [XSD](http://schemas.malighting.de/grandma2/xml/3.6.0/MA.xsd) in line 4786 and 4788:
````xml
<xs:attribute name="repeat" default="none">
	<xs:simpleType>
		<xs:restriction base="xs:string">
			<xs:enumeration value="none" />
			<xs:enumeration value="day" />
			<xs:enumeration value="week" />
			<xs:enumeration value="month" />
			<xs:enumeration value="year" />
			<xs:enumeration value="day_each_month" />
			<xs:enumeration value="week_each_month" />
			<xs:enumeration value="day_each_month" /> <!-- stated twice -->
			<xs:enumeration value="week_each_year" />
			<xs:enumeration value="month_each_year" />
			<xs:enumeration value="day_2" />
		</xs:restriction>
	</xs:simpleType>
</xs:attribute>
````
As you may notice, `"day_each_month"` appears twice, while the second should be, according to the documentation, `"day_each_year"`.

If we edit manually the exported XML and change `"day_each_month"` to `"day_each_year"`, when we import the attribute value won't be recognized and will show up as `None`.
