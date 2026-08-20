'use client';
import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម');
  const [output, setOutput] = useState('សូមបញ្ចូលប្រធានបទស្រាវជ្រាវ រួចចុចជ្រើសរើសមុខងារខាងឆ្វេង ដើម្បីចាប់ផ្តើម...');
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState(10); // ក្រេឌីតចាប់ផ្តើម
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [txId, setTxId] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // មុខងារហៅ AI តាមប្រភេទសេវាកម្មនីមួយៗ
  const handleAIAction = async (serviceType, cost, customPromptText) => {
    if (!topic.trim()) {
      alert('សូមបញ្ចូលប្រធានបទ ឬគំនិតស្រាវជ្រាវសិន!');
      return;
    }
    if (credits < cost) {
      alert('ក្រេឌីតរបស់អ្នកមិនគ្រប់គ្រាន់ទេ! សូមទិញក្រេឌីតបន្ថែម។');
      setShowPaymentModal(true);
      return;
    }
    if (!GEMINI_API_KEY) {
      alert('API Key មិនទាន់បានកំណត់ទេ!');
      return;
    }

    setLoading(true);
    setOutput(`🤖 ប្រព័ន្ធ AI កំពុងដំណើរការមុខងារ "${serviceType}"... សូមរង់ចាំបន្តិច។`);

    try {
      const response = `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ និងវិភាគទិន្នន័យ។ ${customPromptText} លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}"។ សូមសរសេរជាភាសាខ្មែរឱ្យបានក្បោះក្បាយ និងមានវិជ្ជាជីវៈខ្ពស់។`;

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: response }] }] })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.candidates[0].content.parts[0].text;
      setOutput(text);
      setCredits(prev => prev - cost); // កាត់ក្រេឌីតតាមតម្លៃសេវាកម្ម
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('បានចម្លងលទ្ធផលរួចរាល់!');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: "'Khmer OS Siem Reap', sans-serif", color: '#1e293b' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#4338ca', color: '#ffffff', padding: '16px 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontFamily: "'Khmer OS Moul Light', serif", fontSize: '20px', margin: 0 }}>🎓 ជំនួយការសរសេរគ្រោងការស្រាវជ្រាវ</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '6px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
              🪙 {credits} ក្រេឌីត
            </span>
            <button 
              onClick={() => setShowPaymentModal(true)} 
              style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
            >
              ➕ ទិញក្រេឌីត
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '24px' }}>
        
        {/* Left Panel: Inputs & Advanced Services */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Input Box */}
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h2 style={{ fontFamily: "'Khmer OS Moul Light', serif", fontSize: '16px', color: '#1e1b4b', marginTop: 0, marginBottom: '16px' }}>បញ្ចូលព័ត៌មានស្រាវជ្រាវ</h2>
            
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ប្រធានបទ ឬគំនិតស្រាវជ្រាវ</label>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ឧទាហរណ៍៖ ការសិក្សាអំពីផលប៉ះពាល់នៃការប្រែប្រួលអាកាសធាតុ..."
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: "'Khmer OS Siem Reap', sans-serif" }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>វិស័យសិក្សា</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', fontFamily: "'Khmer OS Siem Reap', sans-serif" }}
              >
                <option value="ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម">ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម</option>
                <option value="អប់រំ និងគរុកោសល្យ">អប់រំ និងគរុកោសល្យ</option>
                <option value="ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច">ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច</option>
                <option value="បច្ចេកវិទ្យាព័ត៌មាន">បច្ចេកវិទ្យាព័ត៌មាន</option>
              </select>
            </div>
          </section>

          {/* Advanced AI Services Card (ដូចក្នុងរូបភាពរបស់អ្នក) */}
          <section style={{ backgroundColor: '#1e1b4b', color: '#ffffff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#facc15', margin: '0 0 6px 0' }}>🚀 មុខងារជឿនលឿន (Advanced AI Services)</h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 16px 0' }}>បង្កើនប្រសិទ្ធភាពការងារស្រាវជ្រាវរបស់អ្នកជាមួយសេវាកម្មស៊ីជម្រៅខាងក្រោម៖</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Service 1: Full Proposal */}
              <div 
                onClick={() => handleAIAction('សំណើរកាគ្រោងការពេញលេញ', 3, 'រៀបចំគ្រោងការស្រាវជ្រាវពេញលេញ (Full Proposal) តាម Format ផ្លូវការ រួមមាន៖ សេចក្តីផ្តើម បញ្ហាស្រាវជ្រាវ វណ្ណនីសាស្ត្រ និងផែនការសកម្មភាព')}
                style={{ backgroundColor: '#312e81', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #4f46e5' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>📄 សំណើរកាគ្រោងការពេញលេញ</div>
                  <div style={{ fontSize: '11px', color: '#93c5fd' }}>រៀបចំតាម Format ផ្លូវការ (Full Proposal)</div>
                </div>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>3 Credits</span>
              </div>

              {/* Service 2: Questionnaire */}
              <div 
                onClick={() => handleAIAction('បង្កើតកម្រងសំណួរ', 2, 'រៀបចំកម្រងសំណួរ (Questionnaire) លម្អិត ដែលស្របតាមក្រុមគោលដៅ និងវិធីសាស្ត្រប្រមូលទិន្នន័យ')}
                style={{ backgroundColor: '#312e81', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #4f46e5' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>📋 បង្កើតកម្រងសំណួរ (Questionnaire)</div>
                  <div style={{ fontSize: '11px', color: '#93c5fd' }}>តម្រូវតាមប្រភេទអ្នកឆ្លើយតបគោលដៅ</div>
                </div>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>2 Credits</span>
              </div>

              {/* Service 3: Data Analysis */}
              <div 
                onClick={() => handleAIAction('វិភាគទិន្នន័យ', 5, 'ផ្តល់ផែនការវិភាគទិន្នន័យ (Data Analysis Plan) វិធីសាស្ត្រវិភាគ និងគំរូនៃការបកស្រាយលទ្ធផលរបាយការណ៍')}
                style={{ backgroundColor: '#312e81', padding: '12px 16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #4f46e5' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>📊 វិភាគទិន្នន័យ (Data Analysis)</div>
                  <div style={{ fontSize: '11px', color: '#93c5fd' }}>បកស្រាយទិន្នន័យ និងធ្វើរបាយការណ៍</div>
                </div>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>5 Credits</span>
              </div>

            </div>

            {/* Buy Credit Button inside card */}
            <button 
              onClick={() => setShowPaymentModal(true)}
              style={{ width: '100%', backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '16px' }}
            >
              💳 ទិញក្រេឌីតបន្ថែមខ្សེរនេះ ($1.00 = 10 Credits)
            </button>
          </section>

        </div>

        {/* Right Panel: Output Display */}
        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', marginBottom: '16px' }}>
            <h2 style={{ fontFamily: "'Khmer OS Moul Light', serif", fontSize: '16px', color: '#1e1b4b', margin: 0 }}>លទ្ធផលពី AI</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyOutput} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold', fontFamily: "'Khmer OS Siem Reap', sans-serif" }}>
                📋 ចម្លងអត្ថបទ
              </button>
            </div>
          </div>

          <div style={{ fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap', flexGrow: 1, minHeight: '500px', border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc', color: '#334155' }}>
            {loading ? '⏳ កំពុងបង្កើតទិន្នន័យ... សូមរង់ចាំបន្តិច' : output}
          </div>
        </section>

      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '24px', position: 'relative', fontFamily: "'Khmer OS Siem Reap', sans-serif" }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            
            <h3 style={{ fontFamily: "'Khmer OS Moul Light', serif", fontSize: '16px', marginTop: 0, color: '#1e1b4b' }}>🪙 ទិញក្រេឌីតបន្ថែម</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>ស្កែន KHQR ដើម្បីទទួលបាន 10 ក្រេឌីត ត្រឹមតែ $1.00 ប៉ុណ្ណោះ!</p>
            
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '16px' }}>
              <img src="/QR_Morina.jpg" alt="ABA KHQR" style={{ maxWidth: '160px', borderRadius: '8px' }} />
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#4f46e5', marginTop: '8px' }}>$1.00 = 10 ក្រេឌីត</div>
            </div>

            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="បញ្ចូលលេខប្រតិបត្តិការ (Transaction ID)"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px', fontFamily: "'Khmer OS Siem Reap', sans-serif" }}
            />

            <button
              onClick={() => {
                if (!txId.trim()) { alert('សូមបញ្ចូលលេខប្រតិបត្តិការ!'); return; }
                alert('សំណើទូទាត់ត្រូវបានផ្ញើជោគជ័យ!');
                setCredits(prev => prev + 10); // បន្ថែម 10 ក្រេឌីតពេលសាកល្បង
                setTxId('');
                setShowPaymentModal(false);
              }}
              style={{ width: '100%', backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontFamily: "'Khmer OS Siem Reap', sans-serif" }}
            >
              បញ្ជូនការទូទាត់ (Submit)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}