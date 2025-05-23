const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    fontFamily: {
      sans: ['Inter', 'PingFang SC Medium', ...defaultTheme.fontFamily.sans],
      serif: ['Newsreader', 'Noto Serif SC', ...defaultTheme.fontFamily.serif],
      mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
    },
    extend: {
      textColor: {
        main: 'rgb(var(--color-text-main) / <alpha-value>)',
      },
      backgroundColor: {
        main: 'rgb(var(--color-bg-main) / <alpha-value>)',
        muted: 'rgb(var(--color-bg-muted) / <alpha-value>)',
      },
      borderColor: {
        main: 'rgb(var(--color-border-main) / <alpha-value>)',
      },
      typography: (theme) => ({
        dante: {
          css: {
            '--tw-prose-body': theme('textColor.main / 100%'),
            '--tw-prose-headings': theme('textColor.main / 100%'),
            '--tw-prose-lead': theme('textColor.main / 100%'),
            '--tw-prose-links': theme('textColor.main / 100%'),
            '--tw-prose-bold': theme('textColor.main / 100%'),
            '--tw-prose-counters': theme('textColor.main / 100%'),
            '--tw-prose-bullets': theme('textColor.main / 100%'),
            '--tw-prose-hr': theme('borderColor.main / 100%'),
            '--tw-prose-quotes': theme('textColor.main / 100%'),
            '--tw-prose-quote-borders': theme('borderColor.main / 100%'),
            '--tw-prose-captions': theme('textColor.main / 100%'),
            '--tw-prose-code': theme('textColor.main / 100%'),
            '--tw-prose-pre-code': theme('colors.zinc.100'),
            '--tw-prose-pre-bg': theme('colors.zinc.800'),
            '--tw-prose-th-borders': theme('borderColor.main / 100%'),
            '--tw-prose-td-borders': theme('borderColor.main / 100%'),
          },
        },
        DEFAULT: {
          css: {
            a: {
              fontWeight: 'normal',
              textDecoration: 'underline',
              textDecorationStyle: 'dashed',
              textDecorationThickness: '1px',
              textUnderlineOffset: '2px',
              '&:hover': {
                textDecorationStyle: 'solid',
              },
            },
            'h1,h2,h3,h4,h5,h6': {
              fontFamily: theme('fontFamily.sans'),
              fontWeight: 500,
            },
            img: {
              margin: 'auto',
            },
            blockquote: {
              border: 0,
              fontFamily: theme('fontFamily.serif'),
              fontSize: '1em',
              fontStyle: 'italic',
              fontWeight: 'normal',
              lineHeight: 1.4,
              paddingLeft: 0,
              '@media (min-width: theme("screens.sm"))': {
                fontSize: '1em',
                lineHeight: 1.3,
              },
            },
          },
        },
        lg: {
          css: {
            blockquote: {
              paddingLeft: 0,
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
