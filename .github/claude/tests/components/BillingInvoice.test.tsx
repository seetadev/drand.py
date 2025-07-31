import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { IonApp, IonContent } from '@ionic/react';
import '@testing-library/jest-dom';
import BillingInvoice from '../../src/components/BillingInvoice';
import { DrandProvider } from '../../src/contexts/DrandContext';
import * as DrandService from '../../src/services/DrandService';

// Mock the DrandService
jest.mock('../../src/services/DrandService');
const mockDrandService = DrandService as jest.Mocked<typeof DrandService>;

// Mock Ionic components
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  IonButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  IonCard: ({ children }: any) => <div data-testid="ion-card">{children}</div>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonCardHeader: ({ children }: any) => <div>{children}</div>,
  IonCardTitle: ({ children }: any) => <h2>{children}</h2>,
  IonInput: ({ value, onIonInput, placeholder }: any) => (
    <input 
      value={value} 
      onChange={(e) => onIonInput?.({ detail: { value: e.target.value } })}
      placeholder={placeholder}
    />
  ),
  IonItem: ({ children }: any) => <div>{children}</div>,
  IonLabel: ({ children }: any) => <label>{children}</label>,
  IonToast: ({ isOpen, message }: any) => isOpen ? <div role="alert">{message}</div> : null,
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IonApp>
    <IonContent>
      <DrandProvider>
        {children}
      </DrandProvider>
    </IonContent>
  </IonApp>
);

describe('BillingInvoice Component', () => {
  const mockInvoiceData = {
    invoiceNumber: 'INV-001',
    clientName: 'Government Agency',
    amount: 1500.00,
    dueDate: '2024-01-15',
    services: ['Consulting', 'Development'],
    randomnessBeacon: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDrandService.getLatestRandomness.mockResolvedValue({
      round: 12345,
      randomness: 'abc123def456',
      signature: 'signature123',
      previous_signature: 'prev_sig123',
    });
  });

  it('renders invoice form with all required fields', () => {
    render(
      <TestWrapper>
        <BillingInvoice />
      </TestWrapper>
    );

    expect(screen.getByPlaceholderText('Invoice Number')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Client Name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Amount')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Due Date')).toBeInTheDocument();
    expect(screen.getByText('Generate Secure Invoice')).toBeInTheDocument();
  });

  it('validates required fields before submission', async () => {
    render(
      <TestWrapper>
        <BillingInvoice />
      </TestWrapper>
    );

    const submitButton = screen.getByText('Generate Secure Invoice');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please fill in all required fields')).toBeInTheDocument();
    });

    expect(mockDrandService.getLatestRandomness).not.toHaveBeenCalled();
  });

  it('generates invoice with drand randomness beacon', async () => {
    render(
      <TestWrapper>
        <BillingInvoice />
      </TestWrapper>
    );

    // Fill in form fields
    fireEvent.change(screen.getByPlaceholderText('Invoice Number'), {
      target: { value: mockInvoiceData.invoiceNumber }
    });
    fireEvent.change(screen.getByPlaceholderText('Client Name'), {
      target: { value: mockInvoiceData.clientName }
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: mockInvoiceData.amount.toString() }
    });
    fireEvent.change(screen.getByPlaceholderText('Due Date'), {
      target: { value: mockInvoiceData.dueDate }
    });

    const submitButton = screen.getByText('Generate Secure Invoice');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDrandService.getLatestRandomness).toHaveBeenCalled();
    });

    expect(screen.getByText('Invoice generated successfully with randomness beacon')).toBeInTheDocument();
  });

  it('displays error when randomness generation fails', async () => {
    mockDrandService.getLatestRandomness.mockRejectedValue(new Error('Network error'));

    render(
      <TestWrapper>
        <BillingInvoice />
      </TestWrapper>
    );

    // Fill in required fields
    fireEvent.change(screen.getByPlaceholderText('Invoice Number'), {
      target: { value: 'INV-001' }
    });
    fireEvent.change(screen.getByPlaceholderText('Client Name'), {
      target: { value: 'Test Client' }
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByPlaceholderText('Due Date'), {
      target: { value: '2024-01-15' }
    });

    const submitButton = screen.getByText('Generate Secure Invoice');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to generate secure invoice. Please try again.')).toBeInTheDocument();
    });
  });

  it('formats currency correctly', () => {
    render(
      <TestWrapper>
        <BillingInvoice initialData={{ ...mockInvoiceData, amount: 1234.56 }} />
      </TestWrapper>
    );

    expect(screen.getByText('$1,234.56')).toBeInTheDocument();
  });

  it('disables submit button while generating randomness', async () => {
    // Make the service call hang
    mockDrandService.getLatestRandomness.mockImplementation(() => new Promise(() => {}));

    render(
      <TestWrapper>
        <BillingInvoice />
      </TestWrapper>
    );

    // Fill form and submit
    fireEvent.change(screen.getByPlaceholderText('Invoice Number'), {
      target: { value: 'INV-001' }
    });
    fireEvent.change(screen.getByPlaceholderText('Client Name'), {
      target: { value: 'Test Client' }
    });
    fireEvent.change(screen.getByPlaceholderText('Amount'), {
      target: { value: '1000' }
    });
    fireEvent.change(screen.getByPlaceholderText('Due Date'), {
      target: { value: '2024-01-15' }
    });

    const submitButton = screen.getByText('Generate Secure Invoice');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Generating...')).toBeInTheDocument();
    });
  });
});