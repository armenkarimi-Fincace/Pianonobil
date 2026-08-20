/** The legend under the mosaic figures. */
export function MosaicKeys({ spentLabel = 'spent' }: { spentLabel?: string }) {
  return (
    <div className="keys">
      <span>
        <i className="s" />
        {spentLabel}
      </span>
      <span>
        <i className="h" />
        committed
      </span>
      <span>
        <i className="x" />
        held, not spent
      </span>
    </div>
  );
}
