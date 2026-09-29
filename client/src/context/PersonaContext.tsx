import { PERSONAS } from "@/data/seed";
import { getState, subscribe } from "@/data/store";
import type { HarborState, PersonaId } from "@/types";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const PERSONA_KEY = "harbor-persona";

type Ctx = {
  persona: PersonaId;
  setPersona: (id: PersonaId) => void;
  state: HarborState;
  meta: (typeof PERSONAS)[PersonaId];
};

const PersonaContext = createContext<Ctx | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaId>(() => {
    if (typeof window === "undefined") return "peopleops";
    const saved = localStorage.getItem(PERSONA_KEY) as PersonaId | null;
    return saved && saved in PERSONAS ? saved : "peopleops";
  });
  const [state, setState] = useState<HarborState>(() => getState());

  useEffect(() => subscribe(() => setState(getState())), []);

  const setPersona = (id: PersonaId) => {
    setPersonaState(id);
    localStorage.setItem(PERSONA_KEY, id);
  };

  const value = useMemo(
    () => ({ persona, setPersona, state, meta: PERSONAS[persona] }),
    [persona, state]
  );

  return <PersonaContext.Provider value={value}>{children}</PersonaContext.Provider>;
}

export function useHarbor() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("useHarbor outside provider");
  return ctx;
}
