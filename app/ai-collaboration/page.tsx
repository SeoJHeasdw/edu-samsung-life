import type { Metadata } from "next";
import { AiCollaborationExperience } from "./ai-collaboration-experience";

export const metadata: Metadata = {
  title: "프롬프트 이후 — AI와 협업하는 사람",
  description:
    "삼성생명 AI 워크숍 1교시: 프롬프트 기법을 넘어 목표·판단·검증으로 AI와 협업하는 법",
};

export default function AiCollaborationPage() {
  return <AiCollaborationExperience />;
}
