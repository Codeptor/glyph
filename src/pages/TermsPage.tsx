import { Link } from 'react-router-dom'

export function TermsPage() {
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto', padding: '2rem 1.5rem', color: 'var(--fg)', fontFamily: 'var(--font-display)' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--accent)', textDecoration: 'none' }}>
          ← Back to App
        </Link>
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', letterSpacing: '-0.02em' }}>Terms of Service</h1>
      <div style={{ fontSize: '0.8rem', lineHeight: 1.7, opacity: 0.85 }}>
        <p style={{ marginBottom: '1rem' }}>Last updated: March 2026</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>1. Acceptance</h2>
        <p style={{ marginBottom: '1rem' }}>By using ASC11, you agree to these terms. If you do not agree, please do not use the service.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>2. Service</h2>
        <p style={{ marginBottom: '1rem' }}>ASC11 is a client-side ASCII art generator. All processing happens in your browser. No data is sent to any server.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>3. Content</h2>
        <p style={{ marginBottom: '1rem' }}>You retain all rights to images and content you create using ASC11. We do not store, collect, or have access to your content.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>4. Storage</h2>
        <p style={{ marginBottom: '1rem' }}>All data (images, presets, settings) is stored locally in your browser using IndexedDB and localStorage. Clearing browser data will remove all saved content.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>5. Disclaimer</h2>
        <p style={{ marginBottom: '1rem' }}>ASC11 is provided "as is" without warranty. We are not liable for any loss of data or content.</p>
        <h2 style={{ fontSize: '0.9rem', fontWeight: 600, marginTop: '1.5rem', marginBottom: '0.5rem' }}>6. Changes</h2>
        <p>We may update these terms. Continued use constitutes acceptance of changes.</p>
      </div>
    </div>
  )
}
