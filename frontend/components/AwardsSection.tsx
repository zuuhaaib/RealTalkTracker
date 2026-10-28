"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  MessageCircleMore,
  MessagesSquare,
  Send,
  Zap,
} from "lucide-react";
import type { Awards } from "../types/analysis";
import { Section, SectionTitle } from "./ui";

const awardRotations = [
  "-rotate-1",
  "rotate-1",
  "rotate-[0.5deg]",
  "-rotate-[0.5deg]",
  "rotate-1",
  "-rotate-1",
];

export default function AwardsSection({ awards }: { awards: Awards }) {
  return (
    <>
      {/* AWARDS */}
      <Section>
        <SectionTitle
          eyebrow="the official ceremony"
          title="chat awards"
          text="prestigious. scientifically rigorous. definitely going on linkedin."
        />

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          <Award
            rotation={awardRotations[0]}
            icon={<MessageCircleMore />}
            title="biggest yapper"
            winner={awards.biggestYapper}
            caption="bro had things to say"
          />

          <Award
            rotation={awardRotations[1]}
            icon={<Zap />}
            title="fastest responder"
            winner={awards.fastestResponder}
            caption="phone apparently surgically attached"
          />

          <Award
            rotation={awardRotations[2]}
            icon={<Send />}
            title="conversation starter"
            winner={awards.conversationStarter}
            caption="keeping the friendship alive one text at a time"
          />

          <Award
            rotation={awardRotations[3]}
            icon={<MessagesSquare />}
            title="double text champion"
            winner={awards.doubleTexter}
            caption="one message simply wasn't enough"
          />

          <Award
            rotation={awardRotations[4]}
            icon={<FileText />}
            title="most words"
            winner={awards.mostWords}
            caption="published author apparently"
          />

          <Award
            rotation={awardRotations[5]}
            icon={<BrainCircuit />}
            title="certified essay sender"
            winner={awards.longestMessages}
            caption="paragraph enjoyer"
          />
        </div>
      </Section>
    </>
  );
}

function Award({
  rotation,
  icon,
  title,
  winner,
  caption,
}: {
  rotation: string;
  icon: ReactNode;
  title: string;
  winner: string | null;
  caption: string;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        rotate: 0,
      }}
      className={`${rotation} border-2 border-yellow-400 bg-[#14203a] p-6 shadow-xl`}
    >
      <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-[#0b132b]">
        {icon}
      </div>

      <p className="text-sm font-bold text-yellow-400">{title}</p>

      <p className="mt-2 text-3xl font-black">{winner ?? "n/a"}</p>

      <p className="mt-4 text-sm text-[#8794ad]">{caption}</p>
    </motion.div>
  );
}
