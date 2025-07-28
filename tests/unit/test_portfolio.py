"""
Unit tests for portfolio presets and configurations.
"""

import pytest
from lib.core import PortfolioPreset


class TestPortfolioPreset:
    """Test suite for portfolio preset configurations."""
    
    def test_get_all_portfolios(self):
        """Test retrieval of all portfolio presets."""
        portfolios = PortfolioPreset.get_all()
        
        # Should return exactly 3 portfolios
        assert len(portfolios) == 3
        
        # Check portfolio keys
        expected_keys = ['conservative', 'balanced', 'aggressive']
        assert all(key in portfolios for key in expected_keys)
        
        # Check each portfolio structure
        for key, portfolio in portfolios.items():
            assert hasattr(portfolio, 'name')
            assert hasattr(portfolio, 'expected_return')
            assert hasattr(portfolio, 'std_deviation')
            assert hasattr(portfolio, 'stocks_percentage')
            assert hasattr(portfolio, 'bonds_percentage')
    
    def test_conservative_portfolio(self):
        """Test conservative portfolio configuration."""
        portfolios = PortfolioPreset.get_all()
        conservative = portfolios['conservative']
        
        assert conservative.name == 'Conservative (50/50)'
        assert conservative.stocks_percentage == 50
        assert conservative.bonds_percentage == 50
        assert abs(conservative.expected_return - 0.075) < 0.001
        assert abs(conservative.std_deviation - 0.105) < 0.01
    
    def test_balanced_portfolio(self):
        """Test balanced portfolio configuration."""
        portfolios = PortfolioPreset.get_all()
        balanced = portfolios['balanced']
        
        assert balanced.name == 'Balanced (70/30)'
        assert balanced.stocks_percentage == 70
        assert balanced.bonds_percentage == 30
        assert abs(balanced.expected_return - 0.085) < 0.001
        assert abs(balanced.std_deviation - 0.142) < 0.01
    
    def test_aggressive_portfolio(self):
        """Test aggressive portfolio configuration."""
        portfolios = PortfolioPreset.get_all()
        aggressive = portfolios['aggressive']
        
        assert aggressive.name == 'Aggressive (90/10)'
        assert aggressive.stocks_percentage == 90
        assert aggressive.bonds_percentage == 10
        assert abs(aggressive.expected_return - 0.095) < 0.001
        assert abs(aggressive.std_deviation - 0.181) < 0.01
    
    def test_allocation_consistency(self):
        """Test that stock + bond allocations equal 100%."""
        portfolios = PortfolioPreset.get_all()
        
        for key, portfolio in portfolios.items():
            total_allocation = portfolio.stocks_percentage + portfolio.bonds_percentage
            assert total_allocation == 100, f"{key} portfolio allocations don't sum to 100%"
    
    def test_risk_return_relationship(self):
        """Test that risk and return increase together."""
        portfolios = PortfolioPreset.get_all()
        
        # Order portfolios by expected return
        ordered = [
            portfolios['conservative'],
            portfolios['balanced'],
            portfolios['aggressive']
        ]
        
        # Check that both return and risk increase
        for i in range(len(ordered) - 1):
            assert ordered[i].expected_return < ordered[i + 1].expected_return
            assert ordered[i].std_deviation < ordered[i + 1].std_deviation
            assert ordered[i].stocks_percentage < ordered[i + 1].stocks_percentage