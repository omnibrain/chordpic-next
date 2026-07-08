import React, { useDeferredValue, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChordSettings, ChordStyle, Orientation } from "svguitar";
import {
  FiChevronDown,
  FiChevronUp,
  FiHelpCircle,
  FiTrash2,
} from "react-icons/fi";
import { T, useT } from "@magic-translate/react";
import { SubscriptionType } from "../types";
import { useSubscription } from "../utils/useSubscription";
import { ColorInput } from "./ColorInput";
import { SliderWithTooltip } from "./SliderWithTooltip";
import { GA } from "../services/google-analytics";
import { Button } from "./ui/Button";
import {
  Checkbox,
  FormErrorMessage,
  Input,
  Select,
} from "./ui/Input";
import { Tooltip } from "./ui/Tooltip";

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
  frets: 5,
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

const fieldLabel = "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const Field: React.FunctionComponent<{
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}> = ({ label, error, children }) => (
  <div>
    <label className={fieldLabel}>
      <span className="mb-1.5 block">{label}</span>
      {children}
    </label>
    {error && <FormErrorMessage>{error}</FormErrorMessage>}
  </div>
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
            <Select {...register("style")}>
              <option value={ChordStyle.normal}>{t("Normal")}</option>
              {subscription === SubscriptionType.PRO && (
                <option value={ChordStyle.handdrawn}>{t("Handdrawn")}</option>
              )}
              {subscription !== SubscriptionType.PRO && (
                <option disabled>{t("Handdrawn (Pro only)")}</option>
              )}
            </Select>
          </Field>
          <Field label="Orientation" error={errors.orientation?.message}>
            <Select {...register("orientation")}>
              <option value={Orientation.vertical}>{t("Vertical")}</option>
              <option value={Orientation.horizontal}>{t("Horizontal")}</option>
            </Select>
          </Field>
          <div className="flex items-center">
            <Checkbox {...register("fixedDiagramPosition")}>
              <T>Fixed diagram position</T>
              <Tooltip
                label={t(
                  "If enabled, the space between the diagram and the title will always be the same.",
                )}
              >
                <FiHelpCircle className="ml-2" />
              </Tooltip>
            </Checkbox>
          </div>
          <div className="flex items-center">
            <Checkbox {...register("noPosition")}>
              <T>Hide position</T>
            </Checkbox>
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
          <div className="flex items-center">
            <Checkbox {...register("showFretMarkers")}>
              <T>Show fret markers</T>
              <Tooltip
                label={t(
                  "Show fret markers on the chord diagram (dots between the frets)",
                )}
              >
                <FiHelpCircle className="ml-2" />
              </Tooltip>
            </Checkbox>
          </div>
          <div className="hidden lg:block" />
          <div className="hidden lg:block" />
          <Field label={<T>Color</T>}>
            <Controller
              control={control}
              name="color"
              render={({ field }) => (
                <ColorInput onChange={field.onChange} value={field.value} />
              )}
            />
          </Field>
          <Field label={<T>Background color</T>}>
            <Controller
              control={control}
              name="backgroundColor"
              render={({ field }) => (
                <ColorInput onChange={field.onChange} value={field.value} />
              )}
            />
          </Field>
          <div className="hidden lg:block" />
          <div className="flex items-end justify-end">
            <Button type="button" variant="outline" onClick={resetSettings}>
              <FiTrash2 />
              <T>Reset settings</T>
            </Button>
          </div>
        </div>
      )}
      <div className="mt-4">
        <Button type="button" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          <T>{isOpen ? "Hide" : "Show more"} settings...</T>
        </Button>
      </div>
    </>
  );
};
