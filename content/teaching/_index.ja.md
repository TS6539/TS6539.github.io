---
title: 教育
summary: 担当科目と教育活動

# Further Hiroshima teaching activities, rendered as list rows on the
# Teaching index after the course row (layouts/teaching/list.html).
# They have no pages of their own. Facts follow the Hiroshima entry of
# Hao's CV (static/uploads/resume.pdf); appointment began April 2026.
activities:
  - status: "カリキュラム開発"
    term: "2026"
    title: "Communication Basics and Communication Exercises"
    summary: "科目担当教員とともに、これらのオンライン英語コミュニケーション科目について、新しいカリキュラム、教材、評価方法を開発しています。"
  - status: "授業参観"
    term: "2026"
    title: "授業参観とフィードバック"
    summary: "日本の大学生や英語教育の実践への理解を深めるため、専任教員の授業を参観し、フィードバックを行っています。"
  - status: "FD"
    term: "2026"
    title: "FDワークショップ"
    summary: "大学英語教育のデジタル化とAIリテラシー研修に関するFDワークショップを企画しています。"

cascade:
  - target:
      path: '{/teaching/*/**}'
    type: docs
    params:
      show_breadcrumb: true
---
