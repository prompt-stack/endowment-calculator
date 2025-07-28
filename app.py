#!/usr/bin/env python3
"""
EndowmentIQ API - Flask backend for nonprofit endowment analysis.
Provides Monte Carlo simulation and PDF generation endpoints.
"""

from flask import Flask, request, jsonify, send_file
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
# In production, you should restrict this to your actual frontend domain
frontend_url = os.getenv('FRONTEND_URL', '*')
if frontend_url == '*':
    # Development mode - allow common dev ports
    CORS(app, origins=['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:8080', 'http://127.0.0.1:8080'])
else:
    # Production mode - only allow specific frontend
    CORS(app, origins=[frontend_url])

# Load portfolio data
with open('data/portfolios.json', 'r') as f:
    portfolio_file = json.load(f)
    PORTFOLIO_DATA = portfolio_file['presets']


@app.route('/health')
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'ok',
        'message': 'EndowmentIQ API is running',
        'version': '1.0.0'
    })


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
                'std_deviation': data['std_deviation']
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
        
        # Validate starting balance
        if starting_balance <= 0:
            return jsonify({'error': 'Starting balance must be greater than 0'}), 400
            
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
        
        # Run simulations for all portfolios
        results = {
            'balance': starting_balance,
            'years': years,
            'inflation_rate': inflation_rate,
            'withdrawal_method': withdrawal_method,
            'adjust_for_inflation': adjust_for_inflation,
            'calculation_details': {
                'starting_balance': starting_balance,
                'annual_withdrawal': withdrawal,
                'withdrawal_rate_percent': (withdrawal / starting_balance) * 100,
                'total_withdrawals': withdrawal * years,
                'inflation_adjusted_final_withdrawal': withdrawal * ((1 + inflation_rate) ** years) if adjust_for_inflation else withdrawal
            },
            'portfolios': {}
        }
        
        # Get portfolio presets
        portfolios = PortfolioPreset.get_all()
        
        for portfolio_id, portfolio in portfolios.items():
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
            
            sim_results = simulator.run_simulation()
            
            # Generate chart data
            projection_data = generate_projection_data(
                sim_results['percentile_paths'],
                years
            )
            
            results['portfolios'][portfolio_id] = {
                'portfolio': {
                    'name': portfolio.name,
                    'expected_return': portfolio.expected_return,
                    'std_deviation': portfolio.std_deviation
                },
                'success_rate': sim_results['success_rate'],
                'median_final_balance': sim_results['median_final_balance'],
                'percentile_10': sim_results['percentile_paths']['p10'][-1],
                'percentile_90': sim_results['percentile_paths']['p90'][-1],
                'annual_withdrawal': withdrawal,
                'withdrawal_rate': sim_results['withdrawal_rate'],
                'projection_data': json.dumps(projection_data)
            }
        
        return jsonify(results)
        
    except Exception as e:
        app.logger.error(f"Error in api_calculate: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/generate-pdf', methods=['POST'])
def api_generate_pdf():
    """Generate PDF report from results."""
    try:
        data = request.get_json()
        
        if not data or 'results' not in data:
            return jsonify({'error': 'No results provided'}), 400
        
        results = data['results']
        
        # Generate PDF
        pdf_buffer = simple_pdf_generator(results)
        
        # Send file
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'endowmentiq-analysis-{datetime.now().strftime("%Y%m%d")}.pdf'
        )
        
    except Exception as e:
        app.logger.error(f"Error in api_generate_pdf: {str(e)}")
        return jsonify({'error': 'PDF generation failed'}), 500


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('DEBUG', 'True').lower() == 'true'
    app.run(debug=debug, host='0.0.0.0', port=port)