import Hero from './components/hero';
import Navbar from './components/navbar';

export default function Home() {
	return (
		<main className="min-h-screen">
			<Navbar />
			<Hero />
		</main>
	);
}
