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

export default function AwardsSection({
  awards,
  isGroup,
}: {
  awards: Awards;
  isGroup: boolean;
}) {
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
            emptyCaption="nobody sent a message, somehow"
          />

          <Award
            rotation={awardRotations[1]}
            icon={<Zap />}
            title={isGroup ? "quickest to jump in" : "fastest responder"}
            winner={awards.fastestResponder}
            caption={
              isGroup
                ? "shortest median gap before speaking. who they were answering is anyone’s guess"
                : "phone apparently surgically attached"
            }
            emptyCaption="no sender changes within six hours, so there was nothing to time"
          />

          <Award
            rotation={awardRotations[2]}
            icon={<Send />}
            title="conversation starter"
            winner={awards.conversationStarter}
            caption="keeping the friendship alive one text at a time"
            emptyCaption="no conversations to start"
          />

          <Award
            rotation={awardRotations[3]}
            icon={<MessagesSquare />}
            title="double text champion"
            winner={awards.doubleTexter}
            caption="most extra messages in a row. one message simply wasn't enough"
            emptyCaption="nobody sent two messages in a row"
          />

          <Award
            rotation={awardRotations[4]}
            icon={<FileText />}
            title="most words"
            winner={awards.mostWords}
            caption="published author apparently"
            emptyCaption="no readable words to count"
          />

          <Award
            rotation={awardRotations[5]}
            icon={<BrainCircuit />}
            title="certified essay sender"
            winner={awards.longestMessages}
            caption="paragraph enjoyer"
            emptyCaption="no readable words to count"
          />
        </div>

        <p className="mt-10 text-xs text-[#66738d]">
          awards use the same definitions as the stats above. ties are shared.
        </p>
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
  emptyCaption,
}: {
  rotation: string;
  icon: ReactNode;
  title: string;
  winner: string | null;
  caption: string;
  // Shown instead of the joke when nobody qualified.
  emptyCaption: string;
}) {
  return (
    <motion.div
      whileHover={{
        scale: 1.04,
        rotate: 0,
      }}
      className={`${rotation} min-w-0 border-2 border-yellow-400 bg-[#14203a] p-6 shadow-xl`}
    >
      <div className="mb-7 flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400 text-[#0b132b]">
        {icon}
      </div>

      <p className="text-sm font-bold text-yellow-400">{title}</p>

      <p className="mt-2 text-2xl font-black wrap-anywhere sm:text-3xl">
        {winner ?? "no winner"}
      </p>

      <p className="mt-4 text-sm text-[#8794ad]">
        {winner === null ? emptyCaption : caption}
      </p>
    </motion.div>
  );
}
