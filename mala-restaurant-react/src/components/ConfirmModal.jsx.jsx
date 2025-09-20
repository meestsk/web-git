import React from "react";
import ReactDOM from "react-dom";
import styles from "./ConfirmModal.module.css";


export default function ConfirmModal({
  open,
  title = "ยืนยัน",
  message = "ต้องการดำเนินการต่อหรือไม่?",
  confirmText = "ยืนยัน",
  cancelText = "ยกเลิก",
  onConfirm,
  onCancel,
  danger = false,
}) {
  React.useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") onCancel?.();
      if (e.key === "Enter") onConfirm?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onCancel, onConfirm]);

  if (!open) return null;

  return ReactDOM.createPortal(
    <div className={styles.backdrop} onClick={onCancel} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.btnGhost} onClick={onCancel}>{cancelText}</button>
          <button
            className={`${styles.btnPrimary} ${danger ? styles.btnDanger : ""}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
