'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, LogIn } from 'lucide-react';
import { useLoginWithMatricule } from '@/hooks/useAuth';
import { MatriculeRegex } from '@/types/domain';

export default function LoginPage() {
  const router = useRouter();
  const login = useLoginWithMatricule();
  const [matricule, setMatricule] = useState('');
  const [touched, setTouched] = useState(false);
  const isValid = MatriculeRegex.test(matricule);

  async function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    try {
      await login.mutateAsync(matricule);
      router.push('/map');
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <div style={{ minHeight: '100dvh', background: '#f0f4f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>

      {/* UEMF × POGO Hero */}
      <div style={{ background: '#003A7A', borderRadius: '20px', padding: '24px 28px', marginBottom: '20px', width: '100%', maxWidth: '360px', boxShadow: '0 8px 32px rgba(0,58,122,0.3)' }}>
        {/* Logos */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '14px' }}>
          {/* UEMF */}
          <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#003A7A', lineHeight: 1 }}>UEMF</div>
            <div style={{ fontSize: '8px', color: '#1a8a3a', fontWeight: 700, marginTop: '2px', lineHeight: 1 }}>Université Euromed</div>
          </div>
          {/* × */}
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '22px', fontWeight: 300 }}>×</span>
          {/* POGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px' }}>
            <svg width="26" height="26" viewBox="0 0 200 200">
              <rect width="200" height="200" rx="40" fill="rgba(255,255,255,0.2)" />
              <circle cx="100" cy="100" r="60" fill="white" />
              <circle cx="100" cy="100" r="34" fill="#00c9b1" />
              <circle cx="100" cy="100" r="14" fill="white" />
            </svg>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '2px' }}>POGO</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', letterSpacing: '0.5px', fontWeight: 600 }}>Plateforme officielle de mobilité douce</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', marginTop: '3px' }}>Université Euromed de Fès · Campus principal</div>
        </div>
      </div>

      {/* Login Card */}
      <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 20px rgba(0,58,122,0.08)', border: '1px solid #e2e8f0' }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#003A7A', marginBottom: '4px' }}>Connexion étudiant</h2>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
          Identifiez-vous avec votre matricule UEMF pour accéder au service POGO.
        </p>

        <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, color: '#374151', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Numéro de matricule
        </label>
        <input
          type="tel"
          inputMode="numeric"
          maxLength={7}
          placeholder="1234567"
          value={matricule}
          onChange={(e) => setMatricule(e.target.value.replace(/\D/g, '').slice(0, 7))}
          onKeyUp={(e) => { if (e.key === 'Enter') handleSubmit(); }}
          style={{
            display: 'block', width: '100%', height: '50px',
            border: `2px solid ${touched && !isValid ? '#e53e3e' : matricule.length === 7 ? '#1a8a3a' : '#003A7A'}`,
            borderRadius: '12px', padding: '0 14px',
            fontSize: '20px', fontWeight: 700, letterSpacing: '5px', color: '#1a2a4a',
            background: '#f9fafb', outline: 'none', marginBottom: '6px',
          }}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
        />
        {touched && !isValid && (
          <p style={{ fontSize: '11px', color: '#e53e3e', marginBottom: '10px' }}>
            Le matricule doit comporter exactement 7 chiffres.
          </p>
        )}
        {!touched && (
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
            Votre matricule étudiant UEMF à 7 chiffres
          </p>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={login.isPending}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', height: '50px', marginTop: '4px',
            background: 'linear-gradient(135deg, #003A7A, #1a8a3a)',
            color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '15px', border: 'none', borderRadius: '14px',
            cursor: login.isPending ? 'not-allowed' : 'pointer',
            opacity: login.isPending ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(0,58,122,0.25)',
          }}
        >
          <LogIn size={18} />
          {login.isPending ? 'Connexion...' : 'Se connecter'}
        </button>

        {/* Security badge */}
        <div style={{ marginTop: '14px', padding: '10px 12px', background: '#f0fdf9', borderRadius: '10px', border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} color="#008c7c" />
          <span style={{ fontSize: '11px', color: '#008c7c', fontWeight: 600 }}>
            Connexion sécurisée via le portail UEMF
          </span>
        </div>

        <p style={{ textAlign: 'center', fontSize: '10px', color: '#94a3b8', marginTop: '14px' }}>
          En production, connexion via SSO UEMF
        </p>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '20px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>
        POGO · Partenariat officiel UEMF · {new Date().getFullYear()}
      </p>
    </div>
  );
}
