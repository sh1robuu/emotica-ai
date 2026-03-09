/**
 * Landing Page
 * Hero section, feature cards, testimonials, and CTAs.
 * Sets the emotional tone for the application.
 */
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Heart, MessageCircle, Brain, Eye, Shield,
    ArrowRight, Sparkles, Quote
} from 'lucide-react';
import AnimatedBackground from '../components/AnimatedBackground';
import Card from '../components/Card';
import Button from '../components/Button';

const fadeUp = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 },
};

const stagger = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
};

const features = [
    {
        icon: MessageCircle,
        title: 'Empathetic Conversations',
        description: 'Talk freely in a judgment-free space. Our AI listens, understands, and responds with genuine empathy.',
        gradient: 'from-primary-400 to-primary-600',
    },
    {
        icon: Brain,
        title: 'Emotion-Aware Responses',
        description: 'Advanced emotion detection adapts responses to how you\'re feeling, providing the right support at the right time.',
        gradient: 'from-secondary-400 to-secondary-600',
    },
    {
        icon: Eye,
        title: 'Image Understanding',
        description: 'Share images to express what words can\'t. Our vision model helps understand the full picture of your emotions.',
        gradient: 'from-accent-300 to-accent-500',
    },
    {
        icon: Shield,
        title: 'Safe & Private',
        description: 'Your conversations are completely private. We prioritize your safety and well-being above everything.',
        gradient: 'from-emerald-400 to-emerald-600',
    },
];

const testimonials = [
    {
        name: 'Sarah K.',
        role: 'University Student',
        text: 'Emotica AI helped me through my toughest semester. Having someone to talk to at 2 AM without judgment was exactly what I needed.',
        avatar: 'S',
    },
    {
        name: 'James L.',
        role: 'High School Senior',
        text: 'I was hesitant at first, but the way Emotica responds makes you feel truly heard. It\'s like having a friend who always understands.',
        avatar: 'J',
    },
    {
        name: 'Priya M.',
        role: 'Graduate Student',
        text: 'The emotion detection is amazing. It picks up on things I don\'t even realize I\'m feeling. This app is a game-changer for student mental health.',
        avatar: 'P',
    },
];

const Landing = () => {
    return (
        <div className="relative overflow-hidden">
            <AnimatedBackground />

            {/* ========== Hero Section ========== */}
            <section className="relative min-h-[90vh] flex items-center justify-center px-4 pt-12 pb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/40 text-primary-600 dark:text-primary-300 text-sm font-medium mb-6 backdrop-blur-sm border border-primary-200/50 dark:border-primary-700/30">
                            <Sparkles size={16} />
                            Your AI companion for emotional well-being
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
                            <span className="bg-gradient-to-r from-primary-600 via-secondary-500 to-accent-400 dark:from-primary-300 dark:via-secondary-300 dark:to-accent-300 bg-clip-text text-transparent">
                                You're not alone.
                            </span>
                            <br />
                            <span className="text-gray-800 dark:text-gray-100">
                                We're here to listen.
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Emotica AI is a compassionate AI assistant designed to provide empathetic conversations
                            and emotional support whenever you need it. Safe, private, and always available.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/chat">
                                <Button size="lg" className="min-w-[180px]">
                                    Start Chatting
                                    <ArrowRight size={18} />
                                </Button>
                            </Link>
                            <a href="#features">
                                <Button variant="ghost" size="lg" className="min-w-[180px]">
                                    Learn More
                                </Button>
                            </a>
                        </div>
                    </motion.div>

                    {/* Floating hearts decoration */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute"
                                style={{
                                    left: `${15 + i * 15}%`,
                                    top: `${20 + (i % 3) * 25}%`,
                                }}
                                animate={{
                                    y: [0, -15, 0],
                                    rotate: [0, 10, -10, 0],
                                    opacity: [0.2, 0.4, 0.2],
                                }}
                                transition={{
                                    duration: 4 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                }}
                            >
                                <Heart
                                    size={16 + i * 4}
                                    className="text-primary-300/40 dark:text-primary-500/20 fill-primary-300/20 dark:fill-primary-500/10"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== Features Section ========== */}
            <section id="features" className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Why students trust Emotica AI
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                            Built with care, designed for you. Every feature is crafted to make you feel safe, understood, and supported.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={i}
                                {...stagger}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                            >
                                <Card className="h-full">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 shadow-lg`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== Testimonials Section ========== */}
            <section className="relative py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div {...fadeUp} className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-gray-100 mb-4">
                            Voices of students
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            Real stories from students who found comfort in Emotica AI.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                {...stagger}
                                transition={{ duration: 0.5, delay: i * 0.15 }}
                            >
                                <Card className="h-full">
                                    <Quote className="w-8 h-8 text-primary-300 dark:text-primary-600 mb-3" />
                                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4 italic">
                                        "{t.text}"
                                    </p>
                                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white font-bold text-sm shadow-md">
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{t.name}</p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{t.role}</p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== CTA Section ========== */}
            <section className="relative py-20 px-4">
                <motion.div
                    {...fadeUp}
                    className="max-w-3xl mx-auto text-center"
                >
                    <Card className="!p-10 !bg-gradient-to-br from-primary-500/10 to-secondary-500/10 dark:from-primary-600/20 dark:to-secondary-600/20 !border-primary-200/30 dark:!border-primary-700/20">
                        <Heart className="w-12 h-12 text-primary-400 mx-auto mb-4 fill-primary-400/20" />
                        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-3">
                            Ready to start your journey?
                        </h2>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                            Your feelings matter, and you deserve to be heard. Start a conversation with Emotica AI today — no judgment, just support.
                        </p>
                        <Link to="/register">
                            <Button size="lg" className="min-w-[200px]">
                                Get Started Free
                                <ArrowRight size={18} />
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </section>
        </div>
    );
};

export default Landing;
