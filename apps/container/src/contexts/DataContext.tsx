import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DataContextType {
  sharedData: Record<string, unknown>;
  setData: (key: string, value: unknown) => void;
  getData: (key: string) => unknown;
  clearData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [sharedData, setSharedData] = useState<Record<string, unknown>>({});

  const setData = (key: string, value: unknown) => {
    setSharedData(prev => ({ ...prev, [key]: value }));
  };

  const getData = (key: string) => {
    return sharedData[key];
  };

  const clearData = () => {
    setSharedData({});
  };

  return (
    <DataContext.Provider
      value={{
        sharedData,
        setData,
        getData,
        clearData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};
