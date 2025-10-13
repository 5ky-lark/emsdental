import Head from 'next/head';
import Image from 'next/image';

export default function About() {
  return (
    <>
      <Head>
        <title>About Us - EMS Dental Enterprises</title>
        <meta name="description" content="Learn about EMS Dental Enterprises, your trusted partner in dental equipment and supplies." />
      </Head>

      <div className="bg-white">
        {/* Hero Section with Background Image */}
        <div className="relative h-[60vh] min-h-[500px]">
          <Image
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80"
            alt="Modern dental clinic"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-800/90 to-primary-600/90" />
          <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              About EMS Dental Enterprises
            </h1>
            <p className="mt-6 text-xl text-primary-100 max-w-3xl">
              Your trusted partner in dental equipment and supplies, serving government institutions, private clinics, and medical missions.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Mission Section with Image */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
            <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=800&q=80"
                alt="Our dental team"
                fill
                className="object-cover"
              />
            </div>
            <div className="prose prose-lg">
              <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
              <p className="text-gray-600">
                In today's competitive healthcare landscape, dental enterprises face increasing pressure to modernize and streamline operations while maintaining personalized service. EMS Dental Enterprises specializes in dental equipment packages and medical supplies, serving a diverse client base that includes government institutions, private clinics, and medical missions.
              </p>
            </div>
          </div>

          {/* Digital Transformation Section */}
          <div className="bg-primary-50 rounded-2xl p-8 mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="prose prose-lg">
                <h2 className="text-3xl font-bold text-primary-900">Our Digital Transformation</h2>
                <p className="text-gray-600">
                  The rapid growth of e-commerce has transformed how businesses operate, enabling companies to reach broader audiences and streamline their sales processes. In the dental industry, clinics and practitioners require specialized equipment, such as dental chairs and related tools, which often need to be customized to fit specific operational needs.
                </p>
              </div>
              <div className="relative h-[300px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80"
                  alt="Digital transformation in dental industry"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Challenges Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Current Challenges</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  title: "Limited Customization",
                  description: "Most e-commerce platforms lack the capability to allow customers to modify product packages based on their specific needs.",
                  icon: "⚙️"
                },
                {
                  title: "Inventory Management",
                  description: "Reliance on spreadsheets for inventory tracking leads to inefficiencies and errors.",
                  icon: "📊"
                },
                {
                  title: "Supply Chain",
                  description: "Shipping delays and stock shortages occur frequently during periods of high demand.",
                  icon: "🚚"
                },
                {
                  title: "Communication",
                  description: "Communication with clients through Facebook Messenger is inconsistent and unstructured.",
                  icon: "💬"
                },
                {
                  title: "Workflow",
                  description: "Operational workflows are fragmented, particularly for urgent and government-related orders.",
                  icon: "⚡"
                }
              ].map((challenge, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  <div className="text-4xl mb-4">{challenge.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                  <p className="text-gray-600">{challenge.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Solution Section */}
          <div className="bg-gradient-to-br from-primary-900 to-primary-700 rounded-2xl p-8 mb-16 text-white">
            <h2 className="text-3xl font-bold mb-8">Our Solution</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <p className="text-primary-100">
                  Our web-based system features a mobile-responsive design that ensures optimal viewing and interaction, specifically tailored to EMS Dental Enterprises. We focus exclusively on dental equipment such as:
                </p>
                <ul className="space-y-3">
                  {[
                    "Dental lights",
                    "Handpieces",
                    "Three-way syringes",
                    "Intraoral cameras",
                    "Other essential components"
                  ].map((item, index) => (
                    <li key={index} className="flex items-center">
                      <svg className="h-5 w-5 text-primary-300 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative h-[400px] rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80"
                  alt="Dental equipment showcase"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Why Choose Us Section */}
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose EMS Dental Enterprises?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: "Specialized Expertise",
                  description: "Specialized in dental equipment packages and medical supplies",
                  icon: "🎯"
                },
                {
                  title: "Broad Service",
                  description: "Serving government institutions, private clinics, and medical missions",
                  icon: "🏥"
                },
                {
                  title: "Customization",
                  description: "Customizable dental chair packages to meet your specific needs",
                  icon: "⚡"
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 rounded-xl bg-primary-50">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">{feature.title}</h3>
                  <p className="text-primary-700">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 