import type {
  InputHTMLAttributes,
} from "react";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

type TextInputProps =
  InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    fullWidth?: boolean;
  };

function TextInput({
  label,
  fullWidth = true,
  id,
  style,
  disabled,
  ...inputProps
}: TextInputProps) {
  const inputId =
    id ??
    inputProps.name ??
    undefined;

  return (
    <label
      htmlFor={inputId}
      style={{
        display: "block",
        width: fullWidth
          ? "100%"
          : undefined,

        fontFamily:
          designSystem.typography.family,
      }}
    >
      {label && (
        <span
          style={{
            display: "block",
            marginBottom:
              designSystem.spacing.small,

            fontSize:
              designSystem.typography.sizes
                .small,

            fontWeight:
              designSystem.typography.weights
                .semibold,

            color:
              designSystem.colours.mutedInk,
          }}
        >
          {label}
        </span>
      )}

      <input
        {...inputProps}
        id={inputId}
        disabled={disabled}
        style={{
          ...componentStyles.input,

          width: fullWidth
            ? "100%"
            : undefined,

          background: disabled
            ? designSystem.colours
                .surfaceDisabled
            : designSystem.colours.surface,

          opacity: disabled ? 0.8 : 1,

          cursor: disabled
            ? "default"
            : undefined,

          ...style,
        }}
      />
    </label>
  );
}

export default TextInput;