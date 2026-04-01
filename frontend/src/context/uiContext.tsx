import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

type UiContextType = {
  isBotOpen: boolean;
  setBotOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const UIContext = createContext<UiContextType | null>(null);

export function UiContextProvider({ children }: { children: ReactNode }) {
  const [isBotOpen, setBotOpen] = useState<boolean>(false);

  return (
    <UIContext.Provider value={{ isBotOpen, setBotOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export function useUIContext(): UiContextType {
  const context = useContext(UIContext);

  if (!context) {
    throw new Error("useUIContext must be used within UiContextProvider");
  }

  return context;
}