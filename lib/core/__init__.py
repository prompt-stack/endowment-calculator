"""
Core module for nonprofit spending calculator.
Following grammar-ops patterns for module organization.
"""

"""Core module for nonprofit spending calculator."""

from .monte_carlo import MonteCarloSimulator
from .portfolio import Portfolio, PortfolioPreset

__all__ = ['MonteCarloSimulator', 'Portfolio', 'PortfolioPreset']