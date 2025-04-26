import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Debug the environment variables
console.log('Checking for Stripe keys:');
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);

let stripeInstance: Stripe | null = null;

try {
	// Use the correct environment variable name
	const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

	if (stripeSecretKey) {
		stripeInstance = new Stripe(stripeSecretKey, {
			apiVersion: '2025-03-31.basil', // Keep the original API version to match the type
		});
		console.log('Stripe initialized successfully');
	} else {
		console.error('No Stripe secret key found in environment variables');
	}
} catch (initError) {
	console.error('Error initializing Stripe:', initError);
}

export async function POST(request: Request) {
	try {
		// If Stripe is not initialized, return an error
		if (!stripeInstance) {
			console.error('Stripe not initialized when handling request');
			return NextResponse.json(
				{
					error: 'Stripe is not configured properly. Please check server logs.',
				},
				{ status: 500 }
			);
		}

		// Parse request body
		let requestData;
		try {
			requestData = await request.json();
		} catch (parseError) {
			console.error('Failed to parse request body:', parseError);
			return NextResponse.json(
				{ error: 'Invalid request data' },
				{ status: 400 }
			);
		}

		const { items, customerEmail } = requestData;

		// Validate required fields
		if (!items || !Array.isArray(items) || items.length === 0) {
			console.error('Missing or invalid items in request:', items);
			return NextResponse.json(
				{ error: 'Invalid items data' },
				{ status: 400 }
			);
		}

		// Calculate order amount from items
		const amount = items.reduce((total: number, item: any) => {
			if (
				!item.price ||
				typeof item.price !== 'number' ||
				!item.quantity ||
				typeof item.quantity !== 'number'
			) {
				console.error('Invalid item data:', item);
				throw new Error('Invalid item data');
			}
			return total + Math.round(item.price * 100) * item.quantity;
		}, 0);

		console.log(
			'Creating payment intent for amount:',
			amount,
			'email:',
			customerEmail
		);

		// Create a PaymentIntent with the order amount and currency
		const paymentIntent = await stripeInstance.paymentIntents.create({
			amount,
			currency: 'usd',
			receipt_email: customerEmail,
			automatic_payment_methods: {
				enabled: true,
			},
		});

		console.log('Payment intent created successfully:', paymentIntent.id);
		return NextResponse.json({ clientSecret: paymentIntent.client_secret });
	} catch (error: any) {
		console.error('Error in checkout route:', error.message);
		if (error.type && error.type.startsWith('Stripe')) {
			console.error('Stripe API error:', error.type, error.message);
			return NextResponse.json(
				{ error: `Stripe error: ${error.message}` },
				{ status: 400 }
			);
		}

		return NextResponse.json(
			{ error: 'Server error processing payment' },
			{ status: 500 }
		);
	}
}
