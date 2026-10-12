"use client";
// Bildene på annonsesiden (#150, mockup godkjent av Max 11.10): ett stort bilde og miniatyrer under.
// Under 640 px ligger miniatyrene på én rad som rulles sidelengs (#167); ellers brytes de over flere linjer.
// Klikk på en miniatyr viser den stort. Med ett bilde vises ingen miniatyrer, uten bilder plassholderen.
// Bla (#156, mockup godkjent av Max 12.10): grå piler og teller som bare vises når musen er over bildet, ved trykk,
// og ved tastaturbruk; venstre og høyre piltast bytter bilde på hele siden, og på mobil kan man sveipe. Rundtur.
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { stepIndex, swipeDirection } from "./gallery-step";
import { ListingImage } from "./ListingImage";

// src er det store bildet, thumb miniatyren i raden under (#155).
export type GalleryImage = { src: string; thumb: string };

const REVEAL_MS = 3000;
// Piltastene skal ikke bytte bilde mens man skriver, eller når nettleserens egne snarveier (Alt + pil) brukes.
const TYPING = "input, textarea, select, [contenteditable]";

const arrow =
  "absolute top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-ink/40 opacity-0 transition-opacity " +
  "pointer-events-none hover:bg-ink/60 group-hover:pointer-events-auto group-hover:opacity-100 " +
  "group-data-[revealed]:pointer-events-auto group-data-[revealed]:opacity-100 " +
  "group-has-[:focus-visible]:pointer-events-auto group-has-[:focus-visible]:opacity-100";

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5.5 fill-none stroke-white stroke-[2.6]" strokeLinecap="round" strokeLinejoin="round">
      <path d={direction === "left" ? "m15 5-7 7 7 7" : "m9 5 7 7-7 7"} />
    </svg>
  );
}

export function ListingGallery({ images, title }: { images: GalleryImage[]; title: string }) {
  const [selected, setSelected] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRender = useRef(true);
  const count = images.length;
  const shown = images[selected]?.src ?? null;

  // Pilene vises en stund etter trykk, sveip eller tastebruk, og skjules igjen av seg selv.
  const reveal = useCallback(() => {
    setRevealed(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(false), REVEAL_MS);
  }, []);
  useEffect(() => () => clearTimeout(hideTimer.current), []);

  const step = useCallback((delta: 1 | -1) => setSelected((current) => stepIndex(current, delta, count)), [count]);

  useEffect(() => {
    if (count < 2) return;
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.target instanceof Element && event.target.closest(TYPING)) return;
      event.preventDefault();
      step(event.key === "ArrowRight" ? 1 : -1);
      reveal();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, step, reveal]);

  // Den valgte miniatyren skal alltid være synlig i raden som rulles på mobil. Ikke ved første visning (siden skal ikke hoppe).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    thumbs.current[selected]?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [selected]);

  function pointerDown(event: PointerEvent) {
    if (event.pointerType === "mouse") return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
  }
  function pointerUp(event: PointerEvent) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start || count < 2) return;
    const direction = swipeDirection(event.clientX - start.x, event.clientY - start.y);
    if (direction) {
      step(direction);
      reveal();
    }
  }

  return (
    <div>
      <div
        className="group relative touch-pan-y overflow-hidden rounded-xl"
        data-revealed={revealed ? "" : undefined}
        onClick={count > 1 ? reveal : undefined}
        onPointerDown={pointerDown}
        onPointerUp={pointerUp}
        onPointerCancel={() => (swipeStart.current = null)}
      >
        <ListingImage
          src={shown}
          alt={count > 1 ? `${title}, bilde ${selected + 1} av ${count}` : title}
          className="aspect-[4/3] w-full"
          iconClassName="size-14"
        />
        {count > 1 && (
          <>
            <button type="button" aria-label="Forrige bilde" onClick={() => (step(-1), reveal())} className={`${arrow} left-3`}>
              <Chevron direction="left" />
            </button>
            <button type="button" aria-label="Neste bilde" onClick={() => (step(1), reveal())} className={`${arrow} right-3`}>
              <Chevron direction="right" />
            </button>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute right-3 bottom-3 rounded-md bg-ink/40 px-2.5 py-0.5 text-sm font-bold text-white tabular-nums opacity-0 transition-opacity group-hover:opacity-100 group-data-[revealed]:opacity-100 group-has-[:focus-visible]:opacity-100"
            >
              {selected + 1} / {count}
            </span>
          </>
        )}
      </div>
      {count > 1 && (
        <div className="mt-3 flex gap-2.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
          {images.map(({ src, thumb }, index) => (
            <button
              key={src}
              ref={(element) => {
                thumbs.current[index] = element;
              }}
              type="button"
              onClick={() => setSelected(index)}
              aria-label={`Vis bilde ${index + 1} av ${count}`}
              aria-pressed={index === selected}
              className="size-16 shrink-0 overflow-hidden rounded-lg bg-hairline/60 bg-cover bg-center aria-pressed:shadow-[inset_0_0_0_3px_var(--color-paper),inset_0_0_0_5px_var(--color-ink)] sm:size-[86px]"
              style={{ backgroundImage: `url(${thumb})` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
