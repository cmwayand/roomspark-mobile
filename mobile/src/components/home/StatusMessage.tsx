import React from 'react';
import { Text, StyleSheet } from 'react-native';

interface StatusMessageProps {
  message: string | null;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ message }) => {
  if (!message) return null;

  const getMessageStyle = () => {
    if (message.includes('Error') || message.includes('failed')) {
      return styles.errorMessage;
    }
    if (message.includes('Uploading') || message.includes('Generating')) {
      return styles.uploadingMessage;
    }
    return styles.successMessage;
  };

  return <Text style={[styles.message, getMessageStyle()]}>{message}</Text>;
};

const styles = StyleSheet.create({
  message: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  successMessage: {
    color: '#34C759',
  },
  errorMessage: {
    color: '#FF3B30',
  },
  uploadingMessage: {
    color: '#007AFF',
  },
});
