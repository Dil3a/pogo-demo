'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClientStore } from '@/lib/client-store';
import type { Ride } from '@/types/domain';
import { formatMoney } from '@/lib/format/money';

function fmtDT(ts: string | null | number | undefined) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AttestationPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const [ride, setRide] = useState<Ride | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selfUrl, setSelfUrl] = useState('');

  useEffect(() => {
    setSelfUrl(window.location.href);

    // Strategy 1: decode from URL (works across all devices)
    const encoded = searchParams.get('d');
    if (encoded) {
      try {
        const decoded = JSON.parse(atob(encoded));
        setRide(decoded as Ride);
        return;
      } catch { /* fall through */ }
    }

    // Strategy 2: local store (same session)
    const store = getClientStore();
    const found = store.rides.find((r) => r.id === params.id);
    if (found) setRide(found);
    else setNotFound(true);
  }, [params.id, searchParams]);

  if (notFound) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#f0f4f8', padding:'24px', textAlign:'center' }}>
      <div style={{ fontSize:'48px', marginBottom:'16px' }}>⚠️</div>
      <h2 style={{ fontFamily:'Syne,sans-serif', fontSize:'20px', color:'#003A7A', marginBottom:'8px' }}>Attestation introuvable</h2>
      <p style={{ fontSize:'13px', color:'#64748b' }}>Cette réservation n'existe pas ou a expiré.</p>
    </div>
  );

  if (!ride) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f0f4f8' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid #a5f3fc', borderTopColor:'#0e7490', borderRadius:'50%', animation:'spin .8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const isActive = ride.status === 'active';
  const isCompleted = ride.status === 'completed';
  const statusColor = isActive ? '#008c7c' : isCompleted ? '#64748b' : '#003A7A';
  const statusBg = isActive ? '#e0faf7' : isCompleted ? '#f1f5f9' : '#dbeafe';
  const statusLabel = isActive ? '✅ Trajet en cours' : isCompleted ? '✓ Trajet terminé' : '⏳ Réservé';

  const qrUrl = selfUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(selfUrl)}&color=003A7A&margin=10`
    : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;background:#f0f4f8;min-height:100vh;padding:24px 16px;}
        .container{max-width:480px;margin:0 auto;}
        .card{background:#fff;border-radius:20px;padding:24px;margin-bottom:14px;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,58,122,.08);}
        .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9;}
        .row:last-child{border-bottom:none;}
        @media print{body{background:#fff;padding:0;}.no-print{display:none!important;}.card{box-shadow:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <div className="container">
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'20px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'linear-gradient(135deg,#003A7A,#1a8a3a)', borderRadius:'14px', padding:'12px 22px', marginBottom:'12px' }}>
            <svg width="30" height="30" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="rgba(255,255,255,.2)"/><circle cx="100" cy="100" r="60" fill="white"/><circle cx="100" cy="100" r="34" fill="#00c9b1"/><circle cx="100" cy="100" r="14" fill="white"/></svg>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'20px', color:'#fff', letterSpacing:'2px' }}>POGO</span>
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'17px', color:'#003A7A', marginBottom:'3px' }}>Attestation de réservation</h1>
          <p style={{ fontSize:'11px', color:'#64748b' }}>Université Euromed de Fès — Service Mobilité</p>
        </div>

        {/* Status */}
        <div style={{ background:statusBg, border:`1.5px solid ${statusColor}50`, borderRadius:'14px', padding:'14px 18px', marginBottom:'14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', color:statusColor }}>{statusLabel}</span>
          <span style={{ fontSize:'11px', color:statusColor, fontWeight:600 }}>{ride.reference}</span>
        </div>

        {/* Ride Info */}
        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'18px', paddingBottom:'14px', borderBottom:'1px solid #f1f5f9' }}>
            <div style={{ width:'48px', height:'48px', borderRadius:'12px', background:'linear-gradient(135deg,#e0faf7,#a7f3d0)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <svg width="26" height="26" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="#00c9b1"/><circle cx="100" cy="100" r="60" fill="white"/><circle cx="100" cy="100" r="34" fill="#00c9b1"/><circle cx="100" cy="100" r="14" fill="white"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'20px', fontWeight:800, color:'#003A7A' }}>Trottinette {ride.scooterCode}</div>
              <div style={{ fontSize:'12px', color:'#64748b' }}>📍 {ride.startStationLabel}</div>
            </div>
          </div>

          <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Référence</span><span style={{ fontFamily:'monospace', fontSize:'11px', fontWeight:700, color:'#003A7A' }}>{ride.reference}</span></div>
          <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Durée réservée</span><span style={{ fontSize:'13px', fontWeight:700 }}>{ride.durationHours}h</span></div>
          <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Réservé le</span><span style={{ fontSize:'12px', fontWeight:700, textAlign:'right', maxWidth:'55%' }}>{fmtDT(ride.reservedAt)}</span></div>
          {ride.startedAt && <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Départ</span><span style={{ fontSize:'12px', fontWeight:700 }}>{fmtDT(ride.startedAt)}</span></div>}
          {ride.endedAt && <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Retour</span><span style={{ fontSize:'12px', fontWeight:700 }}>{fmtDT(ride.endedAt)}</span></div>}
          {ride.endStationLabel && <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Station retour</span><span style={{ fontSize:'12px', fontWeight:700 }}>{ride.endStationLabel}</span></div>}

          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'14px', marginTop:'4px', borderTop:'2px dashed #e2e8f0' }}>
            <span style={{ fontSize:'14px', fontWeight:700, color:'#1a2a4a' }}>Montant réglé</span>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:'24px', fontWeight:800, color:'#008c7c' }}>{formatMoney(ride.amountCentimes)}</span>
          </div>
        </div>

        {/* QR Code of this attestation */}
        {qrUrl && (
          <div className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:'12px', fontWeight:700, color:'#003A7A', marginBottom:'12px' }}>
              📲 Partagez cette attestation
            </div>
            <img src={qrUrl} alt="QR Attestation" style={{ borderRadius:'10px', width:'180px', height:'180px' }} />
            <div style={{ fontSize:'11px', color:'#64748b', marginTop:'10px' }}>
              Scannez ce code pour accéder à l'attestation depuis n'importe quel appareil
            </div>
          </div>
        )}

        {/* Official notice */}
        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px', padding:'14px', marginBottom:'14px', fontSize:'12px', color:'#92400e', lineHeight:'1.6' }}>
          <strong>📋 Document officiel POGO</strong><br/>
          Ce document atteste que la trottinette <strong>{ride.scooterCode}</strong> a été réservée via le système POGO — UEMF. Valable uniquement pour la durée indiquée.
        </div>

        {/* Actions */}
        <div style={{ display:'flex', gap:'10px', marginBottom:'12px' }} className="no-print">
          <button
            onClick={() => window.print()}
            style={{ flex:1, height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,#003A7A,#1a8a3a)', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer' }}
          >
            🖨️ Imprimer
          </button>
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title:'Attestation POGO '+ride.reference, url: window.location.href });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien copié dans le presse-papier !');
              }
            }}
            style={{ flex:1, height:'48px', borderRadius:'14px', background:'#fff', color:'#003A7A', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', border:'1.5px solid #e2e8f0', cursor:'pointer' }}
          >
            🔗 Partager
          </button>
        </div>

        <button
          onClick={() => window.location.href = '/map'}
          style={{ width:'100%', height:'44px', borderRadius:'14px', background:'transparent', color:'#64748b', fontFamily:'Syne,sans-serif', fontWeight:600, fontSize:'13px', border:'1.5px solid #e2e8f0', cursor:'pointer', marginBottom:'16px' }}
          className="no-print"
        >
          ← Retour à la carte
        </button>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#94a3b8' }}>
          POGO · Université Euromed de Fès · {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
}
