"use client";

import { createContext, useContext, useState } from "react";

interface LoadingSpinnerContextType {
  showLoading: () => void;
  hideLoading: () => void;
}

const LoadingSpinnerContext = createContext<LoadingSpinnerContextType | undefined>(undefined);

export function LoadingSpinnerProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);

  const showLoading = () => setVisible(true);
  const hideLoading = () => setVisible(false);

  return (
    <LoadingSpinnerContext.Provider value={{ showLoading, hideLoading }}>
      {children}
      {visible && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-200/40 z-50">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin" />
        </div>
      )}
    </LoadingSpinnerContext.Provider>
  );
}

export function useLoadingSpinner() {
  const context = useContext(LoadingSpinnerContext);
  if (context === undefined) {
    throw new Error("useLoadingSpinner must be used within a LoadingSpinnerProvider");
  }
  return context;
} 