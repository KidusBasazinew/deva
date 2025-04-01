"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100 mt-16">
      {/* Hero Section */}
      <div className="hero bg-base-200 relative">
        {/* Background image with opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: "url(/banner.jpg)" }}
        ></div>

        {/* Content container */}
        <div className="hero-content text-center py-16 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-6xl font-extrabold text-white mb-6">
              A Partnership Built on Trust, Excellence, and Growth
            </h1>
            <p className="text-lg text-white mb-8">
              At [Your Company Name], we believe that great partnerships are the
              foundation of success.
            </p>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-semibold text-white mb-6">
            Why Partner with Us?
          </h2>
          <p className="text-lg text-gray-600">
            We don&apos;t just seek collaborations—we build lasting
            relationships.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {[
            "Mutual Growth",
            "Reliability & Integrity",
            "Innovation & Excellence",
            "Flexible Collaboration",
          ].map((title, index) => (
            <div
              key={index}
              className="card bg-base-200 shadow-lg hover:shadow-2xl transition-shadow rounded-lg overflow-hidden"
            >
              <div className="card-body p-6">
                <div className="flex items-center gap-4 mb-4">
                  <h3 className="text-2xl font-semibold text-white text-center">
                    {title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {index === 0
                    ? "We see our partners as an extension of our team. When you grow, we grow—so we are fully committed to driving success together."
                    : index === 1
                    ? "Trust is at our core. We value open communication, fairness, and long-term commitment to ensure a seamless partnership."
                    : index === 2
                    ? "We bring expertise, creativity, and cutting-edge solutions to every project, striving for excellence in execution."
                    : "We adapt to your needs, creating efficient and beneficial working relationships that drive mutual success."}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 bg-gradient-to-r from-primary to-secondary rounded-2xl">
          <h2 className="text-3xl font-semibold text-white mb-6">
            Let&apos;s Build Something Extraordinary
          </h2>
          <p className="text-lg text-white mb-8 max-w-2xl mx-auto">
            Join our forward-thinking community that values success, respect,
            and innovation.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button className="btn btn-lg btn-primary text-white hover:bg-opacity-90 transition-colors">
              Start the Conversation
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <div className="badge badge-outline p-4 mt-4 text-white">
              📩 [Your Contact Information]
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-200 text-base-content rounded-lg mt-16">
        <div>
          <p className="text-gray-600">
            © 2024 [Your Company Name]. All rights reserved
          </p>
        </div>
      </footer>
    </div>
  );
}
