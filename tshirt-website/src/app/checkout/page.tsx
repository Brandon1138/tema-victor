'use client';

import { useCart } from '../context/CartContext';
import { useState } from 'react';
import Link from 'next/link';
import Navbar from '../components/navbar';
import StripeProvider from '../context/StripeProvider';
import PaymentForm from '../components/PaymentForm';

export default function Checkout() {
	const { items, removeFromCart, clearCart } = useCart();
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		address: '',
	});
	const [isSubmitted, setIsSubmitted] = useState(false);
	const [showPayment, setShowPayment] = useState(false);

	const subtotal = items.reduce(
		(total, item) => total + item.price * item.quantity,
		0
	);
	const shipping = 5.99;
	const total = subtotal + shipping;

	const handleInputChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setShowPayment(true);
	};

	const handlePaymentSuccess = () => {
		setIsSubmitted(true);
		clearCart();
	};

	if (isSubmitted) {
		return (
			<>
				<Navbar />
				<div className="container mx-auto px-4 py-16 max-w-4xl bg-white text-gray-800">
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">
							Thank You For Your Order!
						</h1>
						<p className="mb-6">Your order has been successfully placed.</p>
						<Link
							href="/"
							className="inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
						>
							Continue Shopping
						</Link>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Navbar />
			<main className="min-h-screen bg-white text-gray-800">
				<div className="container mx-auto px-4 py-8 max-w-6xl">
					<h1 className="text-2xl font-bold mb-8">Checkout</h1>

					{items.length === 0 ? (
						<div className="text-center py-12">
							<p className="mb-6">Your cart is empty</p>
							<Link
								href="/"
								className="inline-block rounded-full bg-black px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
							>
								Continue Shopping
							</Link>
						</div>
					) : (
						<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
							<div className="lg:col-span-2">
								<div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
									<h2 className="font-semibold text-lg mb-4">Order Summary</h2>
									<div className="divide-y divide-gray-200">
										{items.map((item) => (
											<div key={item.id} className="py-4 flex items-center">
												<div className="h-16 w-16 bg-gray-100 rounded overflow-hidden">
													<img
														src={item.image}
														alt={item.name}
														className="h-full w-full object-cover"
													/>
												</div>
												<div className="ml-4 flex-1">
													<h3 className="font-medium">{item.name}</h3>
													<p className="text-sm text-gray-500">
														Qty: {item.quantity}
													</p>
												</div>
												<div className="text-right">
													<p className="font-medium">
														${(item.price * item.quantity).toFixed(2)}
													</p>
													<button
														onClick={() => removeFromCart(item.id)}
														className="text-sm text-red-600 hover:text-red-800"
													>
														Remove
													</button>
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className="lg:col-span-1">
								<div className="bg-white rounded-lg shadow-sm p-6 mb-6 border border-gray-200">
									<h2 className="font-semibold text-lg mb-4">Order Total</h2>
									<div className="space-y-2 mb-4">
										<div className="flex justify-between">
											<span>Subtotal</span>
											<span>${subtotal.toFixed(2)}</span>
										</div>
										<div className="flex justify-between">
											<span>Shipping</span>
											<span>${shipping.toFixed(2)}</span>
										</div>
										<div className="flex justify-between font-semibold text-lg pt-2 border-t">
											<span>Total</span>
											<span>${total.toFixed(2)}</span>
										</div>
									</div>
								</div>

								{!showPayment ? (
									<form
										onSubmit={handleSubmit}
										className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
									>
										<h2 className="font-semibold text-lg mb-4">
											Shipping Information
										</h2>
										<div className="space-y-4">
											<div>
												<label
													htmlFor="name"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Full Name
												</label>
												<input
													type="text"
													id="name"
													name="name"
													required
													value={formData.name}
													onChange={handleInputChange}
													className="w-full px-3 py-2 border border-gray-300 rounded-md"
												/>
											</div>
											<div>
												<label
													htmlFor="email"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Email Address
												</label>
												<input
													type="email"
													id="email"
													name="email"
													required
													value={formData.email}
													onChange={handleInputChange}
													className="w-full px-3 py-2 border border-gray-300 rounded-md"
												/>
											</div>
											<div>
												<label
													htmlFor="address"
													className="block text-sm font-medium text-gray-700 mb-1"
												>
													Shipping Address
												</label>
												<textarea
													id="address"
													name="address"
													required
													value={formData.address}
													onChange={handleInputChange}
													rows={3}
													className="w-full px-3 py-2 border border-gray-300 rounded-md"
												/>
											</div>
											<button
												type="submit"
												className="w-full rounded-full bg-black px-4 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:bg-gray-400"
											>
												Proceed to Payment
											</button>
										</div>
									</form>
								) : (
									<div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
										<h2 className="font-semibold text-lg mb-4">
											Payment Details
										</h2>
										<StripeProvider>
											<PaymentForm
												email={formData.email}
												onSuccess={handlePaymentSuccess}
											/>
										</StripeProvider>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</main>
		</>
	);
}
