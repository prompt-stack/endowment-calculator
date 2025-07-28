"""
Monte Carlo simulation engine for nonprofit spending analysis.
Simulates thousands of market scenarios to calculate probability of portfolio survival.
"""

import numpy as np
from typing import Dict, List, Tuple, Optional
import json


class MonteCarloSimulator:
    """Runs Monte Carlo simulations for nonprofit endowment spending scenarios."""
    
    def __init__(
        self,
        starting_balance: float,
        annual_return: float,
        annual_std_dev: float,
        withdrawal_amount: float,
        years: int,
        inflation_rate: float = 0.03,
        management_fee: float = 0.01,
        adjust_for_inflation: bool = True
    ):
        """
        Initialize Monte Carlo simulator.
        
        Args:
            starting_balance: Initial endowment amount
            annual_return: Expected annual return (e.g., 0.065 for 6.5%)
            annual_std_dev: Annual standard deviation of returns
            withdrawal_amount: Annual withdrawal in dollars
            years: Number of years to simulate
            inflation_rate: Annual inflation rate (default 3%)
            management_fee: Annual management fee (default 1%)
            adjust_for_inflation: Whether to adjust withdrawals for inflation (default True)
        """
        self.starting_balance = starting_balance
        self.annual_return = annual_return
        self.annual_std_dev = annual_std_dev
        self.withdrawal_amount = withdrawal_amount
        self.years = years
        self.inflation_rate = inflation_rate
        self.management_fee = management_fee
        self.adjust_for_inflation = adjust_for_inflation
        
    def run_simulation(self, iterations: int = 5000) -> Dict:
        """
        Run Monte Carlo simulation.
        
        Args:
            iterations: Number of scenarios to simulate
            
        Returns:
            Dictionary with simulation results
        """
        # Initialize results storage
        final_balances = []
        depletion_years = []
        all_paths = []
        
        for _ in range(iterations):
            balance = self.starting_balance
            path = [balance]
            depleted_year = None
            
            for year in range(1, self.years + 1):
                # Generate random market return
                market_return = np.random.normal(
                    self.annual_return, 
                    self.annual_std_dev
                )
                
                # Apply returns and fees
                balance *= (1 + market_return - self.management_fee)
                
                # Adjust withdrawal for inflation (if enabled)
                if self.adjust_for_inflation:
                    inflated_withdrawal = self.withdrawal_amount * ((1 + self.inflation_rate) ** (year - 1))
                else:
                    inflated_withdrawal = self.withdrawal_amount
                
                # Make withdrawal
                balance -= inflated_withdrawal
                
                # Check if depleted
                if balance <= 0 and depleted_year is None:
                    depleted_year = year
                    balance = 0
                    
                path.append(max(0, balance))
            
            final_balances.append(balance)
            depletion_years.append(depleted_year)
            all_paths.append(path)
        
        # Calculate statistics
        success_rate = sum(1 for b in final_balances if b > 0) / iterations
        median_final = np.median([b for b in final_balances if b > 0]) if success_rate > 0 else 0
        
        # Calculate percentile paths
        all_paths_array = np.array(all_paths)
        percentile_10 = np.percentile(all_paths_array, 10, axis=0)
        percentile_50 = np.percentile(all_paths_array, 50, axis=0)
        percentile_90 = np.percentile(all_paths_array, 90, axis=0)
        
        return {
            'success_rate': success_rate,
            'median_final_balance': median_final,
            'average_depletion_year': np.mean([y for y in depletion_years if y is not None]) if any(depletion_years) else None,
            'percentile_paths': {
                'p10': percentile_10.tolist(),
                'p50': percentile_50.tolist(),
                'p90': percentile_90.tolist()
            },
            'iterations': iterations,
            'years': self.years,
            'annual_withdrawal': self.withdrawal_amount,
            'withdrawal_rate': self.withdrawal_amount / self.starting_balance
        }
    
    def calculate_sustainable_withdrawal(self, target_success_rate: float = 0.7) -> float:
        """
        Calculate sustainable withdrawal amount for target success rate.
        
        Args:
            target_success_rate: Desired probability of success (default 70%)
            
        Returns:
            Sustainable annual withdrawal amount
        """
        # Binary search for optimal withdrawal
        low = 0
        high = self.starting_balance * 0.1  # Max 10% withdrawal
        
        while high - low > 100:  # Within $100 accuracy
            mid = (low + high) / 2
            self.withdrawal_amount = mid
            result = self.run_simulation(1000)  # Fewer iterations for speed
            
            if result['success_rate'] < target_success_rate:
                high = mid
            else:
                low = mid
                
        return low