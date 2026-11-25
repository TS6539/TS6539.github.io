---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2026-11-18
type: landing

# NOTE (i18n): the markdown block titles below (Research, Speaking &
# collaboration, Teaching, Contact) are lookup keys in
# layouts/landing/list.html and must stay in English in every language;
# only the `text` fields are translated.
sections:
  - block: resume-biography-3
    content:
      # Choose a user profile to display (a folder name within `content/authors/`)
      username: me
      text: ''
      # Show a call-to-action button under your biography? (optional)
      button:
        text: Download CV
        url: uploads/resume.pdf
      headings:
        about: ''
        education: ''
        interests: ''
    design:
      # Name heading sizing to accommodate long or short names
      name:
        size: lg # Options: xs, sm, md, lg (default), xl

      # Avatar customization
      avatar:
        size: medium # Options: small (150px), medium (200px, default), large (320px), xl (400px), xxl (500px)
        shape: rounded # Options: circle (default), square, rounded
  - block: markdown
    content:
      title: 'Research'
      subtitle: ''
      text: |-
        我的研究沿着三条相互关联的主线展开：

        **语言教育中的人工智能.** 生成式人工智能如何改变学生以第二语言写作、阅读与学习的方式，以及大学应如何应对，从课堂实践到制度层面的指南。一项 2025 年发表于《Technology in Language Teaching & Learning》的研究考察了大学生如何使用生成式人工智能备考大学英语考试。

        **定量民族志.** 运用认知网络分析（ENA）追踪过程数据中的学习与身份模式，包括学习者如何与人工智能工具互动，以及什么区分了富有成效的使用与走捷径的使用。ICQE 2026 论文集（Springer）中的章节运用 ENA 描绘了学生在基于来源的写作中运用生成式人工智能的模式。

        **证据综合.** 绘制教育学与社会科学领域证据图谱的系统综述，以及让综合更快的人工智能支持工具，包括在 Hyperthesis LLC 参与美国国立卫生研究院（NIH）资助项目的工作。
    design:
      columns: '1'
  - block: markdown
    content:
      title: 'Speaking & collaboration'
      subtitle: ''
      text: |-
        我围绕生成式人工智能与语言教育、大学人工智能指南以及定量民族志做讲座与工作坊，也乐意作为认知网络分析或证据综合方面的合作伙伴加入研究团队。
    design:
      columns: '1'
  - block: markdown
    content:
      title: 'Teaching'
      subtitle: ''
      text: |-
        在广岛大学，我主持《Writing English with AI, On Your Own Terms》——一门为期 10 次课的非学分培训课程（研修项目），面向全校学生、教职员工开放，参与者在课程中学习与人工智能协作写作。我还与学科教师合作开发在线课程 Communication Basics 和 Communication Exercises 的教学大纲，观摩教师课堂，并组织关于英语教育数字化与人工智能素养的教师发展活动。
    design:
      columns: '1'
  - block: collection
    id: papers
    content:
      title: Featured Publications
      filters:
        folders:
          - publications
        featured_only: true
    design:
      view: article-grid
      columns: 2
  - block: collection
    content:
      title: Recent Publications
      text: ''
      filters:
        folders:
          - publications
        exclude_featured: false
    design:
      view: citation
  - block: markdown
    content:
      title: 'Research impact'
      subtitle: ''
      text: |-
        我的研究已被 36 个国家 93 家机构的研究者引用，共计 113 篇引用论文。[查看影响力页面](/zh/impact/)可查看引用机构的地图分布以及引用量逐年的增长。
    design:
      columns: '1'
  - block: collection
    id: news
    content:
      title: Recent News
      subtitle: ''
      text: ''
      # Page type to display. E.g. post, talk, publication...
      page_type: blog
      # Choose how many pages you would like to display (0 = all pages)
      count: 10
      # Filter on criteria
      filters:
        author: ''
        category: ''
        tag: ''
        exclude_featured: false
        exclude_future: false
        exclude_past: false
        publication_type: ''
      # Choose how many pages you would like to offset by
      offset: 0
      # Page order: descending (desc) or ascending (asc) date.
      order: desc
    design:
      # Choose a layout view
      view: card
      # Reduce spacing
      spacing:
        padding: [0, 0, 0, 0]
  - block: markdown
    content:
      title: 'Contact'
      subtitle: ''
      text: |-
        如需邀请演讲或探讨研究合作，请发邮件至 [tianshihao@hiroshima-u.ac.jp](mailto:tianshihao@hiroshima-u.ac.jp)。其他事项也可以联系 [haots2308@gmail.com](mailto:haots2308@gmail.com)。我尤其乐意与从事生成式人工智能与语言教育、定量民族志或人工智能支持的证据综合研究的同行交流。
    design:
      columns: '1'
---
