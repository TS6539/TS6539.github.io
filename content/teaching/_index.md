---
title: Teaching
summary: My teaching

# Further Hiroshima teaching activities, rendered as list rows on the
# Teaching index after the course row (layouts/teaching/list.html).
# They have no pages of their own. Facts follow the Hiroshima entry of
# Hao's CV (static/uploads/resume.pdf); appointment began April 2026.
activities:
  - status: "Curriculum development"
    term: "2026"
    title: "Communication Basics and Communication Exercises"
    summary: "Working with subject instructors, I develop new curricula, teaching materials, and assessments for these online English communication courses."
  - status: "Class observation"
    term: "2026"
    title: "Class observation and feedback"
    summary: "I observe tenure-track faculty classes to gain insight into Japanese university students and English education practices, and provide feedback."
  - status: "Faculty development"
    term: "2026"
    title: "Faculty development workshops"
    summary: "I organize faculty development workshops on the digitization of university English education and AI literacy training."

# The section was renamed from Courses to Teaching (2026-11-19); keep
# the old section URL working.
aliases:
  - /courses/

cascade:
  - target:
      path: '{/teaching/*/**}'
    type: docs
    params:
      show_breadcrumb: true
---
