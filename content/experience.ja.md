---
title: '経歴'
date: 2023-10-24
type: landing

design:
  spacing: '5rem'

# Note: `username` refers to the user's folder name in `content/authors/`
# (the resume blocks read the language-merged profile from
# data/ja/authors/me.yaml; grant titles stay in English as the
# scholarly record, framing and role markers are translated.)

# Page sections
sections:
  # Download CV pill at the top of the page (owner round, 2026-11-21):
  # the button moved here from the homepage hero. Styled by the
  # .exp-cv-* rules in assets/css/custom.css.
  - block: markdown
    content:
      text: |-
        <div class="exp-cv-row"><a class="exp-cv-btn" href="/uploads/resume.pdf">履歴書をダウンロード</a></div>
    design:
      columns: '1'
  - block: resume-experience
    content:
      username: me
    design:
      # Hugo date format
      date_format: '2006年1月'
      # Education or Experience section first?
      is_education_first: false
  - block: markdown
    content:
      title: サービス活動
      text: |-
        - Games and Learning Alliance（GALA）2026 企画委員会メンバー
        - 米国教育学会（AERA）プロポーザル査読者（Division C、E、H、K）
        - CATESOL 2021 セッションチェア
        - ペパーダイン大学 博士論文委員会メンバー（EdD in Learning Technologies）：Chia Hui Hung、2026年〜現在
        - ペパーダイン大学 博士論文委員会メンバー（EdD in Learning Technologies）：Jingzhe Zhang、2026年〜現在
    design:
      columns: '1'
  - block: markdown
    content:
      title: 研究助成
      text: |-
        - プロヴォスト研究助成、ペパーダイン大学、2022（研究代表者）：Gamification of Leadership Studies Curriculum: A Systematic Review (2012-2022)
        - プロヴォスト研究助成、ペパーダイン大学、2022（共同研究代表者）：Adapted Media Communication Strategies: A Comparison between Men and Women Police Chiefs and Sheriffs
        - プロヴォスト研究助成、ペパーダイン大学、2023（研究代表者）：Assessing the Role of AI Tools in Enhancing Learning and Motivation: An Experimental Study
    design:
      columns: '1'
  - block: resume-skills
    content:
      title: スキル
      username: me
  - block: resume-languages
    content:
      title: 言語
      username: me
---
