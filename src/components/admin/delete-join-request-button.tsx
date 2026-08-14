"use client";

type DeleteJoinRequestButtonProps = {
  action: () => void;
  disabled?: boolean;
};

export function DeleteJoinRequestButton({
  action,
  disabled = false,
}: DeleteJoinRequestButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }

        const confirmed = window.confirm(
          "Esta acción no se puede deshacer. ¿Seguro que quieres eliminar esta solicitud?",
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={disabled}
        className="magnetic-button inline-flex rounded-full border border-[#B42318]/30 bg-[#FEE4E2] px-6 py-3.5 text-sm font-semibold text-[#B42318] disabled:cursor-not-allowed disabled:opacity-50"
      >
        Eliminar solicitud
      </button>
    </form>
  );
}
