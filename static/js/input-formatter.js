/**
 * @file static/js/input-formatter.js
 * @purpose Format number inputs with commas while maintaining numeric values
 */

// Alpine.js component for formatted number inputs
document.addEventListener('alpine:init', () => {
    Alpine.data('formattedInput', (initialValue = 0) => ({
        displayValue: initialValue.toLocaleString(),
        numericValue: initialValue,
        
        // Update display when user types
        updateValue(event) {
            // Remove non-numeric characters except commas
            let value = event.target.value.replace(/[^0-9,]/g, '');
            
            // Remove commas to get numeric value
            let numeric = parseInt(value.replace(/,/g, '')) || 0;
            
            // Update both values
            this.numericValue = numeric;
            this.displayValue = numeric.toLocaleString();
            
            // Update the display
            event.target.value = this.displayValue;
        },
        
        // Initialize on mount
        init() {
            this.displayValue = this.numericValue.toLocaleString();
        }
    }));
});