import { createContext, use, useReducer, type Dispatch, type ReactNode } from "react";
import { appReducer, initialState, type AppAction, type AppState } from "./appState";

const StateContext = createContext<AppState | null>(null);
const DispatchContext = createContext<Dispatch<AppAction> | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  return (
    <DispatchContext value={dispatch}>
      <StateContext value={state}>{children}</StateContext>
    </DispatchContext>
  );
}

export function useAppState(): AppState {
  const state = use(StateContext);
  if (!state) throw new Error("useAppState, AppStateProvider içinde kullanılmalı");
  return state;
}

export function useAppDispatch(): Dispatch<AppAction> {
  const dispatch = use(DispatchContext);
  if (!dispatch) throw new Error("useAppDispatch, AppStateProvider içinde kullanılmalı");
  return dispatch;
}
