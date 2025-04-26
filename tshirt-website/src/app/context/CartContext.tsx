'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CartItem {
	id: string;
	name: string;
	price: number;
	image: string;
	quantity: number;
}

interface CartContextType {
	items: CartItem[];
	addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
	removeFromCart: (id: string) => void;
	clearCart: () => void;
	getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([]);

	const addToCart = (
		product: Omit<CartItem, 'quantity'> & { quantity?: number }
	) => {
		setItems((prevItems) => {
			// Check if product already exists in cart
			const existingItemIndex = prevItems.findIndex(
				(item) => item.id === product.id
			);

			if (existingItemIndex > -1) {
				// Update quantity of existing item
				const updatedItems = [...prevItems];
				updatedItems[existingItemIndex].quantity += product.quantity || 1;
				return updatedItems;
			} else {
				// Add new item to cart
				return [...prevItems, { ...product, quantity: product.quantity || 1 }];
			}
		});
	};

	const removeFromCart = (id: string) => {
		setItems((prevItems) => prevItems.filter((item) => item.id !== id));
	};

	const clearCart = () => {
		setItems([]);
	};

	const getCartCount = () => {
		return items.reduce((total, item) => total + item.quantity, 0);
	};

	return (
		<CartContext.Provider
			value={{ items, addToCart, removeFromCart, clearCart, getCartCount }}
		>
			{children}
		</CartContext.Provider>
	);
}

export function useCart() {
	const context = useContext(CartContext);
	if (context === undefined) {
		throw new Error('useCart must be used within a CartProvider');
	}
	return context;
}
