# EndowmentIQ

A sophisticated Monte Carlo simulation platform that helps nonprofit organizations make data-driven decisions about endowment sustainability and withdrawal strategies.

## Features

- **Monte Carlo Simulation**: 5,000 iterations for robust statistical analysis
- **Multiple Portfolio Options**: Conservative (50/50), Balanced (70/30), Aggressive (90/10)
- **Flexible Withdrawals**: Percentage-based or fixed amount strategies
- **Inflation Adjustments**: Optional inflation-adjusted withdrawals
- **Visual Analytics**: Interactive charts showing portfolio projections
- **PDF Reports**: Professional downloadable analysis reports
- **Dual-Axis Charts**: Portfolio value vs. withdrawal analysis

## Technology Stack

### Backend
- Python 3.11
- Flask web framework
- NumPy for Monte Carlo simulations
- ReportLab for PDF generation

### Frontend  
- React 18 with TypeScript
- Vite for fast development
- Chart.js for interactive visualizations
- Component architecture following grammar-ops standards

### Infrastructure
- Docker & Docker Compose
- Nginx for production serving
- CORS-enabled API

## Quick Start with Docker

```bash
# Clone the repository
git clone <repository-url>
cd nonprofit-calculator

# Build and run with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:8080
# Backend API: http://localhost:5000
```

## Development Setup

### Backend Development
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

### Frontend Development
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### Development with Docker (Hot Reload)
```bash
# Use development compose file
docker-compose -f docker-compose.dev.yml up
```

## Project Structure

```
nonprofit-calculator/
├── app.py                  # Flask backend
├── lib/                    # Core calculation logic
│   ├── core/              # Monte Carlo simulator
│   └── reporters/         # Chart and PDF generators
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── primitives/   # Base components
│   │   │   ├── composed/     # Composite components
│   │   │   ├── features/     # Business logic components
│   │   │   └── pages/        # Route components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript definitions
│   └── Dockerfile         # Frontend container
├── docker-compose.yml     # Production setup
└── docker-compose.dev.yml # Development setup
```

## API Endpoints

- `GET /api/portfolios` - Get available portfolio configurations
- `POST /api/calculate` - Run Monte Carlo simulation
- `POST /api/generate-pdf` - Generate PDF report

## Component Architecture

Following grammar-ops standards:
- **Primitives**: Zero-dependency base components (Button, Input)
- **Composed**: Built from primitives (Charts, Cards)
- **Features**: Business logic components (Calculator, ResultsSummary)
- **Pages**: Route-level components

## Testing

```bash
# Run the test script
./test-docker.sh

# Or manually test endpoints
curl http://localhost:5000/api/portfolios
```

## Metadata & Code Standards

This project follows grammar-ops metadata standards:
```bash
# Add metadata to all files
./scripts/add-all-metadata.sh

# Add metadata to specific types
./scripts/add-docker-metadata.sh --all
./scripts/add-react-metadata.sh --components
```

## License

[Your License Here]

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.