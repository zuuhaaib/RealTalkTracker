import type { AnalyzeResponse } from "../types/analysis";
import { byMessages, summarize } from "./edition";
import { formatHour, formatMonth } from "./format";

// Story-sized images of the results, drawn on a canvas in the browser, so
// nothing extra is sent anywhere. Instagram covers roughly the top 250px
// and bottom 340px of a story, so everything stays between those.

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1920;

const SITE = "real-talk-tracker.vercel.app";

const MARGIN = 88;
const CONTENT_WIDTH = CARD_WIDTH - MARGIN * 2;
const TOP = 260;
const FOOTER_Y = 1500;

const LIGHT = { bg: "#f8f7f4", panel: "#efede7", ink: "#141413", muted: "#5f5e5a", accent: "#f2783c" };
const ORANGE = { ...LIGHT, bg: "#f2783c", muted: "#141413" };
const DARK = { bg: "#141413", panel: "#2a2a27", ink: "#f8f7f4", muted: "#bdbbb4", accent: "#f2783c" };

type Theme = typeof LIGHT;
type Ctx = CanvasRenderingContext2D;

export type ShareCard = {
  id: string;
  label: string;
  alt: string;
  theme: Theme;
  draw: (ctx: Ctx, font: string) => void;
};

function setFont(ctx: Ctx, font: string, size: number, weight: number) {
  ctx.font = `${weight} ${size}px ${font}`;
  // Tight on big type, normal on small. Ignored by browsers without it.
  ctx.letterSpacing = size >= 60 ? `${-size * 0.03}px` : "0px";
}

// Wrap text to a width, honouring line breaks and splitting any single
// word too long for a line (long names do happen).
function wrap(ctx: Ctx, text: string, maxWidth: number) {
  const lines: string[] = [];

  text.split(/\n+/).forEach((paragraph, index) => {
    // A blank line between paragraphs.
    if (index > 0) lines.push("");

    let line = "";

    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      const candidate = line ? `${line} ${word}` : word;

      if (ctx.measureText(candidate).width <= maxWidth) {
        line = candidate;
        continue;
      }

      if (line) lines.push(line);
      line = "";

      let rest = word;
      while (ctx.measureText(rest).width > maxWidth) {
        let cut = rest.length - 1;
        while (cut > 1 && ctx.measureText(rest.slice(0, cut)).width > maxWidth) cut -= 1;
        lines.push(rest.slice(0, cut));
        rest = rest.slice(cut);
      }
      line = rest;
    }

    if (line) lines.push(line);
  });

  return lines;
}

type Fit = { font: string; x?: number; maxWidth?: number; maxHeight: number; start: number; min: number; weight: number; leading: number };

// Draw text at the largest size that fits the box, ending in "…" if it
// still doesn't fit at the smallest size. Returns the y below it.
function drawFitted(ctx: Ctx, text: string, y: number, color: string, options: Fit) {
  const { font, x = MARGIN, maxWidth = CONTENT_WIDTH, maxHeight, start, min, weight, leading } = options;

  let size = start;
  let lines: string[] = [];

  for (; size >= min; size -= 2) {
    setFont(ctx, font, size, weight);
    lines = wrap(ctx, text, maxWidth);

    // Prefer a smaller size over splitting a long name mid-word.
    const wordsFit = text.split(/\s+/).every((word) => ctx.measureText(word).width <= maxWidth);
    if (wordsFit && lines.length * size * leading <= maxHeight) break;
  }

  if (size < min) {
    size = min;
    setFont(ctx, font, size, weight);
    lines = wrap(ctx, text, maxWidth);
    const room = Math.max(1, Math.floor(maxHeight / (size * leading)));

    if (lines.length > room) {
      lines = lines.slice(0, room);
      while (lines.length > 1 && !lines[lines.length - 1]) lines.pop();
      let last = lines[lines.length - 1];
      while (last && ctx.measureText(`${last}…`).width > maxWidth) last = last.slice(0, -1);
      lines[lines.length - 1] = `${last.replace(/[\s.,;:]+$/, "")}…`;
    }
  }

  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  lines.forEach((line, index) => ctx.fillText(line, x, y + index * size * leading));

  return y + lines.length * size * leading;
}

function roundedRect(ctx: Ctx, x: number, y: number, width: number, height: number, radius: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
}

// The logo and the address, so a posted card leads back here.
function drawFooter(ctx: Ctx, font: string, theme: Theme) {
  const size = 60;
  const scale = size / 96;

  ctx.save();
  ctx.translate(MARGIN - 12 * scale, FOOTER_Y - 10 * scale);
  ctx.scale(scale, scale);
  ctx.fillStyle = theme === ORANGE ? "#141413" : "#f2783c";
  ctx.fill(new Path2D("M38 20H82A22 22 0 0 1 104 42V74A22 22 0 0 1 82 96H20A4 4 0 0 1 16 92V42A22 22 0 0 1 38 20Z"));
  ctx.fillStyle = theme === ORANGE ? "#f2783c" : theme === DARK ? "#f8f7f4" : "#141413";
  for (const [x, y, height] of [[34, 62, 18], [54, 52, 28], [74, 40, 40]]) {
    ctx.beginPath();
    ctx.roundRect(x, y, 12, height, 3);
    ctx.fill();
  }
  ctx.restore();

  ctx.textBaseline = "middle";
  setFont(ctx, font, 44, 700);
  ctx.fillStyle = theme.ink;
  ctx.fillText("talktracker", MARGIN + size + 14, FOOTER_Y + size / 2);

  setFont(ctx, font, 32, 500);
  ctx.fillStyle = theme.muted;
  const width = ctx.measureText(SITE).width;
  ctx.fillText(SITE, CARD_WIDTH - MARGIN - width, FOOTER_Y + size / 2);
}

function busiestLine(data: AnalyzeResponse) {
  const { busiestHour, busiestDay, busiestMonth } = data.activity;
  const day = busiestDay ? `${busiestDay.toLowerCase()}s` : "no day in particular";

  return `busiest at ${formatHour(busiestHour)}, on ${day}, in ${formatMonth(busiestMonth)}.`;
}

// The cards for a chat. The AI cards only exist when the AI answered.
export function buildShareCards(data: AnalyzeResponse): ShareCard[] {
  const people = byMessages(data);
  const [topName, top] = people[0];
  const isGroup = people.length > 2;
  const verdict = `${topName} is carrying this ${isGroup ? "group chat" : "chat"}.`;
  const facts = summarize(data);
  const ai = "error" in data.aiAnalysis ? null : data.aiAnalysis;

  const cards: ShareCard[] = [
    {
      id: "summary",
      label: "the summary",
      alt: `Summary card: ${verdict} ${facts.map((fact) => `${fact.label}: ${fact.name}.`).join(" ")}`,
      theme: LIGHT,
      draw(ctx, font) {
        let y = drawFitted(ctx, verdict, TOP, LIGHT.ink, { font, maxHeight: 330, start: 124, min: 60, weight: 700, leading: 1.02 });
        y += 40;

        for (const fact of facts) {
          roundedRect(ctx, MARGIN, y, CONTENT_WIDTH, 186, 40, fact.id === "carrying" ? LIGHT.accent : LIGHT.panel);
          const x = MARGIN + 40;
          const maxWidth = CONTENT_WIDTH - 80;
          drawFitted(ctx, fact.label, y + 22, fact.id === "carrying" ? LIGHT.ink : LIGHT.muted, { font, x, maxWidth, maxHeight: 40, start: 32, min: 26, weight: 500, leading: 1.15 });
          drawFitted(ctx, fact.name, y + 62, LIGHT.ink, { font, x, maxWidth, maxHeight: 72, start: 66, min: 30, weight: 700, leading: 1.05 });
          drawFitted(ctx, fact.detail, y + 136, LIGHT.ink, { font, x, maxWidth, maxHeight: 38, start: 32, min: 26, weight: 500, leading: 1.15 });
          y += 204;
        }

        drawFitted(ctx, busiestLine(data), y + 8, LIGHT.ink, { font, maxHeight: 90, start: 40, min: 28, weight: 700, leading: 1.15 });
      },
    },
    {
      id: "verdict",
      label: "the verdict",
      alt: `Verdict card: ${verdict} ${Math.round(top.messagePercentage)}% of the messages.`,
      theme: ORANGE,
      draw(ctx, font) {
        let y = drawFitted(ctx, `${data.messageCount.toLocaleString()} messages later:`, TOP, ORANGE.ink, { font, maxHeight: 70, start: 56, min: 36, weight: 500, leading: 1.15 });
        y = drawFitted(ctx, verdict, y + 50, ORANGE.ink, { font, maxHeight: 780, start: 210, min: 76, weight: 700, leading: 1 });
        y += 50;
        drawFitted(ctx, `${Math.round(top.messagePercentage)}% of it.`, y, ORANGE.ink, { font, maxHeight: 90, start: 72, min: 48, weight: 500, leading: 1.1 });

        const barY = FOOTER_Y - 110;
        roundedRect(ctx, MARGIN, barY, CONTENT_WIDTH, 36, 18, "#f7a67e");
        roundedRect(ctx, MARGIN, barY, Math.max(36, (CONTENT_WIDTH * top.messagePercentage) / 100), 36, 18, ORANGE.ink);
      },
    },
    {
      id: "awards",
      label: "the awards",
      alt: `Awards card: biggest yapper ${data.awards.biggestYapper ?? "nobody"}, and five more awards.`,
      theme: LIGHT,
      draw(ctx, font) {
        const list: [string, string | null][] = [
          ["biggest yapper", data.awards.biggestYapper],
          [isGroup ? "quickest to jump in" : "fastest replier", data.awards.fastestResponder],
          ["conversation starter", data.awards.conversationStarter],
          ["double texter", data.awards.doubleTexter],
          ["most words", data.awards.mostWords],
          ["essay sender", data.awards.longestMessages],
        ];

        let y = drawFitted(ctx, "the awards.", TOP, LIGHT.ink, { font, maxHeight: 140, start: 130, min: 80, weight: 700, leading: 1 });
        y += 50;

        for (const [title, winner] of list) {
          drawFitted(ctx, title, y, LIGHT.muted, { font, maxHeight: 48, start: 38, min: 30, weight: 500, leading: 1.15 });
          drawFitted(ctx, winner ?? "nobody", y + 50, winner ? LIGHT.ink : LIGHT.muted, { font, maxHeight: 92, start: 78, min: 36, weight: 700, leading: 1.05 });
          y += 176;
        }
      },
    },
    {
      id: "when",
      label: "when it happens",
      alt: `Activity card: ${busiestLine(data)}`,
      theme: DARK,
      draw(ctx, font) {
        let y = drawFitted(ctx, "when it happens.", TOP, DARK.ink, { font, maxHeight: 260, start: 130, min: 80, weight: 700, leading: 1 });
        y = drawFitted(ctx, busiestLine(data), y + 40, DARK.accent, { font, maxHeight: 300, start: 84, min: 48, weight: 700, leading: 1.08 });

        const hours = data.activity.messagesByHour;
        const peak = Math.max(1, ...hours.map((hour) => hour.messages));
        const chartBottom = FOOTER_Y - 130;
        const chartHeight = Math.min(420, chartBottom - y - 50);
        const gap = 8;
        const barWidth = (CONTENT_WIDTH - gap * 23) / 24;

        hours.forEach((hour, index) => {
          const height = Math.max(6, (hour.messages / peak) * chartHeight);
          const color = hour.hour === data.activity.busiestHour ? DARK.accent : DARK.ink;
          roundedRect(ctx, MARGIN + index * (barWidth + gap), chartBottom - height, barWidth, height, 6, color);
        });

        setFont(ctx, font, 32, 500);
        ctx.fillStyle = DARK.muted;
        ctx.textBaseline = "top";
        for (const hour of [0, 6, 12, 18]) {
          ctx.fillText(formatHour(hour), MARGIN + hour * (barWidth + gap), chartBottom + 16);
        }
      },
    },
  ];

  if (ai) {
    cards.push({
      id: "funniest",
      label: "the funny one",
      alt: `Funniest card: a robot says ${ai.funniest.person} is the funnier one, ${ai.funniest.confidence}% sure.`,
      theme: LIGHT,
      draw(ctx, font) {
        roundedRect(ctx, MARGIN, TOP, CONTENT_WIDTH, 520, 56, LIGHT.accent);
        const x = MARGIN + 56;
        const maxWidth = CONTENT_WIDTH - 112;
        drawFitted(ctx, "the funnier one is", TOP + 50, LIGHT.ink, { font, x, maxWidth, maxHeight: 70, start: 56, min: 40, weight: 500, leading: 1.15 });
        drawFitted(ctx, ai.funniest.person, TOP + 130, LIGHT.ink, { font, x, maxWidth, maxHeight: 260, start: 170, min: 60, weight: 700, leading: 1 });
        drawFitted(ctx, `${ai.funniest.confidence}% sure. didn’t earn it.`, TOP + 420, LIGHT.ink, { font, x, maxWidth, maxHeight: 60, start: 46, min: 32, weight: 500, leading: 1.15 });

        drawFitted(ctx, ai.funniest.reason, TOP + 580, LIGHT.ink, { font, maxHeight: FOOTER_Y - 60 - (TOP + 580), start: 54, min: 34, weight: 500, leading: 1.3 });
      },
    });

    if (ai.story) {
      const story = ai.story;

      cards.push({
        id: "story",
        label: "the story",
        alt: `Story card: ${story.title}. ${story.text}`,
        theme: DARK,
        draw(ctx, font) {
          let y = drawFitted(ctx, story.title, TOP, DARK.ink, { font, maxHeight: 300, start: 100, min: 56, weight: 700, leading: 1.02 });
          y += 44;
          drawFitted(ctx, story.text, y, DARK.ink, { font, maxHeight: FOOTER_Y - 60 - y, start: 46, min: 28, weight: 400, leading: 1.36 });
        },
      });
    }
  }

  return cards;
}

// Draw one card to a PNG.
export function renderShareCard(card: ShareCard, font: string): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;

  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("no canvas"));

  ctx.fillStyle = card.theme.bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  card.draw(ctx, font);
  drawFooter(ctx, font, card.theme);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("no image"))), "image/png");
  });
}
