/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import PDFParser from 'pdf2json';
import { promises as fs } from 'fs';

export async function pdfToJson(fileData: Uint8Array): Promise<{ text: string }> {
  try {
    // Ensure /tmp directory exists
    await fs.mkdir('/tmp', { recursive: true });

    // Create a temporary file with timestamp
    const tempFilePath = `/tmp/pdf-${Date.now()}.pdf`;
    
    // Convert Uint8Array to Buffer and save
    const buffer = Buffer.from(fileData);
    await fs.writeFile(tempFilePath, buffer);

    // Create parser instance
    const pdfParser = new (PDFParser as any)(null, 1);

    // Parse PDF
    const parseResult = await new Promise((resolve, reject) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => reject(errData.parserError));
      pdfParser.on('pdfParser_dataReady', () => {
        resolve((pdfParser as any).getRawTextContent());
      });
      pdfParser.loadPDF(tempFilePath);
    });

    // Clean up temp file
    await fs.unlink(tempFilePath);

    return {
      text: parseResult as string
    };
  } catch (error) {
    throw new Error(`Failed to convert PDF to JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}