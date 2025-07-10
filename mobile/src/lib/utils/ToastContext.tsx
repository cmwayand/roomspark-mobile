import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/src/constants/Colors';

// Define toast types
export type ToastType = 'success' | 'error' | 'info' | 'warning';

// Toast configuration interface
export interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
}

// Context interface
interface ToastContextValue {
  showToast: (config: ToastConfig) => void;
  hideToast: () => void;
}

// Create context with default values
const ToastContext = createContext<ToastContextValue>({
  showToast: () => {},
  hideToast: () => {},
});

// Custom hook to use the toast
export const useToast = () => useContext(ToastContext);

// Toast Provider component
export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [toastType, setToastType] = useState<ToastType>('info');
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
    });
  }, [fadeAnim]);

  const showToast = useCallback(
    ({ message, type, duration = 3000 }: ToastConfig) => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setMessage(message);
      setToastType(type);
      setVisible(true);

      // Animate in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Set timeout to hide toast after duration
      timeoutRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [fadeAnim, hideToast]
  );

  // Get toast background color based on type
  const getBackgroundColor = () => {
    switch (toastType) {
      case 'success':
        return Colors.status.success;
      case 'error':
        return Colors.status.error;
      case 'warning':
        return Colors.status.warning;
      default:
        return '#007AFF'; // Info color
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {visible && (
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: getBackgroundColor(),
              opacity: fadeAnim,
              top: insets.top + 10,
            },
          ]}
        >
          <TouchableOpacity onPress={hideToast} style={styles.touchable}>
            <Text style={styles.text}>{message}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    borderRadius: 8,
    padding: 16,
    elevation: 6,
    shadowOffset: { width: 0, height: 2 },
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  touchable: {
    width: '100%',
  },
  text: {
    color: 'white',
    fontWeight: '500',
    textAlign: 'center',
  },
});
