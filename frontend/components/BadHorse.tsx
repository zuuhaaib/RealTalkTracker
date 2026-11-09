// The horse, as drawn by milo. It is meant to look like this.
// `plain` leaves out the balcony and labels, for the galloping easter egg.
export default function BadHorse({
  plain = false,
  className = "",
  title,
}: {
  plain?: boolean;
  className?: string;
  title?: string;
}) {
  const hand = {
    fontFamily: '"Comic Sans MS", "Chalkboard SE", "Bradley Hand", cursive',
    fontSize: 30,
    fill: "var(--accent-text)",
  };

  return (
    <svg
      viewBox="0 0 720 480"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={className}
      fill="none"
      stroke="var(--ink)"
      strokeWidth="6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Body, drawn in one go and never corrected. */}
      <path d="M212 212C246 168 372 160 438 196C486 220 472 292 418 296C346 306 262 304 222 284C188 268 188 236 212 212Z" />

      {/* Neck, which does not quite join up. */}
      <path d="M432 192C446 150 462 124 482 100" />
      <path d="M468 252C490 208 508 168 528 134" />

      {/* Head, a bit too big and aimed at the ground. */}
      <path d="M476 104C494 66 562 54 612 82C646 100 640 134 606 138C572 142 546 140 526 132C504 124 470 124 476 104Z" />
      <path d="M502 76L494 34L530 66" />

      {/* Two eyes, both on this side. */}
      <circle cx="552" cy="90" r="9" fill="var(--ink)" />
      <circle cx="590" cy="94" r="9" fill="var(--ink)" />

      {/* It is fine about all of this. */}
      <path d="M580 120Q604 132 624 112" />

      {/* Mane. */}
      <path d="M488 86L462 92L478 112L446 124L466 142L436 158" />

      {/* Legs. There are five. */}
      <path d="M416 296L424 396" />
      <path d="M380 302L372 398" />
      <path d="M318 304L322 372" />
      <path d="M262 300L252 400" />
      <path d="M228 290L202 394" />

      {/* Tail: gave up. */}
      <path d="M196 232C142 208 156 282 112 258C88 246 134 312 92 322" />

      {!plain && (
        <>
          {/* The balcony. Well. */}
          <path d="M150 402C290 396 450 406 600 398" strokeWidth="8" />
          <path d="M152 402L150 456M600 398L604 456M152 456C300 450 460 460 604 454" />
          <path d="M210 408L208 452M280 406L282 452M350 404L348 454M420 406L422 454M490 404L490 454M550 402L552 454" strokeWidth="4" />

          {/* Labels, in case of doubt. */}
          <g stroke="none">
            <text x="20" y="120" style={hand}>
              horse
            </text>
            <text x="618" y="40" style={hand}>
              chill
            </text>
            <text x="16" y="436" style={hand}>
              balcony
            </text>
            <text x="440" y="360" style={hand}>
              legs (5?)
            </text>
          </g>
          <g stroke="var(--accent-text)" strokeWidth="4">
            <path d="M104 118C150 128 188 158 226 198M226 198L206 192M226 198L222 178" />
            <path d="M640 50C638 66 630 76 620 84M620 84L622 66M620 84L638 80" />
            <path d="M136 428C146 424 152 418 162 406M162 406L146 410M162 406L160 422" />
            <path d="M436 352L406 346M406 346L420 338M406 346L418 358" />
          </g>
        </>
      )}
    </svg>
  );
}
