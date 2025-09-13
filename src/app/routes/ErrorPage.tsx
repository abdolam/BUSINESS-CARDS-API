import { useLocation, useSearchParams } from "react-router-dom";
import ErrorState from "@/components/ui/ErrorState";

export default function ErrorPage() {
  const { state } = useLocation() as {
    state?: { message?: string; title?: string };
  };
  const [params] = useSearchParams();

  // Accept a message via navigation state OR ?msg=… query
  const message = state?.message ?? params.get("msg") ?? undefined;
  const title = state?.title ?? params.get("title") ?? "שגיאה";

  return <ErrorState message={message ?? undefined} title={title} />;
}
