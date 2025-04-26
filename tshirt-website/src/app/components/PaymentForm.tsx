'use client';

import { FormEvent, useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useCart } from '../context/CartContext';
import type { StripeCardElement } from '@stripe/stripe-js';

interface PaymentFormProps {
	email: string;
	onSuccess: () => void;
}

export default function PaymentForm({ email, onSuccess }: PaymentFormProps) {
	const stripe = useStripe();
	const elements = useElements();
	const { items } = useCart();

	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [clientSecret, setClientSecret] = useState<string | null>(null);
	const [isInitializing, setIsInitializing] = useState(true);

	const total = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);

	// Log when component mounts
	useEffect(() => {
		console.log('PaymentForm mounted', {
			hasStripe: !!stripe,
			hasElements: !!elements,
			itemsCount: items.length,
		});

		return () => {
			console.log('PaymentForm unmounted');
		};
	}, []);

	useEffect(() => {
		// Create PaymentIntent as soon as the page loads
		if (items.length > 0) {
			setIsInitializing(true);
			console.log('Initializing payment with items:', items);

			fetch('/api/checkout', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					items: items,
					customerEmail: email,
				}),
			})
				.then((res) => {
					console.log('Checkout API response status:', res.status);
					return res.json();
				})
				.then((data) => {
					console.log('Checkout API response:', data);
					if (data.clientSecret) {
						setClientSecret(data.clientSecret);
						setErrorMessage(null);
					} else if (data.error) {
						setErrorMessage(
							data.error || 'Failed to initialize payment. Please try again.'
						);
					}
					setIsInitializing(false);
				})
				.catch((error) => {
					console.error('Error fetching client secret:', error);
					setErrorMessage('Failed to initialize payment. Please try again.');
					setIsInitializing(false);
				});
		}
	}, [items, email]);

	// Log stripe/elements changes
	useEffect(() => {
		console.log('Stripe or Elements updated', {
			hasStripe: !!stripe,
			hasElements: !!elements,
		});
	}, [stripe, elements]);

	// Display error if Stripe is not properly initialized
	useEffect(() => {
		if (!isInitializing && (!stripe || !elements)) {
			setErrorMessage(
				'Payment system is not properly configured. Please try again later.'
			);
		}
	}, [stripe, elements, isInitializing]);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		if (!stripe || !elements || !clientSecret) {
			setErrorMessage(
				'Payment system not fully loaded. Please refresh and try again.'
			);
			return;
		}

		setIsLoading(true);
		setErrorMessage(null);

		const cardElement = elements.getElement(CardElement);

		if (!cardElement) {
			setErrorMessage('Card information is required');
			setIsLoading(false);
			return;
		}

		console.log('Confirming payment with client secret');

		try {
			const { error, paymentIntent } = await stripe.confirmCardPayment(
				clientSecret,
				{
					payment_method: {
						card: cardElement as unknown as StripeCardElement,
						billing_details: {
							email: email,
						},
					},
				}
			);

			setIsLoading(false);

			if (error) {
				console.error('Payment confirmation error:', error);
				setErrorMessage(error.message || 'An error occurred with your payment');
			} else if (paymentIntent.status === 'succeeded') {
				console.log('Payment succeeded:', paymentIntent.id);
				onSuccess();
			} else {
				console.warn('Payment returned with status:', paymentIntent.status);
				setErrorMessage(`Payment status: ${paymentIntent.status}`);
			}
		} catch (err) {
			console.error('Error during payment confirmation:', err);
			setErrorMessage('An unexpected error occurred. Please try again.');
			setIsLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="p-4 border border-gray-300 rounded-md bg-white">
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Card Details
				</label>
				<CardElement
					options={{
						style: {
							base: {
								fontSize: '16px',
								color: '#424770',
								'::placeholder': {
									color: '#aab7c4',
								},
							},
							invalid: {
								color: '#9e2146',
							},
						},
					}}
				/>
			</div>

			{errorMessage && (
				<div className="text-red-600 text-sm">{errorMessage}</div>
			)}

			<button
				type="submit"
				disabled={!stripe || !clientSecret || isLoading || isInitializing}
				className="w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
			>
				{isLoading
					? 'Processing...'
					: isInitializing
					? 'Initializing...'
					: `Pay $${total.toFixed(2)}`}
			</button>
		</form>
	);
}
