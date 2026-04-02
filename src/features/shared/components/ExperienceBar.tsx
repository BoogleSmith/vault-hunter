import { ProgressBar } from "./ProgressBar";

interface ExperienceBarProps {
  current: number;
  max: number;
}

export function ExperienceBar({ current, max }: ExperienceBarProps) {
  return (
    <ProgressBar
      label="🌟"
      tooltip="Experience"
      current={current}
      max={max}
      colorProps={{ hue: 192, saturation: 50, lightness: 50 }}
    />
  );
}
