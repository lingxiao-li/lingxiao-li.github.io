---
layout: page
permalink: /teaching/
title: teaching
description: Course I taught.
nav: true
nav_order: 5
---

{% include base_path %}

{% for post in site.teaching reversed %}
  {% include archive-single.html %}
{% endfor %}
