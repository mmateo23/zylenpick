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
        className="magnetic-button inline-flex rounded-full border border-[#E5484D]/35 bg-[#E5484D]/12 px-6 py-3.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        Eliminar solicitud
      </button>
    </form>
  );
}
