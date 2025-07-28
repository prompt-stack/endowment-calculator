"""
Pytest configuration and shared fixtures for nonprofit calculator tests.
Following grammar-ops testing patterns.
"""

import pytest
import json
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from lib.core import MonteCarloSimulator, PortfolioPreset


@pytest.fixture
def client():
    """Create Flask test client."""
    app.config['TESTING'] = True
    app.config['SECRET_KEY'] = 'test-secret-key'
    
    with app.test_client() as client:
        with app.app_context():
            yield client


@pytest.fixture
def sample_calculation_params():
    """Standard calculation parameters for testing."""
    return {
        'balance': 1000000,
        'withdrawal_rate': 4.0,
        'withdrawal_method': 'percentage',
        'years': 50,
        'inflation': 3.0
    }


@pytest.fixture
def sample_results():
    """Sample results matching production structure."""
    return {
        'balance': 1000000,
        'years': 50,
        'inflation_rate': 0.03,
        'withdrawal_method': 'percentage',
        'adjust_for_inflation': True,
        'calculation_details': {
            'starting_balance': 1000000,
            'annual_withdrawal': 40000,
            'withdrawal_rate_percent': 4.0,
            'total_withdrawals': 2000000,
            'inflation_adjusted_final_withdrawal': 86840
        },
        'portfolios': {
            'conservative': {
                'portfolio': {
                    'name': 'Conservative (50/50)',
                    'expected_return': 0.075,
                    'std_deviation': 0.125
                },
                'success_rate': 0.45,
                'median_final_balance': 5000000,
                'percentile_10': 1000000,
                'percentile_90': 8000000,
                'annual_withdrawal': 40000,
                'withdrawal_rate': 0.04,
                'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1200000,1400000,1600000,1800000,2000000]}]}'
            },
            'balanced': {
                'portfolio': {
                    'name': 'Balanced (70/30)',
                    'expected_return': 0.085,
                    'std_deviation': 0.15
                },
                'success_rate': 0.53,
                'median_final_balance': 8000000,
                'percentile_10': 2000000,
                'percentile_90': 12000000,
                'annual_withdrawal': 40000,
                'withdrawal_rate': 0.04,
                'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1300000,1600000,1900000,2200000,2500000]}]}'
            },
            'aggressive': {
                'portfolio': {
                    'name': 'Aggressive (90/10)',
                    'expected_return': 0.095,
                    'std_deviation': 0.18
                },
                'success_rate': 0.55,
                'median_final_balance': 12000000,
                'percentile_10': 3000000,
                'percentile_90': 20000000,
                'annual_withdrawal': 40000,
                'withdrawal_rate': 0.04,
                'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1400000,1800000,2200000,2600000,3000000]}]}'
            }
        }
    }


@pytest.fixture
def monte_carlo_simulator():
    """Create a standard Monte Carlo simulator instance."""
    return MonteCarloSimulator(
        starting_balance=1000000,
        annual_return=0.085,
        annual_std_dev=0.15,
        withdrawal_amount=40000,
        years=50,
        inflation_rate=0.03,
        adjust_for_inflation=True
    )


@pytest.fixture
def portfolio_presets():
    """Get all portfolio presets."""
    return PortfolioPreset.get_all()


@pytest.fixture
def lead_data():
    """Sample lead data for testing."""
    return {
        'name': 'John Smith',
        'email': 'john@nonprofit.org',
        'organization': 'Test Foundation',
        'phone': '555-123-4567',
        'calculation_params': {
            'balance': 1000000,
            'withdrawal': 40000,
            'portfolio': 'balanced',
            'years': 50
        }
    }


# Test helpers
def assert_success_rate_in_range(success_rate, min_rate=0.0, max_rate=1.0):
    """Assert success rate is within expected range."""
    assert min_rate <= success_rate <= max_rate, \
        f"Success rate {success_rate} not in range [{min_rate}, {max_rate}]"


def assert_valid_portfolio_results(portfolio_result):
    """Assert portfolio result has all required fields."""
    required_fields = [
        'portfolio', 'success_rate', 'median_final_balance',
        'percentile_10', 'percentile_90', 'projection_data',
        'annual_withdrawal', 'withdrawal_rate'
    ]
    for field in required_fields:
        assert field in portfolio_result, f"Missing required field: {field}"
    
    # Validate success rate
    assert_success_rate_in_range(portfolio_result['success_rate'])
    
    # Validate portfolio info
    assert 'name' in portfolio_result['portfolio']
    assert 'expected_return' in portfolio_result['portfolio']
    assert 'std_deviation' in portfolio_result['portfolio']


def assert_valid_calculation_results(results):
    """Assert calculation results have all required structure."""
    required_fields = [
        'balance', 'years', 'inflation_rate', 'withdrawal_method',
        'adjust_for_inflation', 'portfolios', 'calculation_details'
    ]
    for field in required_fields:
        assert field in results, f"Missing required field: {field}"
    
    # Validate each portfolio
    for key in ['conservative', 'balanced', 'aggressive']:
        assert key in results['portfolios']
        assert_valid_portfolio_results(results['portfolios'][key])