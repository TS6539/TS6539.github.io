---
# Leave the homepage title empty to use the site title
title: ''
summary: ''
date: 2026-11-18
type: landing

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
        My work follows three connected lines:

        **AI in language education.** How generative AI changes the way students write, read, and learn in a second language, and how universities should respond, from classroom practice to institutional guidelines. A recent study of Japanese undergraduates writing with ChatGPT appeared as Chapter 16 of the ICQE 2026 proceedings (Springer).

        **Quantitative ethnography.** Using epistemic network analysis (ENA) to trace patterns in how learners interact with AI tools, and what separates productive use from shortcut use. An ENA study of preservice teachers' reading lives is accepted at AERA 2027.

        **Evidence synthesis.** Systematic reviews and AI-supported evidence synthesis that map what the field actually knows about games, AI, and technology in language learning, including work on an NIH-funded synthesis project at Hyperthesis LLC.
    design:
      columns: '1'
  - block: markdown
    content:
      title: 'Teaching'
      subtitle: ''
      text: |-
        At Hiroshima University I teach undergraduate English courses in which students learn how to write with AI. I also run *Writing English with AI, On Your Own Terms*, a 10-session course open to university staff, faculty and students, and I organize faculty development sessions on the digitalization of English education and AI literacy.
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
        My work has been cited in 113 papers by researchers at 93 institutions in 36 countries. [See the Impact page](/impact/) for a map of the citing institutions and how the citations have grown over time.
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
        The best way to reach me is by email at haots2308@gmail.com. I am glad to connect with colleagues working on AI in education, second language acquisition, the learning sciences, learning analytics, quantitative ethnography and systematic review, including co-authoring, ENA collaborations and invited talks.
    design:
      columns: '1'
---
