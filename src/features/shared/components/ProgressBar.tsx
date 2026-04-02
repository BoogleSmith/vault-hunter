import "./HealthBar.css";

interface ProgressBarProps {
  label?: string;
  current: number;
  max: number;
}

export function ProgressBar({ label, current, max }: ProgressBarProps) {
  const safeMax = Math.max(1, max);
  const percentage = Math.max(0, Math.min(100, (current / safeMax) * 100));

  return (
    <div className="health-bar-container">
      <div
        className="progress-bar"
        style={{
          width: `${percentage}%`,
          background:
            "linear-gradient(180deg, hsl(198 86% 74%) 0%, hsl(202 84% 62%) 70%, hsl(208 88% 46%) 100%), linear-gradient(90deg, rgba(255, 255, 255, 0.26) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0) 55%)",
        }}
      />
      <span className="health-text">
        {label ? `${label} ${current}/${max}` : `${current}/${max}`}
      </span>
    </div>
  );
}
