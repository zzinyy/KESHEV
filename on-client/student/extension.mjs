// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
export function createStudentView() {
  const overviewHistory = [];
  let previousOverview = null;
  return {
    renderIdentity({ me, devices, sessions } = {}) {
      // 매 호출마다 새 DOM을 반환하므로 재조회와 오류 시 이전 신원이 남지 않습니다.
      const root = document.createElement('div');
      const add = (parent, tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        parent.append(element);
        return element;
      };
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const label = (labels, value) => Object.hasOwn(labels, value) ? labels[value] : '확인 불가';
      const value = (input) => typeof input === 'string' && input.length ? input : '확인 불가';
      const renderDevice = (parent, device) => {
        add(parent, 'p', '기기: ' + value(device?.label) + ' · ID: ' + value(device?.id) + ' · ' + label(deviceLabels, device?.status) + ' (' + value(device?.status) + ')');
      };
      const renderSession = (parent, session) => {
        add(parent, 'p', '세션 ID: ' + value(session?.id) + ' · ' + label(sessionLabels, session?.status) + ' (' + value(session?.status) + ')');
      };
      const section = (title, resource, renderData) => {
        const area = add(root, 'section', '');
        add(area, 'h3', title);
        const modes = { demo: '예제 자료 · 실제 연결 아님', disconnected: '연결 없음', unknown: '확인 불가' };
        if (resource && Object.hasOwn(modes, resource.mode)) add(area, 'p', modes[resource.mode]);
        if (!resource || resource.status === 'loading') {
          add(area, 'p', '불러오는 중');
        } else if (resource.status === 'error') {
          const message = value(resource.error?.message);
          add(area, 'p', '연결 실패 또는 확인 불가: ' + message);
        } else if (resource.status === 'ok') {
          renderData(area, resource.data);
        } else {
          add(area, 'p', '확인 불가');
        }
      };
      section('현재 로그인', me, (area, data) => {
        if (!data?.user || !data?.device || !data?.session) {
          add(area, 'p', '로그인 정보 확인 불가');
          return;
        }
        add(area, 'p', '사용자: ' + value(data.user.label) + ' · ID: ' + value(data.user.id));
        renderDevice(area, data.device);
        renderSession(area, data.session);
      });
      section('기기 목록', devices, (area, data) => {
        if (!Array.isArray(data)) return void add(area, 'p', '기기 목록 확인 불가');
        if (!data.length) return void add(area, 'p', '표시할 기기가 없습니다.');
        for (const device of data) renderDevice(area, device);
      });
      section('세션 목록', sessions, (area, data) => {
        if (!Array.isArray(data)) return void add(area, 'p', '세션 목록 확인 불가');
        if (!data.length) return void add(area, 'p', '표시할 세션이 없습니다.');
        for (const session of data) renderSession(area, session);
      });
      return root;
    },
    renderDecision({ status = 'idle', mode, data, error, appId } = {}) {
      const root = document.createElement('section');
      const add = (tag, text) => {
        const element = document.createElement(tag);
        element.textContent = text;
        root.append(element);
      };
      const text = (value) => typeof value === 'string' && value.length ? value : '확인 불가';
      add('h3', '업무 앱 접속 판정');
      const modes = { demo: '예제 자료 · 실제 연결 아님', disconnected: '연결 없음', unknown: '연결 상태 확인 불가' };
      if (Object.hasOwn(modes, mode)) add('p', modes[mode]);
      if (appId) add('p', '요청한 앱 ID: ' + text(appId));
      if (status === 'idle') {
        add('p', '앱을 골라 접속을 요청하세요.');
      } else if (status === 'loading') {
        add('p', '판정 확인 중');
      } else if (status === 'error') {
        add('p', '요청 실패: ' + text(error?.message));
        add('p', '접근 거부(deny) 판정이 아니라 요청 처리 실패입니다. 접근 허용 여부를 확인할 수 없습니다.');
      } else if (status === 'ok') {
        const labels = { allow: '허용(allow)', deny: '거부(deny)', challenge: '추가 확인 필요(challenge)', unknown: '확인 불가(unknown)' };
        const code = data && Object.hasOwn(labels, data.decision) ? data.decision : 'unknown';
        add('p', labels[code]);
        add('p', '판정 대상 앱 ID: ' + text(data?.appId));
        add('p', '판정 이유: ' + text(data?.reason));
        add('p', '판정 시각: ' + text(data?.checkedAt));
        if (code === 'allow') add('p', '정책상 접근 허용이며 실제 앱 접속 성공을 보장하지 않습니다.');
        if (code === 'challenge') add('p', '추가 인증 또는 확인이 필요합니다. 이 앱이 확인 절차를 대신 수행하지 않습니다.');
        if (code === 'unknown') add('p', '접근 판정을 확인할 수 없습니다. 허용된 것으로 판단하지 마세요.');
      } else {
        add('p', '확인 불가(unknown) · 요청 상태를 확인할 수 없습니다. 허용된 것으로 판단하지 마세요.');
      }
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      // 필터·선택은 이번 입력의 DOM 안에만 보관합니다. 재조회 시 모두 초기화됩니다.
      const root = document.createElement('section');
      const add = (parent, tag, content) => {
        const node = document.createElement(tag);
        node.textContent = content;
        parent.append(node);
        return node;
      };
      const text = value => typeof value === 'string' && value.length ? value : '확인 불가';
      const describe = (labels, code) => (Object.hasOwn(labels, code) ? labels[code] : '확인 불가') + '(' + text(code) + ')';
      const kinds = { access: '접속 기록', xdr: 'XDR 경보' };
      const accessLabels = { allowed: '허용됨', denied: '거부됨', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      add(root, 'h3', '내 접속 기록과 저장된 XDR 경보');
      const modes = { demo: '예제 자료 · 실제 연결 아님', disconnected: '연결 없음', unknown: '연결 상태 확인 불가' };
      if (Object.hasOwn(modes, mode)) add(root, 'p', modes[mode]);
      if (status === 'loading') {
        add(root, 'p', '기록을 불러오는 중');
        return root;
      }
      if (status === 'error') {
        add(root, 'p', '기록을 불러오지 못했습니다: ' + text(error?.message));
        if (error?.code === 'CONTRACT_MISMATCH') add(root, 'p', '응답 형식 확인 불가(CONTRACT_MISMATCH)');
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        add(root, 'p', '기록 확인 불가 · 응답 상태 또는 형식을 확인할 수 없습니다.');
        return root;
      }
      const events = [...data].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      if (!events.length) {
        add(root, 'p', '표시할 기록이 없습니다.');
        return root;
      }
      const filters = add(root, 'div', '');
      const select = (name, values, caption) => {
        const label = add(filters, 'label', name);
        const control = add(label, 'select', '');
        control.setAttribute('aria-label', name);
        const all = add(control, 'option', '전체');
        all.value = 'all';
        for (const value of [...new Set(values)].filter(v => typeof v === 'string' && v.length)) {
          const option = add(control, 'option', caption(value));
          option.value = value;
        }
        return control;
      };
      const kindFilter = select('기록 종류', events.map(e => e.kind), v => describe(kinds, v));
      const appFilter = select('업무 앱', events.map(e => e.appId), v => v);
      const accessFilter = select('접속 상태', events.map(e => e.state?.access), v => describe(accessLabels, v));
      const count = add(root, 'p', '');
      const list = add(root, 'div', '');
      const detail = add(root, 'div', '');
      const showDetail = event => {
        detail.replaceChildren();
        const area = add(detail, 'section', '');
        area.setAttribute('data-student-event-detail', event.id);
        add(area, 'h4', '사건 ID: ' + text(event.id));
        add(area, 'p', '업무 앱: ' + (event.appId || '앱 확인 불가'));
        for (const [title, rows] of [['근거', event.evidence], ['규칙', event.rules]]) {
          add(area, 'h5', title);
          if (!Array.isArray(rows) || !rows.length) add(area, 'p', title + ' 정보가 없습니다.');
          else for (const row of rows) add(area, 'p', text(row.id) + ': ' + text(row.text));
        }
        add(area, 'p', '접속 상태: ' + describe(accessLabels, event.state?.access));
        add(area, 'p', '세션 상태: ' + describe(sessionLabels, event.state?.session));
        add(area, 'p', '기기 상태: ' + describe(deviceLabels, event.state?.device));
        if (Array.isArray(event.supportedActions) && event.supportedActions.length) {
          add(area, 'p', '아직 지원하지 않음 · 조치 실행 연결은 준비 중입니다. 요청을 보내지 않습니다.');
          for (const action of event.supportedActions) {
            const button = add(area, 'button', text(action) + ' 미지원');
            button.type = 'button';
            button.disabled = true;
          }
        }
      };
      const draw = () => {
        list.replaceChildren();
        detail.replaceChildren();
        const visible = events.filter(event =>
          (kindFilter.value === 'all' || event.kind === kindFilter.value) &&
          (appFilter.value === 'all' || event.appId === appFilter.value) &&
          (accessFilter.value === 'all' || event.state?.access === accessFilter.value));
        count.textContent = '표시 ' + visible.length + '건 / 받은 기록 ' + events.length + '건';
        if (!visible.length) add(list, 'p', '필터 조건에 맞는 기록이 없습니다.');
        for (const event of visible) {
          const row = add(list, 'article', '');
          row.setAttribute('data-student-event-id', event.id);
          add(row, 'p', '사건 ID: ' + text(event.id));
          add(row, 'p', '시각: ' + text(event.at));
          add(row, 'p', '종류: ' + describe(kinds, event.kind));
          add(row, 'p', '업무 앱: ' + (event.appId || '앱 확인 불가'));
          add(row, 'p', '요약: ' + text(event.summary));
          const button = add(row, 'button', event.id + ' 상세');
          button.type = 'button';
          button.addEventListener('click', () => showDetail(event));
        }
      };
      for (const control of [kindFilter, appFilter, accessFilter]) control.addEventListener('change', draw);
      draw();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');
      const add = (parent, tag, content) => {
        const node = document.createElement(tag);
        node.textContent = content;
        parent.append(node);
        return node;
      };
      // 진단 전체 객체를 출력하거나 복사하지 않고, 허용된 필드만 새로 구성합니다.
      const safe = value => {
        if (typeof value !== 'string' || !value.length) return '확인 불가';
        if (/(?:Bearer\s+\S+|sk-[A-Za-z0-9_-]{8,}|github_pat_|ghp_|PRIVATE KEY|(?:password|token|secret|api[_ -]?key|authorization|비밀번호|토큰)\s*[:=])/i.test(value)) return '[민감정보 숨김]';
        return value;
      };
      const code = value => typeof value === 'string' && /^[A-Za-z0-9_.:-]{1,100}$/.test(value) ? safe(value) : 'unknown';
      const modes = { demo: '예제 자료 · 실제 연결 아님', disconnected: '연결 없음', unknown: '연결 상태 확인 불가' };
      const addMode = (parent, value) => { if (Object.hasOwn(modes, value)) add(parent, 'p', modes[value]); };
      const retry = parent => add(parent, 'p', '다시 시도는 위쪽 다시 불러오기 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.');
      const failure = (parent, name, error) => {
        const timeout = /TIMEOUT|TIMED_OUT/i.test(error?.code || '') || /시간.*초과/.test(error?.message || '');
        add(parent, 'p', name + ' 불러오기 실패' + (timeout ? ' · 시간 초과' : '') + ': ' + safe(error?.message));
        add(parent, 'p', '오류 코드: ' + code(error?.code));
        retry(parent);
      };
      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const describe = (labels, value) => (Object.hasOwn(labels, value) ? labels[value] : '확인 불가') + '(' + code(value) + ')';
      const overview = document.createElement('section');
      overview.setAttribute('class', 'keshev-overview');
      overview.setAttribute('aria-label', '케셰브 상태 대시보드');
      const paint = (node, css) => { if (node.style) node.style.cssText = css; return node; };
      paint(overview, 'background:#101d32;color:#edf4ff;border-radius:18px;padding:24px;margin-bottom:24px');
      add(overview, 'p', 'KESHEV / STATUS DESK').setAttribute('class', 'ks-kicker');
      add(overview, 'h3', '내 보안 상태, 한눈에');
      add(overview, 'p', '현재 전달받은 계정·기기 자료를 요약합니다. PC 자원 측정이나 악성코드 검사 결과가 아닙니다.');
      const busy = devices?.status === 'loading' || sessions?.status === 'loading';
      const stateText = resource => resource?.status === 'loading' ? '불러오는 중' : resource?.status === 'error' ? '조회 실패' : '확인 불가';
      const deviceRows = devices?.status === 'ok' && Array.isArray(devices.data) ? devices.data : null;
      const sessionRows = sessions?.status === 'ok' && Array.isArray(sessions.data) ? sessions.data : null;
      const attention = deviceRows?.filter(item => item.status !== 'compliant').length;
      const active = sessionRows?.filter(item => item.status === 'active').length;
      const modeText = mode === 'demo' ? '예제 자료' : mode === 'connected' ? '연결됨' : mode === 'disconnected' ? 'SDP 미연결' : '확인 불가';
      const cards = [
        ['등록 기기', deviceRows ? deviceRows.length + '개' : stateText(devices), deviceRows ? '점검·확인 필요 ' + attention + '개' : '아래 상세에서 원인을 확인하세요'],
        ['현재 세션', sessionRows ? active + '개 활성' : stateText(sessions), '현재 검증된 연결 범위 · 과거 전체 이력 아님'],
        ['주의 알림', Array.isArray(notifications) ? notifications.length + '건' : '확인 불가', '제공 화면에서 전달한 알림 · 침해 탐지 건수 아님'],
        ['연동 상태', modeText, '로컬 앱 실행과 SDP·AI 연결 성공은 별개입니다'],
      ];
      const grid = add(overview, 'div', ''); grid.setAttribute('class', 'ks-grid');
      paint(grid, 'display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:12px;margin:20px 0');
      for (const [title, value, note] of cards) {
        const card = add(grid, 'section', ''); card.setAttribute('class', 'ks-card');
        paint(card, 'padding:16px;border:1px solid #456183;border-radius:12px;background:#192b46');
        paint(add(card, 'h4', title), 'color:#d0ddef');
        paint(add(card, 'p', value), 'font-size:22px;font-weight:700;color:#fff');
        paint(add(card, 'p', note), 'color:#d0ddef');
      }
      const refresh = add(overview, 'button', busy ? '조회 중…' : '다시 조회');
      paint(refresh, 'background:#a5efdc;color:#0a2630;border:0;border-radius:8px;padding:10px 16px;font-weight:700');
      refresh.type = 'button'; refresh.disabled = busy;
      const feedback = add(overview, 'p', '자동 조회하지 않습니다. 다시 조회는 기본 제공 다시 불러오기를 실행합니다.');
      feedback.setAttribute('role', 'status');
      refresh.addEventListener('click', () => {
        const provided = document.getElementById('refresh');
        if (provided && !provided.disabled && typeof provided.click === 'function') provided.click();
        else feedback.textContent = '기본 조회 버튼을 사용할 수 없습니다. 화면 위쪽 다시 불러오기를 직접 확인하세요.';
      });
      const signature = JSON.stringify([mode, devices?.status, deviceRows?.map(d => [d.id,d.status]), sessions?.status, sessionRows?.map(s => [s.id,s.status]), notifications?.map(n => [n.resource,n.code])]);
      if (!busy && signature !== previousOverview) {
        previousOverview = signature;
        const entry = { at: new Date().toLocaleTimeString('ko-KR'), text: cards.map(([name,value]) => name + ' ' + value).join(' · ') };
        if (overviewHistory[0]?.at === entry.at) overviewHistory[0] = entry;
        else overviewHistory.unshift(entry);
        if (overviewHistory.length > 8) overviewHistory.length = 8;
      }
      const history = add(overview, 'section', ''); history.setAttribute('class', 'ks-history');
      paint(history, 'border-top:1px solid #456183;padding-top:16px;margin-top:20px');
      paint(add(history, 'h4', '최근 상태 변화'), 'color:#edf4ff');
      add(history, 'p', '이번 앱 실행 중 전달값이 바뀐 최근 8회만 표시합니다. 시각은 화면에 받은 시각이며 서버 측정 시각이 아닙니다. 새로고침하면 초기화됩니다.');
      const historyList = add(history, 'ol', '');
      if (!overviewHistory.length) add(historyList, 'li', '조회 결과를 기다리고 있습니다.');
      for (const entry of overviewHistory) add(historyList, 'li', entry.at + ' · ' + entry.text);
      root.append(overview);
      add(root, 'h3', '알림·기기·세션·도움정보');
      addMode(root, mode);
      const renderList = (name, resource, empty, renderRow) => {
        const area = add(root, 'section', '');
        add(area, 'h4', name);
        addMode(area, resource?.mode);
        if (resource?.status === 'loading') add(area, 'p', name + ' 불러오는 중');
        else if (resource?.status === 'error') failure(area, name, resource.error);
        else if (resource?.status === 'ok' && Array.isArray(resource.data)) {
          if (!resource.data.length) add(area, 'p', empty);
          else for (const row of resource.data) renderRow(area, row);
        } else {
          add(area, 'p', name + ' 확인 불가');
          retry(area);
        }
      };
      renderList('등록 기기', devices, '등록된 기기가 없습니다.', (area, device) =>
        add(area, 'p', safe(device?.label) + ' · ID: ' + safe(device?.id) + ' · ' + describe(deviceLabels, device?.status)));
      add(root, 'p', '세션 조회는 현재 검증된 연결 한 개를 대상으로 합니다.');
      renderList('현재 세션', sessions, '현재 연결이 없습니다.', (area, session) =>
        add(area, 'p', '세션 ID: ' + safe(session?.id) + ' · ' + describe(sessionLabels, session?.status)));
      const alerts = add(root, 'section', '');
      add(alerts, 'h4', '알림');
      if (Array.isArray(notifications)) {
        if (!notifications.length) add(alerts, 'p', '주의할 알림이 없습니다.');
        else for (const item of notifications) add(alerts, 'p', '자료(resource): ' + safe(item?.resource) + ' · 코드(code): ' + code(item?.code) + ' · ' + safe(item?.message));
      } else add(alerts, 'p', '알림 확인 불가');
      const help = add(root, 'section', '');
      add(help, 'h4', '진단 도움정보');
      addMode(help, diagnostics?.mode);
      let helpText = '';
      if (diagnostics?.status === 'ok' && diagnostics.data && typeof diagnostics.data === 'object') {
        const data = diagnostics.data;
        const fields = [['requestId', data.requestId], ['component', data.component], ['version', data.version], ['checkedAt', data.checkedAt], ['engine.mode', data.engine?.mode], ['engine.code', data.engine?.code]];
        helpText = fields.map(([name, value]) => name + ': ' + safe(value)).join('\n');
        add(help, 'pre', helpText);
      } else if (diagnostics?.status === 'loading') add(help, 'p', '진단 정보를 불러오는 중');
      else if (diagnostics?.status === 'error') failure(help, '진단 정보', diagnostics.error);
      else if (diagnostics?.status === 'ok') add(help, 'p', '진단 정보 확인 불가 · 빈 응답');
      else add(help, 'p', '진단 정보가 없습니다. 위쪽 도움정보 조회 버튼을 직접 누르세요.');
      add(help, 'p', '도움 요청에 사용할 안전한 진단 정보만 복사합니다.');
      const copy = add(help, 'button', '도움정보 복사');
      copy.type = 'button';
      copy.disabled = !helpText;
      const result = add(help, 'p', '');
      copy.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(helpText);
          result.textContent = '도움정보를 복사했습니다.';
        } catch {
          result.textContent = '복사하지 못했습니다. 위에 표시된 안전한 진단 정보를 직접 선택해 복사하세요.';
        }
      });
      return root;
    },
    renderVulnerabilities({ status = 'idle', mode, data, error } = {}) {
      const root = document.createElement('section');
      const add = (parent, tag, content) => {
        const node = document.createElement(tag);
        node.textContent = content;
        parent.append(node);
        return node;
      };
      const text = value => typeof value === 'string' && value.length ? value : '확인 불가';
      add(root, 'h3', '설치 패키지와 OSV 취약점 조회');
      const modes = { demo: '예제 자료 · 실제 조회 아님', disconnected: '연결 없음', unknown: '연결 상태 확인 불가' };
      if (Object.hasOwn(modes, mode)) add(root, 'p', modes[mode]);
      add(root, 'p', 'OSV는 알려진 취약점 정보입니다. 조회 범위에서 알려진 항목이 없다는 결과는 패키지나 앱 전체의 안전을 보장하지 않습니다.');
      if (status === 'idle') add(root, 'p', '패키지 조회 전 · 제공 화면의 설치 패키지 조회 버튼을 직접 누르세요.');
      else if (status === 'loading') add(root, 'p', '패키지 조회 중 · 이전 결과는 현재 결과가 아닙니다.');
      else if (status === 'error') {
        add(root, 'p', '조회 실패: ' + text(error?.message));
        add(root, 'p', '취약점 여부를 확인할 수 없습니다. 제공 화면에서 직접 다시 조회하세요. 자동 재요청하지 않습니다.');
      } else if (status === 'ok' && data && typeof data === 'object') {
        const scans = { complete: '모두 조회(complete)', partial: '일부 조회 실패(partial)', not_checked: '아직 조회 안 함(not_checked) · 승인된 공개 조회 대상 없음 등의 미조회 상태', not_configured: '조회 준비 미완료(not_configured) · 조회 대상 프로젝트 설정 필요', unverifiable: 'lock 파일 확인 불가(unverifiable)' };
        add(root, 'p', Object.hasOwn(scans, data.status) ? scans[data.status] : '전체 조회 상태 확인 불가');
        if (data.lockfileVersion != null) add(root, 'p', 'lockfileVersion: ' + String(data.lockfileVersion));
        if (data.lockfileHash != null) add(root, 'p', 'lockfileHash: ' + text(data.lockfileHash));
        if (data.checkedAt != null) add(root, 'p', '확인 시각(checkedAt): ' + text(data.checkedAt));
        const labels = { known_vulnerabilities: '알려진 항목 있음(known_vulnerabilities)', none_found: '알려진 항목 없음(none_found) · 조회 범위 내 결과', unverifiable: '조회 확인 불가(unverifiable)' };
        if (!Array.isArray(data.packages)) add(root, 'p', '패키지 목록 확인 불가');
        else {
          if (!data.packages.length) add(root, 'p', '표시할 패키지 조회 결과가 없습니다. 미조회·설정 미완료·조회 실패는 취약점 없음이 아닙니다.');
          for (const pkg of data.packages) {
            const row = add(root, 'article', '');
            row.setAttribute('data-student-package-name', text(pkg.name));
            row.setAttribute('data-student-package-version', text(pkg.version));
            add(row, 'h4', text(pkg.name));
            add(row, 'p', '설치된 정확한 버전: ' + text(pkg.version));
            add(row, 'p', Object.hasOwn(labels, pkg.status) ? labels[pkg.status] : '패키지 조회 상태 확인 불가');
            add(row, 'p', '출처(source): ' + text(pkg.source));
            add(row, 'p', '확인 시각(checkedAt): ' + text(pkg.checkedAt));
            const vulnerabilities = Array.isArray(pkg.vulnerabilities) ? pkg.vulnerabilities : [];
            if (pkg.status === 'unverifiable' && vulnerabilities.length) add(row, 'p', '일부 확인·전체 조회 확인 불가 · 이미 받은 취약점 ID는 유지합니다.');
            for (const vulnerability of vulnerabilities) add(row, 'p', '취약점 ID: ' + text(vulnerability.id) + ' · 수정 시각(modified): ' + text(vulnerability.modified));
          }
        }
      } else add(root, 'p', '패키지 조회 결과 확인 불가');
      return root;
    },
    renderAiConnection({ status = 'idle', mode, data, error, checkedAt } = {}) {
      const root = document.createElement('section');
      const add = text => { const node = document.createElement('p'); node.textContent = text; root.append(node); };
      const safe = value => typeof value === 'string' && value.length && !/(?:Bearer\s|sk-[\w-]{8,}|github_pat_|ghp_|PRIVATE KEY|(?:token|password|secret|api[_ -]?key)\s*[:=])/i.test(value) ? value : '확인 불가';
      if (mode === 'demo') add('예제 자료 · 실제 연결 아님');
      if (mode === 'disconnected') add('연결 없음');
      if (mode === 'unknown') add('연결 상태 확인 불가');
      if (status === 'idle') add('AI 연결 점검 전');
      else if (status === 'loading') add('AI 연결 점검 중');
      else if (status === 'ok' && data?.transportChecked === true && ['test', 'verified'].includes(data.audienceAuthorization)) {
        add(data.audienceAuthorization === 'test' ? '시험 연결 점검(test)' : '앱 권한 확인 후 점검(verified)');
        add('모델 수(modelCount): ' + (Number.isInteger(data.modelCount) && data.modelCount >= 0 ? data.modelCount : '확인 불가'));
        add('점검 시각(checkedAt): ' + safe(checkedAt));
        add('연결만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다. 보안 기록에서 사건 설명을 별도로 요청하고 결과를 확인하세요.');
        if (data.modelCount === 0) add('사용 가능한 모델이 없습니다. 담당자에게 모델 허용 설정 확인을 요청하세요.');
      } else if (status === 'error') {
        // 원문 오류 대신 허용된 오류 코드에 대응하는 고정 안내만 출력합니다.
        const groups = [
          [['ON_AI_PROVISIONING_PENDING', 'ON_AI_TRANSPORT_PENDING', 'SUBJECT_SCOPE_UNVERIFIED', 'ON_AI_AUTHORIZATION_CHANGED', 'AI_REQUEST_UNVERIFIED'], '권한 준비 중 또는 확인 불가. 담당자에게 계정 연결과 앱 권한 확인을 요청하세요. 학생 코드 오류로 단정하지 않습니다.'],
          [['WB_CLCO_AUTH_REQUIRED'], '인증 실패. 계정 연결을 다시 확인하고 담당자에게 문의하세요.'],
          [['WB_CLCO_ACCESS_BLOCKED'], '접근 제한. 담당자에게 앱 이용 권한을 확인하세요.'],
          [['WB_CLCO_COHORT_BUDGET_EXHAUSTED', 'WB_CLCO_LIMIT_REACHED'], '사용량 또는 이용 한도에 도달했습니다. 담당자에게 확인하세요.'],
          [['WB_CLCO_SESSION_CLOSED'], '현재 이용 시간이 아닙니다. 이용 시간을 확인하세요.'],
          [['WB_CLCO_RATE_LIMITED'], '요청 제한. 잠시 뒤 직접 다시 점검하세요.'],
          [['WB_CLCO_TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT', 'TIMEOUT'], '시간 초과. 잠시 뒤 직접 다시 점검하세요.'],
          [['WB_CLCO_NETWORK_ERROR', 'WB_CLCO_SERVER_UNAVAILABLE'], '네트워크 또는 서버 연결 실패. 연결을 확인한 뒤 직접 다시 점검하세요.'],
          [['WB_CLCO_CANCELLED', 'CANCELLED', 'REQUEST_CANCELLED'], '취소됨. 이전 결과는 현재 결과가 아닙니다. 필요하면 직접 다시 점검하세요.'],
          [['MODEL_NOT_CONFIGURED', 'ON_AI_MODEL_LIST_EMPTY'], '사용 가능한 모델이 없습니다. 담당자에게 모델 허용 설정 확인을 요청하세요.'],
        ];
        const group = groups.find(([codes]) => codes.includes(error?.code));
        add('AI 연결 점검 실패 · 코드: ' + (group ? error.code : 'AI_REQUEST_UNVERIFIED'));
        add('메시지: ' + safe(error?.message));
        add('다음 행동: ' + (group ? group[1] : 'AI 연결 또는 응답을 확인할 수 없습니다. 담당자에게 확인하세요.'));
      } else add('AI 연결 점검 결과 확인 불가');
      add('다시 점검은 사용자가 위쪽 현재 API 연결 점검 버튼을 직접 누르세요. 자동으로 다시 요청하지 않습니다.');
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('section');
      const add = text => { const node = document.createElement('p'); node.textContent = text; root.append(node); };
      const safe = value => typeof value === 'string' && value.length && !/(?:Bearer\s|sk-[\w-]{8,}|github_pat_|ghp_|PRIVATE KEY|(?:token|password|secret|api[_ -]?key)\s*[:=])/i.test(value) ? value : '확인 불가';
      if (explanation?.status === 'ok' && event?.id && typeof explanation.data?.summary === 'string') {
        const data = explanation.data;
        const evidence = Array.isArray(event.evidence) ? event.evidence : [];
        const refs = data.evidenceIds;
        const proposals = data.proposals;
        const validRefs = ids => Array.isArray(ids) && ids.length > 0 && new Set(ids).size === ids.length && ids.every(id => evidence.some(row => row.id === id));
        const invalid = !evidence.length || !validRefs(refs) || refs.length !== evidence.length ||
          !Array.isArray(event.rules) || !event.rules.length || !event.state ||
          !Array.isArray(proposals) || data.executed !== false || data.requiresHumanConfirmation !== true ||
          proposals.some(proposal => !Array.isArray(event.supportedActions) || !event.supportedActions.includes(proposal.action) || !validRefs(proposal.evidenceIds));
        if (invalid) {
          add('AI 설명을 사용할 수 없습니다: 근거 부족·근거 불일치 또는 실행 상태를 확인할 수 없습니다. 이미 실행했다고 답한 설명도 사용할 수 없습니다.');
          add('코드: ON_AI_INVALID_OUTPUT · 보안 기록은 그대로 유지됩니다.');
          return root;
        }
        root.setAttribute('data-student-explanation-event', event.id);
        add('사건 ID: ' + safe(event.id));
        add('AI 설명(참고용): ' + safe(explanation.data.summary));
        add('인용한 근거');
        for (const id of refs) {
          const row = evidence.find(row => row.id === id);
          add(safe(id) + ' — ' + safe(row.text));
        }
        add('적용 규칙');
        for (const rule of event.rules) add(safe(rule.id) + ' — ' + safe(rule.text));
        add('확인 불가 상태');
        const names = { access: '접속', session: '세션', device: '기기' };
        let unknowns = 0;
        for (const [key, name] of Object.entries(names)) if (event.state[key] === 'unknown') {
          add(name + ': 확인 불가(unknown)');
          unknowns++;
        }
        if (!unknowns) add('없음');
        if (!proposals.length) add(!event.supportedActions?.length ? '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).' : 'AI가 제안한 조치가 없습니다.');
        for (const proposal of proposals) {
          add('제안 조치: ' + safe(proposal.action) + ' · 이유: ' + safe(proposal.reason));
          add('제안 근거 ID: ' + proposal.evidenceIds.map(safe).join(', '));
          add('사람 확인이 필요하며 실행되지 않았습니다.');
        }
        add('확인 시각: ' + safe(checkedAt));
        add('사건 설명 모델 응답을 수신했습니다. 연결 점검이나 모델 목록 조회와 별개의 사건 설명 결과입니다.');
        add('조치 제안은 자동으로 실행하지 않습니다.');
      } else if (explanation?.status === 'error') {
        const codes = ['ON_AI_PROVISIONING_PENDING', 'WB_CLCO_AUTH_REQUIRED', 'WB_CLCO_ACCESS_BLOCKED', 'WB_CLCO_COHORT_BUDGET_EXHAUSTED', 'WB_CLCO_LIMIT_REACHED', 'WB_CLCO_SESSION_CLOSED', 'WB_CLCO_RATE_LIMITED', 'WB_CLCO_TIMEOUT', 'REQUEST_TIMEOUT', 'ENGINE_TIMEOUT', 'TIMEOUT', 'WB_CLCO_CANCELLED', 'CANCELLED', 'REQUEST_CANCELLED', 'MODEL_NOT_CONFIGURED', 'ON_AI_MODEL_LIST_EMPTY', 'ON_AI_INVALID_OUTPUT', 'ON_AI_INVALID_INPUT', 'AI_REQUEST_UNVERIFIED'];
        const code = codes.includes(explanation.error?.code) ? explanation.error.code : 'AI_REQUEST_UNVERIFIED';
        add('AI 사건 설명 실패 · 코드: ' + code);
        const message = /TIMEOUT/.test(code) ? '시간 초과' : /CANCEL/.test(code) ? '취소됨 · 이전 결과는 현재 결과가 아닙니다' : /LIMIT|BUDGET/.test(code) ? '이용 한도 또는 사용량 확인 필요' : 'AI 설명을 확인할 수 없습니다. 계정·앱 권한·모델 설정을 담당자에게 확인하세요';
        add('메시지: ' + safe(explanation.error?.message));
        add('다음 행동: ' + message + '. 보안 기록은 그대로 유지됩니다. 필요하면 사용자가 직접 다시 요청하세요.');
      } else if (!event) add('보안 기록에서 기록을 먼저 고르세요.');
      else if (explanation?.status === 'loading') add('AI 사건 설명 요청 중 · 아직 설명 결과가 없습니다.');
      else add('AI 사건 설명 실행 전 · 보안 기록에서 사건을 선택하고 설명을 직접 요청하세요.');
      return root;
    },
    renderAction({ status = 'idle', event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      const root = document.createElement('section');
      const safe = value => typeof value === 'string' && !/(?:Bearer\s|sk-[\w-]{8,}|github_pat_|ghp_|PRIVATE KEY|(?:token|password|secret|api[_ -]?key)\s*[:=])/i.test(value) ? value : '확인 불가';
      const add = content => { const node = document.createElement('p'); node.textContent = content; root.append(node); };
      const labels = {
        idle: '아직 미실행(idle)',
        loading: '조치 준비 또는 결과 조회 중(loading) · 결과 미확인',
        prepared: '준비됨·미실행(prepared) · 사람 확인이 필요합니다',
        executing: '서버에 전달 중(executing) · 결과가 아직 확인되지 않았습니다',
        pending: '서버 접수·처리 중(pending) · 접수 응답(ACK)은 효과 확인이 아닙니다',
        succeeded: '효과 확인(succeeded)',
        denied: '연동 시스템 거절(denied)',
        failed: '연동 시스템 실패(failed)',
        unknown: '결과 불명(unknown) · 성공이나 효과 없음으로 판단하지 마세요',
        expired: '확인 기한 지남(expired) · 제공 화면에서 다시 준비하세요',
        error: '요청 처리 안 됨(error)',
      };
      const current = Object.hasOwn(labels, status) ? status : 'unknown';
      const mismatched = Boolean((receipt?.eventId && receipt.eventId !== event?.id) || (receipt?.actionId && receipt.actionId !== actionId));
      const observed = current === 'succeeded' && observation?.effectApplied === true && !mismatched;
      const display = mismatched || (current === 'succeeded' && !observed) ? 'unknown' : current;
      add(labels[display]);
      if (mismatched) add('현재 사건·조치와 영수증의 연결을 확인할 수 없습니다.');
      // 현재 입력에 있는 사건과 요청만 연결합니다. 이전 호출의 상태를 보관하지 않습니다.
      if (event?.id) { root.setAttribute('data-student-action-event', event.id); add('사건 ID: ' + safe(event.id)); }
      if (receipt?.requestId) { root.setAttribute('data-student-action-request', receipt.requestId); add('요청 ID: ' + safe(receipt.requestId)); }
      if (Array.isArray(event?.evidence)) for (const item of event.evidence) add('근거 ID: ' + safe(item.id));
      if (actionId) add('조치 ID: ' + safe(actionId));
      if (target?.id) add('실제 대상 ID: ' + safe(target.id));
      if (target?.generation != null) add('대상 세대(generation): ' + String(target.generation));
      if (receipt?.receiptId) add('영수증 ID(receiptId): ' + safe(receipt.receiptId));
      if (receipt?.version != null) add('영수증 버전(version): ' + String(receipt.version));
      if (current === 'prepared') {
        add('확인 기한: ' + safe(confirmationExpiresAt));
        add('제공 화면에서 실제 대상과 조치를 직접 확인한 뒤 집행해야 합니다. AI 제안만으로 실행되지 않습니다.');
      }
      if (observed) {
        add('관측 시각: ' + safe(observation.observedAt));
        add('effectApplied: true');
      }
      if (display === 'unknown') add('제공 화면의 연동 시스템 결과만 재조회 버튼으로 결과만 확인하세요. 자동 재전송하지 마세요.');
      if (receipt?.replayed === true) add('기존 요청 결과 재전달(replayed: true) · 새 집행으로 해석하지 마세요.');
      if (message) add('안내: ' + safe(message));
      if (current === 'error' || error) {
        const code = typeof error?.code === 'string' && /^[A-Z0-9_]{1,100}$/.test(error.code) ? error.code : 'ACTION_RESULT_UNVERIFIED';
        add('오류 코드: ' + code);
        add('오류 메시지: ' + safe(error?.message));
      }
      if (event && Array.isArray(event.supportedActions) && !event.supportedActions.length) add('연동 시스템이 지원하는 조치가 없어 조치 준비 버튼이 나오지 않는 것이 정상입니다.');
      add('학생 화면은 상태만 표시합니다. 제공 화면 버튼을 사용하세요. 조치 화면 취소는 이미 전달된 조치 효과를 되돌리지 않습니다.');
      return root;
    },
  };
}
