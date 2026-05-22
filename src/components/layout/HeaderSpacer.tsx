/**
 * Dynamic spacer component that matches the header height.
 * Use when you need to add header offset to a specific element
 * rather than wrapping in Layout component.
 */
const HeaderSpacer = () => {
  return <div className="h-[var(--header-height)]" aria-hidden="true" />;
};

export default HeaderSpacer;
