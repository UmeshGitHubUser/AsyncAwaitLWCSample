public with sharing class AccountDashboardController {
    @AuraEnabled
    public static Account getAccountDetails(String accountId) {
        return [SELECT Id, Name, BillingAddress, Phone, Website, Industry 
                FROM Account WHERE Id = :accountId LIMIT 1];
    }
    
    @AuraEnabled
    public static List<Contact> getRecentContacts(String accountId) {
        return [SELECT Id, Name, Email, Phone, Title 
                FROM Contact 
                WHERE AccountId = :accountId 
                ORDER BY CreatedDate DESC LIMIT 5];
    }
    
    @AuraEnabled
    public static List<Opportunity> getOpenOpportunities(String accountId) {
        return [SELECT Id, Name, Amount, CloseDate, StageName 
                FROM Opportunity 
                WHERE AccountId = :accountId AND IsClosed = false 
                ORDER BY CloseDate ASC LIMIT 5];
    }
    
    @AuraEnabled
    public static Map<String, Object> getAccountSummary(String accountId) {
        Map<String, Object> result = new Map<String, Object>();
        
        // Aggregate query for total opportunity amount
        AggregateResult[] oppAmounts = [
            SELECT SUM(Amount) totalAmount 
            FROM Opportunity 
            WHERE AccountId = :accountId
        ];
        
        // Count of related cases
        Integer caseCount = [
            SELECT COUNT() 
            FROM Case 
            WHERE AccountId = :accountId
        ];
        
        result.put('totalOpportunityAmount', oppAmounts[0].get('totalAmount'));
        result.put('openCaseCount', caseCount);
        
        return result;
    }
}