+++
# Projects widget.
# Note: this widget will only display if `content/project/` contains projects.

date = "2016-04-20T00:00:00"
draft = true

title = "Projects"
subtitle = ""
widget = "projects"

# Order that this section will appear in.
weight = 3

# View.
# Customize how projects are displayed.
# Legend: 0 = list, 1 = cards.
view = 0

count = 500

# Filter toolbar.
# Add or remove as many filters (`[[filter]]` instances) as you like.
# Use "*" tag to show all projects or an existing tag prefixed with "." to filter by specific tag.
# To remove toolbar, delete/comment all instances of `[[filter]]` below.
[[filter]]
  name = "All"
  tag = "*"

[[filter]]
  name = "Professional"
  tag = ".professional"

[[filter]]
  name = "Personal"
  tag = ".personal"

[[filter]]
  name = "Academic"
  tag = ".academic"

+++

