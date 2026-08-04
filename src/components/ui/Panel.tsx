import type {
  CSSProperties,
  HTMLAttributes,
  ReactNode,
} from "react";

import {
  componentStyles,
  designSystem,
} from "../../styles/designSystem";

type PanelPadding =
  | "none"
  | "small"
  | "regular"
  | "large";

type PanelProps =
  HTMLAttributes<HTMLDivElement> & {
    children: ReactNode;
    padding?: PanelPadding;
  };

const paddingStyles: Record<
  PanelPadding,
  CSSProperties
> = {
  none: {
    padding: 0,
  },

  small: {
    padding: designSystem.spacing.regular,
  },

  regular: {
    padding: designSystem.spacing.xl,
  },

  large: {
    padding: designSystem.spacing.panel,
  },
};

function Panel({
  children,
  padding = "regular",
  style,
  ...panelProps
}: PanelProps) {
  return (
    <div
      {...panelProps}
      style={{
        ...componentStyles.panel,
        ...paddingStyles[padding],
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export default Panel;