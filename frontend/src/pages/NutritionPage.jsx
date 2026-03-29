import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { getNutritionPlan } from '../api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEAL_ICONS = { breakfast: '🌅', lunch: '☀️', dinner: '🌙', snacks: '🍎' };

export default function NutritionPage() {
    const [loading, setLoading] = useState(false);
    const [plan, setPlan] = useState(null);
    const [activeDay, setActiveDay] = useState(0);
    const [preferences, setPreferences] = useState({
        vegetarian: false,
        vegan: false,
        glutenFree: false,
    });
    const [goals, setGoals] = useState('general health');

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const res = await getNutritionPlan({ goals, preferences });
            setPlan(res.data.plan);
            setActiveDay(0);
            toast.success('7-day nutrition plan generated! 🥗');
        } catch (err) {
            toast.error('Failed to generate plan. Check your Groq API key.');
        } finally {
            setLoading(false);
        }
    };

    const dayPlan = plan?.weeklyPlan?.[activeDay];
    const totalCals = dayPlan ? (dayPlan.breakfast?.calories || 0) + (dayPlan.lunch?.calories || 0) + (dayPlan.dinner?.calories || 0) : 0;

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🥗 AI Nutrition Planner</h1>
                <p>Personalized meal plans based on your biomarkers and health goals</p>
            </div>

            {/* Configuration */}
            <div className="grid grid-2" style={{ marginBottom: '28px', alignItems: 'start' }}>
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '20px' }}>⚙️ Plan Configuration</h3>

                    <div className="form-group">
                        <label className="form-label">Health Goal</label>
                        <select
                            className="form-select"
                            value={goals}
                            onChange={e => setGoals(e.target.value)}
                        >
                            <option value="general health">🎯 General Health</option>
                            <option value="lower cholesterol and LDL">❤️ Lower Cholesterol</option>
                            <option value="control blood sugar and diabetes risk">💉 Blood Sugar Control</option>
                            <option value="weight loss and BMI reduction">⚖️ Weight Loss</option>
                            <option value="heart health and cardiovascular strength">🫀 Heart Health</option>
                            <option value="increase energy and reduce fatigue">⚡ Energy Boost</option>
                            <option value="kidney health and creatinine control">🫘 Kidney Health</option>
                            <option value="liver health and detox">🌿 Liver Detox</option>
                            <option value="boost immunity and nutrition">🛡️ Immunity Boost</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Dietary Preferences</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {[
                                { key: 'vegetarian', label: '🥦 Vegetarian' },
                                { key: 'vegan', label: '🌱 Vegan' },
                                { key: 'glutenFree', label: '🌾 Gluten-Free' },
                            ].map(({ key, label }) => (
                                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem' }}>
                                    <input
                                        type="checkbox"
                                        checked={preferences[key]}
                                        onChange={e => setPreferences({ ...preferences, [key]: e.target.checked })}
                                        style={{ width: '18px', height: '18px', accentColor: 'var(--cyan)' }}
                                    />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={handleGenerate}
                        disabled={loading}
                        style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
                        id="generate-nutrition-btn"
                    >
                        {loading ? (
                            <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Generating Plan...</>
                        ) : '🥗 Generate My Nutrition Plan'}
                    </button>
                </div>

                {/* Info Card */}
                <div className="glass-card" style={{ padding: '24px' }}>
                    <h3 style={{ fontSize: '1rem', marginBottom: '16px' }}>💡 How it works</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        {[
                            { icon: '🧪', text: 'Analyzes your latest lab report biomarkers' },
                            { icon: '🎯', text: 'Aligns meals with your specific health goals' },
                            { icon: '🥗', text: 'Creates a 7-day diverse meal plan' },
                            { icon: '🚫', text: 'Suggests foods to avoid based on your data' },
                            { icon: '💊', text: 'Recommends supplements for any deficiencies' },
                        ].map((item, i) => (
                            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{item.icon}</span>
                                <span>{item.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Plan Results */}
            <AnimatePresence>
                {plan && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Summary */}
                        <div className="grid grid-3" style={{ marginBottom: '24px' }}>
                            <div className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Space Grotesk', color: 'var(--cyan)' }}>{plan.targetCalories}</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>Daily Target Calories</div>
                            </div>
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--green)', fontWeight: 700, marginBottom: '8px' }}>✅ RECOMMENDED FOODS</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {plan.recommendedFoods?.slice(0, 4).map((f, i) => (
                                        <span key={i} style={{ padding: '3px 10px', borderRadius: '50px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.75rem', color: 'var(--green)' }}>{f}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="glass-card" style={{ padding: '20px' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--red)', fontWeight: 700, marginBottom: '8px' }}>🚫 FOODS TO AVOID</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                    {plan.avoidFoods?.slice(0, 4).map((f, i) => (
                                        <span key={i} style={{ padding: '3px 10px', borderRadius: '50px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.75rem', color: 'var(--red)' }}>{f}</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Nutrition Insight */}
                        {plan.nutritionInsight && (
                            <div style={{ padding: '16px 20px', background: 'linear-gradient(135deg, rgba(0,212,255,0.06), rgba(124,58,237,0.06))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', marginBottom: '24px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                                💡 <strong style={{ color: 'var(--cyan)' }}>AI Insight: </strong>{plan.nutritionInsight}
                            </div>
                        )}

                        {/* Day Selector */}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
                            {plan.weeklyPlan?.map((day, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveDay(i)}
                                    style={{
                                        padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                        border: `1.5px solid ${activeDay === i ? 'var(--cyan)' : 'rgba(255,255,255,0.1)'}`,
                                        background: activeDay === i ? 'rgba(0,212,255,0.12)' : 'transparent',
                                        color: activeDay === i ? 'var(--cyan)' : 'var(--text-secondary)',
                                        transition: 'all 0.2s',
                                    }}
                                >
                                    {day.day || DAYS[i]}
                                </button>
                            ))}
                        </div>

                        {/* Day Plan */}
                        {dayPlan && (
                            <motion.div key={activeDay} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                    <h3 style={{ fontSize: '1.1rem' }}>{dayPlan.day || DAYS[activeDay]}'s Plan</h3>
                                    <div style={{ padding: '6px 14px', borderRadius: '50px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', fontSize: '0.85rem', color: 'var(--cyan)', fontWeight: 700 }}>
                                        ~{totalCals} kcal total
                                    </div>
                                </div>
                                <div className="grid grid-2" style={{ gap: '16px' }}>
                                    {['breakfast', 'lunch', 'dinner'].map((mealType) => {
                                        const meal = dayPlan[mealType];
                                        if (!meal) return null;
                                        return (
                                            <div key={mealType} className="glass-card" style={{ padding: '20px' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '1.3rem' }}>{MEAL_ICONS[mealType]}</span>
                                                        <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>{mealType}</span>
                                                    </div>
                                                    {meal.calories && (
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--orange)' }}>{meal.calories} kcal</span>
                                                    )}
                                                </div>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '8px' }}>{meal.meal}</div>
                                                {meal.keyBenefits && (
                                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '6px', padding: '8px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px', borderLeft: '2px solid var(--green)' }}>
                                                        {meal.keyBenefits}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    {dayPlan.snacks && (
                                        <div className="glass-card" style={{ padding: '20px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '1.3rem' }}>{MEAL_ICONS.snacks}</span>
                                                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Snacks</span>
                                            </div>
                                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{dayPlan.snacks}</div>
                                        </div>
                                    )}
                                </div>

                                {/* Hydration & Supplements */}
                                <div className="grid grid-2" style={{ marginTop: '16px', gap: '16px' }}>
                                    {plan.hydrationTip && (
                                        <div style={{ padding: '14px 18px', background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', borderRadius: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                            💧 <strong style={{ color: 'var(--cyan)' }}>Hydration: </strong>{plan.hydrationTip}
                                        </div>
                                    )}
                                    {plan.supplementSuggestions?.length > 0 && (
                                        <div style={{ padding: '14px 18px', background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '12px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                                            💊 <strong style={{ color: 'var(--orange)' }}>Supplements: </strong>{plan.supplementSuggestions.join(', ')}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {!plan && !loading && (
                <div className="glass-card" style={{ padding: '48px', textAlign: 'center' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🥗</div>
                    <h3 style={{ marginBottom: '8px' }}>Your Personalized Nutrition Plan</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Configure your health goals and dietary preferences above, then generate your AI-powered 7-day meal plan tailored to your biomarkers.</p>
                </div>
            )}
        </div>
    );
}
