// electron/start.js  (CommonJS)
require('ts-node/register/transpile-only');   // .ts를 CJS로 즉석 트랜스파일
require('./main.ts');                         // 이제 main.ts는 CJS 컨텍스트에서 실행
