"""
Simple PDF Generation using ReportLab
Professional quality PDFs with integrated charts
"""
import io
import logging
import json
import tempfile
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor, black, white
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, Image, BaseDocTemplate, PageTemplate, Frame
from reportlab.platypus.flowables import HRFlowable
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend for server environments
import matplotlib.pyplot as plt
import matplotlib.style as mplstyle
import numpy as np

logger = logging.getLogger(__name__)

class SimplePDFGenerator:
    """Professional PDF generator using ReportLab"""
    
    def __init__(self):
        # Zenith color palette
        self.colors = {
            'primary': HexColor('#1a2332'),
            'navy': HexColor('#1a2332'),  # Navy for headers/footers
            'accent': HexColor('#2b6cb0'),
            'success': HexColor('#059669'),
            'warning': HexColor('#d69e2e'),
            'danger': HexColor('#c53030'),
            'gray_50': HexColor('#f9fafb'),
            'gray_200': HexColor('#e2e8f0'),
            'gray_600': HexColor('#4a5568')
        }
        
        # Custom styles
        self.styles = getSampleStyleSheet()
        self._create_custom_styles()
        
        # Configure matplotlib for clean charts
        try:
            plt.style.use('seaborn-v0_8-whitegrid')
        except:
            try:
                plt.style.use('seaborn-whitegrid')
            except:
                plt.style.use('default')
    
    def _create_custom_styles(self):
        """Create custom paragraph styles"""
        # Header style
        self.styles.add(ParagraphStyle(
            'CustomTitle',
            parent=self.styles['Title'],
            fontSize=20,
            textColor=self.colors['primary'],
            spaceAfter=6,
            alignment=TA_CENTER
        ))
        
        # Subtitle style
        self.styles.add(ParagraphStyle(
            'CustomSubtitle',
            parent=self.styles['Normal'],
            fontSize=12,
            textColor=self.colors['gray_600'],
            spaceAfter=20,
            alignment=TA_CENTER
        ))
        
        # Section header
        self.styles.add(ParagraphStyle(
            'SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=14,
            textColor=self.colors['primary'],
            spaceAfter=10,
            spaceBefore=15
        ))
        
        # Portfolio header
        self.styles.add(ParagraphStyle(
            'PortfolioHeader',
            parent=self.styles['Heading3'], 
            fontSize=12,
            textColor=self.colors['primary'],
            spaceAfter=8
        ))
        
        # Body text
        self.styles.add(ParagraphStyle(
            'CustomBody',
            parent=self.styles['Normal'],
            fontSize=10,
            leading=12,
            spaceAfter=6
        ))
        
        # Small text
        self.styles.add(ParagraphStyle(
            'SmallText',
            parent=self.styles['Normal'],
            fontSize=8,
            leading=10,
            textColor=self.colors['gray_600']
        ))

    def _create_projection_chart(self, projection_data_str, portfolio_name, width=5*inch, height=3*inch):
        """Create a projection chart using matplotlib"""
        try:
            # Parse the JSON projection data
            projection_data = json.loads(projection_data_str)
            labels = projection_data['labels']
            datasets = projection_data['datasets']
            
            # Create figure with Zenith colors
            fig, ax = plt.subplots(figsize=(width/inch, height/inch), dpi=150)
            fig.patch.set_facecolor('white')
            
            # Plot each dataset
            colors = ['#059669', '#1a2332', '#d69e2e']  # Success, Primary, Warning
            line_styles = ['--', '-', '--']
            line_widths = [2, 3, 2]
            
            # Define proper labels for the datasets
            dataset_labels = ['90th Percentile', 'Median (50th)', '10th Percentile']
            
            for i, dataset in enumerate(datasets):
                if i < len(colors):
                    label = dataset.get('label', dataset_labels[i] if i < len(dataset_labels) else f'Series {i+1}')
                    ax.plot(labels, dataset['data'], 
                           color=colors[i], 
                           linestyle=line_styles[i],
                           linewidth=line_widths[i],
                           label=label,
                           alpha=0.8)
            
            # Customize chart
            ax.set_title(f'{portfolio_name} - Endowment Projections', 
                        fontsize=12, fontweight='bold', color='#1a2332', pad=20)
            ax.set_xlabel('Years', fontsize=10, color='#4a5568')
            ax.set_ylabel('Balance ($)', fontsize=10, color='#4a5568')
            
            # Format y-axis to show currency
            ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1000000:.1f}M'))
            
            # Grid and styling
            ax.grid(True, alpha=0.3, color='#e2e8f0')
            ax.set_facecolor('#f9fafb')
            
            # Legend
            ax.legend(loc='upper left', frameon=True, fancybox=True, shadow=True, 
                     fontsize=8, framealpha=0.9)
            
            # Tight layout
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight', 
                       facecolor='white', edgecolor='none', pad_inches=0.1)
            img_buffer.seek(0)
            plt.close()
            
            # Create ReportLab Image
            return Image(img_buffer, width=width, height=height)
            
        except Exception as e:
            logger.error(f"Error creating projection chart: {str(e)}")
            # Return a placeholder paragraph if chart generation fails
            return Paragraph(f"[Chart for {portfolio_name}]", self.styles['CustomBody'])

    def _create_success_rate_chart(self, portfolios_data, width=5*inch, height=2.5*inch):
        """Create a success rate comparison chart"""
        try:
            # Extract portfolio names and success rates
            names = []
            rates = []
            colors_list = []
            
            for key, portfolio_data in portfolios_data.items():
                names.append(portfolio_data['portfolio']['name'])
                rate = portfolio_data['success_rate']
                rates.append(rate * 100)  # Convert to percentage
                
                # Color based on success rate
                if rate >= 0.7:
                    colors_list.append('#059669')  # Success green
                elif rate >= 0.5:
                    colors_list.append('#d69e2e')  # Warning yellow
                else:
                    colors_list.append('#c53030')  # Danger red
            
            # Create horizontal bar chart
            fig, ax = plt.subplots(figsize=(width/inch, height/inch), dpi=150)
            fig.patch.set_facecolor('white')
            
            bars = ax.barh(names, rates, color=colors_list, alpha=0.8, edgecolor='white', linewidth=1)
            
            # Customize chart
            ax.set_title('Portfolio Success Rate Comparison', 
                        fontsize=12, fontweight='bold', color='#1a2332', pad=15)
            ax.set_xlabel('Success Rate (%)', fontsize=10, color='#4a5568')
            
            # Add percentage labels on bars
            for bar, rate in zip(bars, rates):
                width = bar.get_width()
                ax.text(width + 1, bar.get_y() + bar.get_height()/2, 
                       f'{rate:.1f}%', ha='left', va='center', 
                       fontweight='bold', fontsize=9, color='#1a2332')
            
            # Set x-axis limits
            ax.set_xlim(0, 100)
            ax.set_xticks([0, 25, 50, 75, 100])
            
            # Grid and styling
            ax.grid(True, axis='x', alpha=0.3, color='#e2e8f0')
            ax.set_facecolor('#f9fafb')
            
            # Remove spines
            for spine in ax.spines.values():
                spine.set_visible(False)
            
            plt.tight_layout()
            
            # Save to bytes
            img_buffer = io.BytesIO()
            plt.savefig(img_buffer, format='png', dpi=150, bbox_inches='tight',
                       facecolor='white', edgecolor='none', pad_inches=0.1)
            img_buffer.seek(0)
            plt.close()
            
            return Image(img_buffer, width=width, height=height)
            
        except Exception as e:
            logger.error(f"Error creating success rate chart: {str(e)}")
            return Paragraph("[Success Rate Chart]", self.styles['CustomBody'])

    def _draw_header_footer(self, canvas, doc):
        """Draw custom navy header and footer on each page"""
        canvas.saveState()
        
        # Get page dimensions
        width, height = letter
        
        # Draw navy header bar
        header_height = 0.8*inch
        canvas.setFillColor(self.colors['navy'])
        canvas.rect(0, height - header_height, width, header_height, fill=1)
        
        # Header text - left side
        canvas.setFillColor(white)
        canvas.setFont("Helvetica-Bold", 16)
        canvas.drawString(0.75*inch, height - 0.5*inch, "ZENITH WEALTH PARTNERS")
        
        # Header text - right side
        canvas.setFont("Helvetica", 10)
        canvas.drawRightString(width - 0.75*inch, height - 0.5*inch, "Endowment Sustainability Analysis")
        
        # Draw navy footer bar
        footer_height = 0.6*inch
        canvas.setFillColor(self.colors['navy'])
        canvas.rect(0, 0, width, footer_height, fill=1)
        
        # Footer text - left side
        canvas.setFillColor(white)
        canvas.setFont("Helvetica", 8)
        canvas.drawString(0.75*inch, 0.25*inch, f"Generated on {datetime.now().strftime('%B %d, %Y')}")
        
        # Footer text - center
        text_width = canvas.stringWidth("CONFIDENTIAL ANALYSIS", "Helvetica", 8)
        canvas.drawString((width - text_width) / 2, 0.25*inch, "CONFIDENTIAL ANALYSIS")
        
        # Footer text - right side (page number)
        canvas.drawRightString(width - 0.75*inch, 0.25*inch, f"Page {doc.page}")
        
        canvas.restoreState()

    def generate_comprehensive_report(self, results_data, user_info=None):
        """Generate comprehensive PDF report"""
        try:
            logger.info("Starting ReportLab PDF generation")
            
            # Create PDF buffer
            buffer = io.BytesIO()
            
            # Create custom document with headers/footers
            doc = BaseDocTemplate(
                buffer,
                pagesize=letter,
                rightMargin=0.75*inch,
                leftMargin=0.75*inch,
                topMargin=1.2*inch,  # More space for header
                bottomMargin=1.0*inch  # More space for footer
            )
            
            # Create frame for content (avoiding header/footer areas)
            frame = Frame(
                0.75*inch, 1.0*inch,  # x, y position
                letter[0] - 1.5*inch,  # width (page width - left/right margins)
                letter[1] - 2.2*inch,  # height (page height - top/bottom margins)
                leftPadding=0, rightPadding=0, topPadding=0, bottomPadding=0
            )
            
            # Create page template with custom header/footer
            page_template = PageTemplate(id='main', frames=[frame], onPage=self._draw_header_footer)
            doc.addPageTemplates([page_template])
            
            # Build content
            story = []
            
            # Header
            story.append(Paragraph("Endowment Sustainability Analysis", self.styles['CustomTitle']))
            story.append(Paragraph("Comprehensive Investment Strategy Report", self.styles['CustomSubtitle']))
            story.append(Paragraph(f"Generated on {datetime.now().strftime('%B %d, %Y')}", self.styles['SmallText']))
            story.append(Spacer(1, 20))
            
            # Executive Summary
            story.append(Paragraph("Executive Summary", self.styles['SectionHeader']))
            story.append(HRFlowable(width="100%", thickness=1, lineCap='round', color=self.colors['gray_200']))
            
            summary_text = f"""
            Analysis of a <b>${results_data['balance']:,.0f} endowment</b> with 
            <b>${results_data['calculation_details']['annual_withdrawal']:,.0f} annual withdrawals</b> 
            over a {results_data['years']}-year investment horizon.
            """
            story.append(Paragraph(summary_text, self.styles['CustomBody']))
            story.append(Spacer(1, 15))
            
            # Success Rate Summary Table
            summary_data = [['Portfolio Strategy', 'Success Rate']]
            for key, portfolio_data in results_data['portfolios'].items():
                success_rate = f"{portfolio_data['success_rate']*100:.1f}%"
                summary_data.append([portfolio_data['portfolio']['name'], success_rate])
            
            summary_table = Table(summary_data, colWidths=[3*inch, 1.5*inch])
            summary_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['gray_50']),
                ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['primary']),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('ALIGN', (1, 1), (1, -1), 'RIGHT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['gray_200']),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            story.append(summary_table)
            story.append(Spacer(1, 20))
            
            # Find best portfolio
            best_success_rate = 0
            best_portfolio_name = 'Balanced (70/30)'
            for key, portfolio_data in results_data['portfolios'].items():
                if portfolio_data['success_rate'] > best_success_rate:
                    best_success_rate = portfolio_data['success_rate']
                    best_portfolio_name = portfolio_data['portfolio']['name']
            
            # Recommendation
            recommendation_text = f"""
            <b>Recommended Strategy: {best_portfolio_name}</b><br/><br/>
            Based on your {results_data['years']}-year timeline and withdrawal requirements, 
            the {best_portfolio_name.lower()} approach offers the highest success rate at 
            <b>{best_success_rate*100:.1f}%</b>. This strategy provides the optimal balance of growth potential 
            and risk management for sustainable endowment spending.
            """
            story.append(Paragraph(recommendation_text, self.styles['CustomBody']))
            story.append(Spacer(1, 15))
            
            # Add success rate comparison chart
            success_chart = self._create_success_rate_chart(results_data['portfolios'])
            story.append(success_chart)
            story.append(Spacer(1, 20))
            
            # Page break for portfolio analysis
            story.append(PageBreak())
            
            # Portfolio Analysis
            story.append(Paragraph("Individual Portfolio Analysis", self.styles['SectionHeader']))
            story.append(HRFlowable(width="100%", thickness=1, lineCap='round', color=self.colors['gray_200']))
            story.append(Spacer(1, 10))
            
            for key, portfolio_data in results_data['portfolios'].items():
                # Portfolio header
                portfolio_header = f"{portfolio_data['portfolio']['name']} Strategy - {portfolio_data['success_rate']*100:.1f}% Success Rate"
                story.append(Paragraph(portfolio_header, self.styles['PortfolioHeader']))
                
                # Portfolio details
                details_text = f"""
                <b>Expected Return:</b> {portfolio_data['portfolio']['expected_return']*100:.1f}% | 
                <b>Volatility:</b> {portfolio_data['portfolio']['std_deviation']*100:.1f}% | 
                <b>Median Final:</b> ${portfolio_data['median_final_balance']:,.0f}
                """
                story.append(Paragraph(details_text, self.styles['SmallText']))
                
                # Analysis
                if portfolio_data['success_rate'] >= 0.8:
                    analysis = f"This {portfolio_data['portfolio']['name'].lower()} approach shows excellent sustainability with very high confidence for maintaining your spending plan."
                elif portfolio_data['success_rate'] >= 0.7:
                    analysis = f"This {portfolio_data['portfolio']['name'].lower()} strategy offers solid confidence for your spending goals with reasonable growth."
                elif portfolio_data['success_rate'] >= 0.5:
                    analysis = f"This {portfolio_data['portfolio']['name'].lower()} approach carries moderate risk. Consider adjustments for higher confidence."
                else:
                    analysis = f"This {portfolio_data['portfolio']['name'].lower()} strategy shows significant sustainability challenges and may require reducing withdrawals."
                
                story.append(Paragraph(f"<b>Analysis:</b> {analysis}", self.styles['CustomBody']))
                story.append(Spacer(1, 10))
                
                # Add projection chart for this portfolio
                if 'projection_data' in portfolio_data:
                    portfolio_chart = self._create_projection_chart(
                        portfolio_data['projection_data'], 
                        portfolio_data['portfolio']['name'],
                        width=5.5*inch, 
                        height=2.8*inch
                    )
                    story.append(portfolio_chart)
                
                story.append(Spacer(1, 20))
            
            # Page break for technical details
            story.append(PageBreak())
            
            # Calculation Details
            story.append(Paragraph("Calculation Details", self.styles['SectionHeader']))
            story.append(HRFlowable(width="100%", thickness=1, lineCap='round', color=self.colors['gray_200']))
            story.append(Spacer(1, 10))
            
            # Details table
            details_data = [
                ['Parameter', 'Value', 'Notes'],
                ['Starting Balance', f"${results_data['calculation_details']['starting_balance']:,.0f}", 'Initial endowment value'],
                ['Annual Withdrawal', f"${results_data['calculation_details']['annual_withdrawal']:,.0f}", f"{results_data['calculation_details']['withdrawal_rate_percent']:.1f}% of initial balance"],
                ['Time Horizon', f"{results_data['years']} years", 'Investment planning period'],
                ['Inflation Rate', f"{results_data['inflation_rate']*100:.1f}%", 'Annual inflation assumption'],
                ['Total Withdrawals', f"${results_data['calculation_details']['total_withdrawals']:,.0f}", f"Cumulative over {results_data['years']} years"]
            ]
            
            details_table = Table(details_data, colWidths=[1.8*inch, 1.5*inch, 2.2*inch])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), self.colors['gray_50']),
                ('TEXTCOLOR', (0, 0), (-1, 0), self.colors['primary']),
                ('ALIGN', (0, 0), (0, -1), 'LEFT'),
                ('ALIGN', (1, 0), (1, -1), 'RIGHT'),
                ('ALIGN', (2, 0), (2, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 0), (-1, -1), 9),
                ('GRID', (0, 0), (-1, -1), 1, self.colors['gray_200']),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('TOPPADDING', (0, 0), (-1, -1), 6),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ]))
            story.append(details_table)
            story.append(Spacer(1, 20))
            
            # Methodology
            story.append(Paragraph("Methodology", self.styles['SectionHeader']))
            methodology_text = f"""
            <b>Monte Carlo Simulation</b><br/><br/>
            This analysis employs <b>5,000 Monte Carlo simulations</b> to model potential outcomes 
            for your endowment over the {results_data['years']}-year period. Each simulation uses:
            <br/>• Historical market volatility patterns
            <br/>• Portfolio-specific expected returns and standard deviations  
            <br/>• {results_data['inflation_rate']:.1%} annual inflation adjustment
            <br/>• 1% annual management fees
            <br/><br/>
            The success rate represents the percentage of scenarios where your endowment successfully 
            maintains the required withdrawals for the full time period without depletion.
            """
            story.append(Paragraph(methodology_text, self.styles['CustomBody']))
            story.append(Spacer(1, 15))
            
            # Risk Considerations
            story.append(Paragraph("Risk Considerations", self.styles['PortfolioHeader']))
            risk_text = f"""
            <b>Market Risk:</b> Past performance does not guarantee future results. Market conditions can vary significantly from historical patterns.<br/><br/>
            <b>Inflation Risk:</b> Actual inflation may differ from the {results_data['inflation_rate']:.1%} assumption used in this analysis.<br/><br/>
            <b>Model Limitations:</b> Monte Carlo simulations provide probabilistic estimates based on historical data and may not capture all potential market scenarios.
            """
            story.append(Paragraph(risk_text, self.styles['SmallText']))
            story.append(Spacer(1, 15))
            
            # Next Steps
            story.append(Paragraph("Next Steps", self.styles['PortfolioHeader']))
            next_steps = """
            1. Review the recommended investment strategy with your board<br/>
            2. Consider your organization's risk tolerance and mission requirements<br/>
            3. Consult with qualified investment professionals for implementation<br/>
            4. Establish regular monitoring and rebalancing procedures<br/>
            5. Review and update projections annually or when circumstances change
            """
            story.append(Paragraph(next_steps, self.styles['SmallText']))
            
            # Build PDF
            doc.build(story)
            
            # Get PDF data
            pdf_data = buffer.getvalue()
            buffer.close()
            
            logger.info(f"PDF generated successfully, size: {len(pdf_data)} bytes")
            return pdf_data
            
        except Exception as e:
            logger.error(f"Error generating ReportLab PDF: {str(e)}")
            raise

# Singleton instance
simple_pdf_generator = SimplePDFGenerator()