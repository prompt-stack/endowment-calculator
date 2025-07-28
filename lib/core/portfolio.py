"""
Portfolio models and presets for nonprofit endowments.
Defines standard portfolio allocations with expected returns and volatility.
"""

from typing import Dict, Optional
import json
import os


class Portfolio:
    """Represents an investment portfolio allocation."""
    
    def __init__(
        self,
        name: str,
        stocks_percentage: float,
        bonds_percentage: float,
        expected_return: Optional[float] = None,
        std_deviation: Optional[float] = None
    ):
        """
        Initialize portfolio.
        
        Args:
            name: Portfolio name (e.g., "Conservative", "Balanced")
            stocks_percentage: Percentage in stocks (0-100)
            bonds_percentage: Percentage in bonds (0-100)
            expected_return: Annual expected return (calculated if not provided)
            std_deviation: Annual standard deviation (calculated if not provided)
        """
        self.name = name
        self.stocks_percentage = stocks_percentage
        self.bonds_percentage = bonds_percentage
        
        # Historical assumptions
        STOCK_RETURN = 0.10  # 10% historical stock return
        BOND_RETURN = 0.05   # 5% historical bond return
        STOCK_STD = 0.20     # 20% stock volatility
        BOND_STD = 0.05      # 5% bond volatility
        CORRELATION = 0.1    # Low correlation between stocks and bonds
        
        # Calculate expected return if not provided
        if expected_return is None:
            stock_weight = stocks_percentage / 100
            bond_weight = bonds_percentage / 100
            self.expected_return = (stock_weight * STOCK_RETURN + 
                                   bond_weight * BOND_RETURN)
        else:
            self.expected_return = expected_return
            
        # Calculate standard deviation if not provided
        if std_deviation is None:
            stock_weight = stocks_percentage / 100
            bond_weight = bonds_percentage / 100
            
            # Portfolio variance formula
            variance = (
                (stock_weight ** 2) * (STOCK_STD ** 2) +
                (bond_weight ** 2) * (BOND_STD ** 2) +
                2 * stock_weight * bond_weight * CORRELATION * STOCK_STD * BOND_STD
            )
            self.std_deviation = variance ** 0.5
        else:
            self.std_deviation = std_deviation
    
    def to_dict(self) -> Dict:
        """Convert portfolio to dictionary."""
        return {
            'name': self.name,
            'stocks_percentage': self.stocks_percentage,
            'bonds_percentage': self.bonds_percentage,
            'expected_return': self.expected_return,
            'std_deviation': self.std_deviation,
            'risk_level': self.get_risk_level()
        }
    
    def get_risk_level(self) -> str:
        """Categorize risk level based on stock allocation."""
        if self.stocks_percentage <= 30:
            return "Conservative"
        elif self.stocks_percentage <= 60:
            return "Moderate" 
        elif self.stocks_percentage <= 80:
            return "Balanced"
        else:
            return "Aggressive"


class PortfolioPreset:
    """Manages preset portfolio configurations."""
    
    PRESETS = {
        'conservative': Portfolio(
            name="Conservative (50/50)",
            stocks_percentage=50,
            bonds_percentage=50
        ),
        'balanced': Portfolio(
            name="Balanced (70/30)",
            stocks_percentage=70,
            bonds_percentage=30
        ),
        'aggressive': Portfolio(
            name="Aggressive (90/10)",
            stocks_percentage=90,
            bonds_percentage=10
        )
    }
    
    @classmethod
    def get_all(cls) -> Dict[str, Portfolio]:
        """Get all preset portfolios."""
        return cls.PRESETS
    
    @classmethod
    def get(cls, key: str) -> Optional[Portfolio]:
        """Get specific preset portfolio."""
        return cls.PRESETS.get(key)
    
    @classmethod
    def save_to_json(cls, filepath: str):
        """Save presets to JSON file."""
        data = {
            key: portfolio.to_dict() 
            for key, portfolio in cls.PRESETS.items()
        }
        with open(filepath, 'w') as f:
            json.dump(data, f, indent=2)