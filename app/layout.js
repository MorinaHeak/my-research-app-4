export const metadata = {
  title: 'Research Proposal Assistant',
  description: 'កម្មវិធីជំនួយការរៀបចំគ្រោងការស្រាវជ្រាវ',
  manifest: '/manifest.json',
};

export default function RootLayout({ children }) {
  return (
    <html lang="km">
      <body>{children}</body>
    </html>
  );
}