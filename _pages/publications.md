---
layout: page
permalink: /publications/
title: publications
description: (*) denotes equal contribution. 
years: [2023, 2022, 2018]
nav: true
nav_order: 1
---
You can also find my articles on my [Google Scholar profile](https://scholar.google.com/citations?user=F1Cu218AAAAJ&hl=en). <br>
<!-- _pages/publications.md -->
<div class="publications">

{%- for y in page.years %}
  <h2 class="year">{{y}}</h2>
  {% bibliography -f {{ site.scholar.bibliography }} -q @*[year={{y}}]* %}
{% endfor %}

</div>
