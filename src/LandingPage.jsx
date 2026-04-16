import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import {
  Heart, Activity, Brain, Calendar, ArrowRight, Check, Zap, Shield,
  Users, Pill, Sparkles, TrendingUp, Bell, Lock, Smartphone, Play
} from 'lucide-react';

export default function LandingPage({ setCurrentPage, onDemoLogin }) {
  const { scrollYProgress } = useScroll();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-x-hidden">

      {/* Animated Background Particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/30 rounded-full"
            initial={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
            }}
            animate={{
              x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
              y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
            }}
            transition={{
              duration: Math.random() * 10 + 20,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
        ))}
      </div>

      {/* Sticky Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className="fixed top-0 w-full bg-slate-900/90 backdrop-blur-xl border-b border-blue-500/20 z-50"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-slate-900" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              MediTrack
            </h1>
          </motion.div>

          <div className="flex items-center gap-3">
            {/* Try Demo button in nav */}
            <motion.button
              onClick={onDemoLogin}
              className="px-4 py-2 rounded-lg border border-cyan-400/50 text-cyan-400 font-semibold text-sm hover:bg-cyan-400/10 transition-colors flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-3.5 h-3.5" />
              Try Demo
            </motion.button>

            <motion.button
              onClick={() => setCurrentPage('login')}
              className="px-4 sm:px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 font-semibold relative overflow-hidden group text-sm sm:text-base"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">Get Started</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500"
                initial={{ x: '100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <HeroSection setCurrentPage={setCurrentPage} onDemoLogin={onDemoLogin} />

      {/* Stats Bar */}
      <StatsBar />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <HowItWorksSection />

      {/* Interactive Demo */}
      <InteractiveDemoSection onDemoLogin={onDemoLogin} />

      {/* Benefits */}
      <BenefitsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CTASection setCurrentPage={setCurrentPage} onDemoLogin={onDemoLogin} />

      {/* Footer */}
      <Footer />
    </div>
  );
}

// Hero Section
function HeroSection({ setCurrentPage, onDemoLogin }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const [typedText, setTypedText] = useState('');
  const fullText = 'Manage Your Health Intelligently';

  useEffect(() => {
    if (inView) {
      let i = 0;
      const timer = setInterval(() => {
        if (i < fullText.length) {
          setTypedText(fullText.slice(0, i + 1));
          i++;
        } else {
          clearInterval(timer);
        }
      }, 50);
      return () => clearInterval(timer);
    }
  }, [inView]);

  return (
    <section ref={ref} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
      {/* Gradient Orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />

      <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left Side */}
        <motion.div
          className="space-y-8"
          initial={{ opacity: 0, x: -50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-2 backdrop-blur-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span className="text-xs sm:text-sm font-medium">AI-Powered Health Tracking</span>
          </motion.div>

          <div className="space-y-4">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight min-h-[120px] sm:min-h-[180px]">
              {typedText}
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1 h-8 sm:h-12 bg-cyan-400 ml-1"
              />
            </h2>
            <motion.p
              className="text-lg sm:text-xl text-slate-300"
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.5 }}
            >
              Track medications, log symptoms, and get AI-powered health insights.
              <span className="text-cyan-400 font-semibold"> All in one place.</span>
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              onClick={() => setCurrentPage('register')}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 font-bold text-base sm:text-lg flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/50 relative overflow-hidden group"
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(59, 130, 246, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
              Sign Up Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>

            {/* ⭐ TRY DEMO BUTTON */}
            <motion.button
              onClick={onDemoLogin}
              className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl border-2 border-cyan-400/70 hover:border-cyan-400 hover:bg-cyan-400/10 font-bold text-base sm:text-lg backdrop-blur-sm flex items-center justify-center gap-2 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 text-cyan-400" />
              Try Live Demo
            </motion.button>
          </motion.div>

          {/* Demo hint */}
          <motion.p
            className="text-sm text-slate-400"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 1.0 }}
          >
            ✨ No signup needed — explore the full app instantly
          </motion.p>

          {/* Social Proof */}
          <motion.div
            className="flex items-center gap-6 pt-2"
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.9 }}
          >
            <div className="flex -space-x-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 border-2 border-slate-900 flex items-center justify-center font-bold text-slate-900 text-sm sm:text-base"
                  initial={{ scale: 0 }}
                  animate={inView ? { scale: 1 } : {}}
                  transition={{ delay: 0.9 + i * 0.1 }}
                  whileHover={{ scale: 1.2, zIndex: 10 }}
                >
                  {i}
                </motion.div>
              ))}
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-400">Trusted by</p>
              <p className="text-lg sm:text-xl font-bold text-cyan-400">1000+ Users</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side - Animated Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="relative hidden md:block"
        >
          <motion.div
            className="relative w-full h-[500px] bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl border border-blue-400/30 backdrop-blur-sm p-8 shadow-2xl"
            animate={{
              y: [0, -20, 0],
              rotateY: [0, 5, 0]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          >
            {/* Animated Dashboard Elements */}
            <motion.div className="space-y-4">
              <motion.div
                className="h-16 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-xl flex items-center px-4 gap-3"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-8 h-8 bg-cyan-400 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-2 bg-white/30 rounded w-3/4" />
                  <div className="h-2 bg-white/20 rounded w-1/2" />
                </div>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <motion.div
                    key={i}
                    className="h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-xl p-4"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={inView ? { scale: 1, opacity: 1 } : {}}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div className="h-3 bg-white/40 rounded w-1/2 mb-2" />
                    <div className="h-6 bg-white/60 rounded w-3/4" />
                  </motion.div>
                ))}
              </div>

              <motion.div
                className="h-40 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-xl p-4"
                animate={{
                  background: [
                    'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
                    'linear-gradient(to bottom right, rgba(6, 182, 212, 0.2), rgba(59, 130, 246, 0.2))',
                    'linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(6, 182, 212, 0.1))',
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <div className="h-full flex items-end gap-2">
                  {[40, 70, 50, 90, 60, 80, 45].map((height, i) => (
                    <motion.div
                      key={i}
                      className="flex-1 bg-cyan-400/50 rounded-t"
                      initial={{ height: 0 }}
                      animate={inView ? { height: `${height}%` } : {}}
                      transition={{ delay: 1 + i * 0.1, duration: 0.5 }}
                    />
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Floating Elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-400/40 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-32 h-32 bg-blue-400/30 rounded-full blur-xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            {/* ⭐ Demo overlay CTA on the dashboard preview */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-3xl"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
            >
              <motion.button
                onClick={onDemoLogin}
                className="px-6 py-3 bg-cyan-400 text-slate-900 font-bold rounded-xl flex items-center gap-2 shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                Try Live Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// Stats Bar
function StatsBar() {
  const [ref, inView] = useInView({ triggerOnce: true });
  const stats = [
    { value: 1000, label: 'Active Users', suffix: '+', icon: Users },
    { value: 5000, label: 'Medications Tracked', suffix: '+', icon: Pill },
    { value: 10000, label: 'Symptoms Logged', suffix: '+', icon: Activity },
    { value: 99, label: 'Success Rate', suffix: '%', icon: TrendingUp },
  ];

  return (
    <motion.section
      ref={ref}
      className="py-12 px-4 sm:px-6 lg:px-8 bg-slate-800/30 border-y border-blue-500/20 backdrop-blur-sm w-full"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
    >
      <div className="w-full max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
        {stats.map((stat, i) => (
          <CountUpStat key={i} {...stat} delay={i * 0.1} inView={inView} />
        ))}
      </div>
    </motion.section>
  );
}

function CountUpStat({ value, label, suffix, icon: Icon, delay, inView }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (inView) {
      let start = 0;
      const duration = 2000;
      const increment = value / (duration / 16);
      const timer = setInterval(() => {
        start += increment;
        if (start >= value) { setCount(value); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
      return () => clearInterval(timer);
    }
  }, [inView, value]);

  return (
    <motion.div
      className="text-center"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay, duration: 0.5 }}
    >
      <Icon className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-400 mx-auto mb-2" />
      <motion.div className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" key={count}>
        {count.toLocaleString()}{suffix}
      </motion.div>
      <p className="text-slate-400 text-xs sm:text-sm mt-1">{label}</p>
    </motion.div>
  );
}

// Features Section
function FeaturesSection() {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const features = [
    { icon: Pill, title: 'Medication Management', description: 'Track all your medications, dosages, and schedules in one place', color: 'from-blue-400 to-blue-600' },
    { icon: Activity, title: 'Symptom Tracking', description: 'Log symptoms with severity ratings and detailed notes', color: 'from-cyan-400 to-cyan-600' },
    { icon: Brain, title: 'AI Health Insights', description: 'Get intelligent analysis powered by Google Gemini', color: 'from-purple-400 to-purple-600' },
    { icon: Calendar, title: 'Smart Scheduling', description: 'Never miss a medication with smart reminders', color: 'from-pink-400 to-pink-600' },
    { icon: Shield, title: 'Secure & Private', description: 'Your health data is encrypted and secure', color: 'from-green-400 to-green-600' },
    { icon: Users, title: 'Doctor Support', description: 'Share your health data with your healthcare provider', color: 'from-orange-400 to-orange-600' },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}}>
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">Powerful Features</h3>
          <p className="text-lg sm:text-xl text-slate-400">Everything you need to manage your health</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} index={i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, description, color, index, inView }) {
  return (
    <motion.div
      className="group relative bg-gradient-to-br from-blue-500/5 to-cyan-500/5 border border-blue-400/20 rounded-2xl p-6 sm:p-8 hover:border-blue-400/50 cursor-pointer overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -10 }}
    >
      <motion.div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
      <motion.div className={`w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center mb-6 relative z-10`} whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
      </motion.div>
      <h4 className="text-lg sm:text-xl font-bold mb-3 relative z-10">{title}</h4>
      <p className="text-sm sm:text-base text-slate-400 relative z-10">{description}</p>
      <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" initial={{ x: '-100%' }} whileHover={{ x: '100%' }} transition={{ duration: 0.6 }} />
    </motion.div>
  );
}

// How It Works Section
function HowItWorksSection() {
  const [ref, inView] = useInView({ triggerOnce: true });
  const steps = [
    { number: 1, title: 'Sign Up', description: 'Create your free account in seconds', icon: Zap },
    { number: 2, title: 'Add Your Data', description: 'Log medications and symptoms easily', icon: Activity },
    { number: 3, title: 'Get Insights', description: 'Receive AI-powered health recommendations', icon: Brain },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30 border-y border-blue-500/20 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div className="text-center mb-16" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">How It Works</h3>
          <p className="text-lg sm:text-xl text-slate-400">Simple 3-step setup</p>
        </motion.div>
        <div className="relative">
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 transform -translate-y-1/2" />
          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, i) => (
              <motion.div key={i} className="text-center" initial={{ opacity: 0, scale: 0.5 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ delay: i * 0.2 }}>
                <motion.div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-900 shadow-2xl shadow-blue-500/50" whileHover={{ scale: 1.2, rotate: 360 }} transition={{ duration: 0.5 }}>
                  <step.icon className="w-8 h-8 sm:w-10 sm:h-10" />
                </motion.div>
                <h4 className="text-xl sm:text-2xl font-bold mb-2">{step.title}</h4>
                <p className="text-sm sm:text-base text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Interactive Demo Section — now actually launches the demo
function InteractiveDemoSection({ onDemoLogin }) {
  const [ref, inView] = useInView({ triggerOnce: true });
  const [activeTab, setActiveTab] = useState('medications');

  const tabContent = {
    medications: { icon: Pill, title: 'Medication Management', desc: 'Track all your medications, dosages, and schedules. Get reminders so you never miss a dose.' },
    symptoms: { icon: Activity, title: 'Symptom Tracking', desc: 'Log symptoms with severity ratings (1-10), add notes, and see patterns over time.' },
    insights: { icon: Brain, title: 'AI Health Insights', desc: 'Google Gemini analyses your health data and surfaces patterns, correlations, and gentle recommendations.' },
  };

  const { icon: TabIcon, title: tabTitle, desc: tabDesc } = tabContent[activeTab];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">See It In Action</h3>
          <p className="text-lg sm:text-xl text-slate-400">Interactive preview of MediTrack</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl border border-blue-400/30 p-6 sm:p-8 backdrop-blur-sm"
          initial={{ opacity: 0, y: 50 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          {/* Tabs */}
          <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto">
            {['medications', 'symptoms', 'insights'].map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold capitalize transition-all text-sm sm:text-base whitespace-nowrap ${
                  activeTab === tab ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {tab}
              </motion.button>
            ))}
          </div>

          {/* Demo Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="min-h-[250px] sm:min-h-[300px] flex flex-col items-center justify-center gap-6"
            >
              <div className="text-center">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TabIcon className="w-10 h-10 sm:w-12 sm:h-12 text-slate-900" />
                </div>
                <h4 className="text-xl sm:text-2xl font-bold mb-4">{tabTitle}</h4>
                <p className="text-sm sm:text-base text-slate-400 max-w-md mx-auto px-4">{tabDesc}</p>
              </div>

              {/* ⭐ CTA to actually launch demo */}
              <motion.button
                onClick={onDemoLogin}
                className="px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/30"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Play className="w-5 h-5" />
                Launch Live Demo — No Signup Needed
              </motion.button>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}

// Benefits Section
function BenefitsSection() {
  const [ref, inView] = useInView({ triggerOnce: true });
  const benefits = [
    'Completely free to use',
    'AI-powered health insights',
    'Secure and encrypted data',
    'Works on mobile and desktop',
    'Share with your doctor',
    'Real-time medication reminders'
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-800/30 border-y border-blue-500/20 w-full">
      <div className="w-full max-w-5xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">Why Choose MediTrack?</h3>
        </motion.div>
        <div className="space-y-4">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-4 p-4 sm:p-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-400/30 hover:border-blue-400/60 cursor-pointer group"
              initial={{ opacity: 0, x: -50 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, x: 10 }}
            >
              <motion.div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center flex-shrink-0" whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}>
                <Check className="w-4 h-4 sm:w-5 sm:h-5 text-slate-900" />
              </motion.div>
              <span className="text-base sm:text-lg font-medium group-hover:text-cyan-400 transition-colors">{benefit}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const [ref, inView] = useInView({ triggerOnce: true });
  const testimonials = [
    { name: 'Sarah M.', role: 'Patient', text: 'MediTrack has completely changed how I manage my medications. The AI insights are incredible!' },
    { name: 'Dr. James K.', role: 'Physician', text: 'I recommend MediTrack to all my patients. It helps them stay on track with their treatment.' },
    { name: 'Emily R.', role: 'Patient', text: 'The symptom tracking feature helped me identify patterns I never noticed before.' },
  ];

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <motion.div className="text-center mb-12" initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}>
          <h3 className="text-4xl sm:text-5xl font-bold mb-4">Loved by Users</h3>
          <p className="text-lg sm:text-xl text-slate-400">See what our community says</p>
        </motion.div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-6 sm:p-8 border border-blue-400/30 hover:border-blue-400/60"
              initial={{ opacity: 0, y: 50 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.15 }}
              whileHover={{ y: -10 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center font-bold text-slate-900 text-sm sm:text-base">
                  {testimonial.name[0]}
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-slate-400">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-sm sm:text-base text-slate-300 italic">"{testimonial.text}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection({ setCurrentPage, onDemoLogin }) {
  const [ref, inView] = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="py-20 px-4 sm:px-6 lg:px-8 w-full">
      <motion.div
        className="w-full max-w-5xl mx-auto text-center relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={inView ? { opacity: 1, scale: 1 } : {}}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-3xl blur-3xl" />
        <div className="relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-3xl p-8 sm:p-12 border border-blue-400/30">
          <motion.h3
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Ready to Take Control of Your Health?
          </motion.h3>
          <p className="text-base sm:text-xl text-slate-400 mb-8">
            Join thousands of users already managing their health with MediTrack
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              onClick={() => setCurrentPage('register')}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl bg-gradient-to-r from-blue-500 to-cyan-500 font-bold text-lg sm:text-xl flex items-center justify-center gap-3 shadow-2xl shadow-blue-500/50"
              whileHover={{ scale: 1.1, boxShadow: "0 25px 50px rgba(59, 130, 246, 0.6)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5 sm:w-6 sm:h-6" />
              Get Started Free
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            {/* ⭐ Demo button in CTA */}
            <motion.button
              onClick={onDemoLogin}
              className="px-8 sm:px-12 py-4 sm:py-5 rounded-2xl border-2 border-cyan-400/70 hover:border-cyan-400 hover:bg-cyan-400/10 font-bold text-lg sm:text-xl flex items-center justify-center gap-3 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
              Try Demo First
            </motion.button>
          </div>

          <p className="text-slate-500 text-sm mt-6">✨ Demo mode — full app, no account needed</p>
        </div>
      </motion.div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-slate-900 border-t border-blue-500/20 py-12 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3 text-center md:text-left">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center">
              <Heart className="w-6 h-6 text-slate-900" />
            </div>
            <p className="text-slate-400 text-sm sm:text-base">&copy; 2026 MediTrack developed and designed by Sneha Naik. Manage your health intelligently.</p>
          </div>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm">
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="text-slate-400 hover:text-cyan-400 transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}