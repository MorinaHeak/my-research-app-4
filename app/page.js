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

  // Environment variables automatically injected by Next.js
  const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const TELEGRAM_BOT_TOKEN = process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN;
  const TELEGRAM_CHAT_ID = process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID;

  const generateProposal = async () => {
    if (!topic.trim()) {
      alert('សូមបញ្ចូលប្រធានបទស្រាវជ្រាវ!');
      return;
    }

    if (!GEMINI_API_KEY) {
      alert('API Key មិនទាន់បានកំណត់ទេ! (NEXT_PUBLIC_GEMINI_API_KEY is missing)');
      return;
    }

    setLoading(true);
    setOutput('🤖 ប្រព័ន្ធ AI កំពុងរៀបចំ និងសរសេរគ្រោងការស្រាវជ្រាវជាភាសាខ្មែរ...');

    try {
      const prompt = `ចូលតួជាអ្នកជំនាញស្រាវជ្រាវ។ សូមរៀបចំគ្រោងការស្រាវជ្រាវ (Research Proposal) ផ្លូវការជាភាសាខ្មែរ លើប្រធានបទ៖ "${topic}" ក្នុងវិស័យ "${field}"។ 
      គ្រោងការត្រូវមានចំណុចសំខាន់ៗដូចជា៖
      1. ចំណងជើងស្រាវជ្រាវ
      2. ផ្ទាំងទស្សនីយភាព និងបញ្ហាស្រាវជ្រាវ (Background & Statement of the Problem)
      3. បំណងនៃការសិក្សា (Research Objectives)
      4. សំណួរស្រាវជ្រាវ (Research Questions)
      5. វិធីសាស្ត្រស្រាវជ្រាវ (Research Methodology)`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
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
    <div className="bg-slate-50 text-slate-800 min-h-screen">
      {/* Header */}
      <header className="bg-indigo-700 text-white py-4 shadow-md">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center">
          <h1 className="text-lg md:text-xl font-bold flex items-center gap-2">
            🎓 ជំនួយការសរសេរគ្រោងការស្រាវជ្រាវ
          </h1>
          <button onClick={() => setShowPaymentModal(true)} className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition">
            ➕ ទិញក្រេឌីត
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-lg font-bold text-indigo-950 border-b pb-2">ការកំណត់គ្រោងស្រាវជ្រាវ</h2>
            <div>
              <label className="block text-sm font-semibold mb-1">ប្រធានបទ ឬគំនិតស្រាវជ្រាវ</label>
              <textarea
                rows={4}
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="ឧទាហរណ៍៖ ការសិក្សាអំពីផលប៉ះពាល់នៃការប្រែប្រួលអាកាសធាតុ..."
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">ជំនាញ ឬវិស័យសិក្សា</label>
              <select
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="w-full p-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition shadow"
            >
              {loading ? '⏳ កំពុងបង្កើត...' : '✨ បង្កើតគ្រោងការស្រាវជ្រាវ'}
            </button>
          </div>
        </section>

        {/* Output Panel */}
        <section className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
            <h2 className="text-lg font-bold text-indigo-950">សេចក្តីព្រាងគ្រោងការស្រាវជ្រាវ</h2>
            <button onClick={copyOutput} className="text-xs bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded border font-medium">
              📋 ចម្លង
            </button>
          </div>
          <div className="text-sm text-slate-700 whitespace-pre-wrap min-h-[400px] border border-dashed p-4 rounded-lg bg-slate-50">
            {output}
          </div>
        </section>
      </main>

      {/* KHQR Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative border border-slate-100">
            <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 text-slate-400 font-bold">&times;</button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">🪙 ទិញក្រេឌីតបន្ថែម (Buy Credits)</h3>
            <p className="text-xs text-slate-500 mb-4">ស្កែន KHQR ដើម្បីទទួលបាន 10 ក្រេឌីត ត្រឹមតែ $1.00 ប៉ុណ្ណោះ!</p>
            <div className="bg-slate-50 p-4 rounded-xl border flex flex-col items-center mb-4">
              <img src="/QR_Morina.jpg" alt="ABA KHQR" className="max-w-[200px] rounded-lg shadow-md" />
              <span class="text-sm font-bold text-indigo-600 mt-2">$1.00 = 10 ក្រេឌីត</span>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                value={txId}
                onChange={(e) => setTxId(e.target.value)}
                placeholder="បញ្ចូលលេខប្រតិបត្តិការ (Transaction ID)"
                className="w-full p-2.5 border rounded-lg text-sm outline-none"
              />
              <button
                onClick={submitPayment}
                disabled={isSubmittingPay}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm"
              >
                {isSubmittingPay ? '⏳ កំពុងផ្ញើ...' : 'បញ្ជូនការទូទាត់ (Submit)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}