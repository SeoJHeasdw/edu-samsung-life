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
  "AI가 빈칸을 마음대로 추측하게 두지 않는 가장 쉬운 방법이다. 보고서라면 독자·목적·분량·금기, 분석이라면 가설·데이터·판단 기준을 먼저 물어보게 한다. 질문에 답하는 과정 자체가 업무 정의가 된다.",
  "로그인 기능 예시는 비개발자에게도 통한다. ‘고객 안내문을 쓸 건데 내가 놓칠 민원 포인트를 먼저 짚어줘’처럼 자기 업무로 번역한다.",
  "‘여러 개 보여줘’에서 멈추지 말고 서로 다른 방향이어야 한다고 말한다. HTML로 받으면 머릿속 설명이 아니라 실제 화면을 한 자리에서 비교할 수 있다. 네 개를 모두 완성안으로 보지 말고 선택지를 넓히는 탐색안으로 쓴다.",
  "처음부터 거대한 완성품을 요구하면 구조의 좋고 나쁨을 알아보기 어렵다. 먼저 최소 본보기를 만들고 왜 좋은지 설명하게 한 다음 확장한다. 개발이 아닌 업무에서도 좋은 보고서 한 문단, 좋은 분석표 한 행으로 똑같이 적용된다.",
  "오류 해결만 받아 적으면 다음 오류에서 다시 멈춘다. 로그를 신호·뜻·원인 후보·다음 확인으로 번역하게 하면, 문제를 푸는 동안 해당 분야의 언어를 함께 배울 수 있다.",
  "설명을 읽은 직후의 ‘알겠다’는 착각일 수 있다. AI에게 짧은 퀴즈를 내게 하고, 오답에는 정답 대신 힌트만 달라고 한다. 내가 다시 설명할 수 있을 때 비로소 내 지식이 된다.",
  "Three.js 문법을 외운 게 아니라 카메라·모션·장면 전환이라는 판단 언어를 배웠다고 강조한다. AI가 구현을 채우고, 사람은 무엇을 배울지와 무엇을 고를지 정한다.",
  "12만/30만 줄은 생산성의 증명이 아니라 작업량의 체감치다. 6명×4년도 비교 실험이 아니라 강사의 경험적 추정이라고 분명히 말한다. 핵심 문장은 ‘지능이 100배가 아니라 실행 범위가 넓어졌다’이다.",
  "두 부류 모두 장단점이 있다. 한 제품을 깊게 파면 습관이 생기고, 여러 제품을 보면 모델·하네스 차이가 보인다. 강사는 둘 다 해봤고 지금은 비용 때문에 멀티툴에 가깝다고 말한다.",
  "구독을 투자 권유처럼 말하지 않는다. 한 달 동안 실제 과제 하나를 끝내 보는 실험으로 권한다. ‘업체가 무조건 손해’나 ‘천 달러를 공짜로 준다’는 미확인 단정은 피한다.",
  "샘 올트먼 사례의 billion-dollar는 매출이 아니라 기업가치 10억 달러다. 메차 카멜리온은 Steam에 표시된 단일 개발자 계정과 2주 700만 장 발표까지만 말하고, 690억 수익은 확정치로 쓰지 않는다.",
  "직업 간 간극이 사라진다기보다 이동 비용이 급격히 낮아진다고 설명한다. 개발자가 디자인을, 디자이너가 백엔드를 완전히 대체하는 것이 아니라 서로의 영역으로 더 멀리 들어갈 수 있다.",
  "AI가 사고를 퇴화시킨다고 의학적으로 단정하지 않는다. 위임의 방식에 따라 판단 훈련이 늘 수도, 줄 수도 있다는 실무 관찰로 말한다. DB DROP과 GitHub 사례는 검증권을 넘겼을 때의 위험이다.",
  "AI가 N명처럼 일한다는 말의 핵심은 사람의 역할이 사라진다는 뜻이 아니라, 작업자에서 총괄로 올라간다는 뜻이다. 목표와 완료 기준을 먼저 정하고, 역할별 결과를 중간 점검하며, 틀리거나 약한 결과는 구체적으로 지적해 재작업시킨다. ‘혼낸다’는 감정 표현이 아니라 검수권과 승인권을 사람이 끝까지 쥔다는 의미로 설명한다.",
  "마무리는 낙관과 긴장을 함께 둔다. 만드는 비용은 낮아졌지만 목적·취향·검증·책임은 자동화되지 않았다. 다음 장의 Agent/Skill 존재론으로 연결한다.",
];

const sceneLabels = [
  "질문",
  "도발",
  "3D 사례",
  "차이",
  "전환",
  "새 문법",
  "인터뷰",
  "실전",
  "시안 4개",
  "본보기",
  "로그",
  "퀴즈",
  "학습",
  "100×",
  "탐색",
  "구독",
  "신호",
  "경계",
  "두 갈래",
  "총괄",
  "결론",
];

const collaborationMoves = [
  ["01", "나를 인터뷰", "답부터 만들지 말고, 필요한 질문부터 해줘."],
  ["02", "놓친 부분", "내가 놓쳤을 위험과 전제를 먼저 짚어줘."],
  ["03", "시안 4개", "디자인 시안은 HTML로, 서로 다른 디자인 4개를 보여줘."],
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

export function AiCollaborationExperience() {
  const deckRef = useRef<HTMLElement>(null);
  const [activeScene, setActiveScene] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [promptMode, setPromptMode] = useState(1);

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
        <div className={styles.interviewLayout}>
          <div className={styles.collabIntro}>
            <p className={styles.kicker}>실제 사용 문장 01 · 역질문 요청</p>
            <span className={styles.collabIndex}>01 / 06 · INTERVIEW ME</span>
            <h2>답을 받기 전에,<br /><mark>빈칸부터 함께 채웁니다.</mark></h2>
            <blockquote>“이 일을 잘하려면 무엇을 알아야 하는지<br /><strong>나에게 질문부터 해줘.</strong>”</blockquote>
          </div>
          <div className={styles.interviewFlow} aria-label="AI의 질문이 업무 브리프로 정리되는 과정">
            <div className={styles.interviewQuestions}>
              <small>AI · 먼저 묻기</small>
              <span><b>01</b>누가 읽나요?</span>
              <span><b>02</b>무엇을 결정해야 하나요?</span>
              <span><b>03</b>좋은 결과의 기준은?</span>
              <span><b>04</b>지켜야 할 제약은?</span>
            </div>
            <div className={styles.interviewArrow}>→</div>
            <div className={styles.briefSheet}>
              <small>함께 완성한 업무 브리프</small>
              <strong>임원 의사결정용<br />1페이지 비교 메모</strong>
              <span>독자 · 목적 · 성공 기준 · 제약</span>
              <b>추측할 빈칸 ↓</b>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="7">
        <SceneNumber number="08" />
        <div className={styles.riskScene}>
          <div className={styles.promptStage}>
            <p className={styles.kicker}>실제 사용 문장 02 · 사전 검토 요청</p>
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

      <section className={`${styles.scene} ${styles.yellow}`} data-scene="8">
        <SceneNumber number="09" />
        <div className={styles.variantLayout}>
          <div className={styles.collabIntro}>
            <p className={styles.kicker}>실제 사용 문장 03 · 선택지 넓히기</p>
            <span className={styles.collabIndex}>03 / 06 · FOUR DIRECTIONS</span>
            <h2>한 개를 다듬기 전에,<br /><mark>네 방향을 펼칩니다.</mark></h2>
            <blockquote>“디자인 시안은 <strong>HTML로,</strong><br /><strong>서로 다른 디자인 4개</strong>를 한 화면에 보여줘.”</blockquote>
            <p className={styles.collabPoint}>설명을 상상하는 대신, 작동하는 화면을 나란히 놓고 고릅니다.</p>
          </div>
          <div className={styles.variantGrid} aria-label="서로 다른 네 가지 HTML 디자인 시안">
            <article className={styles.variantEditorial}>
              <div className={styles.variantChrome}><i /><i /><i /><span>01 · EDITORIAL</span></div>
              <div className={styles.variantCanvas}><small>INSURANCE / 2026</small><strong>삶의 다음 장을<br />준비하는 방식</strong><b /></div>
            </article>
            <article className={styles.variantDashboard}>
              <div className={styles.variantChrome}><i /><i /><i /><span>02 · DASHBOARD</span></div>
              <div className={styles.variantCanvas}><strong>MY COVERAGE</strong><div><b /><b /><b /></div><small>83% READY</small></div>
            </article>
            <article className={styles.variantImmersive}>
              <div className={styles.variantChrome}><i /><i /><i /><span>03 · IMMERSIVE</span></div>
              <div className={styles.variantCanvas}><b /><strong>당신의 내일을<br />입체적으로 보다</strong><small>SCROLL TO EXPLORE</small></div>
            </article>
            <article className={styles.variantMinimal}>
              <div className={styles.variantChrome}><i /><i /><i /><span>04 · MINIMAL</span></div>
              <div className={styles.variantCanvas}><small>SAMSUNG LIFE</small><strong>보장은<br />단순하게.</strong><b>시작하기 →</b></div>
            </article>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.paper}`} data-scene="9">
        <SceneNumber number="10" />
        <div className={styles.exampleLayout}>
          <div className={styles.collabIntro}>
            <p className={styles.kicker}>실제 사용 문장 04 · 최소 본보기</p>
            <span className={styles.collabIndex}>04 / 06 · EXEMPLAR FIRST</span>
            <h2>완성품보다 먼저,<br /><mark>좋은 뼈대</mark>를 봅니다.</h2>
            <blockquote>“좋은 구조의 <strong>최소 예시</strong>부터 만들어줘.<br />왜 좋은지 설명한 뒤 확장해줘.”</blockquote>
          </div>
          <div className={styles.exampleWorkbench} aria-label="최소 본보기 코드에서 실제 결과로 확장하는 과정">
            <div className={styles.codeWindow}>
              <header><i /><i /><i /><span>example.html</span></header>
              <pre><code>{`<main>\n  <header />\n  <section>\n    <h1 />\n    <article />\n  </section>\n</main>`}</code></pre>
            </div>
            <div className={styles.exampleBridge}>
              <span>구조를 본다</span><span>이유를 묻는다</span><span>내 일에 맞춘다</span>
            </div>
            <div className={styles.expandedFrame}>
              <small>YOUR VERSION</small>
              <strong>정보 위계는 유지하고<br />내용·브랜드·기능을 확장</strong>
              <div><span>DATA</span><span>STYLE</span><span>INTERACTION</span></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.ink}`} data-scene="10">
        <SceneNumber number="11" />
        <div className={styles.logLayout}>
          <div className={styles.collabIntro}>
            <p className={styles.kicker}>실제 사용 문장 05 · 오류를 학습 재료로</p>
            <span className={styles.collabIndex}>05 / 06 · READ THE LOG</span>
            <h2>고치기 전에,<br /><mark>로그의 언어</mark>를 배웁니다.</h2>
            <blockquote>“이 로그를 고치기 전에, 무슨 뜻인지와<br /><strong>내가 모르는 개념</strong>부터 설명해줘.”</blockquote>
          </div>
          <div className={styles.logWorkbench}>
            <div className={styles.terminalPanel} aria-label="로그 오류 예시">
              <header><span>●</span><span>●</span><span>●</span><b>auth.log</b></header>
              <pre><code><i>10:31:08</i> POST /login <strong>401</strong>{"\n"}<i>10:31:08</i> TokenExpiredError{"\n"}<i>10:31:09</i> retry 3/3 <strong>failed</strong></code></pre>
            </div>
            <div className={styles.logDecode} aria-label="로그를 이해하는 네 단계">
              <div><span>01</span><strong>신호</strong><small>무슨 일이 벌어졌나</small></div>
              <div><span>02</span><strong>뜻</strong><small>문장이 무엇을 말하나</small></div>
              <div><span>03</span><strong>개념</strong><small>토큰 · 만료 · 인증</small></div>
              <div><span>04</span><strong>다음 확인</strong><small>어디부터 검증하나</small></div>
            </div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.blue}`} data-scene="11">
        <SceneNumber number="12" />
        <div className={styles.quizLayout}>
          <div className={styles.collabIntro}>
            <p className={styles.kicker}>실제 사용 문장 06 · 이해 검증</p>
            <span className={styles.collabIndex}>06 / 06 · QUIZ ME</span>
            <h2>“알겠어요”에서 멈추지 않고,<br /><mark>내 말로 꺼내봅니다.</mark></h2>
            <blockquote>“내가 진짜 이해했는지 <strong>3문제로 확인해줘.</strong><br />틀리면 정답 대신 힌트만 줘.”</blockquote>
          </div>
          <div className={styles.quizBoard} aria-label="질문, 힌트, 재설명으로 이어지는 이해 검증">
            <div className={styles.quizProgress}><span>1</span><span>2</span><span>3</span><b>UNDERSTANDING CHECK</b></div>
            <div className={styles.quizQuestion}><small>QUESTION 02</small><strong>액세스 토큰과<br />리프레시 토큰은 왜 나눌까요?</strong></div>
            <div className={styles.quizAnswer}><span>내 답</span><p>“하나는 짧게 쓰고…”</p></div>
            <div className={styles.quizHint}><span>AI · HINT ONLY</span><p>편의성보다 먼저, 탈취됐을 때의 피해 범위를 떠올려보세요.</p></div>
            <div className={styles.quizFinish}>답을 소비함 → <strong>설명할 수 있음</strong></div>
          </div>
        </div>
      </section>

      <section className={`${styles.scene} ${styles.ink}`} data-scene="12">
        <SceneNumber number="13" />
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

      <section className={`${styles.scene} ${styles.paper}`} data-scene="13">
        <SceneNumber number="14" />
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

      <section className={`${styles.scene} ${styles.coral}`} data-scene="14">
        <SceneNumber number="15" />
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

      <section className={`${styles.scene} ${styles.paper}`} data-scene="15">
        <SceneNumber number="16" />
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

      <section className={`${styles.scene} ${styles.yellow}`} data-scene="16">
        <SceneNumber number="17" />
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

      <section className={`${styles.scene} ${styles.paper}`} data-scene="17">
        <SceneNumber number="18" />
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

      <section className={`${styles.scene} ${styles.ink}`} data-scene="18">
        <SceneNumber number="19" />
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

      <section className={`${styles.scene} ${styles.paper}`} data-scene="19">
        <SceneNumber number="20" />
        <div className={styles.judgmentLayout}>
          <div>
            <p className={styles.kicker}>운영 원칙 · AI 작업팀을 지휘하는 법</p>
            <h2 className={styles.judgmentTitle}>AI가 N명처럼 일할수록,<br /><mark>나는 총괄처럼 검수해야 합니다.</mark></h2>
            <blockquote className={styles.leadCommand}>“역할별로 나눠 진행해. 각 결과에 근거와 테스트를 붙이고, <strong>내가 승인하기 전에는 완료하지 마.</strong>”</blockquote>
          </div>
          <div className={styles.leadMap} aria-label="사람 총괄이 AI 작업팀에 일을 나누고 검수와 재작업을 반복하는 과정">
            <div className={styles.leadBrief}>
              <small>01 · HUMAN LEAD</small>
              <strong>목표 · 기준 설계</strong>
              <span>완료의 조건부터 정한다</span>
            </div>
            <div className={styles.leadArrow}>→</div>
            <div className={styles.aiCrew}>
              <header><strong>02 · AI WORKSTREAMS</strong><span>N개의 실행 역할</span></header>
              <div>
                <article><b>DEV 01</b><strong>화면</strong><small>구현 결과</small></article>
                <article><b>DEV 02</b><strong>백엔드</strong><small>연결 결과</small></article>
                <article><b>DEV 03</b><strong>테스트</strong><small>검증 결과</small></article>
                <article><b>DEV N</b><strong>문서</strong><small>설명 결과</small></article>
              </div>
            </div>
            <div className={styles.reviewFeedback}>
              <span>“틀렸어” → 근거 다시</span>
              <span>“빠졌어” → 테스트 추가</span>
              <span>“약해” → 대안 비교</span>
            </div>
            <div className={styles.reviewGate}>
              <small>03 · HUMAN REVIEW</small>
              <strong>검수 · 반려 · 재작업 · 승인</strong>
              <span>최종 품질과 책임은 사람에게</span>
            </div>
          </div>
        </div>
        <p className={styles.disclaimer}>‘혼낸다’는 감정적으로 대한다는 뜻이 아닙니다. 기준 미달을 구체적으로 지적하고 다시 일하게 하는 검수 루프입니다.</p>
      </section>

      <section className={`${styles.scene} ${styles.yellow}`} data-scene="20">
        <SceneNumber number="21" />
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
