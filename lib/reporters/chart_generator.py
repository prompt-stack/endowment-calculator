"""
@file lib/reporters/chart_generator.py
@module_type reporter
@deps []
@exports [generate_projection_chart, generate_probability_chart]
"""

import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import io
import base64
from typing import Dict, List


def generate_projection_chart(percentile_paths: Dict[str, List[float]], years: int) -> str:
    """
    Generate a projection chart showing portfolio value over time.
    Returns base64-encoded PNG image.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(10, 6))
    
    # Years array
    years_array = list(range(years + 1))
    
    # Plot percentile paths
    ax.fill_between(years_array, percentile_paths['p10'], percentile_paths['p90'], 
                    alpha=0.2, color='#3b82f6', label='10th-90th Percentile Range')
    ax.plot(years_array, percentile_paths['p50'], color='#dc2626', linewidth=2.5, 
            label='Median (50th Percentile)')
    ax.plot(years_array, percentile_paths['p90'], color='#059669', linewidth=1, 
            linestyle='--', alpha=0.7, label='90th Percentile')
    ax.plot(years_array, percentile_paths['p10'], color='#d97706', linewidth=1, 
            linestyle='--', alpha=0.7, label='10th Percentile')
    
    # Formatting
    ax.set_xlabel('Years', fontsize=12)
    ax.set_ylabel('Portfolio Value ($)', fontsize=12)
    ax.set_title('Portfolio Value Projection - Monte Carlo Simulation', fontsize=14, pad=20)
    
    # Format y-axis as currency
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1e6:.1f}M' if x >= 1e6 else f'${x/1e3:.0f}K'))
    
    # Grid and legend
    ax.grid(True, alpha=0.3)
    ax.legend(loc='upper left', frameon=True, fancybox=True, shadow=True)
    
    # Add zero line
    ax.axhline(y=0, color='black', linewidth=0.5, alpha=0.5)
    
    # Tight layout
    plt.tight_layout()
    
    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return f"data:image/png;base64,{image_base64}"


def generate_income_chart(balance: float, withdrawal: float, years: int, growth_rate: float) -> str:
    """
    Generate an income by source chart similar to Nitrogen.
    Returns base64-encoded PNG image.
    """
    plt.style.use('seaborn-v0_8-whitegrid')
    fig, ax = plt.subplots(figsize=(10, 6))
    
    years_array = list(range(years + 1))
    
    # Calculate values
    portfolio_values = []
    withdrawal_values = []
    current_balance = balance
    
    for year in range(years + 1):
        portfolio_values.append(current_balance)
        annual_withdrawal = withdrawal * ((1.03) ** year)  # Inflation-adjusted
        withdrawal_values.append(annual_withdrawal)
        current_balance = current_balance * (1 + growth_rate) - annual_withdrawal
        if current_balance < 0:
            current_balance = 0
    
    # Create stacked area chart
    ax.fill_between(years_array, 0, portfolio_values, alpha=0.7, color='#3b82f6', label='Portfolio Value')
    
    # Add withdrawal line
    bar_width = 0.8
    bars = ax.bar(years_array[1:], withdrawal_values[1:], bar_width, 
                   color='#10b981', alpha=0.8, label='Annual Withdrawal')
    
    # Formatting
    ax.set_xlabel('Years', fontsize=12)
    ax.set_ylabel('Value ($)', fontsize=12)
    ax.set_title('Portfolio Value and Annual Withdrawals', fontsize=14, pad=20)
    
    # Format y-axis as currency
    ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1e6:.1f}M' if x >= 1e6 else f'${x/1e3:.0f}K'))
    
    # Grid and legend
    ax.grid(True, alpha=0.3, axis='y')
    ax.legend(loc='upper right', frameon=True, fancybox=True, shadow=True)
    
    plt.tight_layout()
    
    # Convert to base64
    buffer = io.BytesIO()
    plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
    buffer.seek(0)
    image_base64 = base64.b64encode(buffer.getvalue()).decode()
    plt.close()
    
    return f"data:image/png;base64,{image_base64}"