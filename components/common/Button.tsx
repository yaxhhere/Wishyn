import clsx from 'clsx';
import { ActivityIndicator, Pressable, PressableProps, Text, View } from 'react-native';

type ButtonSize = 'default' | 'sm' | 'md' | 'lg';
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

interface ButtonProps extends PressableProps {
  title?: string;
  children?: React.ReactNode;
  size?: ButtonSize;
  variant?: ButtonVariant;
  loading?: boolean;
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-300 py-200',
  md: 'px-400 py-300',
  default: 'px-500 py-350',
  lg: 'px-600 py-400',
};

const textSizeStyles: Record<ButtonSize, string> = {
  sm: 'text-200',
  default: 'text-300',
  md: 'text-300',
  lg: 'text-400',
};

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  danger: 'bg-danger',
  ghost: 'bg-transparent',
};

const textVariantStyles: Record<ButtonVariant, string> = {
  primary: 'text-primary-fg',
  secondary: 'text-secondary-fg',
  danger: 'text-danger-fg',
  ghost: 'text-foreground',
};

export function Button({
  title,
  children,
  size = 'default',
  variant = 'primary',
  loading = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      className={clsx(
        'flex-row items-center justify-center rounded-full',
        sizeStyles[size],
        variantStyles[variant],
        isDisabled && 'opacity-50',
        className
      )}
      {...props}>
      {loading ? (
        <ActivityIndicator size="small" color="white" />
      ) : (
        <View className="flex-row items-center gap-200">
          {children}

          {title && (
            <Text className={clsx('font-normal', textSizeStyles[size], textVariantStyles[variant])}>
              {title}
            </Text>
          )}
        </View>
      )}
    </Pressable>
  );
}
