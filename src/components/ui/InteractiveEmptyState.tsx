import React, { memo, useId, forwardRef } from 'react';
import { motion, LazyMotion, domAnimation, HTMLMotionProps } from 'framer-motion';

// =============================================================================
// Planly — InteractiveEmptyState
//
// Komponen empty state interaktif dengan animasi ikon tiga-lapis,
// disesuaikan untuk tema Planly (CSS Variables + dark mode via .dark class).
// =============================================================================

const cn = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ');

const ICON_VARIANTS = {
  left: {
    initial: { scale: 0.8, opacity: 0, x: 0, y: 0, rotate: 0 },
    animate: { scale: 1, opacity: 1, x: 0, y: 0, rotate: -6, transition: { duration: 0.4, delay: 0.1 } },
    hover: { x: -22, y: -5, rotate: -15, scale: 1.1, transition: { duration: 0.2 } },
  },
  center: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
    hover: { y: -10, scale: 1.15, transition: { duration: 0.2 } },
  },
  right: {
    initial: { scale: 0.8, opacity: 0, x: 0, y: 0, rotate: 0 },
    animate: { scale: 1, opacity: 1, x: 0, y: 0, rotate: 6, transition: { duration: 0.4, delay: 0.3 } },
    hover: { x: 22, y: -5, rotate: 15, scale: 1.1, transition: { duration: 0.2 } },
  },
};

const CONTENT_VARIANTS = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.4, delay: 0.2 } },
};

const BUTTON_VARIANTS = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.4, delay: 0.3 } },
};

interface IconContainerProps {
  children: React.ReactNode;
  variant: 'left' | 'center' | 'right';
  className?: string;
}

const IconContainer = memo(({ children, variant, className = '' }: IconContainerProps) => (
  <motion.div
    variants={ICON_VARIANTS[variant]}
    className={cn(
      'w-12 h-12 rounded-xl flex items-center justify-center relative',
      'bg-white border border-[#E2E8F0] shadow-lg',
      'dark:bg-[#1f2937] dark:border-[#374151]',
      'group-hover:shadow-xl transition-all duration-300',
      className
    )}
  >
    <div className="text-sm text-[#94A3B8] group-hover:text-primary transition-colors duration-300">
      {children}
    </div>
  </motion.div>
));
IconContainer.displayName = 'IconContainer';

interface MultiIconDisplayProps {
  icons: React.ReactNode[];
}

const MultiIconDisplay = memo(({ icons }: MultiIconDisplayProps) => {
  if (!icons || icons.length < 3) return null;
  return (
    <div className="flex justify-center isolate relative">
      <IconContainer variant="left" className="left-2 top-1 z-10">
        {icons[0]}
      </IconContainer>
      <IconContainer variant="center" className="z-20">
        {icons[1]}
      </IconContainer>
      <IconContainer variant="right" className="right-2 top-1 z-10">
        {icons[2]}
      </IconContainer>
    </div>
  );
});
MultiIconDisplay.displayName = 'MultiIconDisplay';

const Background = () => (
  <div
    aria-hidden="true"
    className="absolute inset-0 opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500"
    style={{
      backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}
  />
);

interface EmptyStateAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface EmptyStateProps extends Omit<HTMLMotionProps<'section'>, 'title' | 'description'> {
  title: string;
  description?: string;
  icons?: React.ReactNode[];
  action?: EmptyStateAction;
  action2?: EmptyStateAction;
  size?: 'sm' | 'default' | 'lg';
  isIconAnimated?: boolean;
}

const SIZE_CLASSES = {
  sm: 'p-6',
  default: 'p-8',
  lg: 'p-12',
};

const TITLE_SIZE = {
  sm: 'text-base',
  default: 'text-lg',
  lg: 'text-xl',
};

const DESC_SIZE = {
  sm: 'text-xs',
  default: 'text-sm',
  lg: 'text-base',
};

const BUTTON_SIZE = {
  sm: 'text-xs px-3 py-1.5',
  default: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
};

export const EmptyState = forwardRef<HTMLElement, EmptyStateProps>(
  (
    {
      title,
      description,
      icons,
      action,
      action2,
      size = 'default',
      isIconAnimated = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const titleId = useId();
    const descriptionId = useId();

    return (
      <LazyMotion features={domAnimation}>
        <motion.section
          ref={ref}
          role="region"
          aria-labelledby={titleId}
          aria-describedby={description ? descriptionId : undefined}
          className={cn(
            'group transition-all duration-300 rounded-2xl relative overflow-hidden text-center flex flex-col items-center justify-center',
            'bg-white border border-[#E2E8F0] shadow-sm hover:shadow-md',
            'dark:bg-[#111827] dark:border-[#1f2937]',
            SIZE_CLASSES[size],
            className
          )}
          initial="initial"
          animate="animate"
          whileHover={isIconAnimated ? 'hover' : 'animate'}
          {...props}
        >
          <Background />
          <div className="relative z-10 flex flex-col items-center w-full">
            {icons && icons.length >= 3 && (
              <div className="mb-6">
                <MultiIconDisplay icons={icons} />
              </div>
            )}

            <motion.div variants={CONTENT_VARIANTS} className="space-y-2 mb-6">
              <h2
                id={titleId}
                className={cn(
                  TITLE_SIZE[size],
                  'font-semibold text-on-surface transition-colors duration-200'
                )}
              >
                {title}
              </h2>
              {description && (
                <p
                  id={descriptionId}
                  className={cn(
                    DESC_SIZE[size],
                    'text-on-surface-variant max-w-md leading-relaxed transition-colors duration-200 mx-auto'
                  )}
                >
                  {description}
                </p>
              )}
            </motion.div>

            {(action || action2) && (
              <motion.div
                variants={BUTTON_VARIANTS}
                className="flex flex-wrap items-center justify-center gap-3 mt-2 max-w-fit mx-auto"
              >
                {action && (
                  <motion.button
                    type="button"
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-colors duration-200 relative overflow-hidden group/button cursor-pointer',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'bg-primary text-white hover:bg-[#3525cd]',
                      'dark:bg-[#4F46E5] dark:hover:bg-[#6366F1]',
                      'border-none',
                      BUTTON_SIZE[size]
                    )}
                    whileHover="hover"
                    initial="initial"
                    whileTap={{ scale: 0.96 }}
                    variants={{
                      initial: { y: 0 },
                      hover: { y: -2, scale: 1.02 }
                    }}
                  >
                    {action.icon && (
                      <motion.div
                        variants={{
                          initial: { rotate: 0, scale: 1 },
                          hover: { rotate: [0, -15, 10, -5, 0], scale: 1.15, transition: { duration: 0.5 } }
                        }}
                      >
                        {action.icon}
                      </motion.div>
                    )}
                    <span className="relative z-10">{action.label}</span>
                  </motion.button>
                )}

                {action2 && (
                  <motion.button
                    type="button"
                    onClick={action2.onClick}
                    disabled={action2.disabled}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-colors duration-250 relative overflow-hidden group/button cursor-pointer',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'bg-white border border-[#E2E8F0] text-on-surface-variant hover:text-on-surface hover:bg-slate-50',
                      'dark:bg-[#1f2937] dark:border-[#374151] dark:text-slate-200 dark:hover:text-white dark:hover:bg-[#374151]',
                      BUTTON_SIZE[size]
                    )}
                    whileHover="hover"
                    initial="initial"
                    whileTap={{ scale: 0.96 }}
                    variants={{
                      initial: { y: 0 },
                      hover: { y: -2, scale: 1.02 }
                    }}
                  >
                    {action2.icon && (
                      <motion.div
                        variants={{
                          initial: { rotate: 0, scale: 1 },
                          hover: { rotate: [0, -15, 10, -5, 0], scale: 1.15, transition: { duration: 0.5 } }
                        }}
                      >
                        {action2.icon}
                      </motion.div>
                    )}
                    <span className="relative z-10">{action2.label}</span>
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </motion.section>
      </LazyMotion>
    );
  }
);
EmptyState.displayName = 'EmptyState';

export default EmptyState;
