export default function SkipLink() {
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2
                 focus:bg-yellow-300 focus:text-black focus:px-3 focus:py-2 focus:rounded"
    >
      Skip to main content
    </a>
  );
}
