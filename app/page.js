'use client';

import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម');
  const [output, setOutput] = useState('សូមបញ្ចូលប្រធានបទស្រាវជ្រាវ រួចចុចប៊ូតុងខាងឆ្វេង ដើម្បីបង្កើតគ្រោងការស្រាវជ្រាវជាភាសាខ្មែរ (ទទួលបាន Free 1 Credit សម្រាប់ការសាកល្បង)។');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [txId, setTxId] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  // មុខងារហៅ AI សកល (ប្រើ gemini-3.7-flash ចុងក្រោយ)
  const handleAIAction = async (serviceName, customPrompt) => {
    if (!topic.trim()) {
      alert('សូមបញ្ចូលប្រធានបទស្រាវជ្រាវ!');
      return;
    }

    if (!GEMINI_API_KEY) {
      alert('API Key មិនទាន់បានកំណត់ទេ! (NEXT_PUBLIC_GEMINI_API_KEY is missing)');
      return;
    }

    setLoading(true);
    setOutput(`🤖 ប្រព័ន្ធ AI កំពុងរៀបចំ "${serviceName}" ជាភាសាខ្មែរ...`);

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: customPrompt }] }] })
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const text = data.candidates[0].content.parts[0].text;
      setOutput(text);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const generateProposal = () => {
    const prompt = `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ។ សូមរៀបចំគ្រោងការស្រាវជ្រាវ (Research Proposal) ផ្លូវការជាភាសាខ្មែរ លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}"។ 
    គ្រោងការត្រូវមានចំណុចសំខាន់ៗដូចជា៖
    1. ចំណងជើងស្រាវជ្រាវ
    2. ផ្ទាំងទស្សនីយភាព និងបញ្ហាស្រាវជ្រាវ (Background & Statement of the Problem)
    3. បំណងនៃការសិក្សា (Research Objectives)
    4. សំណួរស្រាវជ្រាវ (Research Questions)
    5. វិធីសាស្ត្រស្រាវជ្រាវ (Research Methodology)`;
    
    handleAIAction('គ្រោងការស្រាវជ្រាវសង្ខេប', prompt);
  };

  const submitPayment = async () => {
    if (!txId.trim()) return alert('សូមបញ្ចូលលេខប្រតិបត្តិការ!');

    setIsSubmittingPay(true);
    try {
      const message = `🔔 *ស្នើសុំទិញក្រេឌីតថ្មី (New Payment Request)*\n\n🧾 *Transaction ID*: \`${txId}\`\n💵 *ចំនួនទឹកប្រាក់*: $1.00 (10 Credits)`;

      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
      });

      alert('សំណើទូទាត់ត្រូវបានផ្ញើជោគជ័យ!');
      setTxId('');
      setShowPaymentModal(false);
    } catch (err) {
      alert('កំហុសក្នុងការផ្ញើសំណើ៖ ' + err.message);
    } finally {
      setIsSubmittingPay(false);
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    alert('បានចម្លងគ្រោងស្រាវជ្រាវរួចរាល់!');
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', color: '#1e293b' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#4338ca', color: '#ffffff', padding: '16px 24px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>🎓 ជំនួយការសរសេរគ្រោងការស្រាវជ្រាវ</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>1 ក្រេឌីត</span>
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
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e1b4b', margin: 0 }}>ការកំណត់គ្រោងស្រាវជ្រាវ</h2>
              <span style={{ fontSize: '11px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '4px' }}>សាកល្បង 1 Credit</span>
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ប្រធានបទ ឬគំនិតស្រាវជ្រាវ</label>
              <textarea
                rows={5}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ឧទាហរណ៍៖ ការសិក្សាអំពីផលប៉ះពាល់នៃការប្រែប្រួលអាកាសធាតុ..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>ជំនាញ ឬវិស័យសិក្សា</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
              >
                <option value="ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម">ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម</option>
                <option value="អប់រំ និងគរុកោសល្យ">អប់រំ និងគរុកោសល្យ</option>
                <option value="ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច">ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច</option>
                <option value="បច្ចេកវិទ្យាព័ត៌មាន">បច្ចេកវិទ្យាព័ត៌មាន</option>
              </select>
            </div>

            <button
              onClick={generateProposal}
              disabled={loading}
              style={{ width: '100%', backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', marginTop: '20px', cursor: 'pointer' }}
            >
              {loading ? '⏳ កំពុងបង្កើត...' : '✨ បង្កើតគ្រោងការស្រាវជ្រាវ (1 Credit)'}
            </button>
          </section>

          {/* Advanced Services Card */}
          <section style={{ backgroundColor: '#1e1b4b', color: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#facc15' }}>🚀 មុខងារជឿនលឿន (Advanced AI Services)</h3>
            <p style={{ fontSize: '12px', color: '#cbd5e1', margin: '0 0 16px 0' }}>បង្កើតទម្រង់លម្អិតផ្សេងៗទៀតដោយស្វ័យប្រវត្តិ។</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Service 1 */}
              <div 
                onClick={() => handleAIAction(
                  'សំណើរកាគ្រោងការពេញលេញ',
                  `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ។ សូមរៀបចំគ្រោងការស្រាវជ្រាវពេញលេញ (Full Formal Proposal) តាម Format ផ្លូវការ ជាភាសាខ្មែរ លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}"។`
                )}
                style={{ backgroundColor: '#312e81', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #4f46e5' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>📄 សំណើរកាគ្រោងការពេញលេញ</div>
                  <div style={{ fontSize: '11px', color: '#93c5fd' }}>រៀបចំទម្រង់ ធំដុំ (Format ផ្លូវការ)</div>
                </div>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>3 Credits</span>
              </div>

              {/* Service 2 */}
              <div 
                onClick={() => handleAIAction(
                  'បង្កើតកម្រងសំណួរ',
                  `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ។ សូមបង្កើតកម្រងសំណួរ (Questionnaire) លម្អិតជាភាសាខ្មែរ លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}" ស្របតាមក្រុមគោលដៅ។`
                )}
                style={{ backgroundColor: '#312e81', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #4f46e5' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>📋 បង្កើតកម្រងសំណួរ (Questionnaire)</div>
                  <div style={{ fontSize: '11px', color: '#93c5fd' }}>តម្រូវតាមប្រភេទអ្នកឆ្លើយតបគោលដៅ</div>
                </div>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>2 Credits</span>
              </div>

              {/* Service 3 */}
              <div 
                onClick={() => handleAIAction(
                  'វិភាគទិន្នន័យ',
                  `ចូលតួជាអ្នកជំនាញវិភាគទិន្នន័យស្រាវជ្រាវ។ សូមរៀបចំផែនការវិភាគទិន្នន័យ (Data Analysis) និងគំរូនៃការបកស្រាយលទ្ធផល ជាភាសាខ្មែរ សម្រាប់ប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}"។`
                )}
                style={{ backgroundColor: '#312e81', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', border: '1px solid #4f46e5' }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 'bold' }}>📊 វិភាគទិន្នន័យ (Data Analysis)</div>
                  <div style={{ fontSize: '11px', color: '#93c5fd' }}>បកស្រាយទិន្នន័យ និងធ្វើរបាយការណ៍</div>
                </div>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>5 Credits</span>
              </div>
            </div>
          </section>
        </div>

        {/* Output Panel */}
        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e1b4b', margin: 0 }}>សេចក្តីព្រាងគ្រោងការស្រាវជ្រាវ</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={copyOutput} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                📋 ចម្លង
              </button>
              <button onClick={() => alert('មុខងារទាញយក PDF')} style={{ backgroundColor: '#dc2626', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 ទាញយក PDF
              </button>
              <button onClick={() => alert('មុខងារទាញយក Word')} style={{ backgroundColor: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>
                📥 ទាញយក Word
              </button>
            </div>
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.6', whiteSpace: 'pre-wrap', flexGrow: 1, minHeight: '450px', border: '1px dashed #cbd5e1', padding: '16px', borderRadius: '8px', backgroundColor: '#f8fafc' }}>
            {output}
          </div>
        </section>
      </main>

      {/* Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px', zIndex: 50 }}>
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '400px', width: '100%', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginTop: 0 }}>🪙 ទិញក្រេឌីតបន្ថែម (Buy Credits)</h3>
            <p style={{ fontSize: '12px', color: '#64748b' }}>ស្កែន KHQR ដើម្បីទទួលបាន 10 ក្រេឌីត ត្រឹមតែ $1.00 ប៉ុណ្ណោះ!</p>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', marginBottom: '16px' }}>
              <img src="/QR_Morina.jpg" alt="ABA KHQR" style={{ maxWidth: '180px', borderRadius: '8px' }} />
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', marginTop: '8px' }}>$1.00 = 10 ក្រេឌីត</div>
            </div>
            <input
              type="text"
              value={txId}
              onChange={(e) => setTxId(e.target.value)}
              placeholder="បញ្ចូលលេខប្រតិបត្តិការ (Transaction ID)"
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', marginBottom: '12px' }}
            />
            <button
              onClick={submitPayment}
              disabled={isSubmittingPay}
              style={{ width: '100%', backgroundColor: '#4f46e5', color: '#fff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              {isSubmittingPay ? '⏳ កំពុងផ្ញើ...' : 'បញ្ជូនការទូទាត់ (Submit)'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}