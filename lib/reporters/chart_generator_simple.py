"""
@file lib/reporters/chart_generator_simple.py
@module_type reporter
@deps []
@exports [generate_svg_chart, generate_projection_data]
"""

from typing import Dict, List
import json


def generate_projection_data(percentile_paths: Dict[str, List[float]], years: int) -> str:
    """
    Generate chart data as JSON for client-side rendering.
    """
    # Prepare data for JavaScript charting
    chart_data = {
        'labels': list(range(years + 1)),
        'datasets': [
            {
                'label': '90th Percentile',
                'data': percentile_paths['p90'],
                'borderColor': '#059669',
                'backgroundColor': 'transparent',
                'borderDash': [5, 5]
            },
            {
                'label': 'Median (50th)',
                'data': percentile_paths['p50'],
                'borderColor': '#dc2626',
                'backgroundColor': 'transparent',
                'borderWidth': 3
            },
            {
                'label': '10th Percentile',
                'data': percentile_paths['p10'],
                'borderColor': '#d97706',
                'backgroundColor': 'transparent',
                'borderDash': [5, 5]
            }
        ]
    }
    
    return json.dumps(chart_data)


def generate_svg_chart(balance: float, withdrawal: float, years: int, success_rate: float) -> str:
    """
    Generate a simple SVG chart showing the probability visualization.
    """
    # Calculate bar height based on success rate
    bar_height = int(success_rate * 200)
    
    # Determine color based on success rate
    if success_rate >= 0.7:
        color = '#059669'  # green
    elif success_rate >= 0.5:
        color = '#d97706'  # yellow
    else:
        color = '#dc2626'  # red
    
    svg = f'''
    <svg viewBox="0 0 400 250" style="width: 100%; max-width: 400px; height: auto;">
        <!-- Background grid -->
        <defs>
            <pattern id="grid" width="40" height="25" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 25" fill="none" stroke="#e5e7eb" stroke-width="1"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        <!-- Y-axis labels -->
        <text x="10" y="15" font-size="12" fill="#6b7280">100%</text>
        <text x="10" y="65" font-size="12" fill="#6b7280">75%</text>
        <text x="10" y="115" font-size="12" fill="#6b7280">50%</text>
        <text x="10" y="165" font-size="12" fill="#6b7280">25%</text>
        <text x="10" y="215" font-size="12" fill="#6b7280">0%</text>
        
        <!-- Success rate bar -->
        <rect x="100" y="{200 - bar_height}" width="200" height="{bar_height}" 
              fill="{color}" opacity="0.8" rx="4">
            <animate attributeName="height" from="0" to="{bar_height}" dur="0.5s" fill="freeze"/>
            <animate attributeName="y" from="200" to="{200 - bar_height}" dur="0.5s" fill="freeze"/>
        </rect>
        
        <!-- Success rate text -->
        <text x="200" y="{190 - bar_height}" font-size="24" font-weight="bold" 
              text-anchor="middle" fill="{color}">
            {success_rate:.1%}
        </text>
        
        <!-- Label -->
        <text x="200" y="235" font-size="14" text-anchor="middle" fill="#374151">
            Probability of Success
        </text>
    </svg>
    '''
    
    return svg.strip()