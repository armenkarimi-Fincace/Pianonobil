import type { ReactNode } from 'react';

/** The small bordered selector used wherever a set of choices is short. */
export function Chip({
  children,
  pressed,
  disabled,
  onClick,
}: {
  children: ReactNode;
  pressed: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={'chip' + (disabled ? ' off' : '')}
      aria-pressed={pressed}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
