"""
PDF Generation Service
Implements the exact Reactive Resume approach for professional PDF generation
"""
import asyncio
import tempfile
import os
from datetime import datetime
from flask import current_app
import pyppeteer
from PyPDF2 import PdfMerger
import logging

logger = logging.getLogger(__name__)

class PDFGenerator:
    """Professional PDF generator using the Reactive Resume approach"""
    
    # Letter size dimensions (exactly like Reactive Resume)
    LETTER_WIDTH_MM = 216  # 8.5 inches
    LETTER_HEIGHT_MM = 279  # 11 inches
    MM_TO_PX = 3.78  # Reactive Resume conversion factor
    
    def __init__(self):
        self.page_width = self.LETTER_WIDTH_MM * self.MM_TO_PX  # 816px
        self.page_height = self.LETTER_HEIGHT_MM * self.MM_TO_PX  # 1054px
    
    async def generate_comprehensive_report(self, results_data, user_info=None):
        """
        Generate multi-page PDF report exactly like Reactive Resume
        """
        try:
            logger.info("Starting PDF generation for comprehensive report")
            
            # Launch browser (like Reactive Resume's getBrowser)
            browser = await pyppeteer.launch({
                'headless': True,
                'args': [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    '--disable-dev-shm-usage',
                    '--disable-gpu',
                    '--no-first-run',
                    '--no-default-browser-check',
                    '--disable-default-apps'
                ]
            })
            
            page = await browser.newPage()
            
            # Set viewport (like Reactive Resume)
            await page.setViewport({
                'width': int(self.page_width),
                'height': int(self.page_height)
            })
            
            # Prepare data for template
            template_data = {
                'results': results_data,
                'current_date': datetime.now().strftime('%B %d, %Y'),
                'user_info': user_info or {}
            }
            
            # Navigate to PDF template route
            base_url = 'http://localhost:5001'  # Use port 5001
            pdf_url = f"{base_url}/pdf-template"
            
            # Set template data in localStorage (like Reactive Resume)
            await page.evaluateOnNewDocument(f"""
                window.templateData = {template_data};
                window.localStorage.setItem('reportData', JSON.stringify({template_data}));
            """)
            
            await page.goto(pdf_url, {'waitUntil': 'networkidle0'})
            
            # Wait for charts to render (like Reactive Resume waits for content)
            await page.waitForFunction('window.isPrintReady === true', timeout=10000)
            
            # Generate PDF pages (like Reactive Resume's processPage function)
            pages_buffer = []
            number_of_pages = 3  # Our report has 3 pages
            
            for page_index in range(1, number_of_pages + 1):
                logger.info(f"Processing page {page_index}")
                
                # Find the specific page element
                page_element = await page.querySelector(f'[data-page="{page_index}"]')
                if not page_element:
                    logger.warning(f"Page {page_index} element not found")
                    continue
                
                # Get page dimensions (like Reactive Resume)
                width = await page.evaluate('(element) => element.scrollWidth', page_element)
                height = await page.evaluate('(element) => element.scrollHeight', page_element)
                
                # Temporarily show only this page (like Reactive Resume)
                original_html = await page.evaluate("""
                    () => {
                        const originalHtml = document.body.innerHTML;
                        return originalHtml;
                    }
                """)
                
                await page.evaluate("""
                    (element) => {
                        document.body.innerHTML = element.outerHTML;
                    }
                """, page_element)
                
                # Generate PDF for this page with exact dimensions
                pdf_buffer = await page.pdf({
                    'width': f'{width}px',
                    'height': f'{height}px',
                    'printBackground': True,
                    'margin': {
                        'top': '0',
                        'right': '0', 
                        'bottom': '0',
                        'left': '0'
                    }
                })
                
                pages_buffer.append(pdf_buffer)
                
                # Restore original HTML
                await page.evaluate(f"""
                    () => {{
                        document.body.innerHTML = `{original_html}`;
                    }}
                """)
            
            await browser.close()
            
            # Merge all pages using PyPDF2 (like Reactive Resume uses pdf-lib)
            if len(pages_buffer) > 1:
                return await self._merge_pdf_pages(pages_buffer)
            else:
                return pages_buffer[0] if pages_buffer else None
                
        except Exception as e:
            logger.error(f"Error generating PDF: {str(e)}")
            if 'browser' in locals():
                await browser.close()
            raise
    
    async def _merge_pdf_pages(self, pages_buffer):
        """
        Merge multiple PDF pages into single document (like Reactive Resume)
        """
        try:
            merger = PdfMerger()
            temp_files = []
            
            # Write each page to temporary file
            for i, pdf_buffer in enumerate(pages_buffer):
                temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=f'_page_{i}.pdf')
                temp_file.write(pdf_buffer)
                temp_file.close()
                temp_files.append(temp_file.name)
                merger.append(temp_file.name)
            
            # Write merged PDF to temporary file
            output_temp = tempfile.NamedTemporaryFile(delete=False, suffix='_merged.pdf')
            merger.write(output_temp.name)
            merger.close()
            
            # Read merged PDF
            with open(output_temp.name, 'rb') as f:
                merged_pdf = f.read()
            
            # Clean up temporary files
            for temp_file in temp_files + [output_temp.name]:
                try:
                    os.unlink(temp_file)
                except:
                    pass
            
            return merged_pdf
            
        except Exception as e:
            logger.error(f"Error merging PDF pages: {str(e)}")
            raise
    
    def generate_report_sync(self, results_data, user_info=None):
        """
        Synchronous wrapper for async PDF generation
        """
        import asyncio
        import signal
        
        # Disable signal handlers in this thread
        try:
            signal.signal(signal.SIGINT, signal.SIG_DFL)
            signal.signal(signal.SIGTERM, signal.SIG_DFL)
        except ValueError:
            # signals only work in main thread, that's fine
            pass
        
        # Create new event loop for this thread
        try:
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            # Set nest_asyncio to allow nested loops if needed
            try:
                import nest_asyncio
                nest_asyncio.apply()
            except ImportError:
                pass
                
            return loop.run_until_complete(
                self.generate_comprehensive_report(results_data, user_info)
            )
        except Exception as e:
            logger.error(f"Error in sync wrapper: {str(e)}")
            raise
        finally:
            try:
                loop.close()
            except:
                pass

# Singleton instance
pdf_generator = PDFGenerator()