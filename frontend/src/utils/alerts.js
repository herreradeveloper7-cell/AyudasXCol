import Swal from "sweetalert2";

const COLORS = {
  primary: "#12334b",
  secondary: "#138c85",
};

export function showSuccess(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "success",
    confirmButtonText: "Aceptar",
    confirmButtonColor: COLORS.secondary,
    allowOutsideClick: false,
  });
}

export function showError(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "error",
    confirmButtonText: "Entendido",
    confirmButtonColor: COLORS.primary,
  });
}

export function showInfo(title, text) {
  return Swal.fire({
    title,
    text,
    icon: "info",
    confirmButtonText: "Aceptar",
    confirmButtonColor: COLORS.secondary,
  });
}

export async function showConfirm({
  title = "¿Deseas continuar?",
  text = "Confirma para realizar esta acción.",
  confirmText = "Sí, continuar",
  cancelText = "Cancelar",
} = {}) {
  const result = await Swal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: COLORS.secondary,
    cancelButtonColor: "#64748b",
    reverseButtons: true,
  });

  return result.isConfirmed;
}
