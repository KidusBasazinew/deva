"use client";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-base-100 mt-16">
      {/* Hero Section */}
      <div className="hero bg-base-200 relative">
        {/* Background image with opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/banner.jpg)" }}
        ></div>

        {/* Content container */}
        <div className="hero-content text-center py-16 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              A Partnership Built on Trust, Excellence, and Growth
            </h1>
            <p className="text-xl mb-8">
              At [Your Company Name], we believe that great partnerships are the
              foundation of success.
            </p>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Why Partner with Us?</h2>
          <p className="text-lg text-gray-600">
            We don't just seek collaborations—we build lasting relationships
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="badge badge-primary badge-lg p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Mutual Growth</h3>
              </div>
              <p className="text-gray-600">
                We see our partners as an extension of our team. When you grow,
                we grow—so we are fully committed to driving success together.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="badge badge-primary badge-lg p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Reliability & Integrity</h3>
              </div>
              <p className="text-gray-600">
                Trust is at our core. We value open communication, fairness, and
                long-term commitment to ensure a seamless partnership.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="badge badge-primary badge-lg p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Innovation & Excellence</h3>
              </div>
              <p className="text-gray-600">
                We bring expertise, creativity, and cutting-edge solutions to
                every project, striving for excellence in execution.
              </p>
            </div>
          </div>

          <div className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="badge badge-primary badge-lg p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold">Flexible Collaboration</h3>
              </div>
              <p className="text-gray-600">
                We adapt to your needs, creating efficient and beneficial
                working relationships that drive mutual success.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 bg-base-200 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6">
            Let's Build Something Extraordinary
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Join our forward-thinking community that values success, respect,
            and innovation.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button className="btn btn-primary btn-lg">
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
            <div className="badge badge-outline p-4 mt-4">
              📩 [Your Contact Information]
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer footer-center p-4 bg-base-200 text-base-content">
        <div>
          <p>© 2024 [Your Company Name]. All rights reserved</p>
        </div>
      </footer>
    </div>
  );
}
