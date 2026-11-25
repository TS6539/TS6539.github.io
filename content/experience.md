---
title: 'Experience'
date: 2023-10-24
type: landing

design:
  spacing: '5rem'

# Note: `username` refers to the user's folder name in `content/authors/`

# Page sections
sections:
  # Download CV pill at the top of the page (owner round, 2026-11-21):
  # the button moved here from the homepage hero. Styled by the
  # .exp-cv-* rules in assets/css/custom.css.
  - block: markdown
    content:
      text: |-
        <div class="exp-cv-row"><a class="exp-cv-btn" href="/uploads/resume.pdf">Download CV</a></div>
    design:
      columns: '1'
  - block: resume-experience
    content:
      username: me
    design:
      # Hugo date format
      date_format: 'January 2006'
      # Education or Experience section first?
      is_education_first: false
  - block: markdown
    content:
      title: Service
      text: |-
        - Planning Committee member, Games and Learning Alliance (GALA) 2026
        - Proposal reviewer, American Educational Research Association (Divisions C, E, H, K)
        - Session Chair, CATESOL 2021
        - Dissertation committee member, Pepperdine University (EdD in Learning Technologies): Chia Hui Hung, 2026–present
        - Dissertation committee member, Pepperdine University (EdD in Learning Technologies): Jingzhe Zhang, 2026–present
    design:
      columns: '1'
  - block: markdown
    content:
      title: Grants
      text: |-
        - Provost Grant, Pepperdine University, 2022 (PI): Gamification of Leadership Studies Curriculum: A Systematic Review (2012-2022)
        - Provost Grant, Pepperdine University, 2022 (Co-PI): Adapted Media Communication Strategies: A Comparison between Men and Women Police Chiefs and Sheriffs
        - Provost Grant, Pepperdine University, 2023 (PI): Assessing the Role of AI Tools in Enhancing Learning and Motivation: An Experimental Study
        - Knowledge Engineer on an NIH-funded project developing AI-supported meta-analysis and systematic review software (Hyperthesis LLC; total award $3.9M across Phases I and II)
    design:
      columns: '1'
  - block: resume-skills
    content:
      title: Skills
      username: me
  - block: resume-languages
    content:
      title: Languages
      username: me
---
