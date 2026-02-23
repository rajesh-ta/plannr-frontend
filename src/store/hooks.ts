import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

/** Pre-typed `useDispatch` — use this throughout the app instead of plain `useDispatch`. */
export const useAppDispatch: () => AppDispatch = useDispatch;

/** Pre-typed `useSelector` — use this throughout the app instead of plain `useSelector`. */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
