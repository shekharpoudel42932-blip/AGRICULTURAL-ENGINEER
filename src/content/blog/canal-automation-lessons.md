---
title: "Canal automation: lessons from a pilot"
description: Three automated gates, one season, and why the hardest part wasn't the hardware.
date: 2026-01-22
tags: [Irrigation, Automation]
cover: ../../assets/covers/canal.jpg
coverAlt: "Illustration of an automated canal gate"
---

The sensors and actuators worked from week one. Trust took longer.

Gate operators worried that automation would cost them their jobs, and farmers upstream worried they would lose water.
What helped was **making the data public**: a weekly SMS summary to every member of the water users' association
showing how much water each block received.

On the technical side, the lesson was to build in hysteresis. Without a dead band, the gates hunted back and forth
in gusty wind, and the actuators ran far more often than they needed to.
