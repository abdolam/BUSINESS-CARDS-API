import LogoSpinner from "@/components/system/LogoSpinner";

type LoadingOverlayProps = {
  open: boolean;
  label?: string;
};

export default function LoadingOverlay({ open }: LoadingOverlayProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] grid place-items-center bg-black/25 backdrop-blur-[1px]">
      <div className="rounded-full bg-white/90 dark:bg-muted-900/90 ring-1 ring-muted-200 dark:ring-muted-700 shadow-md p-4">
        {/* Indeterminate spinner around the logo */}
        <LogoSpinner size={96} ringWidth={6} mode="indeterminate" />
      </div>
    </div>
  );
}
