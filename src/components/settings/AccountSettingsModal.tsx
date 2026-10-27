import React from 'react';
import { AccountSettingsView } from './AccountSettingsView';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return <AccountSettingsView isModal={true} onClose={onClose} />;
};
