import React from 'react';
import PublicLayout from '../components/public/PublicLayout';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact = () => {
    return (
        <PublicLayout>
            {/* Header Section */}
            <section className="bg-gray-50 dark:bg-navy-800 pt-40 pb-20 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <span className="text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-widest text-sm mb-4 block">Contact Us</span>
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-8">Get In <span className="text-cyan-600 dark:text-cyan-400">Touch</span></h1>
                    <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                        Have questions? Our team is here to help you 24/7. Reach out to us for any inquiries or special requests.
                    </p>
                </div>
            </section>

            {/* Contact Grid */}
            <section className="py-24 bg-white dark:bg-navy-900 transition-colors duration-500">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
                        {/* Info Section */}
                        <div className="space-y-12">
                            <div>
                                <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Contact Information</h3>
                                <p className="text-gray-600 dark:text-gray-400 text-lg">
                                    Whether you're looking for a peaceful getaway or a high-end corporate stay, we're here to make it perfect.
                                </p>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { icon: Phone, title: 'Call Us', detail: '03333372204', sub: 'Available 24/7' },
                                    { icon: Mail, title: 'Email Us', detail: 'hassanhere246@gmail.com', sub: 'Quick response time' },
                                    { icon: MapPin, title: 'Visit Us', detail: '123 Ocean Drive, Paradise Coast, PC 90210', sub: 'Concierge available' },
                                ].map((item, index) => (
                                    <div key={index} className="flex items-start space-x-6 p-6 rounded-3xl bg-gray-50 dark:bg-navy-800 border border-gray-100 dark:border-white/5 hover:border-cyan-500/30 transition-all">
                                        <div className="w-12 h-12 bg-cyan-600/10 dark:bg-cyan-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                                        </div>
                                        <div>
                                            <h4 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{item.title}</h4>
                                            <p className="text-lg font-bold text-gray-900 dark:text-white">{item.detail}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.sub}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="relative animate-fade-in">
                            <div className="bg-gray-50 dark:bg-navy-900 border border-gray-100 dark:border-white/10 rounded-[40px] p-10 shadow-2xl relative z-10">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Send a Message</h3>
                                <form className="space-y-6" onSubmit={(e) => {
                                    e.preventDefault();
                                    alert('Thank you for your message! Our team will get back to you shortly.');
                                    e.target.reset();
                                }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest pl-2">Full Name</label>
                                            <input
                                                type="text"
                                                required
                                                placeholder="John Doe"
                                                className="w-full bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest pl-2">Email Address</label>
                                            <input
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                className="w-full bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest pl-2">Subject</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Booking Inquiry"
                                            className="w-full bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest pl-2">Your Message</label>
                                        <textarea
                                            rows="4"
                                            required
                                            placeholder="How can we help you?"
                                            className="w-full bg-white dark:bg-navy-800 border border-gray-100 dark:border-white/10 rounded-2xl p-4 text-gray-900 dark:text-white focus:outline-none focus:border-cyan-400 transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 font-bold"
                                        ></textarea>
                                    </div>
                                    <button className="w-full bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-5 rounded-2xl transition-all shadow-xl hover:shadow-cyan-glow flex items-center justify-center group">
                                        <Send className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" />
                                        Send Message
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Map Placeholder */}
            <section className="h-[500px] w-full bg-gray-100 dark:bg-navy-950 flex items-center justify-center border-t border-gray-100 dark:border-white/5">
                <div className="text-center">
                    <MapPin className="w-12 h-12 text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 font-bold uppercase tracking-widest">Interactive Map Placeholder</p>
                </div>
            </section>
        </PublicLayout>
    );
};

export default Contact;
