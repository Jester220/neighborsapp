import { useNavigate } from 'react-router-dom';

const EXAMPLES = [
  { icon: '🔌', text: 'Need a Type-C charger for 20 minutes?' },
  { icon: '🔋', text: 'Need a powerbank for 1 hour?' },
  { icon: '', text: 'Need help with something?' }
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-navy text-white overflow-hidden">
      <header className="flex items-center justify-between px-6 md:px-10 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-display font-extrabold text-lg">
          <span className="text-xl"></span> NeighborSOS
        </div>
        <button
          onClick={() => navigate('/login')}
          className="text-sm font-medium text-white/70 hover:text-white transition-colors"
        >
          Log in
        </button>
      </header>

      {}
      <section className="relative">
        <div
          className="absolute inset-0 bg-cover"
          style={{ backgroundImage: "url('/images/diu-campus.jpg')", backgroundPosition: 'center 30%' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/75 to-navy/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/40" />

        <div className="relative max-w-6xl mx-auto px-6 md:px-10 pt-10 md:pt-20 pb-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="animate-fadeUp">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-coral text-xs font-semibold mb-5">
              Built for Daffodil International University Student
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-[1.1] text-white mb-5">
              Small problems.<br />Nearby people.<br />Real help.
            </h1>
            <p className="text-white/60 text-base md:text-lg leading-relaxed mb-8 max-w-md">
              Need a charger, a quick hand, or help with something you're stuck on?
              Ask the DIU Students around you.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-full bg-coral text-white font-semibold text-sm hover:bg-coral-light transition-colors shadow-card"
              >
                Ask for Help
              </button>
              <button
                onClick={() => navigate('/register')}
                className="px-6 py-3 rounded-full border border-white/20 text-white font-semibold text-sm hover:bg-white/5 transition-colors"
              >
                Explore Nearby
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-blue-accent/10 blur-3xl rounded-full" />
            <div className="relative space-y-3">
              {EXAMPLES.map((ex, i) => (
                <div
                  key={ex.text}
                  style={{ animationDelay: `${i * 120}ms` }}
                  className="animate-fadeUp bg-white/[0.06] backdrop-blur border border-white/10 rounded-xl2 p-4 flex items-center gap-3"
                >
                  <span className="text-2xl">{ex.icon}</span>
                  <span className="text-sm text-white/80">{ex.text}</span>
                  <span className="ml-auto relative flex h-2 w-2 shrink-0">
                    <span className="animate-pulseSoft absolute inline-flex h-full w-full rounded-full bg-coral" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 md:px-10 pb-20">
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { title: 'Ask nearby', desc: 'Post what you need — a charger, a hand, an answer. Students within your radius see it instantly.' },
            { title: 'Someone offers', desc: 'A nearby DIU student offers to help. You accept, then exchange contact details safely.' },
            { title: 'Rate & build trust', desc: 'After you\'re helped, leave a rating. Every profile carries a track record of real help given.' }
          ].map((f) => (
            <div key={f.title} className="bg-white/[0.05] border border-white/10 rounded-xl2 p-5">
              <h3 className="font-display font-bold text-white mb-2">{f.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
