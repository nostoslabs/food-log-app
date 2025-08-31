import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none text-gray-700 space-y-6">
          <p className="text-sm text-gray-500 mb-8">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <p>
              foodlogger.me is committed to protecting your privacy. When you use our service, we may collect:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Account information (email address, display name) when you sign up</li>
              <li>Food log data that you voluntarily enter into the application</li>
              <li>Basic usage analytics to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Social Media Login</h2>
            <p>
              When you sign in using Google or Facebook, we only access:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Your public profile information (name, email address)</li>
              <li>We do not access or store any other social media data</li>
              <li>We do not post to your social media accounts</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p>Your information is used to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Provide and maintain the food logging service</li>
              <li>Sync your data across devices when signed in</li>
              <li>Generate PDF reports for medical consultations</li>
              <li>Improve our application based on usage patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Storage and Security</h2>
            <p>
              Your data is stored securely using Firebase, Google's cloud infrastructure. We implement 
              industry-standard security measures to protect your personal information. Your food log 
              data is private and only accessible to you.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personal information to third parties. 
              Your food log data remains private and is only shared when you explicitly generate and 
              share PDF reports.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Local Storage</h2>
            <p>
              If you use the app without signing in, your data is stored locally on your device and 
              is not transmitted to our servers. This data remains on your device only.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2 mt-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Delete your account and all associated data</li>
              <li>Export your data in a readable format</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or your data, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mt-4">
              <p className="font-medium">Nostos Labs</p>
              <p>Email: privacy@nostoslabs.com</p>
              <p>Website: <a href="https://nostoslabs.com" className="text-blue-600 hover:text-blue-800 underline">nostoslabs.com</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify users of any 
              material changes by updating the "Last updated" date at the top of this policy.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-600">
            © {new Date().getFullYear()} <a href="https://nostoslabs.com" className="text-blue-600 hover:text-blue-800 underline">Nostos Labs</a>. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            foodlogger.me - Your diet may be the key to better health
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;