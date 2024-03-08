---
layout: page
title: Resources
permalink: /pdfs/
sitemap: false
fn: /assets
---

{% assign files = site.static_files %}
{% for f in files %}
  {% if f.extname == '.pdf' %}
  {% assign mt = f.modified_time | split: " " %}
  {{mt[0]}}: [{{f.basename}}]({{f.path}})
  {% endif %}
{% endfor %}
