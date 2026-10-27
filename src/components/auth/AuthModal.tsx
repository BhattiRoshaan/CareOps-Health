import React from 'react';
import { AuthPage } from './AuthPage';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'signin'
}) => {
  if (!isOpen) return null;

  return <AuthPage isModal={true} initialTab={initialTab} onClose={onClose} />;
};
