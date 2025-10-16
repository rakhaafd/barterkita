import Swal from "sweetalert2";

export const showConfirmation = ({
  title = "Konfirmasi",
  text = "Apakah Anda yakin?",
  confirmButtonText = "Ya",
  cancelButtonText = "Batal",
  confirmButtonColor = "#52BA5E",
  cancelButtonColor = "#d33",
  icon = "warning",
}) => {
  console.log("showConfirmation called:", { title, text });
  return Swal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonColor,
    cancelButtonColor,
    confirmButtonText,
    cancelButtonText,
  });
};

export const showSuccess = ({
  title = "Berhasil!",
  text = "",
  confirmButtonColor = "#52BA5E",
}) => {
  console.log("showSuccess called:", { title, text });
  return Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor,
  });
};

export const showError = ({
  title = "Gagal!",
  text = "Terjadi kesalahan.",
  confirmButtonColor = "#d33",
}) => {
  console.log("showError called:", { title, text });
  return Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor,
  });
};

export const showSend = ({
  title = "",
  text = "...",
  timer = 3000,
  showConfirmButton = false,
}) => {
  console.log("showSend called:", { title, text, timer });
  return Swal.fire({
    icon: "info",
    title,
    text,
    timer,
    showConfirmButton,
  });
};

// Tambahkan fungsi Toast untuk notifikasi pesan baru
export const showMessageToast = ({
  title = "Pesan Baru",
  text = "",
  icon = "info",
  timer = 4000,
  position = "top-end",
  showConfirmButton = false,
}) => {
  const Toast = Swal.mixin({
    toast: true,
    position: position,
    showConfirmButton: showConfirmButton,
    timer: timer,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  return Toast.fire({
    icon: icon,
    title: title,
    text: text,
  });
};