import { useFormContext } from "react-hook-form";

type Props = { label?: string };

export default function BusinessToggle({ label = "חשבון עסקי" }: Props) {
  const { register } = useFormContext();
  return (
    <label className="inline-flex items-center gap-2">
      <input type="checkbox" {...register("isBusiness")} />
      <span className="text-sm">{label}</span>
    </label>
  );
}
