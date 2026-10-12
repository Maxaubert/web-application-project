"use client";
// Bildene på annonsesiden (#150, mockup godkjent av Max 11.10): ett stort bilde og miniatyrer under.
// Under 640 px ligger miniatyrene på én rad som rulles sidelengs (#167); ellers brytes de over flere linjer.
// Klikk på en miniatyr viser den stort. Med ett bilde vises ingen miniatyrer, uten bilder plassholderen.
// Bla (#156, mockup godkjent av Max 12.10): bildene ligger side om side i en stripe som rulles sidelengs og låses på hvert
// bilde, så de følger fingeren og glir som i kamerarullen. Grå piler og teller vises bare når musen er over bildet, ved
// trykk og ved tastaturbruk; venstre og høyre piltast bytter bilde på hele siden. Rundtur med pilene og tastene.
import { useCallback, useEffect, useRef, useState } from "react";
import { stepIndex } from "./gallery-step";
import { ListingImage } from "./ListingImage";

// src er det store bildet, thumb miniatyren i raden under (#155).
export type GalleryImage = { src: string; thumb: string };

const REVEAL_MS = 3000;
// Rulling med kode melder fra om hvert mellomtrinn; valgt bilde skal ikke hoppe mens stripen er på vei.
const SETTLE_MS = 700;
// Når rullingen har stått stille så lenge, skal stripen ligge på et bilde.
const IDLE_MS = 150;
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
  const root = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const settleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // Bildet stripen ruller mot etter et klikk eller tastetrykk. Mens det er satt, oppdaterer ikke rullingen valgt bilde.
  const target = useRef<number | null>(null);
  const selectedRef = useRef(0);
  const thumbs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRender = useRef(true);
  const count = images.length;

  // Pilene vises en stund etter trykk, sveip eller tastebruk, og skjules igjen av seg selv.
  const reveal = useCallback(() => {
    setRevealed(true);
    clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => setRevealed(false), REVEAL_MS);
  }, []);
  useEffect(
    () => () => {
      clearTimeout(hideTimer.current);
      clearTimeout(settleTimer.current);
      clearTimeout(idleTimer.current);
    },
    [],
  );

  const goTo = useCallback((index: number, smooth: boolean) => {
    const element = track.current;
    if (!element) return;
    const left = index * element.clientWidth;
    selectedRef.current = index;
    setSelected(index);
    if (Math.abs(element.scrollLeft - left) < 1) return;
    target.current = index;
    clearTimeout(settleTimer.current);
    settleTimer.current = setTimeout(() => (target.current = null), SETTLE_MS);
    element.scrollTo({ left, behavior: smooth ? "smooth" : "instant" });
  }, []);

  // Fingeren (eller styreflaten) ruller stripen; valgt bilde er det som ligger i ro.
  function onScroll() {
    const element = track.current;
    if (!element || !element.clientWidth) return;
    const index = Math.min(count - 1, Math.max(0, Math.round(element.scrollLeft / element.clientWidth)));
    // Stopper rullingen mellom to bilder (et raskt sveip kan gjøre det), glir stripen til det nærmeste.
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (Math.abs(element.scrollLeft - index * element.clientWidth) > 1) element.scrollTo({ left: index * element.clientWidth, behavior: "smooth" });
    }, IDLE_MS);
    if (target.current !== null) {
      if (index !== target.current) return;
      target.current = null;
    }
    selectedRef.current = index;
    setSelected(index);
  }

  const step = useCallback(
    (delta: 1 | -1) => {
      const next = stepIndex(selectedRef.current, delta, count);
      // Rundtur hopper rett til andre enden i stedet for å rulle forbi alle bildene.
      goTo(next, Math.abs(next - selectedRef.current) === 1);
    },
    [count, goTo],
  );

  // Færre bilder enn før (et bilde fjernet i forhåndsvisningen) skal ikke etterlate et valg utenfor.
  useEffect(() => {
    if (count > 0 && selectedRef.current > count - 1) goTo(count - 1, false);
  }, [count, goTo]);

  useEffect(() => {
    if (count < 2) return;
    function onKey(event: KeyboardEvent) {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.target instanceof Element && event.target.closest(TYPING)) return;
      event.preventDefault();
      // En pil som ble klikket med musen beholder fokus, og første tastetrykk ville gitt den tastaturets fokusring.
      const active = document.activeElement;
      if (active instanceof HTMLElement && root.current?.contains(active)) active.blur();
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

  if (count < 2) {
    return <ListingImage src={images[0]?.src ?? null} alt={title} className="aspect-[4/3] w-full rounded-xl" iconClassName="size-14" />;
  }

  return (
    <div ref={root}>
      <div className="group relative overflow-hidden rounded-xl" data-revealed={revealed ? "" : undefined} onClick={reveal}>
        <div
          ref={track}
          tabIndex={-1}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {images.map(({ src }, index) => (
            // Bare det valgte bildet er med for skjermlesere; de andre ligger ved siden av i stripen.
            <div key={src} aria-hidden={index === selected ? undefined : true} className="w-full shrink-0 snap-center snap-always">
              <ListingImage src={src} alt={`${title}, bilde ${index + 1} av ${count}`} className="aspect-[4/3] w-full" iconClassName="size-14" />
            </div>
          ))}
        </div>
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
      </div>
      <div className="mt-3 flex gap-2.5 overflow-x-auto sm:flex-wrap sm:overflow-visible">
        {images.map(({ src, thumb }, index) => (
          <button
            key={src}
            ref={(element) => {
              thumbs.current[index] = element;
            }}
            type="button"
            onClick={() => goTo(index, true)}
            aria-label={`Vis bilde ${index + 1} av ${count}`}
            aria-pressed={index === selected}
            className="size-16 shrink-0 overflow-hidden rounded-lg bg-hairline/60 bg-cover bg-center aria-pressed:shadow-[inset_0_0_0_3px_var(--color-paper),inset_0_0_0_5px_var(--color-ink)] sm:size-[86px]"
            style={{ backgroundImage: `url(${thumb})` }}
          />
        ))}
      </div>
    </div>
  );
}
