import js from '@eslint/js';
import react from 'eslint-plugin-react';
import oxlint from 'eslint-plugin-oxlint';

export default [
  js.configs.recommended,
  react.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      react,
    },
    rules: {
      'react/react-in-jsx-scope': 'off', // Not needed in modern React
    },
  },
  
  // This turns off any ESLint rules that Oxlint already handles
  oxlint.configs['flat/all'], 
];
