import { ProgressBar } from "./ProgressBar";

interface HealthBarProps {
  current: number;
  max: number;
}

export function HealthBar({ current, max }: HealthBarProps) {
  const safeMax = Math.max(1, max);
  const percentage = Math.max(0, Math.min(100, (current / safeMax) * 100));
  const hue = percentage * 1.2;

  return (
    <ProgressBar
      label="HP"
      tooltip="Health"
      current={current}
      max={max}
      colorProps={{ hue }}
      fillBackground={`linear-gradient(180deg, hsl(${hue} 72% 38%) 0%, hsl(${hue} 78% 28%) 70%, hsl(${hue} 84% 22%) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.22) 0%, rgba(255, 255, 255, 0.06) 30%, rgba(255, 255, 255, 0) 55%)`}
    />
  );
}
