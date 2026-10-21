import { Icon } from '@iconify/react'

export default function Page() {
  return (
    <div className="md:p-12 flex flex-col gap-12 min-h-screen antialiased text-gray-900 bg-[#94988e] pt-4 pr-4 pb-4 pl-4 font-sans">
      {/* Panel 1: Hero */}
      <section className="bg-[#FAFAFA] rounded-[2rem] p-6 md:p-12 w-full max-w-[1400px] mx-auto shadow-sm">
        {/* Header */}
        <header className="flex justify-between items-center mb-16 md:mb-24">
          <div className="text-xl font-semibold tracking-tight uppercase">/OFFERNEPAL</div>
          <nav className="hidden md:flex gap-10">
            <a href="/about" className="hover:text-black transition-colors text-sm font-medium text-gray-800">About</a>
            <a href="/features" className="text-sm font-medium text-gray-800 hover:text-black transition-colors">Features</a>
            <a href="/pricing" className="text-sm font-medium text-gray-800 hover:text-black transition-colors">Pricing</a>
            <a href="/contact" className="text-sm font-medium text-gray-800 hover:text-black transition-colors">Contact</a>
          </nav>
          <div className="flex gap-4 items-center">
            <a href="/admin/auth/login" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors">Admin Login</a>
            <a href="/merchant/auth/login" className="border border-gray-300 px-6 py-2.5 rounded-full text-sm font-medium hover:bg-gray-50 transition-colors">Merchant Login</a>
          </div>
        </header>

        {/* Hero Image */}
        <div className="w-full h-[400px] md:h-[600px] rounded-[1.5rem] overflow-hidden relative">
          <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/917d6f93-fb36-439a-8c48-884b67b35381_1600w.jpg" alt="Business Operations" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Container Labels overlay */}
          <div className="absolute bottom-1/2 left-10 md:left-20 flex flex-col gap-2 text-white/80 font-mono text-sm mix-blend-overlay">
            <span>Merchant classification</span>
            <span className="font-semibold text-lg">OFF-8472-991A</span>
            <Icon icon="solar:box-minimalistic-bold-duotone" className="text-3xl mt-2" />
          </div>
        </div>
        
        {/* Trusted By Logos */}
        <div className="mt-16 pt-12 border-t border-gray-200 overflow-hidden">
          <p className="text-sm text-center text-gray-500 font-medium mb-8">Trusted by leading merchants across Nepal</p>
          <div className="relative">
            <div className="flex gap-12 md:gap-20 opacity-60 grayscale animate-marquee">
              <div className="flex gap-12 md:gap-20 items-center">
                <Icon icon="simple-icons:nasa" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:spacex" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:uber" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:visa" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:grab" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:bose" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:discover" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:dji" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:nikon" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:craftsman" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:sony" className="text-[64px] flex-shrink-0" />
              </div>
              <div className="flex gap-12 md:gap-20 items-center">
                <Icon icon="simple-icons:nasa" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:spacex" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:uber" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:visa" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:grab" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:bose" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:discover" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:dji" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:nikon" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:craftsman" className="text-[64px] flex-shrink-0" />
                <Icon icon="simple-icons:sony" className="text-[64px] flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12 mt-16">
          <h1 className="text-6xl md:text-8xl font-semibold tracking-tight leading-[1.05] max-w-3xl">
            Empower Your Business Globally
          </h1>
          <div className="max-w-xs flex flex-col gap-8 md:items-start">
            <p className="text-base text-gray-600 leading-relaxed">
              The complete merchant platform for managing offers, customers, and business operations with enterprise-grade security and scale.
            </p>
            <a href="#" className="bg-black text-white px-8 py-3.5 rounded-full text-base font-medium inline-flex w-max hover:bg-gray-800 transition-colors">
              Explore Platform
            </a>
          </div>
        </div>
      </section>

      {/* Panel 2: Solutions */}
      <section className="bg-[#FAFAFA] rounded-[2rem] p-6 md:p-12 w-full max-w-[1400px] mx-auto shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-12">
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Merchant Services</h2>
          <div className="flex flex-col items-start md:items-end gap-4 max-w-sm text-left md:text-right">
            <p className="text-base text-gray-600">Comprehensive tools to manage your offers, customers, and business operations efficiently.</p>
            <a href="#" className="bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium inline-block">Browse Features</a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 h-[900px] md:h-[600px]">
          {/* Card 1 */}
          <div className="md:col-span-3 relative rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1559297434-fae8a1916a79?auto=format&fit=crop&q=80&w=800" alt="Offer Management" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-semibold tracking-tight mb-2">Offer Campaigns</h3>
              <p className="text-base text-gray-300 line-clamp-2">Create and manage promotional campaigns with flexible scheduling, targeting, and redemption tracking capabilities.</p>
            </div>
          </div>
          
          {/* Card 2 */}
          <div className="md:col-span-3 relative rounded-2xl overflow-hidden group">
            <img src="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/4734259a-bad7-422f-981e-ce01e79184f2_1600w.jpg" alt="Customer Management" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8 text-white">
              <h3 className="text-2xl font-semibold tracking-tight mb-2">Customer Insights</h3>
              <p className="text-base text-gray-300 line-clamp-2">Deep analytics on customer behavior, purchase patterns, and engagement metrics to drive data-driven decisions.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=600" alt="Inventory" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-semibold tracking-tight mb-2">Inventory Sync</h3>
              <p className="text-sm text-gray-300 line-clamp-2">Real-time inventory management with automatic stock updates and low-stock alerts.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=600" alt="Analytics" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-semibold tracking-tight mb-2">Performance Analytics</h3>
              <p className="text-sm text-gray-300 line-clamp-2">Comprehensive dashboards showing revenue, conversion rates, and campaign effectiveness.</p>
            </div>
          </div>

          {/* Card 5 */}
          <div className="md:col-span-2 relative rounded-2xl overflow-hidden group">
            <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600" alt="Payments" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-6 text-white">
              <h3 className="text-xl font-semibold tracking-tight mb-2">Secure Payments</h3>
              <p className="text-sm text-gray-300 line-clamp-2">Integrated payment processing with multiple gateways and automated settlement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Panel 3: Industries */}
      <section className="bg-[#FAFAFA] rounded-[2rem] p-6 md:p-12 w-full max-w-[1400px] mx-auto shadow-sm">
        <div className="mb-12">
          <div className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">/ Business Types We Serve</div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-xl">Industry Solutions</h2>
            <div className="max-w-xs flex flex-col gap-6 items-start md:items-end text-left md:text-right">
              <p className="text-base text-gray-600">Tailored features for different business models, from retail to service providers.</p>
              {/* Custom Arrow Controls */}
              <div className="flex items-center gap-4">
                <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <Icon icon="solar:arrow-left-linear" className="text-xl text-gray-600" />
                </button>
                <div className="w-16 h-px bg-gray-300"></div>
                <button className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors">
                  <Icon icon="solar:arrow-right-linear" className="text-xl text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[400px]">
          {/* Card 1 */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-auto border border-gray-100">
              <Icon icon="solar:cart-large-bold-duotone" className="text-2xl text-gray-800" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mt-12 mb-4">Retail Stores</h3>
            <p className="text-base text-gray-500">Manage in-store promotions, loyalty programs, and omnichannel customer experiences.</p>
          </div>

          {/* Card 2 (Dark) */}
          <div className="bg-gray-900 rounded-[2rem] p-8 flex flex-col shadow-sm">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mb-auto">
              <Icon icon="solar:factory-bold-duotone" className="text-2xl text-white" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mt-12 mb-4 text-white">Manufacturing</h3>
            <p className="text-base text-gray-400">B2B offer management for distributors, bulk pricing, and wholesale operations.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-auto border border-gray-100">
              <Icon icon="solar:pill-bold-duotone" className="text-2xl text-gray-800" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mt-12 mb-4">Healthcare</h3>
            <p className="text-base text-gray-500">Specialized offers for medical services, wellness programs, and patient engagement.</p>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-[2rem] p-8 flex flex-col border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-auto border border-gray-100">
              <Icon icon="solar:cpu-bold-duotone" className="text-2xl text-gray-800" />
            </div>
            <h3 className="text-2xl font-semibold tracking-tight mt-12 mb-4">Technology</h3>
            <p className="text-base text-gray-500">SaaS subscription offers, trial conversions, and digital product promotions.</p>
          </div>
        </div>
      </section>

      {/* Panel 4: Technology */}
      <section className="bg-[#FAFAFA] rounded-[2rem] p-6 md:p-12 w-full max-w-[1400px] mx-auto shadow-sm">
        <div className="mb-16">
          <div className="text-sm font-semibold tracking-wider text-gray-500 uppercase mb-4">/ Platform Features</div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight max-w-xl">Enterprise-Grade Tools</h2>
            <div className="max-w-xs md:text-right">
              <p className="text-base text-gray-600">Built for scale with advanced security, real-time sync, and powerful automation capabilities.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Image */}
          <div className="h-[600px] rounded-[2rem] overflow-hidden bg-gray-100">
            <img src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&q=80&w=800" alt="Platform Dashboard" className="w-full h-full object-cover" />
          </div>

          {/* Right Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-16">
            {/* Feature 1 */}
            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">Real-Time Dashboard</h3>
              <p className="text-base text-gray-600 mb-6">Live monitoring of offers, redemptions, and customer engagement with instant updates.</p>
              <a href="#" className="flex items-center gap-2 text-sm font-semibold hover:text-gray-600 transition-colors">
                Discover More 
                <Icon icon="solar:arrow-right-linear" className="text-lg bg-black text-white rounded-full p-0.5" />
              </a>
            </div>

            {/* Feature 2 */}
            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">Smart Automation</h3>
              <p className="text-base text-gray-600 mb-6">Automated offer scheduling, customer segmentation, and triggered campaigns based on behavior.</p>
              <a href="#" className="flex items-center gap-2 text-sm font-semibold hover:text-gray-600 transition-colors">
                Discover More
                <Icon icon="solar:arrow-right-linear" className="text-lg bg-black text-white rounded-full p-0.5" />
              </a>
            </div>

            {/* Feature 3 */}
            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">Multi-Location Support</h3>
              <p className="text-base text-gray-600 mb-6">Manage multiple outlets, regional pricing, and location-specific offers from one central hub.</p>
              <a href="#" className="flex items-center gap-2 text-sm font-semibold hover:text-gray-600 transition-colors">
                Discover More
                <Icon icon="solar:arrow-right-linear" className="text-lg bg-black text-white rounded-full p-0.5" />
              </a>
            </div>

            {/* Feature 4 */}
            <div>
              <h3 className="text-xl font-semibold tracking-tight mb-3">Admin Control Center</h3>
              <p className="text-base text-gray-600 mb-6">Role-based access, audit logs, and comprehensive admin tools for enterprise governance.</p>
              <a href="#" className="flex items-center gap-2 text-sm font-semibold hover:text-gray-600 transition-colors">
                Discover More
                <Icon icon="solar:arrow-right-linear" className="text-lg bg-black text-white rounded-full p-0.5" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
