---
layout: post
title: Macro XML export format
date: 2018-10-29 23:36 +0100
---

<Macro> XML entities are structured like:

    {% highlight xml %}
    <Macro
        index="(integer)"
        name=""
        cli=""
        timing=""
        >
        <Appearance />
        <InfoItems></InfoItems>
        <Macroline
            index="(integer)"
            delay="(float)" # set to "-1" when trigger is GO instead of Follow
            disabled="(boolean)">
            <text></text>
            <info></info>
        </Macroline>
    </Macro>{% endhighlight %}
