'use client';

import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';

interface TShirt {
	id: string;
	name: string;
	price: number;
	image: string;
	description: string;
}

interface AddedToCartNotification {
	id: string;
	name: string;
}

export default function Hero() {
	const { addToCart } = useCart();
	const [tshirts] = useState<TShirt[]>([
		{
			id: 'ts1',
			name: 'Classic Black Tee',
			price: 29.99,
			image: '/images/black_tee.jpg',
			description: 'Premium cotton classic fit black t-shirt',
		},
		{
			id: 'ts2',
			name: 'Forest Green Tee',
			price: 34.99,
			image: '/images/green_tee.jpg',
			description: 'Soft cotton crew neck t-shirt in vibrant forest green',
		},
		{
			id: 'ts3',
			name: 'Black Beanie',
			price: 24.99,
			image: '/images/black_beanie.jpg',
			description: 'Cozy ribbed knit beanie in classic black',
		},
	]);
	const [notification, setNotification] =
		useState<AddedToCartNotification | null>(null);

	useEffect(() => {
		if (notification) {
			const timer = setTimeout(() => {
				setNotification(null);
			}, 3000);
			return () => clearTimeout(timer);
		}
	}, [notification]);

	const handleAddToCart = (shirt: TShirt) => {
		addToCart(shirt);
		setNotification({ id: shirt.id, name: shirt.name });
		console.log(`Added ${shirt.name} to cart`);
	};

	return (
		<section className="w-full py-8 md:py-16 lg:py-24 bg-white">
			<div className="container px-4 md:px-6 mx-auto">
				<div className="flex flex-col items-center justify-center space-y-4 text-center">
					<p className="max-w-[700px] text-gray-500 md:text-xl">
						Premium quality t-shirts for every occasion
					</p>
				</div>

				{notification && (
					<div className="fixed bottom-4 right-4 bg-black text-white px-4 py-3 rounded-md shadow-lg z-50 animate-fadeIn">
						<p>
							<span className="font-bold">{notification.name}</span> added to
							cart
						</p>
					</div>
				)}

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
					{tshirts.map((shirt) => (
						<div
							key={shirt.id}
							className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md"
						>
							<div className="aspect-square overflow-hidden">
								<img
									src={shirt.image}
									alt={shirt.name}
									className="h-full w-full object-cover transition-transform group-hover:scale-105"
								/>
							</div>
							<div className="p-4">
								<h3 className="font-semibold text-lg text-gray-900">
									{shirt.name}
								</h3>
								<p className="text-sm text-gray-500 mt-1">
									{shirt.description}
								</p>
								<div className="flex items-center justify-between mt-4">
									<span className="font-medium text-gray-900">
										${shirt.price.toFixed(2)}
									</span>
									<button
										onClick={() => handleAddToCart(shirt)}
										className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
									>
										Add to Cart
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
