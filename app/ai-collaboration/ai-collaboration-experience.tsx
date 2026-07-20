"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import styles from "./ai-collaboration.module.css";

const sceneNotes = [
  "손을 들어 가볍게 답하게 한다. ‘회사에서 쓰는 정도’, ‘사람을 보조하는 정도’, ‘직업까지 바꿀 정도’ 중 어디라고 보는지 묻는다.",
  "일부러 강하게 말한 뒤 바로 구분한다. AI가 모든 직업의 책임을 맡았다는 뜻이 아니라, 거의 모든 직업의 과업 일부를 이미 수행하기 시작했다는 뜻이다.",
  "여기서는 사진을 오래 설명하지 않는다. 기존 UI → 첫 결과 → 두 번째 결과만 짚고, 실제 앱을 실행한다. 관객에게 ‘같은 모델인데 왜 달라졌을까요?’라고 묻는다.",
  "프롬프트 2가 길어서가 아니다. 원하는 장면, 선택 기준, 시간 흐름, 기술 환경과 수정 권한까지 줬기 때문이다. 역할극과 예시는 여전히 재료지만 핵심은 아니다.",
  "‘프롬프트 엔지니어링은 끝났다’는 문장을 도발적으로 쓴다. 정확히는 마법 문장 찾기가 끝났다는 뜻이다. 최근 모델일수록 명령을 더 쌓는 것보다 맥락과 성공 기준을 잘 주는 편이 중요해졌다.",
  "여섯 문장은 외우게 하지 말고 하나만 오늘 써보게 한다. 특히 ‘나를 먼저 인터뷰해줘’와 ‘내가 놓친 것을 먼저 말해줘’를 추천한다.",
  "로그인 기능 예시는 비개발자에게도 통한다. ‘고객 안내문을 쓸 건데 내가 놓칠 민원 포인트를 먼저 짚어줘’처럼 자기 업무로 번역한다.",
  "Three.js 문법을 외운 게 아니라 카메라·모션·장면 전환이라는 판단 언어를 배웠다고 강조한다. AI가 구현을 채우고, 사람은 무엇을 배울지와 무엇을 고를지 정한다.",
  "12만/30만 줄은 생산성의 증명이 아니라 작업량의 체감치다. 6명×4년도 비교 실험이 아니라 강사의 경험적 추정이라고 분명히 말한다. 핵심 문장은 ‘지능이 100배가 아니라 실행 범위가 넓어졌다’이다.",
  "두 부류 모두 장단점이 있다. 한 제품을 깊게 파면 습관이 생기고, 여러 제품을 보면 모델·하네스 차이가 보인다. 강사는 둘 다 해봤고 지금은 비용 때문에 멀티툴에 가깝다고 말한다.",
  "구독을 투자 권유처럼 말하지 않는다. 한 달 동안 실제 과제 하나를 끝내 보는 실험으로 권한다. ‘업체가 무조건 손해’나 ‘천 달러를 공짜로 준다’는 미확인 단정은 피한다.",
  "샘 올트먼 사례의 billion-dollar는 매출이 아니라 기업가치 10억 달러다. 메차 카멜리온은 Steam에 표시된 단일 개발자 계정과 2주 700만 장 발표까지만 말하고, 690억 수익은 확정치로 쓰지 않는다.",
  "직업 간 간극이 사라진다기보다 이동 비용이 급격히 낮아진다고 설명한다. 개발자가 디자인을, 디자이너가 백엔드를 완전히 대체하는 것이 아니라 서로의 영역으로 더 멀리 들어갈 수 있다.",
  "AI가 사고를 퇴화시킨다고 의학적으로 단정하지 않는다. 위임의 방식에 따라 판단 훈련이 늘 수도, 줄 수도 있다는 실무 관찰로 말한다. DB DROP과 GitHub 사례는 검증권을 넘겼을 때의 위험이다.",
  "주식 이야기는 ‘종목을 골라 달라’가 아니다. 내 가설의 약점, 반대 근거, 공시 누락과 최악의 경우를 찾아 달라고 한다. 최종 판단과 책임은 사람에게 남긴다.",
  "1인 회사가 곧 100개의 독립된 두뇌를 소유한다는 뜻은 아니다. 비서·엔지니어·디자이너 페르소나는 서로 다른 직업인이 아니라 같은 기반 지능에 얹은 서로 다른 작업대다.",
  "마무리는 낙관과 긴장을 함께 둔다. 만드는 비용은 낮아졌지만 목적·취향·검증·책임은 자동화되지 않았다. 다음 장의 Agent/Skill 존재론으로 연결한다.",
];

const sceneLabels = [
  "질문",
  "도발",
  "3D 사례",
  "차이",
  "전환",
  "새 문법",
  "실전",
  "학습",
  "100×",
  "탐색",
  "구독",
  "신호",
  "경계",
  "두 갈래",
  "판단",
  "오해",
  "결론",
];

const collaborationMoves = [
  ["01", "나를 인터뷰", "답부터 만들지 말고, 필요한 질문부터 해줘."],
  ["02", "놓친 부분", "내가 놓쳤을 위험과 전제를 먼저 짚어줘."],
  ["03", "시안 4개", "완전히 다른 방향 네 개를 한 화면에 보여줘."],
  ["04", "본보기 코드", "좋은 구조의 최소 예시부터 만들어줘."],
  ["05", "막힌 곳 로그", "이 로그가 뜻하는 것과 내가 모르는 개념을 설명해줘."],
  ["06", "나를 퀴즈", "내가 진짜 이해했는지 문제로 확인해줘."],
];

const promptModes = [
  {
    label: "Prompt 01",
    status: "요청은 전달됐지만, 판단 기준이 비어 있음",
    rows: [
      ["목표", "3D 웹디자인을 넣고 싶다"],
      ["맥락", "모델이 빈칸을 추측"],
      ["평가 기준", "‘멋있게’에 가까운 암묵적 기준"],
      ["작업 방식", "한 번에 결과 생성"],
    ],
    result: "무난한 평균값으로 수렴",
  },
  {
    label: "Prompt 02",
    status: "연출 언어와 선택 기준까지 작업 환경에 포함",
    rows: [
      ["목표", "사용자가 경험할 장면과 감정"],
      ["맥락", "기존 화면 · 기술 환경 · 참고 장면"],
      ["평가 기준", "카메라 · 모션 · 씬 전환의 역할"],
      ["작업 방식", "분석 → 대안 → 선택 → 구현"],
    ],
    result: "의도에 맞는 탐색 공간이 생김",
  },
];

const roleModes = [
  { name: "비서", work: "일정 · 메일", instruction: "우선순위와 후속 조치 중심으로 정리" },
  { name: "엔지니어", work: "코드 · 배포", instruction: "실행 가능성과 장애 위험 중심으로 검토" },
  { name: "디자이너", work: "화면 · 시안", instruction: "정보 위계와 사용 경험 중심으로 제안" },
  { name: "분석가", work: "자료 · 가설", instruction: "근거와 반례 중심으로 검증" },
];

export function AiCollaborationExperience() {
  const deckRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [promptMode, setPromptMode] = useState(1);
  const [activeRole, setActiveRole] = useState(0);

  const goToScene = useCallback((nextIndex: number) => {
    const safeIndex = Math.max(0, Math.min(sceneLabels.length - 1, nextIndex));
    const scene = deckRef.current?.querySelector<HTMLElement>(`[data-scene="${safeIndex}"]`);
    scene?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    const scenes = deckRef.current?.querySelectorAll<HTMLElement>("[data-scene]");
    if (!scenes) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveScene(Number((visible.target as HTMLElement).dataset.scene));
      },
      { threshold: [0.45, 0.62, 0.78] },
    );

    scenes.forEach((scene) => observer.observe(scene));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("a, button, input, textarea, select")) return;

      if (["ArrowDown", "ArrowRight", "PageDown", " "].includes(event.key)) {
        event.preventDefault();
        goToScene(activeScene + 1);
      }
      if (["ArrowUp", "ArrowLeft", "PageUp"].includes(event.key)) {
        event.preventDefault();
        goToScene(activeScene - 1);
      }
      if (event.key === "Home") {
        event.preventDefault();
        goToScene(0);
      }
      if (event.key === "End") {
        event.preventDefault();
        goToScene(sceneLabels.length - 1);
      }
      if (event.key.toLowerCase() === "n") setShowNotes((current) => !current);
      if (event.key.toLowerCase() === "f") {
        document.documentElement.requestFullscreen?.().catch(() => undefined);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeScene, goToScene]);

  return (
    <main className={styles.deck} ref={deckRef}>
      <header className={styles.presenterBar} aria-label="발표 조작">
        <Link className={styles.backLink} href="/">
          삼성생명 AI WORKSHOP · 1교시
        </Link>
        <div className={styles.sceneStatus} aria-live="polite">
          <strong>{String(activeScene + 1).padStart(2, "0")}</strong>
          <span>/ {String(sceneLabels.length).padStart(2, "0")}</span>
          <span className={styles.sceneName}>{sceneLabels[activeScene]}</span>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <span style={{ width: `${((activeScene + 1) / sceneLabels.length) * 100}%` }} />
        </div>
        <button className={styles.noteButton} onClick={() => setShowNotes((current) => !current)}>
          N · 발표 노트
        </button>
      </header>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="0">
        <SceneNumber number="01" />
        <div className={styles.centerQuestion}>
          <p className={styles.kicker}>질문 01 · 현재 위치</p>
          <h1>
            여러분은 AI가
            <br />
            <mark>어디까지</mark> 왔다고 생각하세요?
          </h1>
          <div className={styles.pollLine}>
            <span>보조 도구</span>
            <span>동료</span>
            <span>직업을 바꾸는 힘</span>
          </div>
        </div>
        <p className={styles.pauseCue}>여기서 잠시, 여러분의 답을 듣겠습니다.</p>
      </section>

      <section className={`${styles.scene} ${styles.ink}`} data-scene="1">
        <SceneNumber number="02" />
        <div className={styles.thesisLayout}>
          <div className={styles.statementFrame}>
            <p className={styles.kicker}>작업 가설 · 범위 주의</p>
            <h2 className={styles.thesisTitle}>
              <span className={styles.nowrap}>AI는 직업보다 먼저,</span>
              <br />
              <em><span className={styles.nowrap}>과업 안으로 들어</span><br />왔습니다.</em>
            </h2>
            <p className={styles.thesisFoot}>“모든 직업을 바꿀 수 있다”는 제 판단은 여기서 출발합니다.</p>
          </div>
          <div className={styles.taskField} aria-label="여러 직업의 과업에 AI가 들어오는 모습">
            <div className={styles.taskModel}>AI</div>
            {["기획", "개발", "디자인", "분석", "고객 응대"].map((role, roleIndex) => (
              <div className={styles.taskRow} key={role}>
                <strong>{role}</strong>
                <span className={roleIndex < 4 ? styles.taskFilled : ""} />
                <span className={roleIndex < 3 ? styles.taskFilled : ""} />
                <span className={roleIndex < 2 ? styles.taskFilled : ""} />
                <span />
              </div>
            ))}
            <div className={styles.taskLegend}><span /> AI가 이미 수행하는 과업 <i /> 인간이 책임지는 영역</div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="2">
        <SceneNumber number="03" />
        <div className={styles.caseDiagramLayout}>
          <div>
            <p className={styles.kicker}>사례 연구 · 3D 웹 온보딩</p>
            <h2 className={styles.routeTitle}><span className={styles.nowrap}>같은 모델인데,</span><br /><mark className={styles.nowrap}>탐색 경로가</mark><br />달랐습니다.</h2>
          </div>
          <div className={styles.routeCompare} aria-label="두 프롬프트의 탐색 경로 비교">
            <div className={styles.routeOrigin}><span>같은 사람</span><strong>같은 모델</strong></div>
            <div className={styles.routeRow}>
              <b>PROMPT 01</b>
              <div className={styles.shortRoute}><i><small>요청</small></i><i><small>출력</small></i></div>
              <strong>무난한 평균값</strong>
            </div>
            <div className={`${styles.routeRow} ${styles.routeRowLong}`}>
              <b>PROMPT 02</b>
              <div className={styles.longRoute}>
                <i><small>목표</small></i><i><small>기준</small></i><i><small>흐름</small></i><i><small>환경</small></i>
              </div>
              <strong>의도한 장면</strong>
            </div>
            <p className={styles.routeLegend}>선의 길이 = AI가 고려한 판단 재료의 범위</p>
          </div>
        </div>
        <p className={styles.bottomQuestion}>무엇이 달라졌을까요?</p>
      </section>

      <section className={`${styles.scene} ${styles.yellow}`} data-scene="3">
        <SceneNumber number="04" />
        <div className={styles.recipeLayout}>
          <div>
            <p className={styles.kicker}>비교 분석 · Prompt 01 ↔ Prompt 02</p>
            <h2>더 좋은 문장보다<br /><span>더 좋은 판단 재료.</span></h2>
          </div>
          <div className={styles.promptDiff}>
            <div className={styles.diffTabs} aria-label="프롬프트 구조 비교">
              {promptModes.map((mode, index) => (
                <button
                  key={mode.label}
                  className={promptMode === index ? styles.diffTabActive : ""}
                  onClick={() => setPromptMode(index)}
                  aria-pressed={promptMode === index}
                >
                  {mode.label}
                </button>
              ))}
            </div>
            <div className={styles.diffReadout}>
              <p>{promptModes[promptMode].status}</p>
              <div className={styles.diffRows}>
                {promptModes[promptMode].rows.map(([label, value]) => (
                  <div key={label}><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
              <footer><span>예상 결과</span><strong>{promptModes[promptMode].result}</strong></footer>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="4">
        <SceneNumber number="05" />
        <div className={styles.shiftLayout}>
          <p className={styles.kicker}>관찰 · 모델 능력과 지시의 관계</p>
          <h2>
            마법의 문장을 찾는
            <br />
            <s>프롬프트 엔지니어링</s>은 끝났다.
          </h2>
          <div className={styles.shiftEquation}>
            <div><small>BEFORE</small><strong>페르소나 + 퓨샷 + 길게</strong></div>
            <span>→</span>
            <div className={styles.shiftNow}><small>NOW</small><strong>맥락 + 기준 + 대화 + 검증</strong></div>
          </div>
          <p className={styles.factNote}>
            최근 Fable 관련 발표에서는 시스템 지시를 대폭 덜어냈다는 설명이 화제가 됐습니다. 공식 포스트모템도 시스템 프롬프트 한 줄이 지능에 큰 악영향을 줄 수 있음을 공개했습니다. 
            <a href="https://www.anthropic.com/engineering/april-23-postmortem" target="_blank" rel="noreferrer">Anthropic</a>
          </p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.blue}`} data-scene="5">
        <SceneNumber number="06" />
        <div className={styles.movesVisual}>
          <div className={styles.movesHeader}>
            <p className={styles.kicker}>실무 패턴 · 재현 빈도 높음</p>
            <h2>AI에게 답만 받지 않고,<br /><mark>사고를 왕복시킵니다.</mark></h2>
          </div>
          <div className={styles.questionOrbit} aria-label="AI와 사고를 왕복시키는 여섯 가지 방식">
            <div className={styles.orbitCore}><small>답 생성기</small><strong>AI</strong><span>사고 파트너</span></div>
            {collaborationMoves.map(([number, title], index) => (
              <div className={`${styles.orbitMove} ${styles[`orbitMove${index + 1}`]}`} key={number}>
                <span>{number}</span><strong>{title}</strong>
              </div>
            ))}
          </div>
          <p className={styles.visualConclusion}>사람이 질문의 방향을 바꾸면, AI가 탐색하는 공간도 달라집니다.</p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="6">
        <SceneNumber number="07" />
        <div className={styles.riskScene}>
          <div className={styles.promptStage}>
            <p className={styles.kicker}>실제 사용 문장 · 사전 검토 요청</p>
            <blockquote>
              “로그인 기능을 붙일 겁니다.
              <br />
              <strong>제가 놓칠 것을 먼저 말해주세요.</strong>”
            </blockquote>
          </div>
          <div className={styles.riskMap} aria-label="로그인 기능 주변의 여섯 가지 검토 영역">
            <div className={styles.riskCore}><small>BUILD</small><strong>로그인</strong></div>
            {[
              ["01", "보안"], ["02", "세션"], ["03", "복구"],
              ["04", "권한"], ["05", "로그"], ["06", "장애"],
            ].map(([number, label], index) => (
              <div className={`${styles.riskNode} ${styles[`riskNode${index + 1}`]}`} key={number}>
                <span>{number}</span><strong>{label}</strong>
              </div>
            ))}
            <div className={styles.riskAlert}>내가 처음에는 정하지 않았던 것들</div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.ink}`} data-scene="7">
        <SceneNumber number="08" />
        <div className={styles.learnLayout}>
          <div>
            <p className={styles.kicker}>학습 로그 · 무엇을 공부했는가</p>
            <h2>Three.js를 외운 게 아니라,<br /><em>장면을 지휘하는 언어</em>를 배웠다.</h2>
          </div>
          <div className={styles.learningRail}>
            <div><small>REFERENCE</small><strong>이런 화면을 하고 싶다</strong></div>
            <div><small>ASK</small><strong>무엇을 알아야 하지?</strong></div>
            <div><small>LEARN</small><strong>카메라 · 모션 · 씬 전환</strong></div>
            <div><small>CHOOSE</small><strong>시안 4개 중 고른다</strong></div>
          </div>
          <p className={styles.karpathyLine}>결과를 먼저 정하고, 필요한 지식은 프로젝트 안에서 그때그때 배운다. <span>— 카파시식 ‘on-demand learning’을 AI 협업으로 확장한 방식</span></p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="8">
        <SceneNumber number="09" />
        <div className={styles.executionLayout}>
          <div className={styles.executionMap} aria-label="AI 사용 전후 한 사람이 감당하는 실행 범위">
            <div className={styles.radiusBefore}><span>혼자</span><small>기존 실행 반경</small></div>
            <div className={styles.radiusAfter}>
              <span>AI 협업</span>
              {["기획", "코드", "디자인", "테스트", "문서", "리서치"].map((task) => <i key={task}>{task}</i>)}
            </div>
            <div className={styles.radiusHuman}>1명</div>
          </div>
          <div className={styles.multiplierCopy}>
            <p className={styles.kicker}>개인 작업 기록 · 수치 해석 주의</p>
            <h2>지능이 100배가 아니라,<br /><mark>실행 반경</mark>이 넓어졌습니다.</h2>
            <div className={styles.metricRow}>
              <div><strong>약 2개월</strong><span>주말 · 저녁 포함</span></div>
              <div><strong>12만 줄</strong><span>현재 코드 규모</span></div>
              <div><strong>30만 줄</strong><span>수정 · 삭제 포함 체감</span></div>
              <div><strong>6명 × 4년</strong><span>AI가 없었다면 · 개인 추정</span></div>
            </div>
          </div>
        </div>
        <p className={styles.disclaimer}>코드 줄 수는 가치나 품질의 지표가 아닙니다. 이 숫자는 강사가 체감한 실행량을 설명하기 위한 개인 기록입니다.</p>
      </section>

      <section className={`${styles.scene} ${styles.coral}`} data-scene="9">
        <SceneNumber number="10" />
        <div className={styles.twoCampLayout}>
          <p className={styles.kicker}>도구 탐색 방식 · 개인 경험</p>
          <h2>한 우물을 깊게 팔까,<br />여러 도구를 빠르게 건너갈까.</h2>
          <div className={styles.campCompare}>
            <article><span>01</span><h3>Claude를 집요하게 판다</h3><p>한 도구의 습관·한계·최적 흐름을 몸에 익힌다.</p></article>
            <div className={styles.versus}>+</div>
            <article><span>02</span><h3>온갖 AI를 직접 써본다</h3><p>같은 문제를 던져 모델과 실행 환경의 차이를 본다.</p></article>
          </div>
          <p className={styles.personalLine}>저는 1년 반 동안 둘 다 했습니다. 개인 비용 약 200–300만 원. 요즘은 토큰 비용 때문에 ②에 더 가깝습니다.</p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="10">
        <SceneNumber number="11" />
        <div className={styles.subscriptionLayout}>
          <div className={styles.windowHeadline}>
            <p className={styles.kicker}>권장 방식 · 한 달 실험 프로토콜</p>
            <h2>구독의 가치는<br /><mark>한계를 직접 재보는 것</mark>입니다.</h2>
            <div className={styles.trialSteps}>
              <span>① 하나만 구독</span><span>② 진짜 과제</span><span>③ 비용 기록</span><span>④ 다음 달 판단</span>
            </div>
          </div>
          <div className={styles.tokenDiagram} aria-label="컨텍스트 창에 정보가 쌓이고 비용이 증가하는 모습">
            <div className={styles.tokenBadges}><span>비용 ↑</span><span>남은 여유 ↓</span></div>
            <div className={styles.contextTube}>
              <i className={styles.tokenOld}>이전 대화</i><i>파일</i><i>지침</i><i>질문</i><i>도구 결과</i><i>응답</i>
            </div>
            <div className={styles.tokenFragments}><i /><i /><i /><i /><span>오래된 맥락이 밀려남</span></div>
          </div>
          <p className={styles.factNote}>월 구독은 무한 사용권이 아닙니다. 실제 과제에서 어느 지점부터 비용·토큰·품질 제약이 나타나는지 기록해야 합니다.</p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.yellow}`} data-scene="11">
        <SceneNumber number="12" />
        <div className={styles.signalLayout}>
          <div className={styles.signalQuote}>
            <p className={styles.kicker}>외부 신호 01 · 1인 기업</p>
            <h2 className={styles.signalTitle}>“첫 번째 <span className={styles.nowrap}>1인 10억 달러 기업</span><br />은 언제 나올까?”</h2>
            <p>샘 올트먼이 테크 CEO 단체 대화방의 내기라고 소개한 질문. 여기서 10억 달러는 매출이 아니라 <strong>기업가치</strong>입니다.</p>
            <a href="https://fortune.com/2024/02/04/sam-altman-one-person-unicorn-silicon-valley-founder-myth/" target="_blank" rel="noreferrer">원문 보도 ↗</a>
          </div>
          <div className={styles.gameSignal}>
            <p className={styles.kicker}>외부 신호 02 · 실제 출시 사례</p>
            <strong>1인 개발자 계정</strong>
            <h3>MECCHA<br />CHAMELEON</h3>
            <div><b>2주</b><span>700만 장 판매 발표</span></div>
            <p>‘2인 팀·690억 수익’은 확정치로 쓰지 않습니다. Steam에는 개발자·퍼블리셔가 lemorion_1224로 표시됩니다.</p>
            <a href="https://store.steampowered.com/app/4704690/MECCHA_CHAMELEON/" target="_blank" rel="noreferrer">Steam ↗</a>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="12">
        <SceneNumber number="13" />
        <div className={styles.boundaryLayout}>
          <p className={styles.kicker}>역할 변화 · 이동 비용의 감소</p>
          <h2>직업의 경계가 사라지는 게 아니라,<br /><mark>경계를 넘는 비용</mark>이 낮아진다.</h2>
          <div className={styles.boundaryMap}>
            <div className={styles.roleColumn}><strong>개발자</strong><span>디자인</span><span>기획</span><span>리서치</span></div>
            <div className={styles.bridgeWord}>AI와<br />협업</div>
            <div className={styles.roleColumn}><strong>디자이너</strong><span>백엔드</span><span>데이터</span><span>제품 설계</span></div>
          </div>
          <p className={styles.boundaryEnd}>멀리 갈 수 있다. 그래서 이제 능력은 <strong>정답을 아는 것</strong>만이 아니라 <strong>모르는 영역을 건너는 법</strong>이다.</p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.ink}`} data-scene="13">
        <SceneNumber number="14" />
        <div className={styles.forkLayout}>
          <p className={styles.kicker}>관찰 · 위임 방식에 따른 두 경로</p>
          <h2>AI를 쓸수록,<br />누군가는 확장되고 누군가는 약해진다.</h2>
          <div className={styles.forkRoads}>
            <article className={styles.growRoad}><span>GROW</span><h3>함께 판단한다</h3><p>질문 → 선택 → 검증 → 설명</p><strong>사고의 범위가 넓어진다</strong></article>
            <article className={styles.fadeRoad}><span>FADE</span><h3>판단까지 넘긴다</h3><p>요청 → 복사 → 실행 → 모름</p><strong>도구가 없으면 멈춘다</strong></article>
          </div>
          <p className={styles.riskLine}>DB 테이블 DROP · AI 없이는 GitHub 업로드도 막힘 — 실행권과 검증권을 함께 넘겼을 때 생기는 사고</p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="14">
        <SceneNumber number="15" />
        <div className={styles.judgmentLayout}>
          <div>
            <p className={styles.kicker}>사용 사례 · AI를 반론 도구로 쓰기</p>
            <h2 className={styles.judgmentTitle}><span className={styles.nowrap}>판단을 맡기는 게 아니라,</span><br /><mark className={styles.nowrap}>판단을 공격하게 한다.</mark></h2>
          </div>
          <div className={styles.auditLoop} aria-label="투자 가설을 AI가 반론으로 검토하고 다시 사람에게 돌려주는 과정">
            <div className={styles.auditQuestion}><small>01 · HUMAN</small><strong>내 가설</strong><span>“좋아 보인다”</span></div>
            <div className={styles.auditBranch}>
              <span>약한 전제</span><span>반대 근거</span><span>놓친 공시</span><span>철회 조건</span>
            </div>
            <div className={styles.auditAnswer}><small>02 · AI</small><strong>가설 공격</strong><span>결정은 하지 않음</span></div>
            <div className={styles.auditDecision}><small>03 · HUMAN</small><strong>판단 · 책임</strong></div>
          </div>
        </div>
        <p className={styles.disclaimer}>투자 권유가 아니라 AI를 ‘반론 생성기’로 쓰는 개인적 검토 방식의 예시입니다.</p>
      </section>

      <section className={`${styles.scene} ${styles.blue}`} data-scene="15">
        <SceneNumber number="16" />
        <div className={styles.agentMythLayout}>
          <p className={styles.kicker}>개념 구분 · 역할 ≠ 독립 지능</p>
          <h2>비서도, 엔지니어도, 디자이너도<br /><mark>서로 다른 사람이 아닙니다.</mark></h2>
          <div className={styles.sharedEngine}>
            {roleModes.slice(0, 2).map((role, index) => (
              <button
                key={role.name}
                className={`${styles.roleDesk} ${activeRole === index ? styles.roleDeskActive : ""}`}
                onClick={() => setActiveRole(index)}
                aria-pressed={activeRole === index}
              >
                <span>{role.name}</span><small>{role.work}</small>
              </button>
            ))}
            <div className={styles.engineCore}>
              <small>SHARED MODEL + ORCHESTRATOR</small>
              <strong>{roleModes[activeRole].name} 모드</strong>
              <span>{roleModes[activeRole].instruction}</span>
              <b>기반 추론과 공통 한계는 바뀌지 않음</b>
            </div>
            {roleModes.slice(2).map((role, index) => {
              const roleIndex = index + 2;
              return (
                <button
                  key={role.name}
                  className={`${styles.roleDesk} ${activeRole === roleIndex ? styles.roleDeskActive : ""}`}
                  onClick={() => setActiveRole(roleIndex)}
                  aria-pressed={activeRole === roleIndex}
                >
                  <span>{role.name}</span><small>{role.work}</small>
                </button>
              );
            })}
          </div>
          <p className={styles.agentTruth}>‘직원 100명을 소유’하는 것이 아니라, <strong>하나의 범용 지능을 100개의 작업 방식으로 조직</strong>하는 것입니다.</p>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.yellow}`} data-scene="16">
        <SceneNumber number="17" />
        <div className={styles.finalLayout}>
          <p className={styles.kicker}>결론 · 자동화 이후에도 남는 일</p>
          <h2>
            만드는 건 쉬워졌다.
            <br />
            <span>가치 있는 걸 만드는 건</span>
            <br />
            여전히 어렵다.
          </h2>
          <div className={styles.humanValueRow}>
            <span>목표</span><span>취향</span><span>판단</span><span>검증</span><span>책임</span>
          </div>
          <p>AI가 모든 것을 해주는 사람이 아니라,<br /><strong>AI와 함께 더 멀리 가면서도 방향을 잃지 않는 사람.</strong></p>
        </div>
      </section>

      <nav className={styles.deckControls} aria-label="장면 이동">
        <button onClick={() => goToScene(activeScene - 1)} disabled={activeScene === 0} aria-label="이전 장면">←</button>
        <button onClick={() => goToScene(activeScene + 1)} disabled={activeScene === sceneLabels.length - 1} aria-label="다음 장면">→</button>
      </nav>

      <aside className={`${styles.speakerNotes} ${showNotes ? styles.notesOpen : ""}`} aria-hidden={!showNotes}>
        <div>
          <span>SPEAKER NOTE · {String(activeScene + 1).padStart(2, "0")}</span>
          <button onClick={() => setShowNotes(false)} aria-label="발표 노트 닫기">×</button>
        </div>
        <p>{sceneNotes[activeScene]}</p>
        <small>키보드: ← → 장면 이동 · N 노트 · F 전체 화면 · Home/End 처음/끝</small>
      </aside>
    </main>
  );
}

function SceneNumber({ number }: { number: string }) {
  return <span className={styles.sceneNumber} aria-hidden="true">{number}</span>;
}
