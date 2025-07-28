#!/usr/bin/env python3
"""
Flask web application for nonprofit spending calculator.
Simple, lightweight implementation using HTMX for interactivity.
"""

from flask import Flask, render_template, request, jsonify, send_file, make_response, session
from flask_cors import CORS
import json
import os
import io
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from lib.core import MonteCarloSimulator, PortfolioPreset
from lib.core.portfolio import Portfolio
from lib.reporters.chart_generator_simple import generate_projection_data
from lib.simple_pdf_generator import simple_pdf_generator

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')

# Enable CORS for React frontend
CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://127.0.0.1:8080', 'http://frontend:80'])

# Load portfolio data
with open('data/portfolios.json', 'r') as f:
    portfolio_json = json.load(f)
    PORTFOLIO_DATA = portfolio_json['presets']

# Simple JSON file for leads (no database for MVP)
LEADS_FILE = 'data/leads.json'


def save_lead(email, organization, calculation_params):
    """Save lead information to JSON file."""
    leads = []
    if os.path.exists(LEADS_FILE):
        with open(LEADS_FILE, 'r') as f:
            leads = json.load(f)
    
    lead = {
        'email': email,
        'organization': organization,
        'params': calculation_params,
        'timestamp': datetime.now().isoformat(),
        'id': len(leads) + 1
    }
    
    leads.append(lead)
    
    with open(LEADS_FILE, 'w') as f:
        json.dump(leads, f, indent=2)
    
    return lead


@app.route('/showcase')
def showcase():
    """Product showcase page showing different interaction models."""
    return render_template('showcase.html', current_page='showcase')

@app.route('/')
def index():
    """Main calculator page."""
    portfolios = PortfolioPreset.get_all()
    return render_template('index.html', portfolios=portfolios, current_page='calculator')


@app.route('/test')
def test():
    """Test route to verify app is working."""
    return jsonify({
        'status': 'ok',
        'portfolios': len(PortfolioPreset.get_all()),
        'message': 'App is running'
    })


@app.route('/calculate', methods=['POST'])
def calculate():
    """Run Monte Carlo simulation for all three portfolios and return comparative results."""
    try:
        # Get form data
        balance = float(request.form.get('balance', 1000000))
        withdrawal_method = request.form.get('withdrawal_method', 'percentage')
        
        if withdrawal_method == 'percentage':
            withdrawal_rate = float(request.form.get('withdrawal_rate', 4)) / 100
            withdrawal = balance * withdrawal_rate
        else:
            withdrawal = float(request.form.get('withdrawal_amount', 40000))
            withdrawal_rate = withdrawal / balance
        
        years = int(request.form.get('years', 50))
        inflation = float(request.form.get('inflation', 3)) / 100
        
        # For percentage withdrawals, adjust for inflation (withdrawal grows with portfolio)
        # For fixed amounts, don't adjust for inflation (withdrawal stays fixed)
        adjust_for_inflation = (withdrawal_method == 'percentage')
        
        # Run simulations for all three portfolios
        all_portfolios = PortfolioPreset.get_all()
        portfolio_results = {}
        
        for key, portfolio in all_portfolios.items():
            simulator = MonteCarloSimulator(
                starting_balance=balance,
                annual_return=portfolio.expected_return,
                annual_std_dev=portfolio.std_deviation,
                withdrawal_amount=withdrawal,
                years=years,
                inflation_rate=inflation,
                adjust_for_inflation=adjust_for_inflation
            )
            
            simulation_results = simulator.run_simulation(5000)  # Full accuracy for all
            
            # Generate visualization data for each portfolio
            projection_data = generate_projection_data(simulation_results['percentile_paths'], years)
            
            portfolio_results[key] = {
                'portfolio': portfolio.to_dict(),
                'success_rate': simulation_results['success_rate'],
                'median_final_balance': simulation_results['median_final_balance'],
                'percentile_10': simulation_results['percentile_paths']['p10'][-1],  # Final balance at 10th percentile
                'percentile_90': simulation_results['percentile_paths']['p90'][-1],  # Final balance at 90th percentile
                'projection_data': projection_data,
                'annual_withdrawal': simulation_results['annual_withdrawal'],
                'withdrawal_rate': simulation_results['withdrawal_rate']
            }
        
        # Prepare comprehensive results
        results = {
            'balance': balance,
            'years': years,
            'inflation_rate': inflation,
            'withdrawal_method': withdrawal_method,
            'adjust_for_inflation': adjust_for_inflation,
            'portfolios': portfolio_results,
            'calculation_details': {
                'starting_balance': balance,
                'annual_withdrawal': withdrawal,
                'withdrawal_rate_percent': withdrawal_rate * 100,
                'total_withdrawals': withdrawal * years,
                'inflation_adjusted_final_withdrawal': withdrawal * ((1 + inflation) ** years) if adjust_for_inflation else withdrawal
            }
        }
        
        # Store only essential results in session for web report
        # Reduce size to avoid cookie limits
        session['latest_results'] = {
            'balance': results['balance'],
            'years': results['years'],
            'inflation_rate': results['inflation_rate'],
            'calculation_details': results['calculation_details'],
            'portfolios': {
                key: {
                    'portfolio': portfolio['portfolio'],
                    'success_rate': portfolio['success_rate'],
                    'median_final_balance': portfolio['median_final_balance'],
                    'projection_data': portfolio['projection_data']
                }
                for key, portfolio in results['portfolios'].items()
            }
        }
        
        # Return comprehensive results template
        return render_template('partials/comprehensive_results.html', results=results)
        
    except Exception as e:
        # Return error message
        app.logger.error(f"Error in calculate: {str(e)}")
        return f"<div class='card'><h3>Error</h3><p>An error occurred: {str(e)}</p></div>", 500


@app.route('/compare', methods=['POST'])
def compare_scenarios():
    """Compare all portfolio scenarios."""
    try:
        # Get form data - using same logic as /calculate endpoint
        balance = float(request.form.get('balance', 1000000))
        withdrawal = float(request.form.get('withdrawal', 40000))
        withdrawal_method = request.form.get('withdrawal_method', 'percentage')
        years = int(request.form.get('years', 50))
        inflation = float(request.form.get('inflation', 3)) / 100  # Same as /calculate
        
        # IMPORTANT: Use same inflation adjustment logic as /calculate
        # For percentage withdrawals, adjust for inflation (withdrawal grows with portfolio)
        # For fixed amounts, don't adjust for inflation (withdrawal stays fixed)
        adjust_for_inflation = (withdrawal_method == 'percentage')
        
        scenarios = []
        
        for key, portfolio in PortfolioPreset.get_all().items():
            simulator = MonteCarloSimulator(
                starting_balance=balance,
                annual_return=portfolio.expected_return,
                annual_std_dev=portfolio.std_deviation,
                withdrawal_amount=withdrawal,
                years=years,
                inflation_rate=inflation,
                adjust_for_inflation=adjust_for_inflation  # Now matches /calculate exactly
            )
            
            result = simulator.run_simulation(5000)  # Full accuracy for comparison
            
            scenarios.append({
                'portfolio': portfolio.to_dict(),
                'success_rate': result['success_rate'],
                'median_final': result['median_final_balance']
            })
        
        return render_template('partials/comparison.html', scenarios=scenarios)
        
    except Exception as e:
        app.logger.error(f"Error in compare: {str(e)}")
        return f"<div class='card'><h3>Error</h3><p>An error occurred: {str(e)}</p></div>", 500


@app.route('/report-preview')
def report_preview():
    """Professional report preview page to showcase value before lead capture."""
    # Get results from session or use sample data
    results = session.get('latest_results')
    if not results:
        # Sample data for preview
        results = {
            'balance': 1000000,
            'calculation_details': {
                'starting_balance': 1000000,
                'annual_withdrawal': 40000,
                'withdrawal_rate_percent': 4.0,
                'total_withdrawals': 2000000,
                'inflation_adjusted_final_withdrawal': 86840
            },
            'years': 50,
            'inflation_rate': 0.03,
            'adjust_for_inflation': True,
            'portfolios': {
                'conservative': {
                    'success_rate': 0.435,
                    'portfolio': {'name': 'Conservative (50/50)', 'expected_return': 0.075, 'std_deviation': 0.125},
                    'median_final_balance': 5000000,
                    'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1200000,1400000,1600000,1800000,2000000]}, {"data": [1000000,1100000,1200000,1300000,1400000,1500000]}, {"data": [1000000,1000000,1000000,1000000,1000000,1000000]}]}'
                },
                'balanced': {
                    'success_rate': 0.538,
                    'portfolio': {'name': 'Balanced (70/30)', 'expected_return': 0.085, 'std_deviation': 0.15},
                    'median_final_balance': 8000000,
                    'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1300000,1600000,1900000,2200000,2500000]}, {"data": [1000000,1150000,1300000,1450000,1600000,1750000]}, {"data": [1000000,950000,900000,850000,800000,750000]}]}'
                },
                'aggressive': {
                    'success_rate': 0.562,
                    'portfolio': {'name': 'Aggressive (90/10)', 'expected_return': 0.095, 'std_deviation': 0.18},
                    'median_final_balance': 12000000,
                    'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1400000,1800000,2200000,2600000,3000000]}, {"data": [1000000,1200000,1400000,1600000,1800000,2000000]}, {"data": [1000000,900000,800000,700000,600000,500000]}]}'
                }
            }
        }
    
    return render_template('report_preview.html', results=results, current_date=datetime.now().strftime('%B %d, %Y'), current_page='preview')

@app.route('/pdf-template')
def pdf_template():
    """PDF template route for rendering (like Reactive Resume's /artboard/preview)."""
    # Sample data for PDF template testing
    sample_results = {
        'balance': 1000000,
        'calculation_details': {
            'starting_balance': 1000000,
            'annual_withdrawal': 40000,
            'withdrawal_rate_percent': 4.0,
            'total_withdrawals': 2000000,
            'inflation_adjusted_final_withdrawal': 86840
        },
        'years': 50,
        'inflation_rate': 0.03,
        'adjust_for_inflation': True,
        'portfolios': {
            'conservative': {
                'success_rate': 0.45,
                'portfolio': {'name': 'Conservative (50/50)', 'expected_return': 0.075, 'std_deviation': 0.125},
                'median_final_balance': 5000000,
                'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1200000,1400000,1600000,1800000,2000000]}, {"data": [1000000,1100000,1200000,1300000,1400000,1500000]}, {"data": [1000000,1000000,1000000,1000000,1000000,1000000]}]}'
            },
            'balanced': {
                'success_rate': 0.53,
                'portfolio': {'name': 'Balanced (70/30)', 'expected_return': 0.085, 'std_deviation': 0.15},
                'median_final_balance': 8000000,
                'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1300000,1600000,1900000,2200000,2500000]}, {"data": [1000000,1150000,1300000,1450000,1600000,1750000]}, {"data": [1000000,950000,900000,850000,800000,750000]}]}'
            },
            'aggressive': {
                'success_rate': 0.55,
                'portfolio': {'name': 'Aggressive (90/10)', 'expected_return': 0.095, 'std_deviation': 0.18},
                'median_final_balance': 12000000,
                'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1400000,1800000,2200000,2600000,3000000]}, {"data": [1000000,1200000,1400000,1600000,1800000,2000000]}, {"data": [1000000,900000,800000,700000,600000,500000]}]}'
            }
        }
    }
    
    from datetime import datetime
    return render_template('pdf_report.html', 
                         results=sample_results,
                         current_date=datetime.now().strftime('%B %d, %Y'))


@app.route('/download-report', methods=['POST'])
def download_report():
    """Generate and send professional PDF report."""
    try:
        email = request.form.get('email')
        name = request.form.get('name', 'User')
        organization = request.form.get('organization', 'Organization')
        
        # Get comprehensive results data from hidden fields
        portfolio = request.form.get('portfolio', 'comprehensive')
        
        # Reconstruct results data for PDF generation
        results_data = {
            'balance': float(request.form.get('balance', 1000000)),
            'calculation_details': {
                'starting_balance': float(request.form.get('balance', 1000000)),
                'annual_withdrawal': float(request.form.get('withdrawal', 40000)),
                'withdrawal_rate_percent': (float(request.form.get('withdrawal', 40000)) / float(request.form.get('balance', 1000000))) * 100,
                'total_withdrawals': float(request.form.get('withdrawal', 40000)) * int(request.form.get('years', 50)),
                'inflation_adjusted_final_withdrawal': float(request.form.get('withdrawal', 40000)) * (1.03 ** int(request.form.get('years', 50)))
            },
            'years': int(request.form.get('years', 50)),
            'inflation_rate': 0.03,
            'adjust_for_inflation': True,
            'portfolios': {
                'conservative': {
                    'success_rate': float(request.form.get('conservative_success_rate', 0.45)),
                    'portfolio': {'name': 'Conservative (50/50)', 'expected_return': 0.075, 'std_deviation': 0.125},
                    'median_final_balance': 5000000,
                    'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1200000,1400000,1600000,1800000,2000000]}, {"data": [1000000,1100000,1200000,1300000,1400000,1500000]}, {"data": [1000000,1000000,1000000,1000000,1000000,1000000]}]}'
                },
                'balanced': {
                    'success_rate': float(request.form.get('balanced_success_rate', 0.53)),
                    'portfolio': {'name': 'Balanced (70/30)', 'expected_return': 0.085, 'std_deviation': 0.15},
                    'median_final_balance': 8000000,
                    'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1300000,1600000,1900000,2200000,2500000]}, {"data": [1000000,1150000,1300000,1450000,1600000,1750000]}, {"data": [1000000,950000,900000,850000,800000,750000]}]}'
                },
                'aggressive': {
                    'success_rate': float(request.form.get('aggressive_success_rate', 0.55)),
                    'portfolio': {'name': 'Aggressive (90/10)', 'expected_return': 0.095, 'std_deviation': 0.18},
                    'median_final_balance': 12000000,
                    'projection_data': '{"labels": [0,10,20,30,40,50], "datasets": [{"data": [1000000,1400000,1800000,2200000,2600000,3000000]}, {"data": [1000000,1200000,1400000,1600000,1800000,2000000]}, {"data": [1000000,900000,800000,700000,600000,500000]}]}'
                }
            }
        }
        
        user_info = {
            'name': name,
            'email': email,
            'organization': organization
        }
        
        # Save lead information
        calculation_params = {
            'balance': results_data['balance'],
            'withdrawal': results_data['calculation_details']['annual_withdrawal'],
            'portfolio': portfolio,
            'years': results_data['years'],
            'success_rates': {
                'conservative': results_data['portfolios']['conservative']['success_rate'],
                'balanced': results_data['portfolios']['balanced']['success_rate'],
                'aggressive': results_data['portfolios']['aggressive']['success_rate']
            }
        }
        lead = save_lead(email, organization, calculation_params)
        
        # Generate PDF using ReportLab (reliable, no external dependencies)
        app.logger.info(f"Generating PDF report for {email}")
        pdf_buffer = simple_pdf_generator.generate_comprehensive_report(results_data, user_info)
        
        if pdf_buffer:
            # Create file-like object
            pdf_io = io.BytesIO(pdf_buffer)
            pdf_io.seek(0)
            
            # Generate filename
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"Endowment_Analysis_{organization.replace(' ', '_')}_{timestamp}.pdf"
            
            app.logger.info(f"PDF generated successfully: {filename}")
            
            # Return PDF file for download
            return send_file(
                pdf_io,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
        else:
            raise Exception("PDF generation failed")
            
    except Exception as e:
        app.logger.error(f"Error generating PDF report: {str(e)}")
        return render_template('partials/download_error.html', error=str(e))


# API Routes for React Frontend
@app.route('/api/portfolios', methods=['GET'])
def api_get_portfolios():
    """Get available portfolio configurations."""
    try:
        portfolios = []
        for portfolio_id, data in PORTFOLIO_DATA.items():
            portfolios.append({
                'id': portfolio_id,
                'name': data['name'],
                'stocks_percentage': data['stocks_percentage'],
                'bonds_percentage': data['bonds_percentage'],
                'expected_return': data['expected_return'],
                'volatility': data['std_deviation']
            })
        return jsonify(portfolios)
    except Exception as e:
        app.logger.error(f"Error in api_get_portfolios: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/calculate', methods=['POST'])
def api_calculate():
    """Run Monte Carlo simulation for all portfolios via API."""
    try:
        data = request.get_json()
        
        # Extract parameters
        starting_balance = float(data.get('starting_balance', 1000000))
        withdrawal_method = data.get('withdrawal_method', 'percentage')
        withdrawal_rate = data.get('withdrawal_rate')
        withdrawal_amount = data.get('withdrawal_amount')
        years = int(data.get('years', 30))
        inflation_rate = float(data.get('inflation_rate', 0.03))
        management_fee = float(data.get('management_fee', 0.01))
        adjust_for_inflation = data.get('adjust_for_inflation', True)
        
        # Calculate withdrawal amount
        if withdrawal_method == 'percentage':
            if withdrawal_rate is None:
                return jsonify({'error': 'withdrawal_rate required for percentage method'}), 400
            withdrawal = starting_balance * (float(withdrawal_rate) / 100)
        else:
            if withdrawal_amount is None:
                return jsonify({'error': 'withdrawal_amount required for fixed method'}), 400
            withdrawal = float(withdrawal_amount)
        
        app.logger.info(f"Calculation params: balance={starting_balance}, withdrawal={withdrawal}, years={years}")
        
        # Run simulations for ALL portfolios
        all_results = {}
        
        for portfolio_id, portfolio_data in PORTFOLIO_DATA.items():
            portfolio = Portfolio(
                name=portfolio_data['name'],
                stocks_percentage=portfolio_data['stocks_percentage'],
                bonds_percentage=portfolio_data['bonds_percentage'],
                expected_return=portfolio_data['expected_return'],
                std_deviation=portfolio_data['std_deviation']
            )
            
            # Run simulation
            simulator = MonteCarloSimulator(
                starting_balance=starting_balance,
                annual_return=portfolio.expected_return,
                annual_std_dev=portfolio.std_deviation,
                withdrawal_amount=withdrawal,
                years=years,
                inflation_rate=inflation_rate,
                management_fee=management_fee,
                adjust_for_inflation=adjust_for_inflation
            )
            
            result = simulator.run_simulation(5000)
            
            # Generate chart data
            projection_data_json = generate_projection_data(result['percentile_paths'], years)
            projection_data = json.loads(projection_data_json)
            
            # Store results for this portfolio
            all_results[portfolio_id] = {
                'portfolio': {
                    'id': portfolio_id,
                    'name': portfolio.name,
                    'stocks_percentage': portfolio.stocks_percentage,
                    'bonds_percentage': portfolio.bonds_percentage,
                    'expected_return': portfolio.expected_return,
                    'volatility': portfolio.std_deviation
                },
                'success_rate': result['success_rate'],
                'median_final_balance': result['median_final_balance'],
                'percentile_paths': {
                    'p10': result['percentile_paths']['p10'],
                    'p50': result['percentile_paths']['p50'],
                    'p90': result['percentile_paths']['p90']
                },
                'annual_stats': [
                    {
                        'year': i,
                        'p10': result['percentile_paths']['p10'][i],
                        'p50': result['percentile_paths']['p50'][i],
                        'p90': result['percentile_paths']['p90'][i]
                    }
                    for i in range(len(result['percentile_paths']['p10']))
                ],
                'projection_data': projection_data
            }
        
        # Calculate comparison metrics
        comparison_data = {
            'withdrawal_amount': withdrawal,
            'withdrawal_method': withdrawal_method,
            'years': years,
            'portfolios': all_results
        }
        
        return jsonify(comparison_data)
        
    except Exception as e:
        app.logger.error(f"Error in api_calculate: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-pdf', methods=['POST'])
def api_generate_pdf():
    """Generate PDF report via API."""
    try:
        data = request.get_json()
        inputs = data.get('inputs', {})
        results = data.get('results', {})
        
        # Generate PDF using existing logic
        pdf_buffer = simple_pdf_generator({
            'balance': inputs.get('startingBalance', 1000000),
            'years': inputs.get('years', 30),
            'withdrawal_method': inputs.get('withdrawalMethod', 'percentage'),
            'withdrawal_rate': inputs.get('withdrawalRate', 4),
            'withdrawal_amount': inputs.get('withdrawalAmount', 40000),
            'portfolio_id': inputs.get('portfolioId', 'balanced-70-30'),
            'success_rate': results.get('success_rate', 0),
            'median_final_balance': results.get('median_final_balance', 0),
            'projection_data': results.get('projection_data', {})
        })
        
        if pdf_buffer:
            pdf_io = io.BytesIO(pdf_buffer)
            pdf_io.seek(0)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"Endowment_Analysis_{timestamp}.pdf"
            
            return send_file(
                pdf_io,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
        else:
            return jsonify({'error': 'PDF generation failed'}), 500
            
    except Exception as e:
        app.logger.error(f"Error in api_generate_pdf: {str(e)}")
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)