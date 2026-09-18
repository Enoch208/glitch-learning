import { ClayCard } from "@/components/clay";
import { PlaceValueCanvas } from "@/components/canvas/place-value-canvas";

export default function CanvasPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header className="mb-10">
        <p className="mb-3 font-mono text-caption tracking-widest text-violet-500 uppercase">
          Math canvas
        </p>
        <h1 className="text-display text-ink">27 + 8</h1>
      </header>
      <ClayCard padding="roomy">
        <PlaceValueCanvas />
      </ClayCard>
    </main>
  );
}
