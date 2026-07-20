"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Concept = {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  plain: string;
  description: string;
  example: string;
  result: string;
  color: string;
};

const concepts: Concept[] = [
  {
    id: "skill",
    number: "01",
    eyebrow: "MY WAY OF WORKING",
    title: "반복하는 일을\n잘하는 방식으로 저장.",
    plain: "나만의 업무 레시피",
    description:
      "매번 다시 설명하던 기준과 노하우를 한 번 정리해 두고, 필요할 때마다 같은 품질로 꺼내 씁니다.",
    example: "우리 팀 보고서 톤과 검토 기준을 기억해줘.",
    result: "일관된 결과",
    color: "#f0a45b",
  },
  {
    id: "plugin",
    number: "02",
    eyebrow: "CONNECTED TOOLS",
    title: "필요한 도구를\nClaude 곁으로 연결.",
    plain: "업무 도구와의 연결 장치",
    description:
      "파일과 서비스가 있는 곳까지 Claude가 손을 뻗게 합니다. 복사하고 붙이는 단계를 줄여 흐름을 이어갑니다.",
    example: "이 폴더의 설문 파일을 읽고 핵심만 모아줘.",
    result: "끊김 없는 흐름",
    color: "#d97757",
  },
  {
    id: "connector",
    number: "03",
    eyebrow: "BRIDGE TO YOUR TOOLS",
    title: "Claude가 직접\n도구와 데이터로 연결.",
    plain: "시스템과 Claude를 잇는 다리",
    description:
      "메일·캘린더·파일·사내 시스템 등 이미 쓰고 있는 도구를 Claude와 연결합니다. 복사·붙이기 없이 정보가 흐르고, 결과가 제자리에 놓입니다.",
    example: "이번 주 캘린더 보고 내일 회의 자료 미리 정리해줘.",
    result: "연결된 업무 흐름",
    color: "#f3eee7",
  },
];

const promptExamples = [
  {
    label: "메일 정리",
    request: "오늘 받은 메일에서 제가 결정할 것만 알려줘.",
    outcome: "결정 3건 · 회신 2건 · 참고 5건",
  },
  {
    label: "보고서 작성",
    request: "회의 메모를 임원 보고용 한 페이지로 바꿔줘.",
    outcome: "핵심 이슈 · 근거 · 다음 액션",
  },
  {
    label: "고객 응대",
    request: "이 문의의 감정을 읽고 차분한 답변을 써줘.",
    outcome: "공감 · 해결안 · 후속 안내",
  },
];

const workflowSteps = [
  { label: "GOAL", title: "목표 이해", copy: "결과물과 기준을 확인합니다." },
  { label: "SKILL", title: "기준 불러오기", copy: "보고서 작성 방식을 적용합니다." },
  { label: "PLUGIN", title: "정보 연결", copy: "교육 만족도 파일을 읽습니다." },
  { label: "CONNECTOR", title: "도구 연결·실행", copy: "파일을 읽고 결과를 제자리에 전달합니다." },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function ThreeCore({ activeConcept }: { activeConcept: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(activeConcept);

  useEffect(() => {
    activeRef.current = activeConcept;
  }, [activeConcept]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0, 7.6);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      canvas.dataset.fallback = "true";
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;

    const world = new THREE.Group();
    scene.add(world);

    const coreMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xd97757,
      emissive: 0x5f170e,
      emissiveIntensity: 0.65,
      metalness: 0.18,
      roughness: 0.24,
      clearcoat: 1,
      clearcoatRoughness: 0.12,
    });
    const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.05, 5), coreMaterial);
    world.add(core);

    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0xffc39e,
      wireframe: true,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
    });
    const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(1.24, 2), innerMaterial);
    world.add(inner);

    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0xf0a45b,
      transparent: true,
      opacity: 0.2,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.014, 8, 180), haloMaterial);
    halo.rotation.set(Math.PI * 0.58, 0.18, 0.25);
    world.add(halo);

    const orbitLines: THREE.Mesh[] = [];
    for (let index = 0; index < 3; index += 1) {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(2.3 + index * 0.3, 0.007, 6, 180),
        new THREE.MeshBasicMaterial({
          color: index === 2 ? 0xf3eee7 : index === 1 ? 0xd97757 : 0xf0a45b,
          transparent: true,
          opacity: 0.12,
        }),
      );
      ring.rotation.set(1.0 + index * 0.25, index * 0.65, index * 0.4);
      world.add(ring);
      orbitLines.push(ring);
    }

    const satelliteColors = [0xf0a45b, 0xd97757, 0xf3eee7];
    const satelliteGroups = satelliteColors.map((color, index) => {
      const group = new THREE.Group();
      const material = new THREE.MeshPhysicalMaterial({
        color,
        emissive: color,
        emissiveIntensity: index === 2 ? 0.06 : 0.18,
        roughness: 0.22,
        metalness: 0.08,
        clearcoat: 1,
      });
      const node = new THREE.Mesh(new THREE.OctahedronGeometry(0.19, 2), material);
      const nodeRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.34, 0.012, 6, 64),
        new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 }),
      );
      nodeRing.rotation.x = Math.PI / 2.4;
      group.add(node, nodeRing);
      group.userData.angle = index * ((Math.PI * 2) / 3) - 0.4;
      group.userData.node = node;
      group.userData.ring = nodeRing;
      world.add(group);
      return group;
    });

    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xf6d9c6,
      transparent: true,
      opacity: 0.13,
    });
    const connectorLines = satelliteGroups.map(() => {
      const geometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(),
        new THREE.Vector3(1, 0, 0),
      ]);
      const line = new THREE.Line(geometry, lineMaterial);
      world.add(line);
      return line;
    });

    const particleCount = 420;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.5 + Math.random() * 2.7;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      particlePositions[index * 3] = radius * Math.sin(phi) * Math.cos(theta);
      particlePositions[index * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      particlePositions[index * 3 + 2] = radius * Math.cos(phi) * 0.7;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: 0xf4d4c2,
        size: 0.018,
        transparent: true,
        opacity: 0.42,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    world.add(particles);

    scene.add(new THREE.AmbientLight(0xffe1d1, 1.25));
    const keyLight = new THREE.PointLight(0xff8c64, 28, 14, 1.7);
    keyLight.position.set(3, 2, 4);
    scene.add(keyLight);
    const fillLight = new THREE.PointLight(0x6f8cff, 18, 12, 2);
    fillLight.position.set(-4, -2, 2);
    scene.add(fillLight);

    const pointer = { x: 0, y: 0 };
    const scroll = { value: window.scrollY / window.innerHeight };
    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrame = 0;
    const clock = new THREE.Clock();

    const onPointerMove = (event: PointerEvent) => {
      pointer.x = (event.clientX / width - 0.5) * 2;
      pointer.y = (event.clientY / height - 0.5) * 2;
    };

    const onScroll = () => {
      scroll.value = window.scrollY / Math.max(window.innerHeight, 1);
    };

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.65));
    };

    const render = () => {
      const time = reducedMotion ? 0 : clock.getElapsedTime();
      const active = activeRef.current;
      const scrollValue = scroll.value;
      const mobile = width < 820;
      const inBlueprint = scrollValue > 1.7 && scrollValue < 6.6;
      const inAssembly = scrollValue >= 6.2 && scrollValue < 8.3;
      const targetX = mobile ? 0 : inAssembly ? 0 : inBlueprint ? 1.45 : 1.75;

      world.position.x += (targetX - world.position.x) * 0.035;
      world.position.y += ((inBlueprint ? 0.12 : 0) - world.position.y) * 0.04;
      world.rotation.y +=
        ((reducedMotion ? 0.24 : time * 0.075) + scrollValue * 0.21 + pointer.x * 0.1 -
          world.rotation.y) *
        0.035;
      world.rotation.x += ((pointer.y * -0.08 + Math.sin(time * 0.3) * 0.025) - world.rotation.x) * 0.035;

      const pulse = reducedMotion ? 1 : 1 + Math.sin(time * 1.15) * 0.025;
      core.scale.setScalar(pulse);
      core.rotation.x = time * 0.12 + scrollValue * 0.08;
      core.rotation.z = time * -0.09;
      inner.rotation.x = time * -0.14;
      inner.rotation.y = time * 0.11 + scrollValue * 0.08;
      halo.rotation.z = time * 0.08 + scrollValue * 0.12;
      particles.rotation.y = time * -0.018 + scrollValue * 0.035;
      orbitLines.forEach((ring, index) => {
        ring.rotation.z += reducedMotion ? 0 : 0.0005 * (index + 1);
      });

      satelliteGroups.forEach((satellite, index) => {
        const isActive = index === active;
        const baseAngle = satellite.userData.angle as number;
        const angle = baseAngle + time * (0.08 + index * 0.012) + scrollValue * 0.06;
        const radius = (isActive ? 2.72 : 2.25) + (inAssembly ? -0.48 : 0);
        const target = new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius * 0.62,
          Math.sin(angle * 1.6) * 0.75,
        );
        satellite.position.lerp(target, 0.045);
        const targetScale = isActive ? 1.42 : 0.78;
        satellite.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.06);
        const node = satellite.userData.node as THREE.Mesh;
        const ring = satellite.userData.ring as THREE.Mesh;
        node.rotation.x = time * 0.55;
        node.rotation.y = time * -0.4;
        ring.rotation.z = time * (index % 2 ? -0.45 : 0.45);

        const positions = connectorLines[index].geometry.attributes.position as THREE.BufferAttribute;
        positions.setXYZ(0, 0, 0, 0);
        positions.setXYZ(1, satellite.position.x, satellite.position.y, satellite.position.z);
        positions.needsUpdate = true;
      });

      const cameraTargetZ = mobile ? 8.7 : 7.6 - clamp(scrollValue - 2, 0, 4) * 0.08;
      camera.position.z += (cameraTargetZ - camera.position.z) * 0.025;
      camera.position.x += (pointer.x * 0.08 - camera.position.x) * 0.025;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
      animationFrame = window.requestAnimationFrame(render);
    };

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onResize();
    render();

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points || object instanceof THREE.Line) {
          object.geometry?.dispose();
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material?.dispose());
        }
      });
    };
  }, []);

  return (
    <div className="webgl-layer" aria-hidden="true">
      <div className="webgl-fallback" />
      <canvas ref={canvasRef} className="three-canvas" />
    </div>
  );
}

function HeroCoreFilm() {
  const frameRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    const video = videoRef.current;
    if (!frame || !video) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let heroIsVisible = false;

    const syncPlayback = () => {
      const shouldPlay = heroIsVisible && !document.hidden && !motionPreference.matches;
      if (shouldPlay) {
        void video.play().catch(() => {
          // Muted autoplay can still be declined by browser or OS policy.
        });
      } else {
        video.pause();
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        heroIsVisible = entry?.isIntersecting ?? false;
        syncPlayback();
      },
      { threshold: 0.04 },
    );
    const handleVisibilityChange = () => syncPlayback();
    const handleMotionPreferenceChange = () => syncPlayback();

    observer.observe(frame);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionPreference.addEventListener("change", handleMotionPreferenceChange);
    syncPlayback();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionPreference.removeEventListener("change", handleMotionPreferenceChange);
      video.pause();
    };
  }, []);

  return (
    <div ref={frameRef} className="hero-film" aria-hidden="true">
      <video
        ref={videoRef}
        className="hero-film-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        disablePictureInPicture
        tabIndex={-1}
      >
        <source src="/assets/higgsfield-ai-core.mp4" type="video/mp4" />
      </video>
    </div>
  );
}

function ConceptChapter({ concept, index }: { concept: Concept; index: number }) {
  const handleTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    event.currentTarget.style.setProperty("--tilt-x", `${y * -5}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${x * 7}deg`);
  };

  const resetTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
  };

  return (
    <article
      className="concept-chapter"
      id={concept.id}
      data-concept-index={index}
      style={{ "--concept-color": concept.color } as React.CSSProperties}
    >
      <div className="chapter-ghost" aria-hidden="true">
        {concept.id}
      </div>
      <div
        className="concept-card"
        onPointerMove={handleTilt}
        onPointerLeave={resetTilt}
      >
        <div className="concept-card-topline">
          <span>{concept.number}</span>
          <span>{concept.eyebrow}</span>
          <span className="concept-status">ACTIVE</span>
        </div>
        <p className="concept-plain">쉽게 말하면, {concept.plain}</p>
        <h3>
          {concept.title.split("\n").map((line) => (
            <span key={line}>{line}</span>
          ))}
        </h3>
        <p className="concept-description">{concept.description}</p>
        <div className="concept-example">
          <span className="example-mark" aria-hidden="true">
            “
          </span>
          <p>{concept.example}</p>
          <span className="example-result">→ {concept.result}</span>
        </div>
      </div>
      <div className="chapter-stage-label" aria-hidden="true">
        <span>{concept.id.toUpperCase()}</span>
        <span>0{index + 1} / 03</span>
      </div>
    </article>
  );
}

export function ClaudeWorkshopExperience() {
  const [activeConcept, setActiveConcept] = useState(0);
  const [promptIndex, setPromptIndex] = useState(0);
  const [workflowStep, setWorkflowStep] = useState(-1);
  const [workflowRunning, setWorkflowRunning] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? window.scrollY / max : 0;
      progressRef.current?.style.setProperty("--page-progress", `${progress}`);
    };
    const onPointerMove = (event: PointerEvent) => {
      cursorRef.current?.style.setProperty(
        "transform",
        `translate3d(${event.clientX}px, ${event.clientY}px, 0)`,
      );
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-concept-index]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          setActiveConcept(Number((visible.target as HTMLElement).dataset.conceptIndex || 0));
        }
      },
      { threshold: [0.35, 0.55, 0.75] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!workflowRunning) return;
    const timer = window.setInterval(() => {
      setWorkflowStep((current) => {
        if (current >= workflowSteps.length - 1) {
          window.clearInterval(timer);
          setWorkflowRunning(false);
          return current;
        }
        return current + 1;
      });
    }, 760);
    return () => window.clearInterval(timer);
  }, [workflowRunning]);

  const runWorkflow = useCallback(() => {
    setWorkflowStep(-1);
    setWorkflowRunning(false);
    window.setTimeout(() => {
      setWorkflowRunning(true);
      setWorkflowStep(0);
    }, 80);
  }, []);

  return (
    <main className="experience">
      <ThreeCore activeConcept={activeConcept} />
      <div className="noise-layer" aria-hidden="true" />
      <div ref={cursorRef} className="cursor-glow" aria-hidden="true" />

      <nav className="top-nav" aria-label="주요 섹션">
        <a className="brand-lockup" href="#top" aria-label="처음으로">
          <span className="brand-pulse" aria-hidden="true" />
          <span>CLAUDE WORK LAB</span>
        </a>
        <div className="nav-links">
          <a href="#why">WHY</a>
          <a href="#blueprint">SYSTEM</a>
          <a href="#instructor">INSTRUCTOR</a>
        </div>
        <span className="nav-edition">SEOUL · 2026</span>
      </nav>

      <div className="page-rail" ref={progressRef} aria-hidden="true">
        <span>01</span>
        <div className="page-rail-track">
          <div className="page-rail-fill" />
        </div>
        <span>08</span>
      </div>

      <section className="hero" id="top">
        <HeroCoreFilm />
        <div className="hero-aurora" aria-hidden="true" />
        <div className="hero-content">
          <p className="section-kicker hero-kicker">
            <span>Samsung Life</span>
            <span>Claude Workshop</span>
            <span>Instructor · 서제호</span>
          </p>
          <h1>
            <span>AI를 쓰는 사람에서</span>
            <span>
              AI와 <em>일하는</em> 사람으로
            </span>
          </h1>
          <p className="hero-intro">
            Skill · Plugin · Connector를 코드가 아닌 <strong>업무의 언어</strong>로 경험하는 하루.
            오늘, Claude와 일하는 방식이 달라집니다.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#why">
              <span>경험 시작하기</span>
              <span aria-hidden="true">↓</span>
            </a>
            <a className="text-button" href="#blueprint">
              3개의 레이어 미리보기
            </a>
          </div>
        </div>

        <div className="hero-orbit-labels" aria-hidden="true">
          <span className="orbit-label orbit-label-skill">01 · SKILL</span>
          <span className="orbit-label orbit-label-plugin">02 · PLUGIN</span>
          <span className="orbit-label orbit-label-agent">03 · CONNECTOR</span>
        </div>

        <div className="hero-bottomline">
          <span>NO CODE REQUIRED</span>
          <span className="hero-scroll-cue">
            <i /> SCROLL TO EXPLORE
          </span>
          <span>BEGINNER FIRST</span>
        </div>
        <div className="hero-ghost-word" aria-hidden="true">
          COLLABORATE
        </div>
      </section>

      <section className="instructor" id="instructor">
        <div className="night-portrait" aria-hidden="true">
          <img src="/assets/seo-jaeho-night.jpeg" alt="" />
          <div className="night-overlay" />
          <span className="night-caption">FROM SEOUL, WITH CURIOSITY</span>
        </div>

        <div className="instructor-content">
          <p className="section-kicker">YOUR GUIDE · 01</p>
          <div className="profile-card">
            <div className="profile-photo-wrap">
              <img
                src="/assets/seo-jaeho-profile.jpg"
                alt="검은색 터틀넥을 입은 서제호 강사의 정면 프로필 사진"
              />
              <span>AI ENGINEER</span>
            </div>
            <div className="profile-copy">
              <span className="profile-overline">INSTRUCTOR</span>
              <h2>서제호</h2>
              <p>
                복잡한 기술을 누구나 움직일 수 있는
                <br />
                <strong>경험의 언어로 번역합니다.</strong>
              </p>
            </div>
          </div>

          <div className="career-list">
            <div><span>NOW</span><strong>IBM Korea · AI Engineer</strong></div>
            <div><span>BEFORE</span><strong>KT DS · Tech Leader & 사내 AI 강사</strong></div>
            <div><span>TEACH</span><strong>Udemy - Agentic RAG 이론 & 실습</strong></div>
          </div>
          <p className="instructor-note">
            "오늘의 목표는 기능을 많이 아는 것이 아니라,
            내 일에 바로 가져갈 수 있는 한 가지 흐름을 만드는 것입니다."
          </p>
        </div>
      </section>

      <section className="manifesto" id="why">
        <div className="manifesto-inner">
          <div className="manifesto-copy">
            <p className="section-kicker dark-kicker">BEGINNER FIRST · 02</p>
            <h2>
              전혀 어렵지
              <br />
              <em>않습니다.</em>
            </h2>
            <p className="manifesto-lead">
              좋은 프롬프트보다 먼저 필요한 건,
              <br />
              <strong>내가 원하는 결과를 구체적으로 설명하는 일.</strong>
            </p>
            <p className="manifesto-support">
              코딩을 몰라도 괜찮습니다. 익숙한 업무 한 가지를 골라 Claude에게 차근차근
              알려주는 것부터 시작합니다.
            </p>
          </div>

          <div className="prompt-lab">
            <div className="prompt-lab-header">
              <span>ONE LINE → CLEAR OUTCOME</span>
              <span className="live-indicator"><i /> LIVE</span>
            </div>
            <div className="prompt-tabs" role="tablist" aria-label="업무 예시 선택">
              {promptExamples.map((example, index) => (
                <button
                  key={example.label}
                  className={promptIndex === index ? "active" : ""}
                  type="button"
                  role="tab"
                  aria-selected={promptIndex === index}
                  onClick={() => setPromptIndex(index)}
                >
                  {example.label}
                </button>
              ))}
            </div>
            <div className="prompt-window">
              <div className="prompt-person">
                <span>YOU</span>
                <p>{promptExamples[promptIndex].request}</p>
              </div>
              <div className="prompt-arrow" aria-hidden="true">↘</div>
              <div className="prompt-result">
                <span>CLAUDE ORGANIZES</span>
                <p>{promptExamples[promptIndex].outcome}</p>
              </div>
            </div>
            <p className="prompt-caption">먼저 일의 맥락을 말하면, 기술은 뒤에서 따라옵니다.</p>
          </div>
        </div>
      </section>

      <section className="blueprint" id="blueprint">
        <header className="blueprint-intro">
          <p className="section-kicker">THE CLAUDE WORK SYSTEM · 03—05</p>
          <h2>
            막연함을 구조로 바꾸는
            <br />
            <em>3개의 레이어.</em>
          </h2>
          <p>
            아래로 움직일수록 하나의 코어가 확장됩니다.
            <br />
            세 가지 개념을 기술이 아닌 역할로 이해해 보세요.
          </p>
          <div className="blueprint-index" aria-label="현재 개념">
            {concepts.map((concept, index) => (
              <a
                key={concept.id}
                className={activeConcept === index ? "active" : ""}
                href={`#${concept.id}`}
              >
                <span>{concept.number}</span>
                {concept.id.toUpperCase()}
              </a>
            ))}
          </div>
        </header>

        {concepts.map((concept, index) => (
          <ConceptChapter key={concept.id} concept={concept} index={index} />
        ))}
      </section>

      <section className="assembly">
        <div className="assembly-content">
          <p className="section-kicker">THE MOMENT IT CLICKS · 06</p>
          <div className="assembly-equation" aria-label="Skill 더하기 Plugin 더하기 Connector">
            <span>SKILL</span>
            <i>+</i>
            <span>PLUGIN</span>
            <i>+</i>
            <span>CONNECTOR</span>
          </div>
          <h2>
            세 가지가 연결되는 순간,
            <br />
            AI는 <em>업무 파트너</em>가 됩니다.
          </h2>
          <p>
            나의 방식으로, 필요한 도구와 데이터를 연결해,
            <br />
            업무가 끊김 없이 흐르는 시스템.
          </p>
        </div>
        <div className="assembly-ring" aria-hidden="true">
          <span>KNOW-HOW</span><span>TOOLS</span><span>OUTCOME</span>
        </div>
      </section>

      <section className="playground" id="playground">
        <div className="playground-heading">
          <p className="section-kicker dark-kicker">A SMALL DEMO · 07</p>
          <h2>
            한 문장으로
            <br />
            <em>시작해 보세요.</em>
          </h2>
          <p>
            버튼을 누르면 한 문장이 네 단계의 업무 흐름으로 바뀝니다.
            <br />
            복잡한 자동화도 출발점은 분명한 부탁 하나입니다.
          </p>
        </div>

        <div className="workflow-console">
          <div className="console-topbar">
            <div className="console-dots" aria-hidden="true"><i /><i /><i /></div>
            <span>claude-workflow.local</span>
            <span>READY</span>
          </div>
          <div className="console-request">
            <span className="console-avatar">나</span>
            <p>
              지난주 교육 만족도 파일을 읽고, 핵심 이슈를 찾아,
              <strong> 경영진 보고용 1페이지</strong>로 정리해줘.
            </p>
          </div>

          <div className="workflow-steps" aria-live="polite">
            {workflowSteps.map((step, index) => {
              const done = workflowStep > index;
              const active = workflowStep === index;
              return (
                <div
                  key={step.label}
                  className={`workflow-step ${done ? "done" : ""} ${active ? "active" : ""}`}
                >
                  <span className="step-index">0{index + 1}</span>
                  <span className="step-signal" aria-hidden="true"><i /></span>
                  <div>
                    <span>{step.label}</span>
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </div>
                  <span className="step-state">{done ? "DONE" : active ? "WORKING" : "WAIT"}</span>
                </div>
              );
            })}
          </div>

          <div className={`workflow-output ${workflowStep === 3 && !workflowRunning ? "visible" : ""}`}>
            <span>완료된 결과</span>
            <strong>핵심 인사이트 3건 · 개선 액션 2건 · 1페이지 보고서</strong>
          </div>

          <button className="run-button" type="button" onClick={runWorkflow} disabled={workflowRunning}>
            <span>{workflowRunning ? "워크플로 실행 중" : workflowStep === 3 ? "다시 실행하기" : "워크플로 실행"}</span>
            <span className="run-icon" aria-hidden="true">{workflowRunning ? "···" : "↗"}</span>
          </button>
        </div>
      </section>

      <section className="finale">
        <div className="finale-grid" aria-hidden="true" />
        <p className="section-kicker">READY TO WORK DIFFERENTLY? · 08</p>
        <h2>
          Claude를 잘 쓰는 법보다,
          <br />
          <em>내 일을 더 잘 설계하는 법.</em>
        </h2>
        <p>이제, 한 가지 익숙한 업무에서 시작해 봅시다.</p>
        <a className="finale-button" href="#top">
          <span>처음부터 다시 보기</span>
          <span aria-hidden="true">↑</span>
        </a>
        <footer>
          <span>SAMSUNG LIFE × CLAUDE WORKSHOP</span>
          <span>INSTRUCTOR SEO JAEHO</span>
          <span>SEOUL · 2026</span>
        </footer>
      </section>
    </main>
  );
}
