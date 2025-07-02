"use client";
import { useState, useEffect } from 'react';
import { Pen, Zap, Users, Download, Palette, Share2, MousePointer, Square, Circle, ArrowRight, Minus, Type, Edit3 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const router = useRouter();
  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Edit3 className="w-5 h-5" />,
      title: "Intuitive Drawing",
      description: "Natural pen-like experience with pressure sensitivity and smooth strokes"
    },
    {
      icon: <Palette className="w-5 h-5" />,
      title: "Rich Tools",
      description: "Complete set of drawing tools including shapes, text, and freehand drawing"
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live cursor tracking and instant updates"
    },
    {
      icon: <Share2 className="w-5 h-5" />,
      title: "Easy Sharing",
      description: "Share your creations instantly with shareable links and export options"
    }
  ];

  const tools = [
    { icon: <MousePointer className="w-4 h-4" />, name: "Select", symbol: "⌘" },
    { icon: <Square className="w-4 h-4" />, name: "Rectangle", symbol: "□" },
    { icon: <Circle className="w-4 h-4" />, name: "Circle", symbol: "○" },
    { icon: <Minus className="w-4 h-4" />, name: "Line", symbol: "―" },
    { icon: <ArrowRight className="w-4 h-4" />, name: "Arrow", symbol: "→" },
    { icon: <Type className="w-4 h-4" />, name: "Text", symbol: "T" },
    { icon: <Edit3 className="w-4 h-4" />, name: "Freehand", symbol: "✎" }
  ];

  const colors = [
    "#000000", "#ff0000", "#00ff00", "#0000ff", 
    "#ffff00", "#ff00ff", "#00ffff", "#ffffff"
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Subtle background pattern */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-foreground rounded-lg flex items-center justify-center">
            <Edit3 className="w-4 h-4 text-background" />
          </div>
          <span className="text-xl font-bold">DrawFlow</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Features
          </a>
          <a href="#demo" className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Demo
          </a>
          <a href="#pricing" className="text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={() => router.push("/auth")} className="px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            Sign In
          </button>
          <button className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center max-w-6xl mx-auto">
        <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Visual Collaboration
            <br />
            <span className="text-3xl md:text-5xl text-gray-600 dark:text-gray-400">Made Simple</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            The intuitive whiteboard for teams to sketch, diagram, and collaborate in real-time. 
            No learning curve, just natural drawing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity">
              Start Drawing Free
            </button>
            <button className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download App
            </button>
          </div>
        </div>

        {/* Interactive Demo Canvas */}
        <div className={`mt-20 transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
            {/* Simulated Toolbar */}
            <div className="flex items-start gap-6">
              <div className="bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm">
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-1">
                    {tools.slice(0, 6).map((tool, index) => (
                      <button
                        key={index}
                        className={`p-2 rounded text-sm flex items-center justify-center w-8 h-8 transition-colors ${
                          index === 0
                            ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        {tool.symbol}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                  <div className="grid grid-cols-4 gap-1">
                    {colors.slice(0, 4).map((color, index) => (
                      <div
                        key={index}
                        className={`w-6 h-6 rounded border-2 ${
                          index === 0 
                            ? "border-blue-500 ring-1 ring-blue-200 dark:ring-blue-800"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 space-y-1">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Stroke</div>
                  <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                </div>
              </div>

              {/* Simulated Canvas */}
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-8 min-h-80 relative">
                <svg className="w-full h-full" viewBox="0 0 400 300">
                  {/* Animated drawing elements */}
                  <path 
                    d="M50 150 Q100 80 150 150 T250 150" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none" 
                    className="opacity-70"
                  />
                  <circle 
                    cx="320" 
                    cy="100" 
                    r="25" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                    className="opacity-70"
                  />
                  <rect 
                    x="80" 
                    y="200" 
                    width="60" 
                    height="40" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    fill="none"
                    className="opacity-70"
                  />
                  <text 
                    x="200" 
                    y="230" 
                    fontSize="14" 
                    fill="currentColor" 
                    className="opacity-70"
                  >
                    Ideas
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to create
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Powerful features that make visual collaboration effortless for teams of all sizes.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer ${activeFeature === index ? 'ring-2 ring-blue-500/20' : ''}`}
                onMouseEnter={() => setActiveFeature(index)}
              >
                <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to start creating?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands of teams using DrawFlow for their visual collaboration needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-3 bg-foreground text-background rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-8 py-3 border border-gray-300 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 bg-foreground rounded-lg flex items-center justify-center">
                <Edit3 className="w-3 h-3 text-background" />
              </div>
              <span className="text-lg font-bold">DrawFlow</span>
            </div>
            <div className="flex items-center space-x-8">
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground transition-colors">
                Terms
              </a>
              <a href="#" className="text-sm text-gray-600 dark:text-gray-300 hover:text-foreground transition-colors">
                Support
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              © 2025 DrawFlow. Made for creators everywhere.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}