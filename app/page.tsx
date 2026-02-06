import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white shadow-sm">
        <div className="text-2xl font-bold text-blue-600">BAMMS</div>
        <div className="space-x-6">
          <Link href="/login" className="text-slate-600 font-semibold hover:text-blue-600">Login</Link>
          <Link href="/register" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-6xl mx-auto px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
          Efficient Management for <br />
          <span className="text-blue-600">Modern Barangays</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Streamline attendance, resident records, and community services with the Barangay Management & Monitoring System.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-blue-700 transition">
            Register Now
          </Link>
          <Link href="#features" className="bg-white text-slate-900 border-2 border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition">
            Learn More
          </Link>
        </div>
      </header>

      {/* Feature Section */}
<section id="features" className="bg-slate-50 py-24">
  <div className="max-w-6xl mx-auto px-8">
    <div className="text-center mb-16">
      <h2 className="text-3xl font-bold text-slate-900">Why Choose BAMMS?</h2>
      <p className="text-slate-600 mt-2">Built specifically for the needs of our local community.</p>
    </div>

    <div className="grid md:grid-cols-3 gap-8">
      {/* Feature 1: Real-time Monitoring */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 transition hover:shadow-xl group">
        <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition">
          <span className="text-2xl group-hover:scale-110 transition">📊</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-3">Real-time Monitoring</h3>
        <p className="text-slate-600 leading-relaxed">
          Instantly track resident attendance and community activities. Data updates live on your dashboard as they happen.
        </p>
      </div>

      {/* Feature 2: Automated IDs */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 transition hover:shadow-xl group">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-green-600 transition">
          <span className="text-2xl group-hover:scale-110 transition">🆔</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-3">Automated IDs</h3>
        <p className="text-slate-600 leading-relaxed">
          Forget manual numbering. Every new resident is assigned a unique, sequential system ID (starting from 1001) automatically upon registration.
        </p>
      </div>

      {/* Feature 3: Secure Data */}
      <div className="bg-white p-8 rounded-3xl shadow-md border border-slate-200 transition hover:shadow-xl group">
        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition">
          <span className="text-2xl group-hover:scale-110 transition">🔒</span>
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 mb-3">Secure Data</h3>
        <p className="text-slate-600 leading-relaxed">
          We use Supabase Row-Level Security (RLS) to ensure that resident data is only accessible to authorized officials.
        </p>
      </div>
    </div>
  </div>
</section>
    </div>
  )
}