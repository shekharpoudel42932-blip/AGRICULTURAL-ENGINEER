---
title: Writing your first AquaCrop simulation
description: A gentle walkthrough of FAO's AquaCrop, covering climate files, crop parameters and the calibration traps that catch everyone.
date: 2024-10-05
tags: [Crop water, Modelling]
---

AquaCrop is a crop model that runs on water. It's simpler than most, which makes it a good place to start.

## Inputs you need

- Daily **climate** data: rainfall, ET₀ and min/max temperature
- A **crop** file: start from FAO's defaults, then calibrate canopy cover and the harvest index
- **Soil** layers with field capacity and wilting point
- **Management**: irrigation schedule, mulches, fertility stress

## Common traps

Calibrating against yield alone hides compensating errors. Calibrate against **canopy cover over time** first,
then check biomass, and only then look at yield.
