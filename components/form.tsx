import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { KEYBOARD_DISMISS_ACCESSORY_ID } from './keyboard-dismiss-accessory';

import { Palette, Radius, Shadows } from '@/constants/theme';

export const PRIMARY = Palette.primary;

type FormInputProps = TextInputProps & {
  label: string;
};

export function FormInput({ label, style, ...props }: FormInputProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        inputAccessoryViewID={KEYBOARD_DISMISS_ACCESSORY_ID}
        placeholderTextColor={Palette.textMuted}
        style={[styles.input, style]}
        {...props}
      />
    </View>
  );
}

type PrimaryButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, loading, disabled }: PrimaryButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        (pressed || isDisabled) && styles.buttonDim,
      ]}>
      {loading ? (
        <ActivityIndicator color={Palette.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: Radius.large,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Palette.text,
    backgroundColor: Palette.surface,
    boxShadow: Shadows.soft,
  },
  button: {
    backgroundColor: Palette.primary,
    borderRadius: Radius.large,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    boxShadow: Shadows.hero,
  },
  buttonDim: {
    opacity: 0.6,
  },
  buttonText: {
    color: Palette.white,
    fontSize: 16,
    fontWeight: '800',
  },
});
