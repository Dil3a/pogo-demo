'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { setSession, isLoggedIn } from '@/lib/session';
import { getClientStore } from '@/lib/client-store';

const DEMO_USER = {
  matricule: '1234567',
  firstName: 'Yassine',
  lastName: 'El Idrissi',
  email: 'y.elidrissi@uemf.ma',
  establishment: 'Euromed Business School',
  program: 'Génie Informatique & IA',
  role: 'student' as const,
};

export default function LoginPage() {
  const router = useRouter();
  const [matricule, setMatricule] = useState('');
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const isValid = /^\d{7}$/.test(matricule);

  // Already logged in → go to portal
  useEffect(() => {
    if (isLoggedIn()) router.replace('/portail');
  }, [router]);

  async function handleLogin() {
    setTouched(true);
    if (!isValid) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));

    const user = { ...DEMO_USER, matricule };
    setSession(user);

    // Sync with POGO client store
    const store = getClientStore();
    store.user.matricule = matricule;
    store.user.firstName = user.firstName;
    store.user.lastName = user.lastName;
    store.user.email = user.email;
    store.user.establishment = user.establishment;

    router.push('/portail');
  }

  return (
    <div style={{
      minHeight: '100dvh', background: '#f0f4f8',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
    }}>
      {/* Hero */}
      <div style={{
        background: '#003A7A', borderRadius: '20px', padding: '24px 28px',
        marginBottom: '20px', width: '100%', maxWidth: '360px',
        boxShadow: '0 8px 32px rgba(0,58,122,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '14px' }}>
          {/* UEMF */}
          <div style={{ background: '#fff', borderRadius: '10px', padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '16px', fontWeight: 800, color: '#003A7A', lineHeight: 1 }}>UEMF</div>
            <div style={{ fontSize: '8px', color: '#1a8a3a', fontWeight: 700, marginTop: '2px' }}>Université Euromed</div>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '22px', fontWeight: 300 }}>×</span>
          {/* POGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', padding: '8px 14px' }}>
            <svg width="24" height="24" viewBox="0 0 200 200">
              <rect width="200" height="200" rx="40" fill="rgba(255,255,255,0.2)" />
              <circle cx="100" cy="100" r="60" fill="white" />
              <circle cx="100" cy="100" r="34" fill="#00c9b1" />
              <circle cx="100" cy="100" r="14" fill="white" />
            </svg>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '2px' }}>POGO</span>
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>Portail officiel des services étudiants</div>
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)', marginTop: '3px' }}>Université Euromed de Fès · Campus principal</div>
        </div>
      </div>

      {/* Login card */}
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '24px',
        width: '100%', maxWidth: '360px',
        boxShadow: '0 4px 20px rgba(0,58,122,0.08)', border: '1px solid #e2e8f0',
      }}>
        <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', fontWeight: 800, color: '#003A7A', marginBottom: '4px' }}>
          Connexion étudiant
        </h2>
        <p style={{ fontSize: '12px', color: '#64748b', marginBottom: '20px', lineHeight: 1.6 }}>
          Votre matricule UEMF donne accès au portail et à l'application POGO.
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
          onKeyUp={(e) => { if (e.key === 'Enter') handleLogin(); }}
          autoComplete="off"
          style={{
            display: 'block', width: '100%', height: '50px',
            border: `2px solid ${touched && !isValid ? '#e53e3e' : matricule.length === 7 ? '#1a8a3a' : '#003A7A'}`,
            borderRadius: '12px', padding: '0 14px',
            fontSize: '20px', fontWeight: 700, letterSpacing: '5px', color: '#1a2a4a',
            background: '#f9fafb', outline: 'none', marginBottom: '6px',
          }}
        />
        {touched && !isValid && (
          <p style={{ fontSize: '11px', color: '#e53e3e', marginBottom: '10px' }}>
            Le matricule doit comporter exactement 7 chiffres.
          </p>
        )}
        {(!touched || isValid) && (
          <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
            7 chiffres — ex : 1234567
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            width: '100%', height: '50px',
            background: 'linear-gradient(135deg, #003A7A, #1a8a3a)',
            color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 800,
            fontSize: '15px', border: 'none', borderRadius: '14px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            boxShadow: '0 4px 14px rgba(0,58,122,0.25)',
          }}
        >
          {loading ? 'Connexion...' : 'Accéder au portail →'}
        </button>

        <div style={{
          marginTop: '14px', padding: '10px 12px', background: '#f0fdf9',
          borderRadius: '10px', border: '1px solid #a7f3d0',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <ShieldCheck size={16} color="#008c7c" />
          <span style={{ fontSize: '11px', color: '#008c7c', fontWeight: 600 }}>
            Accès sécurisé · Portail UEMF + App POGO
          </span>
        </div>
      </div>

      <p style={{ marginTop: '20px', fontSize: '10px', color: '#94a3b8', textAlign: 'center' }}>
        UEMF × POGO · Portail étudiant unifié · {new Date().getFullYear()}
      </p>
    </div>
  );
}
