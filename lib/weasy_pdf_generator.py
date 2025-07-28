"""
Simplified PDF Generation using WeasyPrint
Professional quality PDFs without the complexity of browser automation
"""
import io
import logging
from datetime import datetime
from weasyprint import HTML, CSS
from flask import render_template_string

logger = logging.getLogger(__name__)

class WeasyPDFGenerator:
    """Professional PDF generator using WeasyPrint"""
    
    def __init__(self):
        self.base_css = '''
        @page {
            size: letter;  /* 8.5in x 11in */
            margin: 0.75in;
            @bottom-center {
                content: "Page " counter(page) " of " counter(pages);
                font-size: 10px;
                color: #666;
            }
            @bottom-right {
                content: "Powered by Zenith Wealth Partners";
                font-size: 10px;
                color: #666;
            }
        }

        /* Page breaks */
        .page-break {
            page-break-before: always;
        }
        
        .no-break {
            page-break-inside: avoid;
        }

        /* Base styles */
        body {
            font-family: 'Arial', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #2d3748;
            background: white;
        }

        /* Zenith colors */
        .color-primary { color: #1a2332; }
        .color-accent { color: #2b6cb0; }
        .color-success { color: #059669; }
        .color-warning { color: #d69e2e; }
        .color-danger { color: #c53030; }

        /* Typography */
        h1 { font-size: 24px; font-weight: bold; color: #1a2332; margin-bottom: 8px; }
        h2 { font-size: 18px; font-weight: bold; color: #1a2332; margin-bottom: 12px; }
        h3 { font-size: 14px; font-weight: bold; color: #1a2332; margin-bottom: 10px; }
        h4 { font-size: 12px; font-weight: bold; color: #1a2332; margin-bottom: 8px; }

        /* Layout components */
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #1a2332;
            padding-bottom: 20px;
        }

        .executive-summary {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 25px;
            border-left: 4px solid #1a2332;
        }

        .summary-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 15px;
        }

        .summary-item {
            text-align: center;
            padding: 12px;
            background: white;
            border-radius: 6px;
            border: 1px solid #e2e8f0;
            flex: 1;
            margin: 0 5px;
        }

        .summary-label {
            font-size: 9px;
            text-transform: uppercase;
            color: #4a5568;
            margin-bottom: 4px;
            letter-spacing: 0.05em;
        }

        .summary-value {
            font-size: 16px;
            font-weight: bold;
            color: #1a2332;
        }

        .success-rate-high { color: #059669; }
        .success-rate-medium { color: #d69e2e; }
        .success-rate-low { color: #c53030; }

        .section {
            margin-bottom: 25px;
        }

        .section-title {
            font-size: 14px;
            font-weight: bold;
            color: #1a2332;
            margin-bottom: 12px;
            padding-bottom: 4px;
            border-bottom: 1px solid #e2e8f0;
        }

        .portfolio-analysis {
            margin-bottom: 20px;
            padding: 15px;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
        }

        .portfolio-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
        }

        .portfolio-success-rate {
            font-size: 18px;
            font-weight: bold;
            text-align: right;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
            font-size: 10px;
        }

        .details-table th,
        .details-table td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
        }

        .details-table th {
            background: #f9fafb;
            font-weight: bold;
            color: #1a2332;
        }

        .details-table .number {
            text-align: right;
            font-weight: 500;
        }

        .recommendation {
            background: #eff6ff;
            border: 2px solid #2b6cb0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }

        .recommendation-title {
            font-size: 12px;
            font-weight: bold;
            color: #2b6cb0;
            margin-bottom: 8px;
        }

        .methodology-box {
            background: #eff6ff;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #2b6cb0;
        }

        .risk-considerations {
            font-size: 10px;
            line-height: 1.5;
        }

        .next-steps {
            background: #f9fafb;
            padding: 15px;
            border-radius: 8px;
        }

        .next-steps ol {
            margin-left: 20px;
            font-size: 10px;
            line-height: 1.6;
        }
        '''

    def generate_comprehensive_report(self, results_data, user_info=None):
        """Generate comprehensive PDF report"""
        try:
            logger.info("Starting WeasyPrint PDF generation")
            
            # Prepare template data
            template_data = {
                'results': results_data,
                'current_date': datetime.now().strftime('%B %d, %Y'),
                'user_info': user_info or {}
            }
            
            # Find best portfolio
            best_success_rate = 0
            best_portfolio_name = 'Balanced (70/30)'
            best_portfolio_key = 'balanced'
            
            for key, portfolio_data in results_data.get('portfolios', {}).items():
                if portfolio_data['success_rate'] > best_success_rate:
                    best_success_rate = portfolio_data['success_rate']
                    best_portfolio_name = portfolio_data['portfolio']['name']
                    best_portfolio_key = key
            
            # HTML template
            html_template = '''
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Endowment Sustainability Analysis</title>
            </head>
            <body>
                <!-- Page 1: Executive Summary -->
                <div class="header">
                    <h1>Endowment Sustainability Analysis</h1>
                    <h2 style="font-size: 14px; color: #4a5568; margin-bottom: 4px;">Comprehensive Investment Strategy Report</h2>
                    <div style="font-size: 11px; color: #4a5568;">Generated on {{ current_date }}</div>
                </div>
                
                <div class="executive-summary no-break">
                    <h3 style="color: #1a2332; margin-bottom: 10px;">Executive Summary</h3>
                    <p style="margin-bottom: 15px;">
                        Analysis of a <strong>${{ "{:,.0f}".format(results.balance) }} endowment</strong> with 
                        <strong>${{ "{:,.0f}".format(results.calculation_details.annual_withdrawal) }} annual withdrawals</strong> 
                        over a {{ results.years }}-year investment horizon.
                    </p>
                    
                    <div class="summary-grid">
                        {% for key, portfolio_data in results.portfolios.items() %}
                        <div class="summary-item">
                            <div class="summary-label">{{ portfolio_data.portfolio.name }}</div>
                            <div class="summary-value {% if portfolio_data.success_rate >= 0.7 %}success-rate-high{% elif portfolio_data.success_rate >= 0.5 %}success-rate-medium{% else %}success-rate-low{% endif %}">
                                {{ "{:.1f}".format(portfolio_data.success_rate * 100) }}%
                            </div>
                        </div>
                        {% endfor %}
                    </div>
                </div>
                
                <div class="recommendation no-break">
                    <div class="recommendation-title">Recommended Strategy: {{ best_portfolio_name }}</div>
                    <p>
                        Based on your {{ results.years }}-year timeline and withdrawal requirements, 
                        the {{ best_portfolio_name|lower }} approach offers the highest success rate at 
                        <strong>{{ "{:.1f}".format(best_success_rate * 100) }}%</strong>. 
                        This strategy provides the optimal balance of growth potential and risk management 
                        for sustainable endowment spending.
                    </p>
                </div>
                
                <!-- Page 2: Portfolio Analysis -->
                <div class="page-break">
                    <div class="section">
                        <h2 class="section-title">Individual Portfolio Analysis</h2>
                        
                        {% for key, portfolio_data in results.portfolios.items() %}
                        <div class="portfolio-analysis no-break">
                            <div class="portfolio-header">
                                <h3>{{ portfolio_data.portfolio.name }} Strategy</h3>
                                <div class="portfolio-success-rate {% if portfolio_data.success_rate >= 0.7 %}success-rate-high{% elif portfolio_data.success_rate >= 0.5 %}success-rate-medium{% else %}success-rate-low{% endif %}">
                                    {{ "{:.1f}".format(portfolio_data.success_rate * 100) }}% Success Rate
                                </div>
                            </div>
                            
                            <p style="font-size: 10px; color: #4a5568; margin-bottom: 10px;">{{ portfolio_data.portfolio.description if portfolio_data.portfolio.get('description') else 'Professional investment strategy' }}</p>
                            
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <div>
                                    <strong>Expected Return:</strong> {{ "{:.1f}".format(portfolio_data.portfolio.expected_return * 100) }}%
                                </div>
                                <div>
                                    <strong>Volatility:</strong> {{ "{:.1f}".format(portfolio_data.portfolio.std_deviation * 100) }}%
                                </div>
                                <div>
                                    <strong>Median Final:</strong> ${{ "{:,.0f}".format(portfolio_data.median_final_balance) }}
                                </div>
                            </div>
                            
                            <div style="background: #f8fafc; padding: 12px; border-radius: 6px; font-size: 10px;">
                                <strong>Analysis:</strong>
                                {% if portfolio_data.success_rate >= 0.8 %}
                                This {{ portfolio_data.portfolio.name|lower }} approach shows excellent sustainability with very high confidence for maintaining your spending plan.
                                {% elif portfolio_data.success_rate >= 0.7 %}
                                This {{ portfolio_data.portfolio.name|lower }} strategy offers solid confidence for your spending goals with reasonable growth.
                                {% elif portfolio_data.success_rate >= 0.5 %}
                                This {{ portfolio_data.portfolio.name|lower }} approach carries moderate risk. Consider adjustments for higher confidence.
                                {% else %}
                                This {{ portfolio_data.portfolio.name|lower }} strategy shows significant sustainability challenges and may require reducing withdrawals.
                                {% endif %}
                            </div>
                        </div>
                        {% endfor %}
                    </div>
                </div>
                
                <!-- Page 3: Technical Details -->
                <div class="page-break">
                    <div class="section">
                        <h2 class="section-title">Calculation Details</h2>
                        
                        <table class="details-table">
                            <thead>
                                <tr>
                                    <th>Parameter</th>
                                    <th>Value</th>
                                    <th>Notes</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Starting Balance</td>
                                    <td class="number">${{ "{:,.0f}".format(results.calculation_details.starting_balance) }}</td>
                                    <td>Initial endowment value</td>
                                </tr>
                                <tr>
                                    <td>Annual Withdrawal</td>
                                    <td class="number">${{ "{:,.0f}".format(results.calculation_details.annual_withdrawal) }}</td>
                                    <td>{{ "{:.1f}".format(results.calculation_details.withdrawal_rate_percent) }}% of initial balance</td>
                                </tr>
                                <tr>
                                    <td>Time Horizon</td>
                                    <td class="number">{{ results.years }} years</td>
                                    <td>Investment planning period</td>
                                </tr>
                                <tr>
                                    <td>Inflation Rate</td>
                                    <td class="number">{{ "{:.1f}".format(results.inflation_rate * 100) }}%</td>
                                    <td>Annual inflation assumption</td>
                                </tr>
                                <tr>
                                    <td>Total Withdrawals</td>
                                    <td class="number">${{ "{:,.0f}".format(results.calculation_details.total_withdrawals) }}</td>
                                    <td>Cumulative over {{ results.years }} years</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="section no-break">
                        <h2 class="section-title">Methodology</h2>
                        <div class="methodology-box">
                            <h4 style="color: #2b6cb0; margin-bottom: 8px;">Monte Carlo Simulation</h4>
                            <p style="margin-bottom: 10px;">
                                This analysis employs <strong>5,000 Monte Carlo simulations</strong> to model potential outcomes 
                                for your endowment over the {{ results.years }}-year period. Each simulation uses:
                            </p>
                            <ul style="margin-left: 20px; margin-bottom: 10px; font-size: 10px;">
                                <li>Historical market volatility patterns</li>
                                <li>Portfolio-specific expected returns and standard deviations</li>
                                <li>{{ "{:.1%}".format(results.inflation_rate) }} annual inflation adjustment</li>
                                <li>1% annual management fees</li>
                            </ul>
                            <p style="font-size: 10px;">
                                The success rate represents the percentage of scenarios where your endowment successfully 
                                maintains the required withdrawals for the full time period without depletion.
                            </p>
                        </div>
                    </div>
                    
                    <div class="section no-break">
                        <h2 class="section-title">Risk Considerations</h2>
                        <div class="risk-considerations">
                            <p style="margin-bottom: 8px;">
                                <strong>Market Risk:</strong> Past performance does not guarantee future results. 
                                Market conditions can vary significantly from historical patterns.
                            </p>
                            <p style="margin-bottom: 8px;">
                                <strong>Inflation Risk:</strong> Actual inflation may differ from the {{ "{:.1%}".format(results.inflation_rate) }} 
                                assumption used in this analysis.
                            </p>
                            <p style="margin-bottom: 8px;">
                                <strong>Model Limitations:</strong> Monte Carlo simulations provide probabilistic estimates 
                                based on historical data and may not capture all potential market scenarios.
                            </p>
                        </div>
                    </div>
                    
                    <div class="section no-break">
                        <h2 class="section-title">Next Steps</h2>
                        <div class="next-steps">
                            <ol>
                                <li>Review the recommended investment strategy with your board</li>
                                <li>Consider your organization's risk tolerance and mission requirements</li>
                                <li>Consult with qualified investment professionals for implementation</li>
                                <li>Establish regular monitoring and rebalancing procedures</li>
                                <li>Review and update projections annually or when circumstances change</li>
                            </ol>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            '''
            
            # Add best portfolio data to template
            template_data['best_portfolio_name'] = best_portfolio_name
            template_data['best_success_rate'] = best_success_rate
            
            # Render HTML
            html_content = render_template_string(html_template, **template_data)
            
            # Generate PDF
            html_doc = HTML(string=html_content)
            css_doc = CSS(string=self.base_css)
            
            pdf_buffer = html_doc.write_pdf(stylesheets=[css_doc])
            
            logger.info(f"PDF generated successfully, size: {len(pdf_buffer)} bytes")
            return pdf_buffer
            
        except Exception as e:
            logger.error(f"Error generating WeasyPrint PDF: {str(e)}")
            raise

# Singleton instance
weasy_pdf_generator = WeasyPDFGenerator()