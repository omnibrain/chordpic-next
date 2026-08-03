import React, { PropsWithChildren } from "react";
import { Logo } from "./Logo";
import { T } from "@magic-translate/react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export interface AuthBoxProps {
  title: string;
}

export const AuthBox: React.FunctionComponent<
  PropsWithChildren<AuthBoxProps>
> = ({ children, title }) => (
  <div className="flex justify-center">
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center pt-10">
        <Logo className="h-12 w-12" />
        <h1 className="pt-6 text-center font-heading text-xl">
          <T>{title}</T>
        </h1>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  </div>
);
