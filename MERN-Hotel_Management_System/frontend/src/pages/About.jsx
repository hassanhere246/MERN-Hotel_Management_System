import React from 'react';
import PublicLayout from '../components/public/PublicLayout';
import { Target, Users, Award, ShieldCheck } from 'lucide-react';

const About = () => {
    const stats = [
        { label: 'Years of Experience', value: '25+' },
        { label: 'Luxury Rooms', value: '150+' },
        { label: 'Happy Guests', value: '10k+' },
        { label: 'Awards Won', value: '12' },
    ];

    return (
        <PublicLayout>
            {/* Header Section */}
            <section className="relative h-[60vh] flex items-center justify-center pt-20 overflow-hidden text-white">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1455587734955-081b22074882?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="About Us"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-navy-900/70 backdrop-blur-[2px]"></div>
                </div>
                <div className="relative z-10 text-center px-4">
                    <span className="text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block">The LuxeStay Story</span>
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">About <span className="text-cyan-400">Our Heritage</span></h1>
                </div>
            </section>

            {/* Content Section */}
            <section className="py-24 bg-white dark:bg-navy-900 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-24">
                        <div className="space-y-8">
                            <h2 className="text-4xl font-bold text-gray-900 dark:text-white leading-tight">Setting New Standards in <span className="text-cyan-500 dark:text-cyan-400">Hospitality</span> Since 1998</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                Founded on the principles of excellence and genuine care, LuxeStay has evolved from a boutique coastal retreat into a symbol of global luxury. Our journey has been defined by a relentless pursuit of perfection in every detail.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                                We believe that true luxury lies in the personalization of experience. Our staff are not just employees, but artisans of hospitality dedicated to anticipating your every need before you even realize it.
                            </p>
                            <div className="grid grid-cols-2 gap-8 pt-8">
                                {stats.map((stat, index) => (
                                    <div key={index}>
                                        <div className="text-3xl font-bold text-cyan-600 dark:text-cyan-500 mb-1">{stat.value}</div>
                                        <div className="text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="relative">
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                                <img
                                    src="https://images.unsplash.com/photo-1541971822442-ec3ef41d5bf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                    alt="Hotel Team"
                                    className="w-full h-auto"
                                />
                            </div>
                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl z-0"></div>
                            <div className="absolute -top-10 -left-10 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl z-0"></div>
                        </div>
                    </div>

                    {/* Mission & Vision */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Target, title: 'Our Mission', desc: 'To provide unparalleled luxury experiences that exceed expectations through innovation and service.' },
                            { icon: Award, title: 'Quality First', desc: 'We never compromise on the quality of our amenities, food, or service standards.' },
                            { icon: Users, title: 'Guest Centric', desc: 'Every decision we make is centered around the comfort and satisfaction of our guests.' },
                            { icon: ShieldCheck, title: 'Sustainability', desc: 'Committed to luxury that respects the environment and supports local communities.' },
                        ].map((item, index) => (
                            <div key={index} className="p-8 bg-gray-50 dark:bg-navy-800 rounded-3xl border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-all group">
                                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-cyan-500 transition-colors">
                                    <item.icon className="w-7 h-7 text-cyan-500 dark:text-cyan-400 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
};

export default About;
