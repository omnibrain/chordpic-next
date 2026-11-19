"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { T, useT } from "@magic-translate/react";
import NextLink from "@/components/LocalizedLink";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToastAction } from "@/components/ui/toast";
import type { Chart } from "@/domain/chart";
import { toast } from "@/hooks/use-toast";
import { GA } from "@/services/google-analytics";
import {
  countSavedChords,
  FREE_SAVED_CHORDS_LIMIT,
  markPendingSave,
  saveChord,
  SavedChordsLimitError,
  takePendingSave,
} from "@/services/saved-chords";
import { SubscriptionType } from "@/types";
import { useLocalizedRouter } from "@/utils/use-localized-router";
import { useSubscription } from "@/utils/useSubscription";
import { useUser } from "@/utils/useUser";
import { ChordNameDialog } from "./ChordNameDialog";

const LimitDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange(open: boolean): void;
}) => {
  const t = useT();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("Your free chord slots are full")}</DialogTitle>
          <DialogDescription>
            {/* Keep in sync with FREE_SAVED_CHORDS_LIMIT */}
            <T>
              Free accounts can save up to 3 chords. Go Pro to save as many as
              you like, or delete a chord in My chords to make room.
            </T>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <NextLink
            href="/my-chords"
            className={buttonVariants({ variant: "outline" })}
          >
            <T>Open My chords</T>
          </NextLink>
          <NextLink
            href="/pricing"
            className={buttonVariants()}
            onClick={() => GA()?.("event", "saved_chords_limit_upgrade")}
          >
            <T>Go Pro</T>
          </NextLink>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const SaveChord = ({ chart }: { chart: Chart }) => {
  const t = useT();
  const router = useLocalizedRouter();
  const queryClient = useQueryClient();
  const { user, isLoading } = useUser();
  const subscription = useSubscription();
  const [nameOpen, setNameOpen] = useState(false);
  const [limitOpen, setLimitOpen] = useState(false);
  const [checking, setChecking] = useState(false);

  const openSave = useCallback(async () => {
    if (subscription !== SubscriptionType.PRO) {
      setChecking(true);
      try {
        if ((await countSavedChords()) >= FREE_SAVED_CHORDS_LIMIT) {
          setLimitOpen(true);
          return;
        }
      } catch (err) {
        // The insert enforces the limit anyway, so carry on.
        console.error(err);
      } finally {
        setChecking(false);
      }
    }
    setNameOpen(true);
  }, [subscription]);

  // Back from signing in for a save: pick up where the visitor left off.
  useEffect(() => {
    if (user && subscription && takePendingSave()) {
      void Promise.resolve().then(openSave);
    }
  }, [user, subscription, openSave]);

  const onClick = () => {
    GA()?.("event", "save_chord_click", { signed_in: !!user });
    if (!user) {
      markPendingSave();
      router.push(`/signin?next=${encodeURIComponent("/")}`);
      return;
    }
    openSave();
  };

  const onSubmit = async (name: string) => {
    try {
      await saveChord(name, chart);
    } catch (err) {
      if (err instanceof SavedChordsLimitError) {
        setNameOpen(false);
        setLimitOpen(true);
        return;
      }
      throw err;
    }
    GA()?.("event", "save_chord");
    setNameOpen(false);
    queryClient.invalidateQueries(["saved-chords"]);
    toast({
      title: t("Saved to My chords"),
      description: name.trim(),
      action: (
        <ToastAction
          altText={t("Open My chords")}
          onClick={() => router.push("/my-chords")}
        >
          <T>Open My chords</T>
        </ToastAction>
      ),
    });
  };

  return (
    <div className="mt-8" id="save">
      <h2 className="mb-3 font-heading text-2xl font-semibold tracking-tight">
        <T>Save</T>
      </h2>
      <Button
        variant="outline"
        onClick={onClick}
        disabled={isLoading || checking}
      >
        {checking ? <Loader2 className="animate-spin" /> : <Bookmark />}
        <T>Save to my chords</T>
      </Button>
      <ChordNameDialog
        open={nameOpen}
        onOpenChange={setNameOpen}
        title={t("Save to my chords")}
        initialName={chart.settings.title || t("Unnamed chord")}
        submitLabel={t("Save")}
        onSubmit={onSubmit}
      />
      <LimitDialog open={limitOpen} onOpenChange={setLimitOpen} />
    </div>
  );
};
