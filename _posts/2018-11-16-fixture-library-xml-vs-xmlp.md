---
layout: post
title: 'Fixture library: XML vs XMLP'
date: 2018-11-16 23:36 +0100
tags: xml
---
What are the differences between XML and XMLP fixture files?
XMLP are compressed XMLs with an extra header.

````sh
$ cp generic\@dimmer\@00.xmlp generic\@dimmer\@00.xml.gz
$ gzip -d generic\@dimmer\@00.xml.gz
$ cat generic\@dimmer\@00.xml
MA DATA?﻿<?xml version="1.0" encoding="utf-8"?>
<MA xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://schemas.malighting.de/grandma2/xml/MA http://schemas.malighting.de/grandma2/xml/2.8.123/MA.xsd" major_vers="2" minor_vers="8" stream_vers="123" xmlns="http://schemas.malighting.de/grandma2/xml/MA">
	<FixtureType name="Dimmer" mode="00">
		<InfoItems>
			<Info type="Revision" date="2015-12-07">Automated import from MA Lighting (C-RevNum: 11; Date: 2014-10-22)</Info>
			<Info type="Invisible" date="2015-12-07">generator_software_name="MA Importer",generator_software_version="9f54f4b62519d7c623c7e8e9b20a0a67177041b6"</Info>
		</InfoItems>
		<short_name>Dim</short_name>
		<manufacturer>Generic</manufacturer>
		<short_manufacturer>Generic</short_manufacturer>
		<Modules>
			<Module name="Main Module" class="Conventional" beamtype="Wash" beam_angle="25" beam_intensity="10000">
				<ChannelType attribute="DIM" feature="DIMMER" preset="DIMMER" coarse="1" highlight_value="100">
					<ChannelFunction from="0" to="100" min_dmx_24="0" max_dmx_24="16777215" physfrom="0" physto="1" subattribute="DIM" attribute="DIM" feature="DIMMER" preset="DIMMER">
						<ChannelSet name="closed" from_dmx="0" to_dmx="0" />
						<ChannelSet name="open" from_dmx="255" to_dmx="255" />
					</ChannelFunction>
				</ChannelType>
			</Module>
		</Modules>
		<Instances>
			<Instance module_index="0" patch="1" locked="true" />
		</Instances>
		<Wheels />
	</FixtureType>
</MA>$
````
What appears as `MA DATA?` in the `cat` output is actually a 19 bytes header:

````
4D 41 20 44 41 54 41 00 02 00 05 03 FD 05 00 00 EF BB BF
M  A     D  A  T  A                 ˝           Ô  ª  ø
````
