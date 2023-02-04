import {
  ChevronDownIcon,
  ChevronUpIcon,
  DeleteIcon,
  QuestionIcon,
} from "@chakra-ui/icons";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useDeferredValue, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChordSettings, ChordStyle, Orientation } from "svguitar";
import { SubscriptionType } from "../types";
import { useSubscription } from "../utils/useSubscription";
import { ColorInput } from "./ColorInput";
import { SliderWithTooltip } from "./SliderWithTooltip";
import { GA } from '../services/google-analytics'

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
  | "strokeWidth"
  | "color"
  | "backgroundColor"
  | "fixedDiagramPosition"
  | "noPosition"
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
  backgroundColor: undefined,
  color: undefined,
  fixedDiagramPosition: false,
};

export const ChordForm: React.FunctionComponent<{
  onSettings(settings: AdjustableChordSettings): void;
  settings: AdjustableChordSettings;
}> = ({ onSettings, settings }) => {
  const { isOpen, onToggle } = useDisclosure();
  const subscription = useSubscription();

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
      {}
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
      <SimpleGrid columns={[1, 2, 4, 4]} mt={10} gap={4}>
        <Box>
          <FormControl isInvalid={!!errors.title}>
            <FormLabel>
              Title
              <Input
                placeholder="Enter title..."
                {...register("title", {
                  maxLength: {
                    value: 300,
                    message: "Title is too long.",
                  },
                })}
              />
            </FormLabel>
            {errors.title?.message && (
              <FormErrorMessage>{errors.title?.message}</FormErrorMessage>
            )}
          </FormControl>
        </Box>
        <Box>
          <FormControl isInvalid={!!errors.position}>
            <FormLabel>
              Starting fret
              <Input
                placeholder="Enter starting fret..."
                {...register("position", {
                  valueAsNumber: true,
                  min: {
                    value: 1,
                    message: "Starting fret must be at least 1",
                  },
                  max: 50,
                })}
                type="number"
              />
            </FormLabel>
            {errors.position?.message && (
              <FormErrorMessage>{errors.position?.message}</FormErrorMessage>
            )}
          </FormControl>
        </Box>
        <Box>
          <FormControl isInvalid={!!errors.frets}>
            <FormLabel>
              Number of frets
              <Input
                placeholder="Number of frets..."
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
            </FormLabel>
            {errors.frets?.message && (
              <FormErrorMessage>{errors.frets?.message}</FormErrorMessage>
            )}
          </FormControl>
        </Box>
        <Box>
          <FormControl isInvalid={!!errors.strings}>
            <FormLabel>
              Number of strings
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
            </FormLabel>
            {errors.strings?.message && (
              <FormErrorMessage>{errors.strings?.message}</FormErrorMessage>
            )}
          </FormControl>
        </Box>
      </SimpleGrid>

      <Collapse
        in={isOpen}
        animateOpacity
        style={isOpen ? { overflow: "visible" } : {}}
      >
        <SimpleGrid columns={[1, 2, 4, 4]} mt={5} gap={4}>
          <Box>
            <FormControl isInvalid={!!errors.style}>
              <FormLabel>
                Style
                <Select {...register("style")}>
                  <option value={ChordStyle.normal}>Normal</option>

                  {subscription === SubscriptionType.PRO && (
                    <option value={ChordStyle.handdrawn}>Handdrawn</option>
                  )}
                  {subscription !== SubscriptionType.PRO && (
                    <option disabled>Handdrawn (Pro only)</option>
                  )}
                </Select>
              </FormLabel>
              {errors.style?.message && (
                <FormErrorMessage>{errors.style?.message}</FormErrorMessage>
              )}
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Orientation
                <Select {...register("orientation")}>
                  <option value={Orientation.vertical}>Vertical</option>
                  <option value={Orientation.horizontal}>Horizontal</option>
                </Select>
              </FormLabel>
              {errors.orientation?.message && (
                <FormErrorMessage>
                  {errors.orientation?.message}
                </FormErrorMessage>
              )}
            </FormControl>
          </Box>
          <Box display="flex" alignItems="center">
            <Checkbox {...register("fixedDiagramPosition")}>
              Fixed diagram position
              <Tooltip
                placement="top"
                label="If enabled, the space between the diagram and the title will always be the same."
                aria-label="If enabled, the space between the diagram and the title will always be the same."
                hasArrow={true}
              >
                <QuestionIcon ml={2} />
              </Tooltip>
            </Checkbox>
          </Box>
          <Box display="flex" alignItems="center">
            <Checkbox {...register("noPosition")}>
              Hide position
              <QuestionIcon ml={2} />
            </Checkbox>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Height
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
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Finger size
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
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Finger font size
                <Controller
                  control={control}
                  name="fingerTextSize"
                  render={({ field }) => (
                    <SliderWithTooltip
                      aria-label="Chord chart finger text size"
                      min={10}
                      max={50}
                      step={1}
                      {...field}
                    />
                  )}
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Stroke width
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
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Color
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <ColorInput onChange={field.onChange} value={field.value} />
                  )}
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box>
            <FormControl>
              <FormLabel>
                Background color
                <Controller
                  control={control}
                  name="backgroundColor"
                  render={({ field }) => (
                    <ColorInput onChange={field.onChange} value={field.value} />
                  )}
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box></Box>
          <Flex alignItems="flex-end" justify="flex-end">
            <FormLabel as="div">
              <Button
                variant="outline"
                display="flex"
                gap={2}
                onClick={resetSettings}
              >
                <DeleteIcon />
                Reset settings
              </Button>
            </FormLabel>
          </Flex>
        </SimpleGrid>
      </Collapse>
      <Button variant="ghost" onClick={onToggle}>
        {isOpen ? (
          <ChevronUpIcon boxSize={6} />
        ) : (
          <ChevronDownIcon boxSize={6} />
        )}
        {isOpen ? "Hide" : "Show more"} settings...
      </Button>
    </>
  );
};
