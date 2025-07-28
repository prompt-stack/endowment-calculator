/**
 * @file static/js/calculator.js
 * @purpose Calculator utilities and number formatting
 */

// Format number with commas
function formatNumber(num) {
    return Math.round(num).toLocaleString();
}

// Format currency
function formatCurrency(num) {
    return '$' + formatNumber(num);
}

// Alpine.js data for calculator
document.addEventListener('alpine:init', () => {
    Alpine.data('calculator', () => ({
        balance: 1000000,
        method: 'percentage',
        rate: 4,
        amount: 40000,
        amountDisplay: '40,000',
        
        // Computed withdrawal amount
        get withdrawalAmount() {
            if (this.method === 'percentage') {
                return this.balance * (this.rate / 100);
            }
            return this.amount;
        },
        
        // Computed withdrawal rate
        get withdrawalRate() {
            return (this.withdrawalAmount / this.balance * 100).toFixed(1);
        },
        
        // Format balance for display
        get formattedBalance() {
            return formatCurrency(this.balance);
        },
        
        // Format withdrawal for display
        get formattedWithdrawal() {
            return formatCurrency(this.withdrawalAmount);
        },
        
        // Handle formatted input
        updateAmount(event) {
            // Get the input value and remove commas
            let value = event.target.value.replace(/,/g, '');
            
            // Parse to number
            let numeric = parseInt(value) || 0;
            
            // Update the numeric value
            this.amount = numeric;
            
            // Format and update display
            this.amountDisplay = numeric.toLocaleString();
            event.target.value = this.amountDisplay;
        },
        
        // Initialize formatted display
        init() {
            this.amountDisplay = this.amount.toLocaleString();
        }
    }));
});