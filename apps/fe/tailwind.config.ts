import { createGlobPatternsForDependencies } from '@nx/react/tailwind';
import { join } from 'path';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Mulish', 'sans-serif'],
      },
      colors: {
        app: {
          header: '#1C1C21',
        },
      },
    },
  },
  plugins: [],
};
