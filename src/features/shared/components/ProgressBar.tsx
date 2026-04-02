import "./ProgressBar.css";

interface ColorProps {
  hue?: number;
  saturation?: number;
  lightness?: number;
}

interface ProgressBarProps {
  label?: string;
  tooltip?: string;
  colorProps?: ColorProps;
  current: number;
  max: number;
  fillBackground?: string;
}

export function ProgressBar({
  label,
  tooltip,
  current,
  max,
  colorProps = {},
  fillBackground,
}: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const percentage = Math.max(0, Math.min(100, (current / safeMax) * 100));
  const { hue = 192, saturation = 86, lightness = 50 } = colorProps;
  const background =
    fillBackground ??
    `linear-gradient(180deg, hsl(${hue} ${saturation}% ${lightness}%) 0%, hsl(${hue} ${saturation - 2}% ${lightness - 12}%) 70%, hsl(${hue} ${saturation + 2}% ${lightness - 28}%) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0) 55%)`;

  return (
    <div className="progress-bar-container" title={tooltip}>
      <div
        className="progress-bar-fill"
        style={{
          width: `${percentage}%`,
          background,
        }}
      />
      <span className="progress-bar-text">
        {label ? `${label} ${current}/${max}` : `${current}/${max}`}
      </span>
    </div>
  );
}
