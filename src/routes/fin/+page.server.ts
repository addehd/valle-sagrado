import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { createReceipt, updateReceipt, getUserReceipts } from '$lib/receipts';
import type { Receipt, ReceiptProcessedData } from '$lib/types';
import OpenAI from 'openai';
import sharp from 'sharp';

// Function to get OpenAI client with lazy initialization
function getOpenAIClient() {
  return new OpenAI({
    apiKey: "REDACTED"
  });
}

export const load: PageServerLoad = async ({ locals }) => {
  const { session, user } = await locals.safeGetSession();
  
  if (!user) {
    redirect(303, '/login');
  }

  // Load user's receipts
  const { receipts, error } = await getUserReceipts(locals.supabase, user.id);
  
  return {
    user,
    receipts: receipts || [],
    receiptsError: error
  };
};

export const actions: Actions = {
  uploadReceipt: async ({ request, locals }) => {
    const { session, user } = await locals.safeGetSession();
    
    if (!user) {
      return fail(401, { error: 'Authentication required' });
    }

    try {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file || file.size === 0) {
        return fail(400, { error: 'No file provided' });
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        return fail(400, { 
          error: 'Invalid file type. Only JPEG, PNG, and PDF files are supported.' 
        });
      }

      // Check file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        return fail(400, { error: 'File too large. Maximum size is 10MB.' });
      }

      // Create initial receipt record
      console.log('Creating receipt record for user:', user.id, 'file:', file.name);
      const receiptData: Partial<Receipt> = {
        user_id: user.id,
        file_name: file.name,
        file_type: getFileTypeFromName(file.name) as 'jpg' | 'jpeg' | 'png' | 'pdf',
        processing_status: 'processing'
      };
      console.log('Receipt data:', receiptData);

      const createResult = await createReceipt(locals.supabase, receiptData);
      console.log('Create receipt result:', createResult);
      
      if (!createResult.success) {
        console.error('Failed to create receipt record:', createResult.error);
        return fail(500, { 
          error: 'Failed to create receipt record', 
          details: createResult.error 
        });
      }

      const receiptId = createResult.receipt_id!;

      try {
        // Process the file
        console.log(`Processing file: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
        const fileBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(fileBuffer);
        console.log(`File buffer created: ${buffer.length} bytes`);
        
        let extractedText: string;
        let processedImage: Buffer | null = null;

        if (file.type === 'application/pdf') {
          // Extract text from PDF using dynamic import with error handling
          console.log('Processing PDF file...');
          try {
            const pdfParse = (await import('pdf-parse')).default;
            const pdfData = await pdfParse(buffer);
            extractedText = pdfData.text;
            console.log(`PDF text extracted: ${extractedText.length} characters`);
          } catch (pdfError) {
            console.error('PDF parsing failed, falling back to OCR:', pdfError);
            // Fallback: convert PDF to image and use OCR
            processedImage = await sharp(buffer, { density: 300 })
              .png()
              .toBuffer();
            extractedText = await performOCR(processedImage);
            console.log(`OCR fallback completed: ${extractedText.length} characters`);
          }
        } else {
          // Process image
          console.log('Processing image file...');
          processedImage = await sharp(buffer)
            .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
          console.log(`Image processed: ${processedImage.length} bytes`);

          // Perform OCR using OpenAI Vision API
          console.log('Starting OCR...');
          extractedText = await performOCR(processedImage);
          console.log(`OCR completed: ${extractedText.length} characters`);
        }

        console.log('Extracted text preview:', extractedText.substring(0, 200) + '...');

        // Interpret the extracted text
        console.log('Starting text interpretation...');
        const interpretedData = await interpretReceiptText(extractedText);
        console.log('Interpreted data:', JSON.stringify(interpretedData, null, 2));

        // Update receipt with results
        const updateData: Partial<Receipt> = {
          raw_text: extractedText,
          processed_data: interpretedData,
          merchant: interpretedData.merchant,
          date: interpretedData.date,
          total: interpretedData.total,
          currency: interpretedData.currency || 'USD',
          processing_status: 'completed'
        };
        console.log('Updating receipt with data:', updateData);

        const updateResult = await updateReceipt(locals.supabase, receiptId, updateData);
        console.log('Update receipt result:', updateResult);
        
        if (!updateResult.success) {
          console.error('Failed to update receipt with processed data:', updateResult.error);
          return fail(500, { 
            error: 'Failed to update receipt with processed data',
            details: updateResult.error 
          });
        }

        return {
          success: true,
          message: 'Receipt processed successfully',
          receipt_id: receiptId,
          processed_data: interpretedData,
          extracted_text: extractedText
        };

      } catch (processingError) {
        // Update receipt with error status
        await updateReceipt(locals.supabase, receiptId, {
          processing_status: 'failed',
          error_message: processingError instanceof Error ? processingError.message : 'Processing failed'
        });

        console.error('Receipt processing error:', processingError);
        return fail(500, { 
          error: 'Failed to process receipt', 
          details: processingError instanceof Error ? processingError.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error('Upload error:', error);
      return fail(500, { 
        error: 'Upload failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },

  deleteReceipt: async ({ request, locals }) => {
    const { session, user } = await locals.safeGetSession();
    
    if (!user) {
      return fail(401, { error: 'Authentication required' });
    }

    try {
      const formData = await request.formData();
      const receiptId = formData.get('receiptId') as string;
      
      if (!receiptId) {
        return fail(400, { error: 'Receipt ID required' });
      }

      // Delete receipt (RLS policies will ensure user can only delete their own)
      const { error } = await locals.supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId)
        .eq('user_id', user.id);

      if (error) {
        return fail(500, { 
          error: 'Failed to delete receipt',
          details: error.message 
        });
      }

      return {
        success: true,
        message: 'Receipt deleted successfully'
      };

    } catch (error) {
      console.error('Delete error:', error);
      return fail(500, { 
        error: 'Delete failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
};

/**
 * Perform OCR on an image using OpenAI Vision API
 */
async function performOCR(imageBuffer: Buffer): Promise<string> {
  try {
    const base64Image = imageBuffer.toString('base64');
    const openai = getOpenAIClient();
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Using the latest model with vision capabilities
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Please extract ALL text from this receipt image. Provide the complete text content as accurately as possible, maintaining the original structure and order."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
                detail: "high"
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    });

    return response.choices[0]?.message?.content || '';
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error(`OCR failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Interpret extracted text to extract structured receipt data
 */
async function interpretReceiptText(text: string): Promise<ReceiptProcessedData> {

  try {
    const prompt = `
Please analyze this receipt/invoice text and extract structured data. Return a JSON object with the following fields:

BASIC FIELDS:
- merchant: string (store/company name)
- date: string (ISO date format YYYY-MM-DD, or null if not found)
- total: number (final total amount as a number, or null if not found)
- subtotal: number (subtotal before tax, or null if not found)
- tax: number (tax amount, or null if not found)
- currency: string (currency code like "USD", "EUR", "SEK", etc.)
- items: array of objects with {name: string, quantity?: number, price?: number}
- address: string (store address, or null if not found)
- confidence_score: number (0-1, how confident you are in the extraction)

INVOICE/RECEIPT SPECIFIC FIELDS (Swedish/European invoices):
- invoice_number: string (unique invoice number / fakturanummer, or null if not found)
- invoice_date: string (invoice date if different from transaction date, ISO format YYYY-MM-DD)
- seller_vat_number: string (seller's VAT registration number / momsregistreringsnummer)
- buyer_name: string (buyer's name / köparens namn)
- buyer_address: string (buyer's address / köparens adress)
- seller_address: string (seller's address / säljarens adress)
- delivery_date: string (delivery or service date / leveransdatum, ISO format YYYY-MM-DD)
- vat_rate: number (VAT rate as percentage, e.g. 25 for 25%)
- vat_amount: number (VAT amount / momsbelopp)
- payment_due_date: string (payment due date / betalningsdatum, ISO format YYYY-MM-DD)
- unit_price_excl_vat: number (unit price excluding VAT)

Receipt/Invoice text:
${text}

Return only the JSON object, no additional text.`;

    const openai = getOpenAIClient();
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.1 // Low temperature for consistent extraction
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    try {
      // Clean the response - remove markdown code blocks if present
      let cleanContent = content.trim();
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }
      
      // Parse the JSON response
      const parsedData = JSON.parse(cleanContent) as ReceiptProcessedData;
      
      // Validate and clean the data
      return {
        merchant: parsedData.merchant || undefined,
        date: parsedData.date || undefined,
        total: typeof parsedData.total === 'number' ? parsedData.total : undefined,
        subtotal: typeof parsedData.subtotal === 'number' ? parsedData.subtotal : undefined,
        tax: typeof parsedData.tax === 'number' ? parsedData.tax : undefined,
        currency: parsedData.currency || 'USD',
        items: Array.isArray(parsedData.items) ? parsedData.items : [],
        address: parsedData.address || undefined,
        confidence_score: typeof parsedData.confidence_score === 'number' ? parsedData.confidence_score : 0.5,
        
        // Swedish invoice fields
        invoice_number: parsedData.invoice_number || undefined,
        invoice_date: parsedData.invoice_date || undefined,
        seller_vat_number: parsedData.seller_vat_number || undefined,
        buyer_name: parsedData.buyer_name || undefined,
        buyer_address: parsedData.buyer_address || undefined,
        seller_address: parsedData.seller_address || undefined,
        delivery_date: parsedData.delivery_date || undefined,
        vat_rate: typeof parsedData.vat_rate === 'number' ? parsedData.vat_rate : undefined,
        vat_amount: typeof parsedData.vat_amount === 'number' ? parsedData.vat_amount : undefined,
        payment_due_date: parsedData.payment_due_date || undefined,
        unit_price_excl_vat: typeof parsedData.unit_price_excl_vat === 'number' ? parsedData.unit_price_excl_vat : undefined
      };
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse structured data from response');
    }

  } catch (error) {
    console.error('Text interpretation error:', error);
    throw new Error(`Text interpretation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get file type from filename
 */
function getFileTypeFromName(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  return ext || 'unknown';
} 