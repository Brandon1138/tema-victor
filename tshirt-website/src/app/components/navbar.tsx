'use client';

import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function Navbar() {
	const { getCartCount } = useCart();
	const cartCount = getCartCount();

	return (
		<nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200">
			<div className="container mx-auto px-4 md:px-6">
				<div className="flex items-center justify-between h-16">
					{/* Brand Name */}
					<Link href="/" className="text-xl font-bold tracking-tight">
						COMATI
					</Link>

					{/* Cart Icon */}
					<Link
						href="/checkout"
						className="relative p-2 text-gray-800 hover:text-black focus:outline-none"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="24"
							height="24"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="h-6 w-6"
						>
							<circle cx="8" cy="21" r="1" />
							<circle cx="19" cy="21" r="1" />
							<path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
						</svg>

						{/* Cart Count Badge */}
						{cartCount > 0 && (
							<span className="absolute top-0 right-0 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-black rounded-full">
								{cartCount}
							</span>
						)}
					</Link>
				</div>
			</div>
		</nav>
	);
}
