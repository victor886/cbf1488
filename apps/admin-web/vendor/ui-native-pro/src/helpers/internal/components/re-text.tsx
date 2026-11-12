import { forwardRef, useMemo } from 'react';
import type { TextInputProps } from 'react-native';
import { TextInput } from 'react-native';
import type { AnimatedProps, SharedValue } from 'react-native-reanimated';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
/**
 * Props for {@link ReText}.
 *
 * `text` holds the string driven on the UI thread via `useAnimatedProps`.
 */
/**
 * Read-only `TextInput` surface whose visible characters are updated from a
 * {@link SharedValue<string>} on the UI thread using `useAnimatedProps`.
 *
 * @param props - {@link ReTextProps}
 */
const ReText = forwardRef((props: any, ref: any) => {
  const { className, style, text, ...rest } = props;
  const initialValue = useMemo(() => text.get(), [text]);
  const animatedProps = useAnimatedProps(() => {
    return {
      text: text.get(),
    };
  });
  return (
    <AnimatedTextInput
      ref={ref}
      editable={false}
      underlineColorAndroid="transparent"
      {...rest}
      className={className}
      style={style}
      value={initialValue}
      animatedProps={animatedProps}
    />
  );
});
ReText.displayName = 'HeroUINative.Internal.ReText';
export default ReText;

/**
 * Props for {@link ReText}.
 *
 * `text` holds the string driven on the UI thread via `useAnimatedProps`.
 */
export interface ReTextProps extends Omit<TextInputProps, 'value' | 'style'> {
  /**
   * Shared string updated on the UI thread.
   */
  text: SharedValue<string>;
  /**
   * Animated styles for the underlying `TextInput`.
   */
  style?: AnimatedProps<TextInputProps>['style'];
}
