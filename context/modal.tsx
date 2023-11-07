import React, { createContext, useContext, useState } from "react";
import { Modal, Portal, useTheme } from "react-native-paper";

const ModalContext = createContext({
  isVisible: false,
  openModal: (content: React.ReactNode) => {},
  closeModal: () => {},
});

export const ModalProvider = ({ children }: { children: React.ReactNode }) => {
  const themeSettings = useTheme();
  const [isVisible, setIsVisible] = useState(false);
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const openModal = (content: React.ReactNode) => {
    setModalContent(content);
    setIsVisible(true);
  };

  const closeModal = () => {
    setIsVisible(false);
    setModalContent(null);
  };

  return (
    <ModalContext.Provider value={{ isVisible, openModal, closeModal }}>
      {children}
      {isVisible && (
        <Portal>
          <Modal
            visible={true}
            onDismiss={closeModal}
            contentContainerStyle={{
              backgroundColor: themeSettings.colors.background,
              padding: 20,
              flexDirection: "column",
            }}
            style={{ padding: 10, marginBottom: 100 }}
          >
            {modalContent}
          </Modal>
        </Portal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  return useContext(ModalContext);
};
