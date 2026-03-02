import React from 'react';
import { Heart, Activity, Brain, Calendar, ArrowRight, Check, Zap, Shield, Users } from 'lucide-react';
import { Pill } from 'lucide-react';
export default function LandingPage({ setCurrentPage }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-md border-b border-blue-500/20 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MediTrack
            </h1>
          </div>
          <button
            onClick={() => setCurrentPage('login')}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold transition-all hover:shadow-lg"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Text */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-bold leading-tight">
                Manage Your <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Health</span> Intelligently
              </h2>
              <p className="text-xl text-slate-300">
                Track medications, log symptoms, and get AI-powered health insights. All in one place.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setCurrentPage('register')}
                className="px-8 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold flex items-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-500/50"
              >
                Sign Up Free
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentPage('login')}
                className="px-8 py-3 rounded-lg border border-blue-400/50 hover:border-blue-400 hover:bg-blue-400/10 font-semibold transition-all"
              >
                Sign In
              </button>
            </div>

            {/* Social Proof */}
            <div className="space-y-3 pt-6">
              <p className="text-sm text-slate-400">Trusted by healthcare users worldwide</p>
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900 flex items-center justify-center text-slate-900 font-bold"
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
                <span className="text-slate-400">1000+ active users</span>
              </div>
            </div>
          </div>

          {/* Right Side - Visual */}
          <div className="relative hidden md:block">
            <div className="relative w-full h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-400/30 backdrop-blur-sm p-8 space-y-4">
              {/* Mock Dashboard */}
              <div className="space-y-4">
                <div className="h-12 bg-blue-400/20 rounded-lg animate-pulse"></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 bg-blue-400/20 rounded-lg animate-pulse"></div>
                  <div className="h-20 bg-cyan-400/20 rounded-lg animate-pulse"></div>
                </div>
                <div className="h-24 bg-blue-400/10 rounded-lg animate-pulse"></div>
              </div>
              
              {/* Floating Icons */}
              <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-500/30 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-slate-800/50 border-y border-blue-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Powerful Features</h3>
            <p className="text-xl text-slate-400">Everything you need to manage your health</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                <Pill className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">Medication Management</h4>
              <p className="text-slate-400">Track all your medications, dosages, and schedules in one place</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">Symptom Tracking</h4>
              <p className="text-slate-400">Log symptoms with severity ratings and detailed notes</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">AI Health Insights</h4>
              <p className="text-slate-400">Get intelligent analysis powered by Google Gemini</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">Smart Scheduling</h4>
              <p className="text-slate-400">Never miss a medication with smart reminders</p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">Secure & Private</h4>
              <p className="text-slate-400">Your health data is encrypted and secure</p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/30 rounded-xl p-8 hover:border-blue-400/60 hover:bg-blue-500/20 transition-all">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-slate-900" />
              </div>
              <h4 className="text-xl font-bold mb-2">Doctor Support</h4>
              <p className="text-slate-400">Share your health data with your healthcare provider</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">How It Works</h3>
            <p className="text-xl text-slate-400">Simple 3-step setup</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-slate-900">
                1
              </div>
              <h4 className="text-2xl font-bold mb-2">Sign Up</h4>
              <p className="text-slate-400">Create your free account in seconds</p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-slate-900">
                2
              </div>
              <h4 className="text-2xl font-bold mb-2">Add Your Data</h4>
              <p className="text-slate-400">Log medications and symptoms easily</p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold text-slate-900">
                3
              </div>
              <h4 className="text-2xl font-bold mb-2">Get Insights</h4>
              <p className="text-slate-400">Receive AI-powered health recommendations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-6 bg-slate-800/50 border-y border-blue-500/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">Why Choose MediTrack?</h3>
          </div>

          <div className="space-y-4">
            {[
              'Completely free to use',
              'AI-powered health insights',
              'Secure and encrypted data',
              'Works on mobile and desktop',
              'Share with your doctor',
              'Real-time medication reminders'
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-blue-500/10 rounded-lg border border-blue-400/20 hover:border-blue-400/50 transition-all">
                <Check className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                <span className="text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Ready to Take Control of Your Health?</h3>
          <p className="text-xl text-slate-400 mb-8">Join thousands of users already managing their health with MediTrack</p>
          <button
            onClick={() => setCurrentPage('register')}
            className="px-10 py-4 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-bold text-lg flex items-center gap-3 mx-auto transition-all hover:shadow-2xl hover:shadow-blue-500/50"
          >
            <Zap className="w-6 h-6" />
            Get Started Free
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-blue-500/20 py-12 px-6">
        <div className="max-w-6xl mx-auto text-center text-slate-400">
          <p>&copy; 2026 MediTrack. Manage your health intelligently.</p>
          <div className="flex justify-center gap-6 mt-6 text-sm">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}