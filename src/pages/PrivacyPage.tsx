import { Link } from 'react-router-dom'

export function PrivacyPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem', color: 'var(--fg)', fontFamily: 'var(--font-display)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', textDecoration: 'none' }}>
          ← Back to App
        </Link>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Privacy Policy</h1>
      <div style={{ fontSize: '0.8rem', lineHeight: 1.7, opacity: 0.85 }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: March 2026</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Data Collection</h2>
        <p style={{ marginBottom: '1rem' }}>ASC11 does not collect, store, or transmit any personal data. The application runs entirely in your browser.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Local Storage</h2>
        <p style={{ marginBottom: '1rem' }}>Images, presets, and settings are stored locally in your browser using IndexedDB. This data never leaves your device.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Camera Access</h2>
        <p style={{ marginBottom: '1rem' }}>If you use the camera feature, your browser will request camera permissions. Video data is processed locally and never transmitted.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Cookies</h2>
        <p style={{ marginBottom: '1rem' }}>ASC11 does not use cookies or any tracking technologies.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Third Parties</h2>
        <p style={{ marginBottom: '1rem' }}>We do not share any data with third parties. Google Fonts are loaded from Google's CDN for typography.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>Contact</h2>
        <p>For privacy concerns, please open an issue on the project repository.</p>
      </div>
    </div>
  )
}
