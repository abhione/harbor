import { useHarbor } from "@/context/PersonaContext";
import { nextCue } from "@/lib/demoNext";

export default function DemoCue() {
  const { persona, state } = useHarbor();
  const cue = nextCue(persona, state);
  return (
    <div
      className={`rounded-2xl border px-4 py-3 ${
        cue.done ? "border-border bg-card" : "border-primary/25 bg-foam"
      }`}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {cue.done ? "Happy path complete" : "Do this next"}
      </p>
      <p className="font-serif text-xl text-foreground">{cue.title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{cue.body}</p>
    </div>
  );
}
