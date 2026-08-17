/**
 * The single source of truth for everything the site renders about its author.
 *
 * Mirrors `resume-en.typ` in the companion `resume` repository. When the CV
 * changes, change this file — nothing else on the site hardcodes biography.
 */

export interface SocialLink {
  readonly label: string;
  readonly handle: string;
  readonly href: string;
  /** Key into the icon sprite in `src/components/Icon.astro`. */
  readonly icon: 'github' | 'scholar' | 'linkedin' | 'mail' | 'x' | 'arrow';
}

export interface Interest {
  readonly title: string;
  readonly blurb: string;
  /** Two-digit index rendered as a mono eyebrow. */
  readonly index: string;
}

export interface TimelineEntry {
  readonly organisation: string;
  readonly role: string;
  readonly location: string;
  readonly start: string;
  readonly end: string;
  readonly detail?: string;
  readonly href?: string;
  readonly kind: 'education' | 'experience';
}

export interface Publication {
  readonly title: string;
  readonly authors: readonly string[];
  readonly venue: string;
  readonly year: number;
  readonly href?: string;
  readonly note?: string;
  /** Shown before the "show everything" toggle is pressed. */
  readonly selected: boolean;
}

export interface Award {
  readonly title: string;
  readonly detail?: string;
  readonly year: string;
}

export interface SkillGroup {
  readonly label: string;
  readonly items: readonly string[];
}

export interface OpenSourceLink {
  readonly label: string;
  readonly href: string;
}

export interface OpenSourceEntry {
  readonly kind: 'own' | 'upstream';
  readonly label: string;
  readonly name: string;
  readonly description: string;
  readonly href: string;
  readonly tags: readonly string[];
  readonly links?: readonly OpenSourceLink[];
}

export interface CvEdition {
  /** Matches the `resume-<id>.typ` entry point and the released asset name. */
  readonly id: 'en' | 'zh' | 'en-zh';
  /** Set in the language of the document itself, so it needs no gloss. */
  readonly label: string;
  /** Path under `public/`, filled in by `bun run cv`. Never a GitHub URL. */
  readonly href: string;
}

export interface Profile {
  readonly name: string;
  readonly nameLocal: string;
  readonly alias: string;
  readonly role: string;
  readonly affiliation: string;
  readonly affiliationHref: string;
  readonly location: string;
  readonly timezone: string;
  /** Caption under the portrait in the about section. */
  readonly portrait: { readonly alt: string; readonly caption: string };
  /** Short personal line, set vertically in the hero margin. */
  readonly tagline: string;
  readonly rotatingWords: readonly string[];
  readonly bio: readonly string[];
  /**
   * What I am expert in, for `schema.org/knowsAbout` and the social card.
   * Separate from `interests`, which is hobbies — a machine reading this page
   * should not conclude that serverless infrastructure is my field.
   */
  readonly researchAreas: readonly string[];
  readonly cv: readonly CvEdition[];
  readonly email: string;
  readonly socials: readonly SocialLink[];
  readonly interests: readonly Interest[];
  readonly timeline: readonly TimelineEntry[];
  readonly publications: readonly Publication[];
  readonly awards: readonly Award[];
  readonly skills: readonly SkillGroup[];
  readonly openSource: readonly OpenSourceEntry[];
  readonly service: readonly SkillGroup[];
}

/** Name used to mark the author's own entry in an author list. */
export const SELF = 'Siqi Yang';

/**
 * The site serves the CV itself. The `resume` repository is private, so its
 * release assets 404 for visitors; `bun run cv` vendors them into `public/cv/`
 * ahead of every build. Named for whoever ends up with the file in a downloads
 * folder, not for the release asset it came from.
 */
const CV = '/cv/siqi-yang-cv';

export const profile: Profile = {
  name: 'Siqi Yang',
  nameLocal: '杨思祺',
  alias: 'YouSiki',
  role: 'Ph.D. Candidate in Computer Science',
  affiliation: 'Camera Intelligence Lab, Peking University',
  affiliationHref: 'https://camera.pku.edu.cn',
  // Where I am right now, not where the Ph.D. is — the hero clock runs on this.
  location: 'Tokyo, Japan',
  timezone: 'Asia/Tokyo',
  portrait: {
    alt: 'Siqi Yang sitting on a grassy riverbank beneath cherry blossoms, camera in hand, looking up into the branches',
    // Date, place, and body are read straight off the original file's EXIF.
    caption: 'April 2026 · Kyoto · Canon EOS R5',
  },

  // Mirrors the bio on https://github.com/yousiki.
  tagline: 'PhD student by day. Vibe coder by night.',

  rotatingWords: ['spike cameras', 'video generation', 'world models', 'light & pixels'],

  /**
   * General to specific, on three verbs: recover, capture, generate. The first
   * paragraph names all three; the next three take them in that order, which is
   * also the order I came to them. Relighting sits under generate rather than
   * recover — it synthesises an appearance the scene never had.
   *
   * The three expansions share one shape — verb, colon, the work under it — so
   * they read as three answers to the same question rather than three separate
   * remarks. One sentence each, and deliberately no more: the cards below carry
   * the detail, and anything longer here was competing with them.
   */
  bio: [
    'Everything I work on is one question about light, asked three ways: how to **recover** a scene, how to **capture** one, and how to **generate** one that was never there.',
    'Recovery is the inverse problem: **intrinsic decomposition** and **inverse rendering** prise geometry, material and light apart, and **neural radiance fields** do it in three dimensions.',
    'Capture stops treating the sensor as given: a **spike camera** fires the instant a pixel has seen enough light, tens of thousands of times a second, which is what brings **HDR** and **high-frame-rate** imaging to scenes too fast and too contrasty for a shutter to hold.',
    'Generation runs the arrow backwards: **video generation** that follows a camera and a soundtrack, **relighting** under a sun the scene never saw, **world models** consistent for everyone inside them.',
  ],

  researchAreas: [
    'Neuromorphic imaging',
    'Video generation',
    'World models',
    'Inverse rendering',
    'Neural radiance fields',
    'Computational photography',
  ],

  /**
   * Three editions built from three Typst entry points. English leads because
   * the site is written in it; the bilingual edition is the two documents in one
   * file, which is what most applications ask for.
   */
  cv: [
    { id: 'en', label: 'English', href: `${CV}-en.pdf` },
    { id: 'zh', label: '中文', href: `${CV}-zh.pdf` },
    { id: 'en-zh', label: 'English + 中文', href: `${CV}-en-zh.pdf` },
  ],

  email: 'you.siki@outlook.com',

  socials: [
    {
      label: 'Email',
      handle: 'you.siki@outlook.com',
      href: 'mailto:you.siki@outlook.com',
      icon: 'mail',
    },
    { label: 'GitHub', handle: '@yousiki', href: 'https://github.com/yousiki', icon: 'github' },
    {
      label: 'Google Scholar',
      handle: 'Siqi Yang',
      href: 'https://scholar.google.co.jp/citations?user=uA-gr1cAAAAJ',
      icon: 'scholar',
    },
    {
      label: 'LinkedIn',
      handle: 'in/yousiki',
      href: 'https://www.linkedin.com/in/yousiki/',
      icon: 'linkedin',
    },
    { label: 'X', handle: '@__yousiki__', href: 'https://x.com/__yousiki__', icon: 'x' },
  ],

  /**
   * Side interests, not research. The about section already states the research;
   * these are here to show the other half. Deliberately kept out of
   * `researchAreas`, which is what the structured data and the social card read.
   */
  interests: [
    {
      index: '01',
      title: 'Agent Harness',
      blurb:
        'Harnesses tuned to one task rather than all of them, mixing models instead of betting on a single one: cheap work routed to cheap models, budget spent only where it changes the answer. The likes of oh-my-openagent and oh-my-pi.',
    },
    {
      index: '02',
      title: 'Game Generation',
      blurb:
        'Handing the last two years of LLM and coding-agent progress to players and makers rather than researchers, so anyone can build the game already in their head — at a cost they can predict and a quality they can count on.',
    },
    {
      index: '03',
      title: 'Serverless Infra',
      blurb:
        'Serverless primitives on Cloudflare, used to keep services small, cheap, and forgettable. I would rather pay per request than spend the next decade keeping a machine alive.',
    },
  ],

  timeline: [
    {
      kind: 'experience',
      organisation: 'Alaya Lab, Shanda AI Research Tokyo',
      role: 'Research Intern',
      // The org's own name carries the city, so repeating it here would stutter.
      location: 'Japan',
      start: '2025.12',
      end: 'Present',
      detail: 'Multiplayer world models, panoramic video generation, generative game platform.',
    },
    {
      kind: 'education',
      organisation: 'Camera Intelligence Lab, Peking University',
      role: 'Ph.D. in Computer Science',
      location: 'Beijing, China',
      start: '2022.09',
      end: '2027.07',
      detail: 'Advised by Prof. Boxin Shi and Prof. Zhaofei Yu.',
      href: 'https://camera.pku.edu.cn',
    },
    {
      kind: 'experience',
      organisation: 'Hyperplane Lab, Peking University',
      role: 'Research Intern',
      location: 'Beijing, China',
      start: '2019.05',
      end: '2019.08',
      detail: 'Convolutional neural network quantisation and pruning.',
    },
    {
      kind: 'education',
      organisation: 'Turing Class, Peking University',
      role: 'B.S. in Computer Science',
      location: 'Beijing, China',
      start: '2018.09',
      end: '2022.07',
      detail: 'Honours track in the School of EECS.',
      href: 'https://cfcs.pku.edu.cn/english/research/turing_program/introduction1/index.htm',
    },
    {
      kind: 'experience',
      organisation: 'Youtu X-Lab, Tencent',
      role: 'Research Intern',
      location: 'Shenzhen, China',
      start: '2018.07',
      end: '2018.08',
      detail: 'Object detection and classification on the Tencent Weishi dataset.',
    },
  ],

  publications: [
    {
      title: 'MASS: Multiplayer World Models with Authoritative Shared State',
      authors: [
        'Ziqi Cai',
        SELF,
        'Yimu Wang',
        'Zixian Gao',
        'Yunheng Liu',
        'Shuchen Weng',
        'Erwin Wu',
        'Kaipeng Zhang',
        'Boxin Shi',
      ],
      venue: 'arXiv preprint',
      year: 2026,
      href: 'https://arxiv.org/abs/2608.06257',
      selected: true,
    },
    {
      title: 'Generative World Renderer at the Speed of Play',
      authors: [
        'Guixu Lin',
        'Zheng-Hui Huang',
        SELF,
        'Ming-Hsuan Yang',
        'Kaipeng Zhang',
        'Zhixiang Wang',
      ],
      venue: 'arXiv preprint',
      year: 2026,
      href: 'https://arxiv.org/abs/2607.18703',
      selected: false,
    },
    {
      title: 'High-Speed Full-Color HDR Imaging via Unwrapping Modulo-Encoded Spike Streams',
      authors: [
        'Chu Zhou*',
        `${SELF}*`,
        'Kailong Zhang',
        'Heng Guo',
        'Zhaofei Yu',
        'Boxin Shi',
        'Imari Sato',
      ],
      venue: 'arXiv preprint',
      year: 2026,
      href: 'https://arxiv.org/abs/2604.14632',
      note: '* equal contribution',
      selected: true,
    },
    {
      title: 'InstructAV2AV: Instruction-Guided Audio-Video Joint Editing',
      authors: ['Haojie Zheng', 'Yixin Yang', SELF, 'Shuchen Weng', 'Boxin Shi'],
      venue: 'SIGGRAPH Asia',
      year: 2026,
      href: 'https://arxiv.org/abs/2605.18467',
      note: 'To appear',
      selected: false,
    },
    {
      title: 'Interactive Panoramic World Exploration via Camera Control',
      authors: [
        'Jiaming Tan',
        'Zhen Li',
        'Shuwei Shi',
        'Minggui Teng',
        SELF,
        'Yuwei Wu',
        'Bo Zheng',
        'Kaipeng Zhang',
        'Chuanhao Li',
      ],
      venue: 'SIGGRAPH Asia',
      year: 2026,
      note: 'To appear',
      selected: false,
    },
    {
      title:
        'HFR and HDR Video from Multi-Attenuated Spikes Using a Rapidly Rotating SpokeND Filter',
      authors: [
        'Yakun Chang',
        'Zhaojun Huang',
        SELF,
        'Yeliduosi Xiaokaiti',
        'Shikui Wei',
        'Yao Zhao',
        'Tiejun Huang',
        'Boxin Shi',
      ],
      venue: 'CVPR',
      year: 2026,
      href: 'https://openaccess.thecvf.com/content/CVPR2026/html/Chang_HFR_and_HDR_Video_from_Multi-Attenuated_Spikes_Using_a_Rapidly_CVPR_2026_paper.html',
      selected: false,
    },
    {
      title: 'Audio-sync Video Instance Editing with Granularity-Aware Mask Refiner',
      authors: ['Haojie Zheng', 'Shuchen Weng', 'Jingqi Liu', SELF, 'Boxin Shi', 'Xinlong Wang'],
      venue: 'CVPR',
      year: 2026,
      href: 'https://openaccess.thecvf.com/content/CVPR2026/html/Zheng_Audio-sync_Video_Instance_Editing_with_Granularity-Aware_Mask_Refiner_CVPR_2026_paper.html',
      selected: false,
    },
    {
      title:
        'PanoWan: Lifting Diffusion Video Generation Models to 360° with Latitude/Longitude-aware Mechanisms',
      authors: [
        'Yifei Xia',
        'Shuchen Weng',
        SELF,
        'Jingqi Liu',
        'Chengxuan Zhu',
        'Minggui Teng',
        'Zijian Jia',
        'Han Jiang',
        'Boxin Shi',
      ],
      venue: 'NeurIPS',
      year: 2025,
      href: 'https://arxiv.org/abs/2505.22016',
      selected: true,
    },
    {
      title:
        'SpikeDiff: Zero-shot High-Quality Video Reconstruction from Chromatic Spike Camera and Sub-Millisecond Spike Streams',
      authors: [
        SELF,
        'Jinxiu Liang',
        'Zhaojun Huang',
        'Yeliduosi Xiaokaiti',
        'Yakun Chang',
        'Zhaofei Yu',
        'Boxin Shi',
      ],
      venue: 'ICCV',
      year: 2025,
      href: 'https://openaccess.thecvf.com/content/ICCV2025/html/Yang_SpikeDiff_Zero-shot_High-Quality_Video_Reconstruction_from_Chromatic_Spike_Camera_and_ICCV_2025_paper.html',
      selected: true,
    },
    {
      title: 'EventUPS: Uncalibrated Photometric Stereo Using an Event Camera',
      authors: [
        'Jinxiu Liang',
        'Bohan Yu',
        SELF,
        'Haotian Zhuang',
        'Jieji Ren',
        'Peiqi Duan',
        'Boxin Shi',
      ],
      venue: 'ICCV',
      year: 2025,
      href: 'https://openaccess.thecvf.com/content/ICCV2025/html/Liang_EventUPS_Uncalibrated_Photometric_Stereo_Using_an_Event_Camera_ICCV_2025_paper.html',
      selected: false,
    },
    {
      title: 'Real-Data-Driven 2000 FPS Color Video from Mosaicked Chromatic Spikes',
      authors: [`${SELF}*`, 'Zhaojun Huang*', 'Yakun Chang', 'Bin Fan', 'Zhaofei Yu', 'Boxin Shi'],
      venue: 'ECCV',
      year: 2024,
      href: 'https://doi.org/10.1007/978-3-031-73254-6_18',
      note: '* equal contribution',
      selected: true,
    },
    {
      title: 'Focal Stack and Light Field Imaging',
      authors: [SELF],
      venue: 'Computational Photography (China Machine Press), Chapter 5',
      year: 2024,
      href: 'https://e.dangdang.com/products/1901354835.html',
      note: 'Book chapter',
      selected: false,
    },
    {
      title:
        'Complementary Intrinsics From Neural Radiance Fields and CNNs for Outdoor Scene Relighting',
      authors: [
        `${SELF}*`,
        'Xuanning Cui*',
        'Yongjie Zhu',
        'Jiajun Tang',
        'Si Li',
        'Zhaofei Yu',
        'Boxin Shi',
      ],
      venue: 'CVPR',
      year: 2023,
      href: 'https://openaccess.thecvf.com/content/CVPR2023/html/Yang_Complementary_Intrinsics_From_Neural_Radiance_Fields_and_CNNs_for_Outdoor_Scene_Relighting_CVPR_2023_paper.html',
      note: '* equal contribution',
      selected: true,
    },
    {
      title: 'MILO: Multi-bounce Inverse Rendering for Indoor Scene with Light-emitting Objects',
      authors: ['Bohan Yu', SELF, 'Xuanning Cui', 'Siyan Dong', 'Baoquan Chen', 'Boxin Shi'],
      venue: 'TPAMI',
      year: 2023,
      href: 'https://doi.org/10.1109/TPAMI.2023.3244658',
      selected: false,
    },
  ],

  awards: [
    { title: 'PKU–Huawei Turing Graduate Program Scholarship', year: '2025' },
    { title: 'Huawei Hackathon, Software Challenge', detail: 'Gold Medal', year: '2025' },
    { title: 'Peking University Academic Excellence Award', year: '2019' },
    { title: 'China Collegiate Programming Contest, Guilin', detail: 'Gold Medal', year: '2018' },
    { title: 'National Olympiad in Informatics (NOI)', detail: 'Silver Medal', year: '2017' },
    // Split apart: a NOIP first prize is not a bronze medal, and the single
    // combined row put 'Bronze Medals' against both.
    {
      title: 'National Olympiad in Informatics in Provinces (NOIP)',
      detail: 'First Prize ×2',
      year: '2016–2017',
    },
    {
      title: 'APIO, CTSC, and Winter Camp',
      detail: 'Bronze Medals',
      year: '2016–2017',
    },
  ],

  skills: [
    { label: 'Languages', items: ['Python', 'C++', 'CUDA', 'Rust', 'TypeScript', 'Lisp', 'Nix'] },
    { label: 'Deep Learning', items: ['PyTorch', 'JAX', 'TensorFlow', 'Diffusers', 'Triton'] },
    {
      label: 'Graphics & Imaging',
      items: ['NeRF', '3DGS', 'Differentiable Rendering', 'Spike Sensor Pipeline'],
    },
    { label: 'Infrastructure', items: ['Docker', 'Ray', 'Cloudflare', 'GCP', 'Git'] },
  ],

  openSource: [
    {
      kind: 'own',
      label: 'Own project',
      name: 'cloudflare-zotero-mcp',
      description:
        'A remote Zotero MCP server on Cloudflare Workers, with full metadata and WebDAV PDF read/write, OAuth, and hybrid semantic search.',
      href: 'https://github.com/yousiki/cloudflare-zotero-mcp',
      tags: ['TypeScript', 'Cloudflare Workers', 'MCP', 'Zotero', 'WebDAV'],
    },
    {
      kind: 'upstream',
      label: 'Upstream contribution',
      name: 'junhoyeo/tokscale',
      description:
        'Added Jcode support, then fixed cached-token accounting and macOS configuration paths.',
      href: 'https://github.com/junhoyeo/tokscale',
      tags: ['Rust', 'CLI', 'Coding Agents'],
      links: [
        { label: '#468 · merged', href: 'https://github.com/junhoyeo/tokscale/pull/468' },
        { label: '#718 · merged', href: 'https://github.com/junhoyeo/tokscale/pull/718' },
        { label: '#937 · merged', href: 'https://github.com/junhoyeo/tokscale/pull/937' },
      ],
    },
    {
      kind: 'own',
      label: 'Own project',
      name: 'cloudflare-workers-mikan',
      description:
        'A serverless mirror of Mikan on Cloudflare Workers, including account flows, custom domains and a live deployment.',
      href: 'https://github.com/yousiki/cloudflare-workers-mikan',
      tags: ['TypeScript', 'Cloudflare Workers', 'Hono', 'Serverless'],
    },
    {
      kind: 'upstream',
      label: 'Upstream commit · 2019',
      name: 'WakeupSchedule_Kotlin',
      description:
        'Fixed PKU course imports by skipping unselected rows, correcting week parsing and restoring the elective-system URL.',
      href: 'https://github.com/tKM9WsmQUaUgNttn3DGUsHkxG8/WakeupSchedule_Kotlin',
      tags: ['Kotlin', 'Android', 'PKU'],
      links: [
        {
          label: 'e26d321 · commit',
          href: 'https://github.com/tKM9WsmQUaUgNttn3DGUsHkxG8/WakeupSchedule_Kotlin/commit/e26d32185fc3460f10d4246945df8243e42fb64d',
        },
      ],
    },
    {
      kind: 'own',
      label: 'Learning project',
      name: 'PKU-Racket',
      description:
        'Functional-programming exercises spanning SICP, continuations, interpreters, amb evaluation and register machines.',
      href: 'https://github.com/yousiki/PKU-Racket',
      tags: ['Racket', 'SICP', 'Functional Programming'],
    },
    {
      kind: 'upstream',
      label: 'Upstream contribution',
      name: 'numtide/treefmt-nix',
      description: 'Added isort as a supported formatter, including its Nix module and checks.',
      href: 'https://github.com/numtide/treefmt-nix',
      tags: ['Nix', 'isort', 'Formatting'],
      links: [{ label: '#87 · merged', href: 'https://github.com/numtide/treefmt-nix/pull/87' }],
    },
    {
      kind: 'own',
      label: 'Learning project',
      name: 'SoftwareFoundations',
      description:
        'Coq proofs and exercises from Software Foundations, covering induction, tactics, logic, proof objects and IMP.',
      href: 'https://github.com/yousiki/SoftwareFoundations',
      tags: ['Coq', 'Formal Methods', 'Proofs'],
    },
    {
      kind: 'upstream',
      label: 'Upstream contribution',
      name: 'kaitranntt/ccs',
      description:
        'Corrected Codex and Claude quota parsing across additional rate limits and utilization payloads.',
      href: 'https://github.com/kaitranntt/ccs',
      tags: ['TypeScript', 'Codex', 'Claude'],
      links: [
        { label: '#1113 · merged', href: 'https://github.com/kaitranntt/ccs/pull/1113' },
        { label: '#1114 · merged', href: 'https://github.com/kaitranntt/ccs/pull/1114' },
      ],
    },
    {
      kind: 'own',
      label: 'Learning project',
      name: 'PyTorch-FBS',
      description:
        'A PyTorch implementation of Feature Boosting and Suppression for input-dependent dynamic channel pruning.',
      href: 'https://github.com/yousiki/PyTorch-FBS',
      tags: ['Python', 'PyTorch', 'Dynamic Pruning'],
    },
    {
      kind: 'upstream',
      label: 'Upstream contribution',
      name: 'yuhp/opencode-models-discovery',
      description: 'Fixed models.dev matching for models served by custom providers.',
      href: 'https://github.com/yuhp/opencode-models-discovery',
      tags: ['TypeScript', 'OpenCode', 'models.dev'],
      links: [
        {
          label: '#39 · merged',
          href: 'https://github.com/yuhp/opencode-models-discovery/pull/39',
        },
      ],
    },
  ],

  service: [
    {
      label: 'Conference Reviewer',
      items: ['CVPR', 'ICCV', 'ECCV', 'NeurIPS', 'SIGGRAPH', 'ACCV', 'PRCV', 'ICIG'],
    },
    { label: 'Journal Reviewer', items: ['TPAMI'] },
  ],
};

/** Publications in reverse-chronological order, newest first. */
export const publicationsByYear: readonly Publication[] = [...profile.publications].sort(
  (a, b) => b.year - a.year,
);
