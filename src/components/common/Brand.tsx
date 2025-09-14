import { Link } from "react-router-dom";
import CfLogo from "./logo";

type Props = {
  className?: string;
  stacked?: boolean;
};

export default function Brand({ className, stacked = false }: Props) {
  return (
    <Link
      to="/"
      aria-label="CardForge - דף הבית"
      className={[
        "inline-flex items-center gap-2 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400",
        stacked ? "flex-col items-start" : "",
        className ?? "",
      ].join(" ")}
    >
      <CfLogo title="CardForge" className="h-16 w-16" />
    </Link>
  );
}
