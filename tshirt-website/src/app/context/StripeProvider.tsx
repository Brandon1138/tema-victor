'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode, useEffect, useState } from 'react';

// Don't initialize on import - defer to client
let stripePromise: ReturnType<typeof loadStripe> | null = null;

interface StripeProviderProps {
	children: ReactNode;
}

export default function StripeProvider({ children }: StripeProviderProps) {
	const [stripe, setStripe] = useState<ReturnType<typeof loadStripe> | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const initializeStripe = async () => {
			try {
				if (!stripePromise && typeof window !== 'undefined') {
					// Debug the environment variable
					const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
					console.log('Stripe key exists:', !!key);

					if (key) {
						console.log('Initializing Stripe with key:', key);
						stripePromise = loadStripe(key);
						setStripe(stripePromise);
					} else {
						console.error('Stripe publishable key is missing');
						setError('Stripe publishable key is missing');
					}
				} else if (stripePromise) {
					console.log('Using existing Stripe promise');
					setStripe(stripePromise);
				}
			} catch (err) {
				console.error('Error initializing Stripe:', err);
				setError('Failed to initialize Stripe');
			} finally {
				setLoading(false);
			}
		};

		initializeStripe();
	}, []);

	// For debugging purposes
	useEffect(() => {
		console.log('StripeProvider state:', {
			hasStripe: !!stripe,
			loading,
			error,
		});
	}, [stripe, loading, error]);

	// Provide helpful diagnostics in development
	if (process.env.NODE_ENV === 'development' && error) {
		console.warn('Stripe initialization error:', error);
	}

	return <Elements stripe={stripe}>{children}</Elements>;
}
