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
        私の研究は、相互につながる3つのラインで進めています。

        **言語教育におけるAI.** 生成AIが、学生の第二言語でのライティング、リーディング、学びをどう変えているのか、そして大学が教室実践から制度的なガイドラインまで、どう応えるべきかを扱います。『Technology in Language Teaching & Learning』に掲載された2025年の研究では、大学生が大学英語試験の準備に生成AIをどう使ったかを調べました。

        **量的エスノグラフィー.** エピステミック・ネットワーク分析（ENA）を用いて、プロセスデータの中の学びとアイデンティティのパターンを追います。学習者がAIツールとどう関わるのか、生産的な利用と近道的な利用を分けるものは何かも含みます。ICQE 2026 のプロシーディングス（Springer）の章では、ENA を用いて、資料に基づくライティングにおける生成AI利用のパターンを描きました。

        **エビデンス統合.** 教育学と社会科学のエビデンスを地図化するシステマティックレビューと、統合を速くするAI支援ツールです。Hyperthesis LLC における NIH 助成プロジェクトでの仕事も含まれます。
    design:
      columns: '1'
  - block: markdown
    content:
      title: 'Speaking & collaboration'
      subtitle: ''
      text: |-
        生成AIと言語教育、大学のためのAIガイドライン、量的エスノグラフィーについて講演やワークショップを行っています。エピステミック・ネットワーク分析やエビデンス統合のパートナーとして、研究チームに加わることも歓迎しています。
    design:
      columns: '1'
  - block: markdown
    content:
      title: 'Teaching'
      subtitle: ''
      text: |-
        広島大学では『Writing English with AI, On Your Own Terms』を担当しています。大学の学生・教職員を対象とした10回完結の単位外研修プログラムで、参加者はAIとともに書くことを学びます。また、科目担当教員とともにオンライン科目 Communication Basics と Communication Exercises のカリキュラム開発を行い、教員の授業を参観し、英語教育のデジタル化とAIリテラシーに関するFDセッションを企画しています。
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
        私の研究は、36か国93機関の研究者による113本の論文に引用されています。[インパクトページ](/ja/impact/)では、引用機関の地図と、引用の年ごとの推移をご覧いただけます。
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
        講演のご依頼や共同研究のご相談は、[tianshihao@hiroshima-u.ac.jp](mailto:tianshihao@hiroshima-u.ac.jp) までメールでご連絡ください。その他のご用件は [haots2308@gmail.com](mailto:haots2308@gmail.com) でも受け付けています。生成AIと言語教育、量的エスノグラフィー、AI支援のエビデンス統合に取り組む方々からのご連絡を特に歓迎しています。
    design:
      columns: '1'
---
