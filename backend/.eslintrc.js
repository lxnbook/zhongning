module.exports = {
  env: {
    node: true,
    es2021: true,
    jest: true
  },
  extends: [
    'eslint:recommended',
    'prettier' // 添加 prettier 集成，避免冲突
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    // 错误预防
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'no-unused-vars': ['error', { 
      argsIgnorePattern: '^_', 
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true // 允许解构剩余变量
    }],
    'no-var': 'error',
    'prefer-const': 'error',
    'no-duplicate-imports': 'error',
    'no-template-curly-in-string': 'error',
    'no-use-before-define': ['error', { functions: false }],
    
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
    'no-await-in-loop': 'warn', // 降级为警告，有些情况下需要顺序执行
    'prefer-arrow-callback': 'error',
    
    // 注释
    'spaced-comment': ['error', 'always', { markers: ['/'] }],
    'capitalized-comments': ['warn', 'always', { 
      ignoreConsecutiveComments: true,
      ignoreInlineComments: true // 忽略行内注释
    }],
    
    // 错误处理
    'no-unused-expressions': ['error', { 
      allowShortCircuit: true, 
      allowTernary: true,
      allowTaggedTemplates: true // 允许标记模板字面量
    }],
    'no-empty': ['error', { allowEmptyCatch: true }]
  }
}; 