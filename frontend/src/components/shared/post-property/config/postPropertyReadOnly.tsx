"use client";

import { createContext, useContext, type ReactNode } from "react";

const PostPropertyReadOnlyContext = createContext(false);

export function PostPropertyReadOnlyProvider({
  readOnly,
  children,
}: {
  readOnly: boolean;
  children: ReactNode;
}) {
  return (
    <PostPropertyReadOnlyContext.Provider value={readOnly}>{children}</PostPropertyReadOnlyContext.Provider>
  );
}

export function usePostPropertyReadOnly() {
  return useContext(PostPropertyReadOnlyContext);
}
