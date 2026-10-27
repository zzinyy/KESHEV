# 내 보안 Agent 시작 틀 0.2.11

## 마지막 총공세 · PC 일상 관제실

on-client 폴더에서 `node student/daily-server.mjs` 실행 후 http://127.0.0.1:5195/daily 를 엽니다. [1~7일차 안내와 시연](docs/FINAL_SEVEN_DAYS.md)을 따르세요. 포장·업데이트 명령은 실행하지 않습니다. 기존 보안 Agent는 같은 서버의 /에서 열립니다.


## 학생 구현 · 케셰브 13~21단계

목적은 직원 본인의 계정·기기·세션, 업무 앱 판정, 보안 기록과 AI 설명을 구분해 보는 것입니다. 학생은 `student/extension.mjs`의 표시 함수를 구현했습니다. 서버 연결·권한·실제 조치 처리와 공식 과제 판정은 제공 시스템의 역할입니다.

- 실행·설정·구성도·장애 확인·지원 범위: [학생 실행 설명서](docs/STUDENT_RUNBOOK.md)
- 직접 실행한 명령과 미확인 범위: [21단계 검증 기록](docs/STUDENT_VERIFICATION_21.md)
- 제공 시작 틀의 기준 환경: Node.js 24.19.0. 이번 확인 환경: Windows PowerShell, Node.js 24.21.0, Git 2.55.0.windows.5.
- 기본 실행은 연결 어댑터가 준비되지 않으면 연결 없음으로 동작합니다. 외부 npm 의존성이 없는 시작 틀이므로 현재 저장소에는 설치용 package-lock.json이 없으며 npm install이 실행 전 필수 절차가 아닙니다.

아래 제공 문서는 유지했습니다. 최신 포털의 설치판 버전과 이 프로젝트의 package.json 버전은 다를 수 있습니다. 이 문서는 제출 코드인 0.2.11을 기준으로 합니다.

이 보안 Agent는 회사 직원이 자기 로그인 상태, 업무 앱 접속 결과, 최근 접속 기록과 보안 경보를 보는 보안 앱입니다. 13단계부터 22단계까지 이 프로젝트 하나로 화면을 채워 가며 완성합니다. 처음이라면 docs/GETTING_STARTED_STUDENT.md부터 읽습니다. 무엇을 왜 만드는지와 단계별 순서가 그 문서에 있습니다.

이 시작 틀을 받은 것만으로 단계를 통과하지 않습니다. 단계마다 docs/STUDENT_PROMPTS.md의 안내를 수업용 AI에 붙여 넣어 student/extension.mjs를 고치고, 화면에서 확인하고, 커밋한 뒤 ALEPH에 제출합니다. 제출하면 서버가 그 커밋의 코드를 받아 AI가 단계 과제 기준으로 읽고 판정합니다. 코드를 실행해서 판정하지 않습니다.

## 켜기

검수 환경은 Node.js 24.19.0이며 외부 npm 의존성이 없습니다. 이 폴더의 PowerShell에서 아래를 실행하고 PC 브라우저로 http://127.0.0.1:5189 를 엽니다. 자세한 켜기·끄기·다시 켜기는 docs/STUDENT_LAUNCH_GUIDE.md에 있습니다.

    powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1

npm start도 같은 서버를 켭니다. 기본 실행은 실제 회사 시스템(기존 엔진)에 연결되지 않은 상태입니다. npm run demo는 예제 자료로 화면을 보여 줄 뿐이며 실제 연결이나 성취가 아닙니다. npm run check는 student/extension.mjs의 문법만 확인합니다.

## 지킬 것

- 기존 1~3차 프로젝트와 학생 파일은 지우거나 덮어쓰지 않습니다. 새 폴더에서 시작하거나, 이미 하던 프로젝트를 이어 씁니다.
- AI 열쇠·비밀번호·토큰을 코드, 커밋, 캡처, 도움정보에 넣지 않습니다. 주소나 열쇠를 직접 입력하는 칸도 만들지 않습니다.
- .env.example에는 비밀 없는 설정만 있습니다.

## 더 읽을 곳

- 단계별 안내와 AI에 붙여 넣을 문장: docs/STUDENT_PROMPTS.md
- 단계별 확인 항목: docs/CURRICULUM.json, docs/IMPLEMENTATION_CONTRACT.md
- 오류 코드별 해결: docs/CONNECTION_TROUBLESHOOT.md
- 시작 틀 업데이트(내 파일 보존): docs/STARTER_UPDATE.md
- 실제 회사 시스템(SDP)·앱 안 AI 연결은 담당자가 따로 안내할 때만 씁니다: docs/SDP_HOST_CONNECTION.md, docs/AI_SETUP_GUIDE.md. 이 연결은 앱을 처음 켜고 13~16단계 화면을 만들거나 공식 AI 코드 판정을 받기 위한 전제 조건은 아닙니다. 다만 17단계 이후의 실제 연결과 새 환경 재현은 해당 단계의 기준에 따라 따로 확인합니다.

