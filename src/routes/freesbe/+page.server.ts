import { fail } from '@sveltejs/kit';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import type { Actions } from './$types';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL || 'https://zcqegfromikuxdieueto.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpjcWVnZnJvbWlrdXhkaWV1ZXRvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MzIzNDYzOCwiZXhwIjoxOTg4ODEwNjM4fQ.hGebc9mFzBA0JakNGDGPI92ye89wqEgNtYujEb5LX5I' 

if (!supabaseServiceKey) {
	throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Email configuration
const emailConfig = {
	host: 'smtp.websupport.se',
	port: 465,
	secure: true,
	auth: {
		user: process.env.SMTP_USER || 'your-email@yourdomain.tld',
		pass: process.env.SMTP_PASS || 'your-email-password'
	}
};

export const actions: Actions = {
	requestQuote: async ({ request }) => {
		const data = await request.formData();
		
		// Extract form data
		const customerName = data.get('customerName') as string;
		const email = data.get('email') as string;
		const phone = data.get('phone') as string;
		const company = data.get('company') as string;
		const quantity = parseInt(data.get('quantity') as string);
		const logoPosition = data.get('logoPosition') as string;
		const additionalNotes = data.get('additionalNotes') as string;
		const selectedServices = JSON.parse(data.get('selectedServices') as string);
		const logo = data.get('logo') as File;
		
		// Basic validation
		if (!customerName || !email || !quantity || selectedServices.length === 0) {
			return fail(400, {
				error: 'Missing required fields',
				customerName,
				email,
				phone,
				company,
				quantity,
				logoPosition,
				additionalNotes
			});
		}
		
		// Email validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return fail(400, {
				error: 'Invalid email address',
				customerName,
				email,
				phone,
				company,
				quantity,
				logoPosition,
				additionalNotes
			});
		}
		
		try {
			// Handle logo upload if present
			let logoUrl = null;
			let logoFilename = null;
			
			if (logo && logo.size > 0) {
				// Validate file type
				if (!logo.type.startsWith('image/')) {
					return fail(400, {
						error: 'Logo must be an image file',
						customerName,
						email,
						phone,
						company,
						quantity,
						logoPosition,
						additionalNotes
					});
				}
				
				// For now, we'll store just the filename
				// In production, you'd upload to Supabase Storage or another service
				logoFilename = logo.name;
				logoUrl = `pending_upload_${Date.now()}_${logo.name}`;
				
				// TODO: Implement actual file upload to Supabase Storage
				// const { data: uploadData, error: uploadError } = await supabase.storage
				//   .from('logos')
				//   .upload(`${Date.now()}_${logo.name}`, logo);
			}
			
			// Save to Supabase database
			const { data: printData, error: dbError } = await supabase
				.from('print')
				.insert({
					customer_name: customerName,
					email: email,
					phone: phone || null,
					company: company || null,
					quantity: quantity,
					selected_services: selectedServices,
					logo_url: logoUrl,
					logo_filename: logoFilename,
					logo_position: logoPosition,
					additional_notes: additionalNotes,
					status: 'pending'
				})
				.select()
				.single();

			if (dbError) {
				console.error('Database error:', dbError);
				return fail(500, {
					error: 'Failed to save quote request to database'
				});
			}

			// Send email notifications
			await sendQuoteRequestEmail({
				id: printData.id,
				customerName,
				email,
				phone,
				company,
				quantity,
				selectedServices,
				logoPosition,
				additionalNotes,
				createdAt: printData.created_at
			});
			
			return {
				success: true,
				message: 'Quote request submitted successfully!',
				quoteId: printData.id
			};
			
		} catch (error) {
			console.error('Error processing quote request:', error);
			return fail(500, {
				error: 'Failed to process quote request. Please try again.'
			});
		}
	}
};

// Email sending function
async function sendQuoteRequestEmail(quoteData: any) {
	try {
		const transporter = nodemailer.createTransporter(emailConfig);

		// Format selected services for email
		const servicesText = quoteData.selectedServices.map((serviceId: number) => {
			const serviceNames = {
				1: 'Custom Frisbee Printing',
				2: 'Premium Sweatshirt Printing', 
				3: 'Custom Coffee Cup Design',
				4: 'Bulk Order Discounts'
			};
			return `- ${serviceNames[serviceId as keyof typeof serviceNames] || `Service ${serviceId}`}`;
		}).join('\n');

		// Email to business owner/admin
		const adminEmailContent = `
Ny offertförfrågan från Freesbe Print Service

Kunduppgifter:
- Namn: ${quoteData.customerName}
- E-post: ${quoteData.email}
- Telefon: ${quoteData.phone || 'Ej angivet'}
- Företag: ${quoteData.company || 'Ej angivet'}

Beställningsdetaljer:
- Antal: ${quoteData.quantity}
- Valda tjänster:
${servicesText}
- Logotyp position: ${quoteData.logoPosition}

Ytterligare anteckningar:
${quoteData.additionalNotes || 'Inga anteckningar'}

Offert-ID: ${quoteData.id}
Datum: ${new Date(quoteData.createdAt).toLocaleString('sv-SE')}
		`.trim();

		// Send admin notification
		await transporter.sendMail({
			from: emailConfig.auth.user,
			to: emailConfig.auth.user, // Send to yourself
			subject: `Ny offertförfrågan - ${quoteData.customerName}`,
			text: adminEmailContent
		});

		// Email confirmation to customer
		const customerEmailContent = `
Tack för din offertförfrågan!

Hej ${quoteData.customerName},

Vi har mottagit din offertförfrågan för våra print-tjänster. Vi kommer att granska din förfrågan och återkomma med en personlig offert inom 24 timmar.

Dina uppgifter:
- Antal: ${quoteData.quantity} st
- Valda tjänster:
${servicesText}

Offert-ID: ${quoteData.id}

Vi ser fram emot att arbeta med dig!

Med vänliga hälsningar,
Freesbe Print Service Team
		`.trim();

		// Send customer confirmation
		await transporter.sendMail({
			from: emailConfig.auth.user,
			to: quoteData.email,
			subject: 'Tack för din offertförfrågan - Freesbe Print Service',
			text: customerEmailContent
		});

		console.log('Emails sent successfully for quote:', quoteData.id);
		
	} catch (error) {
		console.error('Error sending emails:', error);
		// Don't throw error here - quote was saved successfully
		// Email failure shouldn't break the whole process
	}
}