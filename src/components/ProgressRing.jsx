const SIZE = 64
const STROKE = 7
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/** Circular progress indicator for how many habits are done today. */
export default function ProgressRing({ done, total }) {
  const fraction = total ? done / total : 0
  const complete = total > 0 && done >= total

  return (
    <div
      className={`ring${complete ? ' ring-complete' : ''}`}
      role="img"
      aria-label={`${done} of ${total} habits done today`}
    >
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden="true">
        <circle className="ring-track" cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} strokeWidth={STROKE} fill="none" />
        <circle
          className="ring-fill"
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - fraction)}
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </svg>
      <span className="ring-label">{complete ? '⚓' : `${Math.round(fraction * 100)}%`}</span>
    </div>
  )
}
