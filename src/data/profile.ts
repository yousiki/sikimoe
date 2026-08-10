/**
 * The single source of truth for everything the site renders about its author.
 *
 * Mirrors `yousiki-cv.typ` in the companion `resume` repository. When the CV
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

export interface Profile {
  readonly name: string;
  readonly nameLocal: string;
  readonly alias: string;
  readonly pronunciation: string;
  readonly role: string;
  readonly affiliation: string;
  readonly affiliationHref: string;
  readonly location: string;
  readonly timezone: string;
  /** Caption under the portrait in the about section. */
  readonly portrait: { readonly alt: string; readonly caption: string };
  readonly rotatingWords: readonly string[];
  readonly bio: readonly string[];
  readonly now: readonly { readonly label: string; readonly value: string }[];
  readonly cv: { readonly en: string; readonly zh: string };
  readonly email: string;
  readonly socials: readonly SocialLink[];
  readonly interests: readonly Interest[];
  readonly timeline: readonly TimelineEntry[];
  readonly publications: readonly Publication[];
  readonly awards: readonly Award[];
  readonly skills: readonly SkillGroup[];
  readonly service: readonly SkillGroup[];
}

/** Name used to mark the author's own entry in an author list. */
export const SELF = 'Siqi Yang';

export const profile: Profile = {
  name: 'Siqi Yang',
  nameLocal: '杨思祺',
  alias: 'YouSiki',
  /** Pinyin with tone marks, family name first — as it is said in Mandarin. */
  pronunciation: 'Yáng Sīqí',
  role: 'Ph.D. Candidate in Computer Science',
  affiliation: 'Camera Intelligence Lab, Peking University',
  affiliationHref: 'https://camera.pku.edu.cn',
  location: 'Beijing, China',
  timezone: 'Asia/Shanghai',
  portrait: {
    alt: 'Siqi Yang sitting on a grassy riverbank beneath cherry blossoms, camera in hand, looking up into the branches',
    // Date and body are read straight off the original file's EXIF.
    caption: 'April 2026 · Canon EOS R5',
  },

  rotatingWords: ['spike cameras', 'inverse rendering', 'world models', 'light & pixels'],

  bio: [
    'I teach cameras to see what human eyes cannot — microsecond-scale light, recovered as colour, motion and geometry.',
    'My research sits between computational photography and computer vision: neuromorphic **spike cameras** that fire asynchronously at tens of thousands of frames per second, **inverse rendering** that pulls material and illumination back out of a photograph, and generative **world models** that render playable video.',
    'Before the Ph.D. I spent a decade in competitive programming, which is probably why I still enjoy a well-shaped abstraction more than a well-tuned hyperparameter.',
  ],

  now: [
    { label: 'Research Intern', value: 'Shanda AI Research, Tokyo' },
    { label: 'Building', value: 'Multiplayer world models & panoramic video generation' },
    { label: 'Learning', value: 'Nix, Rust, and how to take better photographs' },
    { label: 'Graduating', value: 'July 2027 (expected)' },
  ],

  cv: {
    en: 'https://github.com/yousiki/resume/releases/latest/download/yousiki-cv.pdf',
    zh: 'https://github.com/yousiki/resume/releases/latest/download/yousiki-cv-zh.pdf',
  },

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

  interests: [
    {
      index: '01',
      title: 'Neuromorphic Imaging',
      blurb:
        'Spike cameras sample light continuously instead of in frames. I build the reconstruction stack that turns those sub-millisecond binary streams back into colour, high-dynamic-range video.',
    },
    {
      index: '02',
      title: 'Inverse Rendering',
      blurb:
        'Given a photograph, recover the scene that made it — geometry, reflectance, and the light that fell on it — so the whole thing can be relit and re-photographed.',
    },
    {
      index: '03',
      title: 'World Models',
      blurb:
        'Video generators that hold a consistent, controllable, and shared state, so more than one person can walk around inside the same generated world.',
    },
  ],

  timeline: [
    {
      kind: 'experience',
      organisation: 'Shanda AI Research',
      role: 'Research Intern',
      location: 'Tokyo, Japan',
      start: '2025.12',
      end: 'Present',
      detail: 'Multiplayer world models, panoramic video generation, generative game platform.',
    },
    {
      kind: 'education',
      organisation: 'Peking University',
      role: 'Ph.D. in Computer Science',
      location: 'Beijing, China',
      start: '2022.09',
      end: '2027.07',
      detail: 'Camera Intelligence Lab, advised by Prof. Boxin Shi and Prof. Zhaofei Yu.',
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
      organisation: 'Peking University',
      role: 'B.S. in Computer Science',
      location: 'Beijing, China',
      start: '2018.09',
      end: '2022.07',
      detail: 'Turing Honor Class, School of EECS.',
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
    {
      title: 'NOIP First Prize ×2 · APIO / CTSC / WC',
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

/** The subset rendered before the reader asks for the full list. */
export const selectedPublications: readonly Publication[] = publicationsByYear.filter(
  (p) => p.selected,
);

/** Distinct venues, for the stat strip. */
export const publicationVenues: readonly string[] = [
  ...new Set(
    profile.publications
      .map((p) => p.venue)
      .filter((v) => !v.includes('arXiv') && !v.includes('Chapter')),
  ),
];
