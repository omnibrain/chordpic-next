"use client";

import { FormEvent, ReactNode, useState } from "react";
import { Loader2 } from "lucide-react";
import { T, useT } from "@magic-translate/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onOpenChange(open: boolean): void;
  title: string;
  description?: ReactNode;
  initialName: string;
  submitLabel: string;
  /** Resolves when done; a rejection is shown in the dialog. */
  onSubmit(name: string): Promise<void>;
}

type FormProps = Omit<Props, "open">;

// Mounted only while the dialog is open, so every opening starts from initialName.
const NameForm = ({
  onOpenChange,
  title,
  description,
  initialName,
  submitLabel,
  onSubmit,
}: FormProps) => {
  const t = useT();
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await onSubmit(name);
    } catch (err) {
      console.error(err);
      setError(t("Something went wrong. Please try again."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description && <DialogDescription>{description}</DialogDescription>}
      </DialogHeader>
      <div className="grid gap-2">
        <Label htmlFor="chord-name">
          <T>Name</T>
        </Label>
        <Input
          id="chord-name"
          value={name}
          maxLength={200}
          autoFocus
          onFocus={(e) => e.target.select()}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          <T>Cancel</T>
        </Button>
        <Button type="submit" disabled={saving || !name.trim()}>
          {saving && <Loader2 className="animate-spin" />}
          {submitLabel}
        </Button>
      </DialogFooter>
    </form>
  );
};

export const ChordNameDialog = ({ open, ...props }: Props) => (
  <Dialog open={open} onOpenChange={props.onOpenChange}>
    <DialogContent>
      <NameForm {...props} />
    </DialogContent>
  </Dialog>
);
