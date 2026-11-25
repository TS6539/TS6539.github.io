---
title: 教学
summary: 我的教学

# Further Hiroshima teaching activities, rendered as list rows on the
# Teaching index after the course row (layouts/teaching/list.html).
# They have no pages of their own. Facts follow the Hiroshima entry of
# Hao's CV (static/uploads/resume.pdf); appointment began April 2026.
activities:
  - status: "课程开发"
    term: "2026"
    title: "Communication Basics and Communication Exercises"
    summary: "我与学科教师合作，为这两门在线英语沟通课程开发新的课程大纲、教学材料与评估。"
  - status: "课堂观摩"
    term: "2026"
    title: "课堂观摩与反馈"
    summary: "我观摩专任教师的课堂，以了解日本大学生的情况与英语教育实践，并提供反馈。"
  - status: "教师发展"
    term: "2026"
    title: "教师发展工作坊"
    summary: "我组织关于大学英语教育数字化与人工智能素养培训的教师发展工作坊。"

cascade:
  - target:
      path: '{/teaching/*/**}'
    type: docs
    params:
      show_breadcrumb: true
---
