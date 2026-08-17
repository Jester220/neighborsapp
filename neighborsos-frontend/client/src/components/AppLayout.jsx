import Navbar from './Navbar';

export default function AppLayout({ children }) {
  return (
    <div className="app-bg">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-10">
        {children}
      </main>
    </div>
  );
}
// show navbar in all pages expect for login and signup pages