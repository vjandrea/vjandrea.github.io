---
layout: post
title: Agenda XML export format
date: 2018-10-29 23:36 +0100
---
Agenda elements are structured like:

    {% highlight xml %}
    <Agenda>
        <InfoItems>
            <Info />
        </InfoItems>
    </Agenda>{% endhighlight %}


Here's a breakdown of the attributes:

    {% highlight xml %}
    <Agenda
        index="0" 
        repeat="(string)"
            Options:
            |none
            |day
            |week
            |month
            |year
            |day_each_month
            |week_each_month
            |day_each_month # repetition, looks like a bug in the XSD
            |week_each_year
            |month_each_year
            |day_2 # TODO: see if "every 3rd day" uses this attribute
                     with repeat_count
        repeat_count="(integer)"
        date="(timestamp)" # formatted as YYYY-MM-DDThh:mm:ss
        time="(integer)" # looks like an offset of fractions of a second
                           eg: 108000
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

