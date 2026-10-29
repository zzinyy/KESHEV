# 22단계 최종 인수인계 · 검증 중인 버전

2026-10-23 작성. 저장소 https://github.com/zzinyy/KESHEV, 작업 브랜치 master. 런타임 버전은 package.json 0.2.11이며 운영 인증된 v1.0이 아니다.

## 버전 식별

기준 코드·21단계 문서 커밋은 f68cd572aa13c6171f9919149616d8fb1a0d7961이다. 최종 제출은 이 문서를 포함하는 후속 커밋이며, 이 문서 자체에 자기 커밋 해시를 적어 다시 커밋하는 순환을 피한다. 과제 접수의 40자리 해시와 `git rev-parse HEAD`를 최종 식별자로 사용한다. 코드와 문서는 같은 제출 커밋에 묶는다. 과거 단계의 통과를 합쳐 현재 버전 전체의 실제 연결 성공으로 주장하지 않는다.

## 새 폴더 재현 절차

원본 프로젝트를 보존하고 Git 최상위 폴더 밖 새 빈 위치를 선택한다. 공개 GitHub 업로드 유무와 관계없이 로컬 Git 저장소를 복제할 수 있다. 실제 자격·.env·설정 보관함·학생 개인정보는 복사하지 않는다.

```powershell
# 원본 Git 최상위에서 확인한 최종 해시를 변수에 보관
$releaseCommit = git rev-parse HEAD
# 아래 경로는 이 작업 PC의 예시이며, 새 PC에서는 자기 위치로 바꾼다.
git clone --no-hardlinks "C:\Users\Administrator\Documents\Codex\2026-10-19\q\work" "C:\Users\Administrator\Documents\Codex\2026-10-19\q\work-reproduction22"
Set-Location "C:\Users\Administrator\Documents\Codex\2026-10-19\q\work-reproduction22"
git checkout --detach $releaseCommit
git rev-parse HEAD
Set-Location on-client
node --version
node --check student/extension.mjs
$env:ON_PORT='5194'
node src/server.mjs
```

외부 npm 의존성이 없는 현재 package.json에는 별도 npm install이 필수가 아니다. 기본 주소는 5189이고 검증용 별도 포트는 5194다. 시작 로그의 주소로 브라우저를 연다. Ctrl+C로 종료하고 같은 명령으로 재실행한다. 기존 5189 사용자 서버는 건드리지 않는다. 런타임 파일은 프로젝트 상대경로를 사용하며 위 절대경로는 작업 예시에만 있다. 실제 설정은 담당자가 새 환경에서 준비해야 한다. .env.example은 비밀 없는 참고 자료이며 자동 로드를 가정하지 않는다.

## 이번 최종 커밋 검증 기록

### 실제 재현 경로 정정

로컬 git clone은 Windows msys의 NtCreateDirectoryObject 접근 거부로 실패했다. 따라서 성공한 복제로 기록하지 않는다. 대안으로 `git archive --format=zip --output=<프로젝트 밖 ZIP> HEAD`를 수행하고 `Expand-Archive`로 새 work-reproduction22-package 폴더에 풀었다. 이 방식은 커밋 소스만 이동하며 Git 기록과 인증 파일은 포함하지 않는다. 문법 검사는 통과했다. 새 폴더에서 서버 시작 로그는 확인했지만 도구 환경에서 로컬 HTTP fetch가 연결 실패했으므로 HTTP·브라우저 기능 성공으로 표시하지 않는다. 이 문서를 반영한 최종 제출 커밋도 같은 ZIP 절차로 재검증하고 결과 파일에 해시를 저장한다.

환경: Windows PowerShell, Node.js v24.21.0, Git 2.55.0.windows.5. 최종 커밋을 만든 뒤 위 별도 폴더에 로컬 clone하고 그 해시로 detached checkout하여 검사한다. 제출 전 수행한 결과는 Git 밖의 FINAL_REPRODUCTION_RESULT.json에도 최종 해시와 함께 저장한다. 런타임 코드가 21단계 이후 변경되지 않았다는 원문 비교와 별개로, 최종 checkout을 대상으로 문법·시작·로컬 HTTP·종료·재시작을 확인한다.

| 단계 | 이번 버전의 기능·근거 | 검증 종류와 결과 / 미확인 원인 |
|---|---|---|
| 13 | renderIdentity 사용자·기기·세션 상태 | 모의 DOM 상태 조합 확인. 실제 회사 엔진 연결 미확인 |
| 14 | renderDecision 네 판정과 실패 분리 | 모의 입력 확인. 실계정 정책 반환 미확인 |
| 15 | renderEvents 최신순·필터·근거 상세 | 모의 입력 확인. 본인 원천 기록 실제 조회 미확인 |
| 16 | renderStatus 빈 상태·오류·진단 복사 | 모의 입력 확인. 실제 클립보드 권한 미확인 |
| 17 | renderAiConnection 시험/verified와 오류 | 모의 입력 확인. 현재 실계정 모델 권한·생성 응답 미확인 |
| 18 | renderExplanation 근거·규칙·unknown | 모의 입력으로 잘못된 근거 거부 확인. 실제 AI 생성 미확인 |
| 19 | renderAction ACK·효과 관측 구분 | 모의 입력 확인. 실제 집행기는 미연결, 시험 조치 실행하지 않음 |
| 20 | renderVulnerabilities 버전·출처·부분 실패 | 모의 입력 확인. 승인 프로젝트·OSV 실조회 미확인 |
| 21 | README·STUDENT_RUNBOOK·검증 기록 | 명령·파일·구성도 코드 대조. 다른 OS·새 PC 설치 미확인 |

위 모의 확인은 개발 과정의 증거다. 최종 checkout에 대한 로컬 실행 결과는 아래 재현 절차와 외부 결과 파일을 기준으로 구분한다. 브라우저 UI를 직접 확인하지 못한 경우 HTTP 응답 성공을 메뉴·키보드·화면 성공으로 바꾸지 않는다. 실제 연결 없음 안내는 연결 성공이 아니다.

## 데이터 보존·백업·복원

1. 변경 전 Git 상태와 커밋을 확인하고 기존 폴더를 보존한다. 필요하면 `git bundle create <프로젝트 밖 새 경로> --all`로 커밋 기록을 보관하고 `git archive --format=zip --output=<프로젝트 밖 새 ZIP> HEAD`로 커밋 소스를 보관한다. 미커밋 변경과 Git에서 제외된 데이터는 들어가지 않는다.
2. 학생 코드·README·학생 문서는 커밋과 백업에 포함한다. 개인 기록·인증 보관함·.env는 소스 ZIP/JSON에 넣지 않는다. 별도 보호된 개인 백업이 필요하면 보관 범위·접근 권한·복구 절차를 담당자와 확인한다.
3. 복원은 원본 위에 덮지 않고 bundle clone 또는 소스 ZIP을 새 폴더에 푼다. 커밋 해시, 문법, 포트와 시작 로그를 확인하고 새 환경의 계정 승인 절차를 거친다. 소스 ZIP만으로 Git 기록이나 로그인 자격을 복원했다고 주장하지 않는다.
4. 접속·XDR 기록은 연동 시스템이 원천이다. 이 학생 UI는 해당 원천 DB의 백업·복원 권한을 갖지 않는다. 화면이나 Git 백업이 원천 기록을 복구하지 않는다. 실제 조치 효과도 소스 복원으로 되돌아가지 않는다.
5. 별도 폴더 복제와 문법·기동은 이번에 확인하지만, 운영 데이터·인증 보관함 백업 복원 및 재승인은 미확인이다. 민감 백업을 일반 제출물에 포함하지 않는다.

## 인수인계 자료와 제한

필수 파일은 Git 커밋의 on-client 전체이며 실행 진입점은 src/server.mjs, 학생 구현은 student/extension.mjs이다. 설명은 README, docs/STUDENT_RUNBOOK.md, docs/STUDENT_VERIFICATION_21.md와 이 문서다. 기본 예시 설정은 .env.example이며 비밀을 적지 않았다. src·public·vendor 제공 코드는 수정하지 않는다.

최종 검증 중 버전이다. 실제 조치 실행, 외부 권한과 대상 매핑, 새 PC·다른 OS, 브라우저 전체 기능 검증에는 미확인 항목이 남는다. 포털 단계 통과는 AI 원문 검토 기준의 수료이며 서버의 실제 실행 인증·운영 사용 승인·무결점 보증이 아니다. 시연·모의 데이터·학생 진술·코드 검토·직접 실행 로그를 서로 대신하지 않는다.
