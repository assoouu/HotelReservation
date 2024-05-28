module.exports = {
    env: {
      es2020: true, // 최신 ECMAScript 기능 사용 가능
      browser: true, // 브라우저 환경
      node: true, // Node.js 환경
    },
    extends: [
      'eslint:recommended',
      'plugin:react/recommended',
      'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
      ecmaVersion: 2020, // ECMAScript 2020 문법 사용
      sourceType: 'module',
    },
    rules: {
      // 추가 규칙을 여기에 정의할 수 있습니다.
    },
  };
  