import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { IonApp, IonContent, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

import BillingWorkflow from '../../src/components/BillingWorkflow';
import { DrandProvider } from '../../src/contexts/DrandContext';
import { InvoiceProvider } from '../../src/contexts/InvoiceContext';
import * as DrandService from '../../src/services/DrandService';
import * as StorageService from '../../src/services/StorageService';

// Mock services
jest.mock('../../src/services/DrandService');
jest.mock('../../src/services/StorageService');
jest.mock('@ionic/react', () => ({
  ...jest.requireActual('@ionic/react'),
  IonButton: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled}>{children}</button>
  ),
  IonCard: ({ children }: any) => <div data-testid="ion-card">{children}</div>,
  IonCardContent: ({ children }: any) => <div>{children}</div>,
  IonInput: ({ value, onIonInput, placeholder }: any) => (
    <input 
      value={value} 
      onChange={(e) => onIonInput?.({ detail: { value: e.target.value } })}
      placeholder={placeholder}
    />
  ),
  IonItem: ({ children }: any) => <div>{children}</div>,
  IonLabel: ({ children }: any) => <label>{children}</label>,
  IonList: ({ children }: any) => <ul>{children}</ul>,
  IonSpinner: () => <div data-testid="spinner">Loading...</div>,
  IonToast: ({ isOpen, message }: any) => isOpen ? <div role="alert">{message}</div> : null,
  IonAlert: ({ isOpen, header, message, buttons }: any) => isOpen ? (
    <div role="dialog">
      <h2>{header}</h2>
      <p>{message}</p>
      {buttons?.map((btn: any, idx: number) => (
        <button key={idx} onClick={btn.handler}>{btn.text}</button>
      ))}
    </div>
  ) : null,
}));

const mockDrandService = DrandService as jest.Mocked<typeof DrandService>;
const mockStorageService = StorageService as jest.Mocked<typeof StorageService>;

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <IonApp>
    <IonReactRouter>
      <IonContent>
        <DrandProvider>
          <InvoiceProvider>
            <IonRouterOutlet>
              <Route path="/" component={() => <>{children}</>} exact />
            </IonRouterOutlet>
          </InvoiceProvider>
        </DrandProvider>
      </IonContent>
    </IonReactRouter>
  </IonApp>
);

describe('BillingWorkflow Integration Tests', () => {
  const mockRandomnessData = {
    round: 12345,
    randomness: 'test-randomness-beacon-123',
    signature: 'test-signature',
    previous_signature: 'test-previous-signature'
  };

  const mockInvoiceData = {
    id: 'test-invoice-id',
    invoiceNumber: 'INV-001',
    clientName: 'Government Agency',
    amount: 1500.00,
    dueDate: '2024-01-15',
    services: ['Consulting', 'Development'],
    status: 'draft',
    createdAt: new Date().toISOString(),
    randomnessBeacon: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockDrandService.getLatestRandomness.mockResolvedValue(mockRandomnessData);
    mockDrandService.verifyRandomness.mockReturnValue(true);
    mockDrandService.generateSecureInvoiceId.mockReturnValue('secure-id-123');
    mockStorageService.saveInvoice.mockResolvedValue(mockInvoiceData);
    mockStorageService.getInvoices.mockResolvedValue([]);
  });

  it('completes full billing workflow from creation to storage', async () => {
    const user = userEvent.setup();
    
    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Step 1: Fill out invoice form
    await user.type(screen.getByPlaceholderText('Invoice Number'), mockInvoiceData.invoiceNumber);
    await user.type(screen.getByPlaceholderText('Client Name'), mockInvoiceData.clientName);
    await user.type(screen.getByPlaceholderText('Amount'), mockInvoiceData.amount.toString());
    await user.type(screen.getByPlaceholderText('Due Date'), mockInvoiceData.dueDate);

    // Step 2: Generate secure invoice with randomness
    const generateButton = screen.getByText('Generate Secure Invoice');
    await user.click(generateButton);

    // Verify randomness is fetched
    await waitFor(() => {
      expect(mockDrandService.getLatestRandomness).toHaveBeenCalled();
    });

    // Step 3: Verify invoice details are shown
    await waitFor(() => {
      expect(screen.getByText('Invoice Generated Successfully')).toBeInTheDocument();
      expect(screen.getByText(/Randomness Beacon:/)).toBeInTheDocument();
      expect(screen.getByText(/Round: 12345/)).toBeInTheDocument();
    });

    // Step 4: Save invoice
    const saveButton = screen.getByText('Save Invoice');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockStorageService.saveInvoice).toHaveBeenCalledWith(
        expect.objectContaining({
          invoiceNumber: mockInvoiceData.invoiceNumber,
          clientName: mockInvoiceData.clientName,
          amount: mockInvoiceData.amount,
          randomnessBeacon: expect.objectContaining({
            round: 12345,
            randomness: 'test-randomness-beacon-123'
          })
        })
      );
    });

    // Step 5: Verify success message
    expect(screen.getByText('Invoice saved successfully')).toBeInTheDocument();
  });

  it('handles randomness verification failure', async () => {
    const user = userEvent.setup();
    mockDrandService.verifyRandomness.mockReturnValue(false);

    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Fill form and generate
    await user.type(screen.getByPlaceholderText('Invoice Number'), 'INV-002');
    await user.type(screen.getByPlaceholderText('Client Name'), 'Test Client');
    await user.type(screen.getByPlaceholderText('Amount'), '1000');
    await user.type(screen.getByPlaceholderText('Due Date'), '2024-02-01');

    const generateButton = screen.getByText('Generate Secure Invoice');
    await user.click(generateButton);

    await waitFor(() => {
      expect(screen.getByText('Randomness verification failed. Please try again.')).toBeInTheDocument();
    });

    // Verify save button is disabled
    const saveButton = screen.getByText('Save Invoice');
    expect(saveButton).toBeDisabled();
  });

  it('allows editing invoice after generation', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Generate initial invoice
    await user.type(screen.getByPlaceholderText('Invoice Number'), 'INV-003');
    await user.type(screen.getByPlaceholderText('Client Name'), 'Initial Client');
    await user.type(screen.getByPlaceholderText('Amount'), '500');
    await user.type(screen.getByPlaceholderText('Due Date'), '2024-03-01');

    await user.click(screen.getByText('Generate Secure Invoice'));

    await waitFor(() => {
      expect(screen.getByText('Invoice Generated Successfully')).toBeInTheDocument();
    });

    // Edit the invoice
    const editButton = screen.getByText('Edit Invoice');
    await user.click(editButton);

    const clientNameInput = screen.getByDisplayValue('Initial Client');
    await user.clear(clientNameInput);
    await user.type(clientNameInput, 'Updated Client');

    // Regenerate with new data
    await user.click(screen.getByText('Generate Secure Invoice'));

    await waitFor(() => {
      expect(mockDrandService.getLatestRandomness).toHaveBeenCalledTimes(2);
    });

    // Verify updated data is shown
    expect(screen.getByText(/Updated Client/)).toBeInTheDocument();
  });

  it('displays invoice history', async () => {
    const mockInvoiceHistory = [
      { ...mockInvoiceData, invoiceNumber: 'INV-001', status: 'paid' },
      { ...mockInvoiceData, invoiceNumber: 'INV-002', status: 'pending' },
      { ...mockInvoiceData, invoiceNumber: 'INV-003', status: 'draft' },
    ];

    mockStorageService.getInvoices.mockResolvedValue(mockInvoiceHistory);

    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Click on history tab
    const historyTab = screen.getByText('Invoice History');
    fireEvent.click(historyTab);

    await waitFor(() => {
      expect(screen.getByText('INV-001')).toBeInTheDocument();
      expect(screen.getByText('INV-002')).toBeInTheDocument();
      expect(screen.getByText('INV-003')).toBeInTheDocument();
    });

    // Verify status indicators
    expect(screen.getByText('paid')).toBeInTheDocument();
    expect(screen.getByText('pending')).toBeInTheDocument();
    expect(screen.getByText('draft')).toBeInTheDocument();
  });

  it('handles network errors gracefully', async () => {
    const user = userEvent.setup();
    mockDrandService.getLatestRandomness.mockRejectedValue(new Error('Network timeout'));

    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Fill form
    await user.type(screen.getByPlaceholderText('Invoice Number'), 'INV-004');
    await user.type(screen.getByPlaceholderText('Client Name'), 'Test Client');
    await user.type(screen.getByPlaceholderText('Amount'), '750');
    await user.type(screen.getByPlaceholderText('Due Date'), '2024-04-01');

    // Attempt to generate
    await user.click(screen.getByText('Generate Secure Invoice'));

    await waitFor(() => {
      expect(screen.getByText('Failed to generate secure invoice. Network timeout')).toBeInTheDocument();
    });

    // Verify retry functionality
    mockDrandService.getLatestRandomness.mockResolvedValue(mockRandomnessData);
    
    const retryButton = screen.getByText('Retry');
    await user.click(retryButton);

    await waitFor(() => {
      expect(screen.getByText('Invoice Generated Successfully')).toBeInTheDocument();
    });
  });

  it('validates form inputs properly', async () => {
    const user = userEvent.setup();

    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Try to generate without filling required fields
    await user.click(screen.getByText('Generate Secure Invoice'));

    await waitFor(() => {
      expect(screen.getByText('Invoice number is required')).toBeInTheDocument();
      expect(screen.getByText('Client name is required')).toBeInTheDocument();
      expect(screen.getByText('Amount is required')).toBeInTheDocument();
      expect(screen.getByText('Due date is required')).toBeInTheDocument();
    });

    // Test invalid amount
    await user.type(screen.getByPlaceholderText('Amount'), '-100');
    await user.click(screen.getByText('Generate Secure Invoice'));

    await waitFor(() => {
      expect(screen.getByText('Amount must be positive')).toBeInTheDocument();
    });

    // Test past due date
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    
    await user.type(screen.getByPlaceholderText('Due Date'), pastDate.toISOString().split('T')[0]);
    await user.click(screen.getByText('Generate Secure Invoice'));

    await waitFor(() => {
      expect(screen.getByText('Due date must be in the future')).toBeInTheDocument();
    });
  });

  it('handles concurrent randomness requests', async () => {
    const user = userEvent.setup();
    
    // Make first request hang
    let resolveFirstRequest: (value: any) => void;
    const firstRequestPromise = new Promise((resolve) => {
      resolveFirstRequest = resolve;
    });

    mockDrandService.getLatestRandomness.mockReturnValueOnce(firstRequestPromise);

    render(
      <TestWrapper>
        <BillingWorkflow />
      </TestWrapper>
    );

    // Fill form and start first request
    await user.type(screen.getByPlaceholderText('Invoice Number'), 'INV-005');
    await user.type(screen.getByPlaceholderText('Client Name'), 'Concurrent Test');
    await user.type(screen.getByPlaceholderText('Amount'), '1200');
    await user.type(screen.getByPlaceholderText('Due Date'), '2024-05-01');

    await user.click(screen.getByText('Generate Secure Invoice'));

    // Verify loading state
    await waitFor(() => {
      expect(screen.getByTestId('spinner')).toBeInTheDocument();
    });

    // Try to start another request while first is pending
    await user.click(screen.getByText('Generate Secure Invoice'));

    // Should show message about request in progress
    expect(screen.getByText('Request in progress...')).toBeInTheDocument();

    // Resolve first request
    resolveFirstRequest!(mockRandomnessData);

    await waitFor(() => {
      expect(screen.getByText('Invoice Generated Successfully')).toBeInTheDocument();
    });
  });
});