import type {
  ButtonHTMLAttributes,
  CSSProperties,
  ReactNode,
} from "react";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

export type ButtonVariant =
  | "primary"
  | "dark"
  | "secondary"
  | "surface"
  | "danger";

export type ButtonSize =
  | "small"
  | "regular";

type ButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    fullWidth?: boolean;
  };

const variantStyles: Record<
  ButtonVariant,
  CSSProperties
> = {
  primary:
    componentStyles.buttonPrimary,

  dark: componentStyles.buttonDark,

  secondary:
    componentStyles.buttonSecondary,

  surface:
    componentStyles.buttonSurface,

  danger: {
    border: "none",

    background:
      designSystem.colours.danger,

    color:
      designSystem.colours.invertedText,
  },
};

const sizeStyles: Record<
  ButtonSize,
  CSSProperties
> = {
  small: {
    padding: "11px 14px",

    fontSize:
      designSystem.typography.sizes.small,

    borderRadius:
      designSystem.radii.input,
  },

  regular: {
    padding: "14px 18px",

    fontSize:
      designSystem.typography.sizes.bodyLarge,

    borderRadius:
      designSystem.radii.button,
  },
};

function Button({
  children,
  variant = "primary",
  size = "regular",
  fullWidth = false,
  disabled = false,
  type = "button",
  style,
  ...buttonProps
}: ButtonProps) {
  return (
    <button
      {...buttonProps}
      type={type}
      disabled={disabled}
      style={{
        ...componentStyles.buttonBase,
        ...variantStyles[variant],
        ...sizeStyles[size],

        width: fullWidth
          ? "100%"
          : undefined,

        opacity: disabled ? 0.6 : 1,

        cursor: disabled
          ? "default"
          : "pointer",

        ...style,
      }}
    >
      {children}
    </button>
  );
}

export default Button;