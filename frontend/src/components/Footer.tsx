// Add this Footer component at the bottom of the file, before the export
export const Footer = () => (
    <footer className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-4">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-1">
              <span className="text-green-400">Green</span>
              <span className="text-blue-300">Source</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-sm">
              Building a sustainable future by connecting farmers directly
              with consumers. Join us in revolutionizing the agricultural
              marketplace.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-2">
              <h4 className="font-bold text-lg mb-2 text-green-400">
                About Us
              </h4>
              <p className="text-gray-400 leading-relaxed text-sm">
                Empowering farmers and consumers through direct trade
                relationships for a more sustainable and equitable food
                system.
              </p>
            </div>
  
            <div className="space-y-2">
              <h4 className="font-bold text-lg mb-2 text-green-400">
                Quick Links
              </h4>
              <ul className="space-y-1">
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    How it Works
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    For Farmers
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-400 hover:text-white transition-colors hover:underline"
                  >
                    For Consumers
                  </a>
                </li>
              </ul>
            </div>
  
            <div className="space-y-2">
              <h4 className="font-bold text-lg mb-2 text-green-400">
                Contact
              </h4>
              <ul className="space-y-1">
                <li className="text-gray-400 hover:text-white transition-colors">
                  <span className="block font-medium">Email</span>
                  support@farmmarket.com
                </li>
                <li className="text-gray-400 hover:text-white transition-colors">
                  <span className="block font-medium">Phone</span>
                  (555) 123-4567
                </li>
              </ul>
            </div>
          </div>
  
          <div className="border-t border-gray-700 mt-4 pt-2 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 GreenSource Marketplace. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
  
