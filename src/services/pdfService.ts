import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

// Configure the worker
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url
).toString();

export interface PDFExtractionResult {
  text: string;
  images: string[];
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    const images: string[] = [];
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      
      // Extract text
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';

      // Extract images
      const operatorList = await page.getOperatorList();
      for (let j = 0; j < operatorList.fnArray.length; j++) {
        if (operatorList.fnArray[j] === 82) { // 82 is the code for "paintImageXObject"
          const imgData = await page.objs.get(operatorList.argsArray[j][0]);
          if (imgData && imgData.src) {
            images.push(imgData.src);
          }
        }
      }
    }
    
    if (!fullText.trim() && images.length === 0) {
      throw new Error('No content could be extracted from the PDF.');
    }
    
    return { text: fullText, images };
  } catch (error) {
    console.error('Error extracting content from PDF:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to process PDF: ${error.message}`);
    }
    throw new Error('Failed to process PDF. Please ensure the file is a valid PDF document.');
  }
} 