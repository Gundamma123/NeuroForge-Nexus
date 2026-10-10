// import { useEffect } from "react";
// import { X } from "lucide-react";

// const Modal = ({ open, onClose, title, children }) => {
//   useEffect(() => {
//     const handleEsc = (e) => e.key === "Escape" && onClose();
//     if (open) document.addEventListener("keydown", handleEsc);
//     return () => document.removeEventListener("keydown", handleEsc);
//   }, [open, onClose]);

//   if (!open) return null;

//   return (
//     <div className="nf-modal-overlay" onClick={onClose}>
//       <div className="nf-modal-pop" onClick={(e) => e.stopPropagation()}>
//         <div className="nf-modal-header">
//           <h3>{title}</h3>
//           <button className="nf-modal-close" onClick={onClose} aria-label="Close">
//             <X size={18} />
//           </button>
//         </div>
//         <div className="nf-modal-body">{children}</div>
//       </div>
//     </div>
//   );
// };

// export default Modal;

import { useEffect } from "react";
import { X } from "lucide-react";

// const Modal = ({ open, onClose, title, children }) => {
  const Modal = ({ open, onClose, title, children, wide = false }) => {
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    if (open) document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="nf-modal-overlay" onClick={onClose}>
      {/* <div className="nf-modal-pop" onClick={(e) => e.stopPropagation()}> */}
      <div
      className={`nf-modal-pop ${wide ? "nf-modal-wide" : ""}`}
     onClick={(e) => e.stopPropagation()}
   >



        <div className="nf-modal-header">
          <h3>{title}</h3>
          <button className="nf-modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="nf-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;