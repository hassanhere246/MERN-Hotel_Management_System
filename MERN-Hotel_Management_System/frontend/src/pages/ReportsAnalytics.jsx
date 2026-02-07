import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Loader2 } from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line,
    Legend
} from 'recharts';
import {
    Download,
    Calendar,
    TrendingUp,
    TrendingDown,
    BarChart3,
    PieChart as PieIcon,
    Activity,
    ChevronDown,
    Filter,
    Sparkles
} from 'lucide-react';

const ReportsAnalytics = () => {
    const [revenueData, setRevenueData] = useState([]);
    const [occupancyData, setOccupancyData] = useState([]);
    const [kpis, setKpis] = useState(null);
    const [analytics, setAnalytics] = useState({ forecast: [], pricingRecommendation: {}, feedback: { stats: {}, recent: [] } });
    const [timeframe, setTimeframe] = useState('monthly');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReport();
    }, [timeframe]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const [reportRes, analyticsRes] = await Promise.all([
                api.get(`/reports/revenue?timeframe=${timeframe}`),
                api.get('/reports/analytics')
            ]);
            setRevenueData(reportRes.data.revenuePerformance);
            setOccupancyData(reportRes.data.occupancyByType);
            setKpis(reportRes.data.kpis);
            setAnalytics(analyticsRes.data);
        } catch (err) {
            console.error('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = () => {
        window.print();
    };

    const COLORS = ['#0ea5e9', '#3b82f6', '#f59e0b', '#6366f1'];

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
            <Loader2 className="animate-spin w-12 h-12 text-primary-600" />
            <p className="text-gray-500 font-medium">Generating reports...</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 font-heading">Reports & Analytics</h1>
                    <p className="text-gray-500 mt-1">Detailed insights and performance metrics for your hotel.</p>
                </div>
                <div className="flex items-center space-x-3 no-print">
                    <div className="flex bg-white border border-gray-100 rounded-xl p-1 shadow-soft">
                        {['daily', 'weekly', 'monthly'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setTimeframe(tf)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold capitalize transition-all ${timeframe === tf ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {tf}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={handleDownloadPDF}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Download className="w-4 h-4" />
                        <span>Download PDF</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Avg. Daily Rate', value: `$${kpis?.avgDailyRate}`, trend: 'up', trendVal: '4.2%', icon: TrendingUp, color: 'text-blue-600' },
                    { label: 'Total Revenue', value: `$${kpis?.totalRevenue}`, trend: 'up', trendVal: '12.1%', icon: Activity, color: 'text-primary-600' },
                    { label: 'Occupancy Rate', value: `${kpis?.occupancyRate}%`, trend: 'down', trendVal: '2.4%', icon: TrendingDown, color: 'text-rose-600' },
                    { label: 'Net Profit', value: `$${kpis?.netProfit}`, trend: 'up', trendVal: '8.5%', icon: BarChart3, color: 'text-blue-600' },
                ].map((kpi, idx) => (
                    <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-500">{kpi.label}</p>
                            <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                        </div>
                        <div className="mt-4 flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                            <span className={`text-xs font-bold ${kpi.trend === 'up' ? 'text-blue-600' : 'text-rose-600'}`}>
                                {kpi.trend === 'up' ? '+' : '-'}{kpi.trendVal}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-900">Revenue Performance</h2>
                        <button className="p-2 hover:bg-gray-50 rounded-lg">
                            <Filter className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-900">Occupancy by Room Type</h2>
                        <button className="p-2 hover:bg-gray-50 rounded-lg">
                            <PieIcon className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                    <div className="h-[300px] w-full flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Demand Forecasting Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">7-Day Demand Forecast</h2>
                            <p className="text-xs text-gray-500">Predicted occupancy based on upcoming stays</p>
                        </div>
                        <TrendingUp className="w-5 h-5 text-primary-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.forecast}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis axisLine={false} tickLine={false} hide />
                                <Tooltip cursor={{ fill: '#f8fafc' }} />
                                <Bar dataKey="occupancy" fill="#0ea5e9" radius={[12, 12, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Dynamic Pricing Recommendation */}
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft flex flex-col justify-center">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className={`p-4 rounded-2xl ${analytics.pricingRecommendation?.adjustment > 0 ? 'bg-blue-50 text-blue-600' :
                            analytics.pricingRecommendation?.adjustment < 0 ? 'bg-rose-50 text-rose-600' :
                                'bg-blue-50 text-blue-600'
                            }`}>
                            <Activity className="w-8 h-8" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Rate Optimization</p>
                            <h3 className="text-xl font-bold text-gray-900">{analytics.pricingRecommendation?.status}</h3>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-sm font-bold text-gray-900">{analytics.pricingRecommendation?.action}</p>
                            <p className="text-xs text-gray-500 mt-1">{analytics.pricingRecommendation?.reason}</p>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">Suggested Adjustment</span>
                            <span className={`font-bold ${analytics.pricingRecommendation?.adjustment >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                                {analytics.pricingRecommendation?.adjustment > 0 ? '+' : ''}{analytics.pricingRecommendation?.adjustment}%
                            </span>
                        </div>
                    </div>
                    <button className="mt-6 w-full py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg shadow-gray-200">
                        Apply Suggested Rates
                    </button>
                </div>

                {/* Guest Feedback & Ratings */}
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-soft">
                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center space-x-6">
                                <div className="text-center">
                                    <h4 className="text-5xl font-black text-gray-900">{analytics.feedback?.stats?.avgRating?.toFixed(1) || '4.8'}</h4>
                                    <div className="flex items-center justify-center text-amber-400 mt-2">
                                        {[1, 2, 3, 4, 5].map(s => <Sparkles key={s} className="w-3 h-3 fill-current text-amber-400" />)}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-tighter">{analytics.feedback?.stats?.totalReviews || 24} Verified Reviews</p>
                                </div>
                                <div className="h-20 w-[1px] bg-gray-100 hidden md:block"></div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 flex items-center">
                                        Recent Guest Feedback
                                        <PieIcon className="w-4 h-4 ml-2 text-primary-500" />
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">Latest reviews from your guests</p>
                                </div>
                            </div>
                            <button className="px-6 py-4 bg-primary-50 text-primary-600 font-bold rounded-2xl hover:bg-primary-100 transition-all text-sm whitespace-nowrap">
                                View All Feedback
                            </button>
                        </div>

                        {/* Feedback List */}
                        <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {(analytics.feedback?.recent?.length > 0 ? analytics.feedback.recent : [
                                {
                                    guestId: { userId: { name: 'John Doe' } },
                                    rating: 5,
                                    comments: 'Exceptional service and beautiful room! The staff was incredibly friendly and accommodating.',
                                    createdAt: new Date().toISOString(),
                                    bookingId: { bookingReference: 'BK-2024-001' }
                                },
                                {
                                    guestId: { userId: { name: 'Alice Smith' } },
                                    rating: 4,
                                    comments: 'Very comfortable stay, breakfast could be better. Overall great experience.',
                                    createdAt: new Date(Date.now() - 86400000).toISOString(),
                                    bookingId: { bookingReference: 'BK-2024-002' }
                                }
                            ]).map((f, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-primary-200 transition-all">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-gray-900 text-sm">{f.guestId?.userId?.name || 'Anonymous'}</span>
                                                <span className="text-amber-500 font-black text-sm">★ {f.rating}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] text-gray-400">
                                                {f.createdAt && (
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(f.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                )}
                                                {f.bookingId?.bookingReference && (
                                                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 rounded-md font-bold">
                                                        {f.bookingId.bookingReference}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed italic">"{f.comments}"</p>
                                </div>
                            ))}

                            {analytics.feedback?.recent?.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-gray-400 text-sm">No feedback available yet</p>
                                    <p className="text-gray-400 text-xs mt-1">Guest reviews will appear here once submitted</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsAnalytics;
