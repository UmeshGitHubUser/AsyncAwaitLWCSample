import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getAccountDetails from '@salesforce/apex/AccountDashboardController.getAccountDetails';
import getRecentContacts from '@salesforce/apex/AccountDashboardController.getRecentContacts';
import getOpenOpportunities from '@salesforce/apex/AccountDashboardController.getOpenOpportunities';
import getAccountSummary from '@salesforce/apex/AccountDashboardController.getAccountSummary';

export default class AccountDashboard extends LightningElement {
    @api recordId; // Account Id passed from record page
    
    account;
    contacts;
    opportunities;
    summary;
    
    loading = true;
    error;
    
    // Load all data when component initializes
    async connectedCallback() {
        if (this.recordId) {
            await this.loadAllData();
        }
    }

// Add these properties to the JavaScript class
    get contactColumns() {
        return [
            { label: 'Name', fieldName: 'Name', type: 'text' },
            { label: 'Title', fieldName: 'Title', type: 'text' },
            { label: 'Email', fieldName: 'Email', type: 'email' },
            { label: 'Phone', fieldName: 'Phone', type: 'phone' }
        ];
    }

    get opportunityColumns() {
        return [
            { label: 'Name', fieldName: 'Name', type: 'text' },
            { label: 'Amount', fieldName: 'Amount', type: 'currency' },
            { label: 'Close Date', fieldName: 'CloseDate', type: 'date' },
            { label: 'Stage', fieldName: 'StageName', type: 'text' }
        ];
    }
    
    // Method to handle refresh button click
    async handleRefresh() {
        this.loading = true;
        this.error = null;
        await this.loadAllData();
    }
    
    // Load all data in parallel for maximum efficiency
    async loadAllData() {
        try {
            const [accountResult, contactsResult, opportunitiesResult, summaryResult] = await Promise.all([
                getAccountDetails({ accountId: this.recordId }),
                getRecentContacts({ accountId: this.recordId }),
                getOpenOpportunities({ accountId: this.recordId }),
                getAccountSummary({ accountId: this.recordId })
            ]);
            
            this.account = accountResult;
            this.contacts = contactsResult;
            this.opportunities = opportunitiesResult;
            this.summary = summaryResult;
            
            this.showToast('Success', 'Account data loaded successfully', 'success');
        } catch (error) {
            this.error = error.message || 'Unknown error loading account data';
            this.showToast('Error', this.error, 'error');
        } finally {
            this.loading = false;
        }
    }
    
    // Sequential loading example (not used but shown for demonstration)
    async loadDataSequentially() {
        try {
            // First load account
            this.account = await getAccountDetails({ accountId: this.recordId });
            
            // Then load contacts and opportunities in parallel
            [this.contacts, this.opportunities] = await Promise.all([
                getRecentContacts({ accountId: this.recordId }),
                getOpenOpportunities({ accountId: this.recordId })
            ]);
            
            // Finally load summary
            this.summary = await getAccountSummary({ accountId: this.recordId });
        } catch (error) {
            this.error = error.message || 'Unknown error loading account data';
        } finally {
            this.loading = false;
        }
    }
    
    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title,
                message,
                variant
            })
        );
    }
}