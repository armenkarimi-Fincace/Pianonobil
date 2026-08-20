'use client';

/**
 * A labelled range control. The original updated the value label on `input`
 * and recomputed the whole room on `change`; React state makes both immediate
 * while `onSettle` still carries the "the drag has finished" moment used to
 * re-check the capital position.
 */
export function Slider({
  label,
  value,
  display,
  min,
  max,
  step,
  onChange,
  onSettle,
  className,
}: {
  label: string;
  value: number;
  display: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  onSettle?: () => void;
  className?: string;
}) {
  return (
    <>
      <div className={'sl-head' + (className ? ' ' + className : '')}>
        <span className="eyebrow q">{label}</span>
        <span className="v">{display}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={onSettle}
        onTouchEnd={onSettle}
        onKeyUp={onSettle}
      />
    </>
  );
}
