---
title: '经历'
date: 2023-10-24
type: landing

design:
  spacing: '5rem'

# Note: `username` refers to the user's folder name in `content/authors/`
# (the resume blocks read the language-merged profile from
# data/zh/authors/me.yaml; grant titles stay in English as the
# scholarly record, framing and role markers are translated.)

# Page sections
sections:
  # Download CV pill at the top of the page (owner round, 2026-11-21):
  # the button moved here from the homepage hero. Styled by the
  # .exp-cv-* rules in assets/css/custom.css.
  - block: markdown
    content:
      text: |-
        <div class="exp-cv-row"><a class="exp-cv-btn" href="/uploads/resume.pdf">下载简历</a></div>
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
      title: 社会服务
      text: |-
        - Games and Learning Alliance（GALA）2026 筹备委员会成员
        - 美国教育研究协会（AERA）提案评审人（C、E、H、K 分会）
        - CATESOL 2021 分会场主席
        - 佩珀代因大学博士论文委员会成员（学习技术教育博士项目）：Chia Hui Hung，2026 年至今
        - 佩珀代因大学博士论文委员会成员（学习技术教育博士项目）：Jingzhe Zhang，2026 年至今
    design:
      columns: '1'
  - block: markdown
    content:
      title: 科研经费
      text: |-
        - 教务长基金，佩珀代因大学，2022（主持人）：Gamification of Leadership Studies Curriculum: A Systematic Review (2012-2022)
        - 教务长基金，佩珀代因大学，2022（共同主持人）：Adapted Media Communication Strategies: A Comparison between Men and Women Police Chiefs and Sheriffs
        - 教务长基金，佩珀代因大学，2023（主持人）：Assessing the Role of AI Tools in Enhancing Learning and Motivation: An Experimental Study
    design:
      columns: '1'
  - block: resume-skills
    content:
      title: 技能
      username: me
  - block: resume-languages
    content:
      title: 语言
      username: me
---
