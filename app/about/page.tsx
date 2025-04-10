"use client";

import React from "react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-base-100 mt-16 text-base-content">
      {/* Hero Section */}
      <div className="hero bg-base-200 relative">
        {/* Background Image with Opacity */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url(/banner.jpg)" }}
        ></div>

        {/* Content Container */}
        <div className="hero-content text-center py-16 relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-5xl font-bold mb-6">
              A Partnership Built on Trust, Excellence, and Growth
            </h1>
            <p className="text-xl mb-8">
              At <span className="font-semibold">[Your Company Name]</span>, we
              believe that great partnerships are the foundation of success.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">Why Partner with Us?</h2>
          <p className="text-lg text-gray-400">
            We don&apos;t just seek collaborations—we build lasting
            relationships.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {[
            {
              title: "Mutual Growth",
              description:
                "We see our partners as an extension of our team. When you grow, we grow—so we are fully committed to driving success together.",
            },
            {
              title: "Reliability & Integrity",
              description:
                "Trust is at our core. We value open communication, fairness, and long-term commitment to ensure a seamless partnership.",
            },
            {
              title: "Innovation & Excellence",
              description:
                "We bring expertise, creativity, and cutting-edge solutions to every project, striving for excellence in execution.",
            },
            {
              title: "Flexible Collaboration",
              description:
                "We adapt to your needs, creating efficient and beneficial working relationships that drive mutual success.",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow"
            >
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
                  <h3 className="text-2xl font-bold">{item.title}</h3>
                </div>
                <p className="text-gray-400">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center py-12 bg-base-200 rounded-2xl">
          <h2 className="text-3xl font-bold mb-6">
            Leta&apos;s Build Something Extraordinary
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-gray-300">
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
