import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  SimpleGrid,
} from "@chakra-ui/react";
import React, { useState, useEffect, useDeferredValue } from "react";
import { useForm } from "react-hook-form";
import { ChordSettings, Orientation } from "svguitar";

export type AdjustableChordSettings = Pick<
  ChordSettings,
  "orientation" | "frets" | "strings" | "position" | "title"
>;

const defaultValues: AdjustableChordSettings = {
  orientation: Orientation.vertical,
  title: "",
  frets: 5,
  strings: 6,
  position: 1,
};

export const ChordForm: React.FunctionComponent<{
  onSettings(settings: AdjustableChordSettings): void;
}> = ({ onSettings }) => {
  const {
    register,
    watch,
    formState: { errors },
  } = useForm<AdjustableChordSettings>({
    mode: "onChange",
    defaultValues,
  });
  const [data, setData] = useState<AdjustableChordSettings>(defaultValues);

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

  return (
    <SimpleGrid columns={[1, 2, 4, 4]} my={10}>
      <Box>
        <FormControl isInvalid={!!errors.title}>
          <FormLabel>
            Title
            <Input
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
  );
};
