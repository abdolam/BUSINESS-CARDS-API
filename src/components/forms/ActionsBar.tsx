import Button, { FormButton } from "@/components/common/Button";

type Props = {
  submitting: boolean;
  canSubmit: boolean;
  isValid: boolean;
  isSubmitting: boolean;
  onCancel?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
};

export default function ActionsBar({
  submitting,
  canSubmit,
  isValid,
  isSubmitting,
  onCancel,
  submitLabel = "שמירה",
  cancelLabel = "ביטול",
}: Props) {
  return (
    <div className="flex gap-3 justify-start pt-2">
      <FormButton
        type="submit"
        className="u-btn u-btn-submit"
        disabled={!isValid || submitting || !canSubmit || isSubmitting}
      >
        {submitLabel}
      </FormButton>
      <Button type="button" className="u-btn u-btn-cancel" onClick={onCancel}>
        {cancelLabel}
      </Button>
    </div>
  );
}
