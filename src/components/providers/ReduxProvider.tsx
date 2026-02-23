"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";

/**
 * Client-side wrapper that makes the Redux store available to the entire
 * Next.js App Router component tree.  Place this as the outermost provider
 * in the root layout.
 */
export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
