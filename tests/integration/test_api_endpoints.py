"""
Integration tests for API endpoints.
Tests the full API request/response cycle.
"""

import pytest
import json


class TestAPIEndpoints:
    """Test suite for API endpoints."""
    
    def test_portfolios_endpoint(self, client):
        """Test GET /api/portfolios endpoint."""
        response = client.get('/api/portfolios')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Check structure
        assert isinstance(data, list)
        assert len(data) == 3
        
        # Check that we have all portfolio types
        portfolio_ids = [p['id'] for p in data]
        assert 'conservative' in portfolio_ids
        assert 'balanced' in portfolio_ids
        assert 'aggressive' in portfolio_ids
    
    def test_calculate_percentage_withdrawal(self, client):
        """Test calculation with percentage withdrawal method."""
        payload = {
            'starting_balance': 1000000,
            'withdrawal_rate': 4.0,
            'withdrawal_method': 'percentage',
            'years': 30,
            'inflation_rate': 0.03,
            'management_fee': 0.01,
            'adjust_for_inflation': True
        }
        
        response = client.post('/api/calculate',
                             json=payload,
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Check response structure
        assert 'balance' in data
        assert 'portfolios' in data
        assert 'calculation_details' in data
        
        # Check portfolios
        assert len(data['portfolios']) == 3
        for portfolio_key in ['conservative', 'balanced', 'aggressive']:
            assert portfolio_key in data['portfolios']
            portfolio = data['portfolios'][portfolio_key]
            assert 'success_rate' in portfolio
            assert 'median_final_balance' in portfolio
            assert 'projection_data' in portfolio
    
    def test_calculate_fixed_withdrawal(self, client):
        """Test calculation with fixed amount withdrawal."""
        payload = {
            'starting_balance': 1000000,
            'withdrawal_amount': 50000,
            'withdrawal_method': 'fixed',
            'years': 30,
            'inflation_rate': 0.03,
            'management_fee': 0.01,
            'adjust_for_inflation': False
        }
        
        response = client.post('/api/calculate',
                             json=payload,
                             content_type='application/json')
        
        assert response.status_code == 200
        data = response.get_json()
        
        # Verify withdrawal amount is used
        assert data['calculation_details']['annual_withdrawal'] == 50000
        assert data['calculation_details']['withdrawal_rate_percent'] == 5.0
    
    def test_calculate_invalid_balance(self, client):
        """Test calculation with invalid balance."""
        payload = {
            'starting_balance': -1000,
            'withdrawal_rate': 4.0,
            'withdrawal_method': 'percentage',
            'years': 30
        }
        
        response = client.post('/api/calculate',
                             json=payload,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_calculate_missing_fields(self, client):
        """Test calculation with missing required fields."""
        payload = {
            'starting_balance': 1000000
            # Missing other required fields
        }
        
        response = client.post('/api/calculate',
                             json=payload,
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_generate_pdf_with_valid_results(self, client, sample_results):
        """Test PDF generation with valid results."""
        response = client.post('/api/generate-pdf',
                             json=sample_results,
                             content_type='application/json')
        
        assert response.status_code == 200
        assert response.content_type == 'application/pdf'
        assert len(response.data) > 1000  # PDF should have content
    
    def test_generate_pdf_without_results(self, client):
        """Test PDF generation without results."""
        response = client.post('/api/generate-pdf',
                             json={},
                             content_type='application/json')
        
        assert response.status_code == 400
        data = response.get_json()
        assert 'error' in data
    
    def test_cors_headers(self, client):
        """Test CORS headers are present."""
        response = client.get('/api/portfolios')
        
        assert 'Access-Control-Allow-Origin' in response.headers
        assert response.headers['Access-Control-Allow-Origin'] == '*'
    
    def test_calculation_edge_cases(self, client):
        """Test various edge cases for calculations."""
        test_cases = [
            {
                'name': 'Very high withdrawal rate',
                'payload': {
                    'balance': 1000000,
                    'withdrawal_rate': 10.0,
                    'withdrawal_method': 'percentage',
                    'years': 30,
                    'inflation': 3.0
                }
            },
            {
                'name': 'Very long time horizon',
                'payload': {
                    'balance': 1000000,
                    'withdrawal_rate': 3.0,
                    'withdrawal_method': 'percentage',
                    'years': 100,
                    'inflation': 3.0
                }
            },
            {
                'name': 'Zero inflation',
                'payload': {
                    'balance': 1000000,
                    'withdrawal_rate': 4.0,
                    'withdrawal_method': 'percentage',
                    'years': 30,
                    'inflation': 0.0
                }
            }
        ]
        
        for test_case in test_cases:
            response = client.post('/api/calculate',
                                 json=test_case['payload'],
                                 content_type='application/json')
            
            assert response.status_code == 200, f"Failed on: {test_case['name']}"
            data = response.get_json()
            assert 'portfolios' in data, f"Missing portfolios for: {test_case['name']}"