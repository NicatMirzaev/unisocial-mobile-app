import React, { createContext, useContext, useState } from "react";
import { Dialog, Portal } from "react-native-paper";

const DialogContext = createContext({
  isVisible: false,
  openDialog: (content: React.ReactNode) => {},
  closeDialog: () => {},
});

export const DialogProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [dialogContent, setDialogContent] = useState<React.ReactNode>(null);

  const openDialog = (content: React.ReactNode) => {
    setDialogContent(content);
    setIsVisible(true);
  };

  const closeDialog = () => {
    setIsVisible(false);
    setDialogContent(null);
  };

  return (
    <DialogContext.Provider value={{ isVisible, openDialog, closeDialog }}>
      {children}
      <Portal>
        <Dialog visible={isVisible} onDismiss={closeDialog}>
          {dialogContent}
        </Dialog>
      </Portal>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  return useContext(DialogContext);
};
