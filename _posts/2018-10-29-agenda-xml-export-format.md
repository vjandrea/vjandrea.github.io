---
layout: post
title: Agenda XML export format
date: 2018-10-29 23:36 +0100
tags:
    - XML
---
Agenda XML elements generated using the *Export* command are structured like:

    {% highlight xml %}
    <Agenda>
        <InfoItems>
            <Info />
        </InfoItems>
    </Agenda>{% endhighlight %}

Attribute breakdown

    {% highlight xml %}
    <Agenda
        index="(integer)" # starts from 0
        repeat="(string)"
            Options:
            |none
            |day
            |week
            |month
            |year
            |day_each_month # stated twice in the XSD, probably a bug.
            |week_each_month
            |week_each_year
            |month_each_year
            |day_2
        repeat_count="(integer)"
            Some options:
            | "3" = "Every 3rd day"
            | "4" = "Every 4th day"
            | "5" = "Every 5th day"
            | "6" = "Every 6th day"
            | "7" = **Illegal**{:.rednote}
        date="(timestamp)" # formatted as YYYY-MM-DDThh:mm:ss
        time="(integer)" # looks like an offset
                           eg: 108000 = 3600 * 30
        last_day="(integer)" # looks like the number of days from 0000-00-00
                               but there's an offset, eg: 737367
        duration="(integer)" # duration in seconds, eg: 30
        special_time="(string)"
            Options:
            |absolute
            |first_sunlight
            |sunrise
            |sunset
            |last_daylight
        >
        <InfoItems>
            <Info
                date="(timestamp of the comment creation YYYY-MM-DDThh:mm:ss)">
                (comment)
            </Info>
        </InfoItems>
        <macro_line>
            (actual command line)
        </macro_line>
    </Agenda>{% endhighlight %}
