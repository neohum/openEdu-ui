/** Flaticon UIcons Regular Rounded glyph. The consumer loads the `fi` icon font CSS. */
export function Icon({ name }: { name: string }) {
  return <i className={`fi fi-rr-${name}`} aria-hidden="true" />;
}
