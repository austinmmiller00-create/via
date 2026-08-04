import type {
  CSSProperties,
  ReactNode,
} from "react";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

type ModalWidth =
  | "small"
  | "regular"
  | "large";

type ModalProps = {
  children: ReactNode;
  ariaLabel: string;
  width?: ModalWidth;
  zIndex?: number;
  style?: CSSProperties;
};

const widthStyles: Record<
  ModalWidth,
  CSSProperties
> = {
  small: {
    width:
      designSystem.layout.summaryWidth,
  },

  regular: {
    width:
      designSystem.layout.savedTripsWidth,
  },

  large: {
    width: "620px",
  },
};

function Modal({
  children,
  ariaLabel,
  width = "regular",
  zIndex = designSystem.zIndex.modal,
  style,
}: ModalProps) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
      style={{
        ...componentStyles.modalBackdrop,
        zIndex,
      }}
    >
      <div
        style={{
          ...componentStyles.modal,
          ...widthStyles[width],
          ...style,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;