"""
Unit tests for Monte Carlo simulation engine.
Tests core calculation logic without external dependencies.
"""

import pytest
import numpy as np
from lib.core import MonteCarloSimulator


class TestMonteCarloSimulator:
    """Test suite for Monte Carlo simulator."""
    
    def test_initialization(self):
        """Test simulator initialization with valid parameters."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30,
            inflation_rate=0.03,
            management_fee=0.01,
            adjust_for_inflation=True
        )
        
        assert sim.starting_balance == 1000000
        assert sim.annual_return == 0.07
        assert sim.annual_std_dev == 0.15
        assert sim.withdrawal_amount == 40000
        assert sim.years == 30
        assert sim.inflation_rate == 0.03
        assert sim.management_fee == 0.01
        assert sim.adjust_for_inflation is True
    
    def test_basic_simulation(self):
        """Test basic simulation returns expected structure."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30
        )
        
        results = sim.run_simulation(iterations=100)  # Small iteration for speed
        
        # Check structure
        assert 'success_rate' in results
        assert 'median_final_balance' in results
        assert 'average_depletion_year' in results
        assert 'percentile_paths' in results
        assert 'iterations' in results
        assert 'years' in results
        assert 'annual_withdrawal' in results
        assert 'withdrawal_rate' in results
        
        # Check types
        assert isinstance(results['success_rate'], float)
        assert 0 <= results['success_rate'] <= 1
        assert results['iterations'] == 100
        assert results['years'] == 30
        assert results['annual_withdrawal'] == 40000
        assert results['withdrawal_rate'] == 0.04
    
    def test_percentile_paths(self):
        """Test percentile paths calculation."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=10
        )
        
        results = sim.run_simulation(iterations=500)
        paths = results['percentile_paths']
        
        # Check structure
        assert 'p10' in paths
        assert 'p50' in paths
        assert 'p90' in paths
        
        # Check lengths (years + 1 for initial balance)
        assert len(paths['p10']) == 11
        assert len(paths['p50']) == 11
        assert len(paths['p90']) == 11
        
        # Check ordering (p90 should be >= p50 >= p10)
        for i in range(11):
            assert paths['p10'][i] <= paths['p50'][i]
            assert paths['p50'][i] <= paths['p90'][i]
    
    def test_zero_withdrawal(self):
        """Test simulation with zero withdrawal."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=0,
            years=30
        )
        
        results = sim.run_simulation(iterations=100)
        
        # With no withdrawals, success rate should be 100%
        assert results['success_rate'] == 1.0
        assert results['average_depletion_year'] is None
    
    def test_high_withdrawal_rate(self):
        """Test simulation with unsustainably high withdrawal."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=200000,  # 20% withdrawal rate
            years=30
        )
        
        results = sim.run_simulation(iterations=100)
        
        # With 20% withdrawal, success rate should be very low
        assert results['success_rate'] < 0.1
        assert results['average_depletion_year'] is not None
        assert results['average_depletion_year'] < 10
    
    def test_inflation_adjustment(self):
        """Test inflation adjustment on withdrawals."""
        # Without inflation adjustment
        sim_no_inflation = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30,
            inflation_rate=0.03,
            adjust_for_inflation=False
        )
        
        # With inflation adjustment
        sim_with_inflation = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30,
            inflation_rate=0.03,
            adjust_for_inflation=True
        )
        
        results_no_inflation = sim_no_inflation.run_simulation(iterations=500)
        results_with_inflation = sim_with_inflation.run_simulation(iterations=500)
        
        # With inflation adjustment, success rate should be lower
        assert results_with_inflation['success_rate'] < results_no_inflation['success_rate']
    
    def test_management_fee_impact(self):
        """Test impact of management fees."""
        # No management fee
        sim_no_fee = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30,
            management_fee=0.0
        )
        
        # 2% management fee
        sim_with_fee = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30,
            management_fee=0.02
        )
        
        results_no_fee = sim_no_fee.run_simulation(iterations=500)
        results_with_fee = sim_with_fee.run_simulation(iterations=500)
        
        # Higher fees should reduce success rate
        assert results_with_fee['success_rate'] < results_no_fee['success_rate']
    
    def test_sustainable_withdrawal_calculation(self):
        """Test calculation of sustainable withdrawal rate."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.07,
            annual_std_dev=0.15,
            withdrawal_amount=40000,
            years=30
        )
        
        sustainable = sim.calculate_sustainable_withdrawal(target_success_rate=0.7)
        
        # Check it returns a reasonable value
        assert 20000 < sustainable < 60000  # 2-6% range
        
        # Verify it achieves target success rate
        sim.withdrawal_amount = sustainable
        results = sim.run_simulation(iterations=1000)
        assert 0.65 < results['success_rate'] < 0.75  # Within tolerance
    
    def test_deterministic_scenario(self):
        """Test with zero volatility for deterministic results."""
        sim = MonteCarloSimulator(
            starting_balance=1000000,
            annual_return=0.05,
            annual_std_dev=0.0,  # No volatility
            withdrawal_amount=40000,
            years=5,
            management_fee=0.0,
            adjust_for_inflation=False
        )
        
        results = sim.run_simulation(iterations=10)
        
        # With no randomness, all paths should be identical
        paths = results['percentile_paths']
        for i in range(len(paths['p10'])):
            assert paths['p10'][i] == paths['p50'][i]
            assert paths['p50'][i] == paths['p90'][i]
        
        # Calculate expected final balance
        balance = 1000000
        for _ in range(5):
            balance = balance * 1.05 - 40000
        
        assert abs(paths['p50'][-1] - balance) < 1  # Allow for rounding