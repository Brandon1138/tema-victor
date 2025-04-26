import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	/* config options here */
	env: {
		NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
			process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
		STRIPE_SECRET_KEY:
			process.env.STRIPE_SECRET_KEY ||
			process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY,
	},
};

export default nextConfig;
