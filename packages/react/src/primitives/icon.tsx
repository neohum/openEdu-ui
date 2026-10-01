/** Phosphor Icons (MIT) regular glyph. The consumer loads `@phosphor-icons/web/regular`. */
export function Icon({ name }: { name: string }) {
  return <i className={`ph ph-${name}`} aria-hidden="true" />;
}
