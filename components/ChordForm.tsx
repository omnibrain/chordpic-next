import React, { useDeferredValue, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChordSettings, ChordStyle, Orientation } from "svguitar";
import { ChevronDown, ChevronUp, CircleHelp, Trash2 } from "lucide-react";
import { T, useT } from "@magic-translate/react";
import { SubscriptionType } from "../types";
import { useSubscription } from "../utils/useSubscription";
import { ColorInput } from "./ColorInput";
import { SliderWithTooltip } from "./SliderWithTooltip";
import { GA } from "../services/google-analytics";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type AdjustableChordSettings = Pick<
  ChordSettings,
  | "orientation"
  | "frets"
  | "strings"
  | "position"
  | "title"
  | "style"
  | "fretSize"
  | "fingerSize"
  | "fingerTextSize"
  | "titleFontSize"
  | "strokeWidth"
  | "color"
  | "backgroundColor"
  | "fixedDiagramPosition"
  | "noPosition"
  | "showFretMarkers"
>;

export const defaultValues: AdjustableChordSettings = {
  orientation: Orientation.vertical,
  title: "",
  frets: 4,
  strings: 6,
  position: 1,
  style: ChordStyle.normal,
  fretSize: 1.5,
  fingerSize: 0.65,
  fingerTextSize: 24,
  strokeWidth: 2,
  titleFontSize: 48,
  backgroundColor: undefined,
  color: undefined,
  fixedDiagramPosition: false,
  noPosition: false,
  showFretMarkers: false,
};

const Field: React.FunctionComponent<{
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div className="space-y-2">
    <Label className="block">{label}</Label>
    {children}
    {error && <p className="text-sm text-destructive">{error}</p>}
  </div>
);

const HelpTooltip: React.FunctionComponent<{ label: string }> = ({ label }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <CircleHelp className="ms-1.5 inline h-4 w-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent className="max-w-64">{label}</TooltipContent>
  </Tooltip>
);

export const ChordForm: React.FunctionComponent<{
  onSettings(settings: AdjustableChordSettings): void;
  settings: AdjustableChordSettings;
}> = ({ onSettings, settings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const subscription = useSubscription();
  const t = useT();

  const {
    register,
    watch,
    control,
    formState: { errors },
    reset,
    setValue,
  } = useForm<AdjustableChordSettings>({
    mode: "onChange",
    defaultValues: settings,
  });
  const [data, setData] = useState<AdjustableChordSettings>(settings);

  watch(setData);

  const deferredValue = useDeferredValue(data);

  useEffect(() => {
    // iterate through form data and replace invalid values with default values.
    // Unfortunately use-form-hooks always triggers the watch callback even if values are invalid
    const validData = Object.entries(deferredValue).reduce(
      (acc, [key, value]) => {
        return {
          ...acc,
          [key]:
            key in errors || (typeof value === "number" && isNaN(value))
              ? defaultValues[key as keyof AdjustableChordSettings]
              : value,
        };
      },
      {},
    ) as AdjustableChordSettings;

    onSettings(validData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredValue, errors]);

  useEffect(() => {
    setValue("orientation", settings.orientation);
  }, [setValue, settings.orientation]);

  useEffect(() => {
    if (isOpen) {
      GA()?.("event", "toggled_more_settings");
    }
  }, [isOpen]);

  const resetSettings = () => {
    GA()?.("event", "reset_settings");
    reset(defaultValues);
  };

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label={<T>Title</T>} error={errors.title?.message}>
          <Input
            placeholder={t("Enter title")}
            {...register("title", {
              maxLength: {
                value: 300,
                message: t("Title is too long."),
              },
            })}
          />
        </Field>
        <Field label={<T>Starting fret</T>} error={errors.position?.message}>
          <Input
            placeholder={t("Enter starting fret...")}
            {...register("position", {
              valueAsNumber: true,
              min: {
                value: 1,
                message: t("Starting fret must be at least 1"),
              },
              max: 50,
            })}
            type="number"
          />
        </Field>
        <Field label={<T>Number of frets</T>} error={errors.frets?.message}>
          <Input
            placeholder={t("Number of frets...")}
            {...register("frets", {
              valueAsNumber: true,
              min: {
                value: 1,
                message: "Must have at least 1 fret",
              },
              max: {
                value: 50,
                message: "Too many frets!",
              },
            })}
            type="number"
          />
        </Field>
        <Field label={<T>Number of strings</T>} error={errors.strings?.message}>
          <Input
            placeholder="Number of string..."
            {...register("strings", {
              valueAsNumber: true,
              min: {
                value: 2,
                message: "Must have at least 2 strings",
              },
              max: {
                value: 50,
                message: "Too many strings!",
              },
            })}
            type="number"
          />
        </Field>
      </div>

      {isOpen && (
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label={<T>Style</T>} error={errors.style?.message}>
            <Controller
              control={control}
              name="style"
              render={({ field }) => (
                <Select
                  value={field.value ?? ChordStyle.normal}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ChordStyle.normal}>
                      {t("Normal")}
                    </SelectItem>
                    {subscription === SubscriptionType.PRO ? (
                      <SelectItem value={ChordStyle.handdrawn}>
                        {t("Handdrawn")}
                      </SelectItem>
                    ) : (
                      <SelectItem value={ChordStyle.handdrawn} disabled>
                        {t("Handdrawn (Pro only)")}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <Field label="Orientation" error={errors.orientation?.message}>
            <Controller
              control={control}
              name="orientation"
              render={({ field }) => (
                <Select
                  value={field.value ?? Orientation.vertical}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Orientation.vertical}>
                      {t("Vertical")}
                    </SelectItem>
                    <SelectItem value={Orientation.horizontal}>
                      {t("Horizontal")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </Field>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="fixedDiagramPosition"
              render={({ field }) => (
                <Checkbox
                  id="fixed-diagram-position"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="fixed-diagram-position">
              <T>Fixed diagram position</T>
              <HelpTooltip
                label={t(
                  "If enabled, the space between the diagram and the title will always be the same.",
                )}
              />
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="noPosition"
              render={({ field }) => (
                <Checkbox
                  id="no-position"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="no-position">
              <T>Hide position</T>
            </Label>
          </div>
          <Field label={<T>Height</T>}>
            <Controller
              control={control}
              name="fretSize"
              render={({ field }) => (
                <SliderWithTooltip
                  aria-label="Chord chart height"
                  min={0.7}
                  max={5}
                  step={0.05}
                  {...field}
                />
              )}
            />
          </Field>
          <Field label={<T>Finger size</T>}>
            <Controller
              control={control}
              name="fingerSize"
              render={({ field }) => (
                <SliderWithTooltip
                  aria-label="Chord chart finger size"
                  min={0.5}
                  max={2}
                  step={0.01}
                  {...field}
                />
              )}
            />
          </Field>
          <Field label={<T>Finger font size</T>}>
            <Controller
              control={control}
              name="fingerTextSize"
              render={({ field }) => (
                <SliderWithTooltip
                  aria-label="Chord chart finger text size"
                  min={10}
                  max={100}
                  step={1}
                  {...field}
                />
              )}
            />
          </Field>
          <Field label={<T>Title font size</T>}>
            <Controller
              control={control}
              name="titleFontSize"
              render={({ field }) => (
                <SliderWithTooltip
                  aria-label="Title font size"
                  min={5}
                  max={250}
                  step={1}
                  {...field}
                />
              )}
            />
          </Field>
          <Field label={<T>Stroke width</T>}>
            <Controller
              control={control}
              name="strokeWidth"
              render={({ field }) => (
                <SliderWithTooltip
                  aria-label="Stroke width"
                  min={1}
                  max={10}
                  step={0.1}
                  {...field}
                />
              )}
            />
          </Field>
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="showFretMarkers"
              render={({ field }) => (
                <Checkbox
                  id="show-fret-markers"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="show-fret-markers">
              <T>Show fret markers</T>
              <HelpTooltip
                label={t(
                  "Show fret markers on the chord diagram (dots between the frets)",
                )}
              />
            </Label>
          </div>
          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
          <Field label={<T>Color</T>}>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorInput
                  direction="up"
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </Field>
          <Field label={<T>Background color</T>}>
            <Controller
              control={control}
              name="backgroundColor"
              render={({ field }) => (
                <ColorInput
                  direction="up"
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </Field>
          <div className="hidden lg:block" />
          <div className="flex items-end justify-end">
            <Button type="button" variant="outline" onClick={resetSettings}>
              <Trash2 />
              <T>Reset settings</T>
            </Button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronUp /> : <ChevronDown />}
          <T>{isOpen ? "Hide" : "Show more"} settings...</T>
        </Button>
      </div>
    </>
  );
};
