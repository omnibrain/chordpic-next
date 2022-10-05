import { ChevronDownIcon, ChevronUpIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Collapse,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Select,
  SimpleGrid,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  useDisclosure,
} from "@chakra-ui/react";
import React, { useDeferredValue, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ChordSettings, ChordStyle, Orientation } from "svguitar";
import { ColorInput } from "./ColorInput";

export type AdjustableChordSettings = Pick<
  ChordSettings,
  | "orientation"
  | "frets"
  | "strings"
  | "position"
  | "title"
  | "style"
  | "fretSize"
  | "nutSize"
  | "strokeWidth"
  | "color"
  | "backgroundColor"
>;

const defaultValues: AdjustableChordSettings = {
  orientation: Orientation.vertical,
  title: "",
  frets: 5,
  strings: 6,
  position: 1,
  style: ChordStyle.normal,
  fretSize: 1.5,
  nutSize: 0.65,
  strokeWidth: 2,
  backgroundColor: undefined,
  color: undefined,
};

export const ChordForm: React.FunctionComponent<{
  onSettings(settings: AdjustableChordSettings): void;
  settings: AdjustableChordSettings;
}> = ({ onSettings, settings }) => {
  const { isOpen, onToggle } = useDisclosure();

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
  }, [deferredValue, errors]);

  useEffect(() => {
    setValue("orientation", settings.orientation);
  }, [settings.orientation]);

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
                  <option value={ChordStyle.handdrawn}>Handdrawn</option>
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
          <Box></Box>
          <Box></Box>
          <Box>
            <FormControl>
              <FormLabel>
                Height
                <Controller
                  control={control}
                  name="fretSize"
                  render={({ field }) => (
                    <Slider
                      aria-label="Chord chart height"
                      min={0.7}
                      max={5}
                      step={0.1}
                      defaultValue={1.5}
                      {...field}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
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
                  name="nutSize"
                  render={({ field }) => (
                    <Slider
                      aria-label="Chord chart finger size"
                      min={0.3}
                      max={1.5}
                      step={0.025}
                      defaultValue={1.5}
                      {...field}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
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
                    <Slider
                      aria-label="Stroke width"
                      min={1}
                      max={10}
                      step={1}
                      defaultValue={1.5}
                      {...field}
                    >
                      <SliderTrack>
                        <SliderFilledTrack />
                      </SliderTrack>
                      <SliderThumb boxSize={6} />
                    </Slider>
                  )}
                ></Controller>
              </FormLabel>
            </FormControl>
          </Box>
          <Box></Box>
          <Box>
            <FormControl>
              <FormLabel>
                Color
                <Controller
                  control={control}
                  name="color"
                  render={({ field }) => (
                    <ColorInput onChange={field.onChange} />
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
                    <ColorInput onChange={field.onChange} />
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
                onClick={() => reset(defaultValues)}
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
