import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { DataProvider, useData } from '../contexts/DataContext';

const TestComponent = () => {
  const { sharedData, setData, clearData } = useData();

  return (
    <div>
      <div data-testid="shared-data">{JSON.stringify(sharedData)}</div>
      <button onClick={() => setData('test', 'value')}>Set Data</button>
      <button onClick={clearData}>Clear Data</button>
    </div>
  );
};

describe('DataContext', () => {
  it('should provide empty shared data initially', () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    expect(screen.getByTestId('shared-data')).toHaveTextContent('{}');
  });

  it('should allow setting and getting data', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    const setButton = screen.getByText('Set Data');
    
    await act(async () => {
      setButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('shared-data')).toHaveTextContent('{"test":"value"}');
    });
  });

  it('should allow clearing data', async () => {
    render(
      <DataProvider>
        <TestComponent />
      </DataProvider>
    );

    const setButton = screen.getByText('Set Data');
    
    await act(async () => {
      setButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('shared-data')).toHaveTextContent('{"test":"value"}');
    });

    const clearButton = screen.getByText('Clear Data');
    
    await act(async () => {
      clearButton.click();
    });

    await waitFor(() => {
      expect(screen.getByTestId('shared-data')).toHaveTextContent('{}');
    });
  });
});

