module.exports = {
  env: {
    browser: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 12,
    sourceType: 'module'
  },
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y'
  ],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // React 规则
    'react/prop-types': 'warn',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/react-in-jsx-scope': 'off', // React 17+ 不需要导入 React
    'react/jsx-filename-extension': ['warn', { extensions: ['.jsx', '.tsx'] }],
    'react/jsx-curly-spacing': ['error', { when: 'never', children: true }],
    'react/jsx-indent': ['error', 2],
    'react/jsx-indent-props': ['error', 2],
    'react/jsx-closing-bracket-location': ['error', 'line-aligned'],
    'react/jsx-tag-spacing': ['error', { beforeSelfClosing: 'always' }],
    'react/jsx-curly-brace-presence': ['warn', {
      props: 'never',
      children: 'never',
      propElementValues: 'always'
    }],
    'react/self-closing-comp': 'error',
    'react/jsx-max-props-per-line': ['error', { maximum: { single: 3, multi: 1 } }],
    'react/jsx-first-prop-new-line': ['error', 'multiline'],
    'react/jsx-sort-props': ['warn', {
      callbacksLast: true,
      shorthandFirst: true,
      ignoreCase: true
    }],
    'react/jsx-wrap-multilines': ['error', {
      declaration: 'parens-new-line',
      assignment: 'parens-new-line',
      return: 'parens-new-line',
      arrow: 'parens-new-line',
      condition: 'parens-new-line',
      logical: 'parens-new-line',
      prop: 'parens-new-line'
    }],
    
    // React Hooks 规则
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // 错误预防
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-template-curly-in-string': 'error',
    'no-use-before-define': ['error', { functions: false, classes: false }],
    
    // 代码风格
    'semi': ['error', 'always'],
    'quotes': ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
    'comma-dangle': ['error', 'never'],
    'indent': ['error', 2, { SwitchCase: 1 }],
    'arrow-spacing': 'error',
    'array-bracket-spacing': ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    'key-spacing': ['error', { beforeColon: false, afterColon: true }],
    'keyword-spacing': ['error', { before: true, after: true }],
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': ['error', 'never'],
    'space-infix-ops': 'error',
    'eol-last': ['error', 'always'],
    'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1 }],
    'no-trailing-spaces': 'error',
    'comma-spacing': ['error', { before: false, after: true }],
    
    // 最佳实践
    'eqeqeq': ['error', 'always', { null: 'ignore' }],
    'no-return-await': 'error',
    'require-await': 'error',
    'no-param-reassign': 'warn',
    'prefer-promise-reject-errors': 'error',
    'radix': 'error',
    'no-throw-literal': 'error',
    'no-unneeded-ternary': 'error',
    'prefer-template': 'error',
    'prefer-destructuring': ['warn', { array: false, object: true }],
    
    // 异步处理
    'no-async-promise-executor': 'error',
    'no-await-in-loop': 'warn',
    'prefer-arrow-callback': 'error',
    
    // 注释
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'capitalized-comments': ['warn', 'always', {
      ignoreConsecutiveComments: true,
      ignoreInlineComments: true
    }],
    
    // 错误处理
    'no-unused-expressions': ['error', {
      allowShortCircuit: true,
      allowTernary: true,
      allowTaggedTemplates: true
    }],
    'no-empty': ['error', { allowEmptyCatch: true }]
  }
}; 