import React from 'react';

/**
 * AnimatedButton
 * - Inspired by Vengence UI Animated Button
 * - Features sweeping border shine, light mask shimmer, and smooth spring hover/tap interactions
 * - Fully theme-aware (works seamlessly in dark & light modes)
 */
export const AnimatedButton = ({
  children,
  className = '',
  variant = 'secondary', // 'primary' | 'secondary' | 'ghost'
  size = 'md', // 'sm' | 'md' | 'lg'
  onClick,
  type = 'button',
  disabled = false,
  id,
  title,
  ariaLabel,
  ariaPressed,
  ariaExpanded,
  style = {},
  ...rest
}) => {
  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      aria-pressed={ariaPressed}
      aria-expanded={ariaExpanded}
      className={`animated-button animated-button-${variant} animated-button-${size} ${className}`}
      style={style}
      {...rest}
    >
      {/* Text & Icon content with animated shimmer mask */}
      <span className="animated-button-content">
        {children}
      </span>

      {/* Sweeping border shine mask */}
      <span className="animated-button-border-shine" aria-hidden="true" />
    </button>
  );
};

export default AnimatedButton;
