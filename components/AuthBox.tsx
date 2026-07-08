import React, { PropsWithChildren } from "react";
import { Logo } from "./Logo";
import { T } from "@magic-translate/react";

export interface AuthBoxProps {
  title: string;
}

export const AuthBox: React.FunctionComponent<
  PropsWithChildren<AuthBoxProps>
> = ({ children, title }) => (
  <div className="flex justify-center">
    <div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="my-8 flex flex-col items-center">
        <Logo className="h-12 w-12" />
        <h1 className="mb-4 mt-8 font-heading text-xl">
          <T>{title}</T>
        </h1>
      </div>

      {children}
    </div>
  </div>
);
