'use client';
import { useState } from 'react';

export default function Home() {
  const [topic, setTopic] = useState('');
  const [field, setField] = useState('ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម');
  const [output, setOutput] = useState('សូមបញ្ចូលប្រធានបទស្រាវជ្រាវ រួចចុចជ្រើសរើសមុខងារខាងឆ្វេង ដើម្បីចាប់ផ្តើម...');
  const [loading, setLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [txId, setTxId] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  // មុខងារហៅ AI សកល (ប្រើ gemini-3.7-flash ចុងក្រោយបង្អស់)
  const handleAIAction = async (serviceName, promptInstructions) => {
    if (!topic.trim()) { alert('សូមបញ្ចូលប្រធានបទសិន!'); return; }
    if (!GEMINI_API_KEY) { alert('API Key មិនទាន់បានកំណត់ទេ!'); return; }

    setLoading(true);
    setOutput(`🤖 ប្រព័ន្ធកំពុងដំណើរការ "${serviceName}"... សូមរង់ចាំបន្តិច។`);

    try {
      const fullPrompt = `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ។ ${promptInstructions} លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}"។ សូមឆ្លើយតបជាភាសាខ្មែរឱ្យបានក្បោះក្បាយ។`;
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.7-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: fullPrompt }] }] })
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      setOutput(data.candidates[0].content.parts[0].text);
    } catch (err) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const submitPayment = async () => {
    if (!txId.trim()) return alert('សូមបញ្ចូលលេខប្រតិបត្តិការ!');
    setIsSubmittingPay(true);
    try {
      const message = `🔔 *សំណើទិញក្រេឌីតថ្មី*\n🧾 *ID*: \`${txId}\``;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: 'Markdown' })
      });
      alert('ផ្ញើសំណើជោគជ័យ!');
      setTxId('');
      setShowPaymentModal(false);
    } catch (err) { alert(err.message); } finally { setIsSubmittingPay(false); }
  };

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'sans-serif', color: '#1e293b' }}>
      <header style={{ backgroundColor: '#4338ca', color: '#ffffff', padding: '16px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', margin: 0 }}>🎓 ជំនួយការស្រាវជ្រាវ AI</h1>
          <button onClick={() => setShowPaymentModal(true)} style={{ backgroundColor: '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>➕ ទិញក្រេឌីត</button>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        
        {/* Left Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 'bold', color: '#1e1b4b' }}>បញ្ចូលព័ត៌មាន</h2>
            <textarea rows={4} style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} onChange={(e) => setTopic(e.target.value)} placeholder="បញ្ចូលប្រធានបទស្រាវជ្រាវរបស់អ្នក..." />
            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} onChange={(e) => setField(e.target.value)}>
              <option value="ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម">ការងារសង្គម និងវិទ្យាសាស្ត្រសង្គម</option>
              <option value="អប់រំ និងគរុកោសល្យ">អប់រំ និងគរុកោសល្យ</option>
              <option value="ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច">ពាណិជ្ជកម្ម និងសេដ្ឋកិច្ច</option>
              <option value="បច្ចេកវិទ្យាព័ត៌មាន">បច្ចេកវិទ្យាព័ត៌មាន</option>
            </select>
          </section>

          {/* Advanced AI Services */}
          <section style={{ backgroundColor: '#1e1b4b', color: '#ffffff', padding: '20px', borderRadius: '12px' }}>
            <h3 style={{ fontSize: '14px', color: '#facc15', marginBottom: '16px' }}>🚀 មុខងារជឿនលឿន (Advanced AI Services)</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div onClick={() => handleAIAction('Full Proposal', 'រៀបចំគ្រោងការស្រាវជ្រាវពេញលេញ (Full Proposal) តាម Format ផ្លូវការ រួមមាន សេចក្តីផ្តើម បញ្ហាស្រាវជ្រាវ វណ្ណនីសាស្ត្រ និងវិធីសាស្ត្រ')} style={{ cursor: 'pointer', backgroundColor: '#312e81', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px' }}>📄 សំណើរកាគ្រោងការពេញលេញ</span>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>3 Credits</span>
              </div>
              <div onClick={() => handleAIAction('Questionnaire', 'រៀបចំកម្រងសំណួរ (Questionnaire) លម្អិតស្របតាមក្រុមគោលដៅ')} style={{ cursor: 'pointer', backgroundColor: '#312e81', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px' }}>📋 បង្កើតកម្រងសំណួរ</span>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>2 Credits</span>
              </div>
              <div onClick={() => handleAIAction('Data Analysis', 'រៀបចំផែនការវិភាគទិន្នន័យ (Data Analysis) និងការបកស្រាយលទ្ធផល')} style={{ cursor: 'pointer', backgroundColor: '#312e81', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px' }}>📊 វិភាគទិន្នន័យ</span>
                <span style={{ backgroundColor: '#facc15', color: '#713f12', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>5 Credits</span>
              </div>
            </div>
          </section>
        </div>

        {/* Right Panel */}
        <section style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            <h2 style={{ fontSize: '16px', margin: 0, color: '#1e1b4b' }}>លទ្ធផលពី AI</h2>
            <button onClick={() => { navigator.clipboard.writeText(output); alert('បានចម្លងរួចរាល់!'); }} style={{ backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}>📋 ចម្លង</button>
          </div>
          <div style={{ whiteSpace: 'pre-wrap', padding: '16px', backgroundColor: '#f8fafc', minHeight: '450px', borderRadius: '8px', border: '1px dashed #cbd5e1', fontSize: '14px', lineHeight: '1.6' }}>{output}</div>
        </section>
      </main>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 50 }}>
          <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', width: '350px', position: 'relative' }}>
            <button onClick={() => setShowPaymentModal(false)} style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', fontSize: '20px', cursor: 'pointer' }}>&times;</button>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginTop: 0 }}>🪙 ទិញក្រេឌីតបន្ថែម</h3>
            <img src="/QR_Morina.jpg" alt="QR" style={{ width: '100%', marginBottom: '16px', borderRadius: '8px' }} />
            <input type="text" placeholder="Transaction ID" style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} value={txId} onChange={(e) => setTxId(e.target.value)} />
            <button onClick={submitPayment} disabled={isSubmittingPay} style={{ width: '100%', padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{isSubmittingPay ? 'កំពុងផ្ញើ...' : 'បញ្ជូន'}</button>
          </div>
        </div>
      )}
    </div>
  );
}