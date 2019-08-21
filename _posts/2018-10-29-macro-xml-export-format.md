---
layout: post
title: Macro XML export format
date: 2018-10-29 23:36 +0100
tags:
    - XML
---
Macro XML entities generated using the *Export* command are structured like:

    {% highlight xml %}
    <Macro
        index="(integer)"
        name="(text)"
    >
		<Appearance
            Color="(text)" # HEX color code
        />
		<Macroline
            index="(integer)" # starting form 0
        >
			<text>
                (text) # CMD line
            </text>
		</Macroline>
	</Macro>{% endhighlight %}
