'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getClientStore } from '@/lib/client-store';
import type { Ride } from '@/types/domain';
import { formatMoney } from '@/lib/format/money';

function fmtDT(ts: string | null | number) {
  if (!ts) return '—';
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function AttestationPage() {
  const params = useParams<{ id: string }>();
  const [ride, setRide] = useState<Ride | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const store = getClientStore();
    const found = store.rides.find((r) => r.id === params.id);
    if (found) setRide(found);
    else setNotFound(true);
  }, [params.id]);

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');
        *{margin:0;padding:0;box-sizing:border-box;}
        body{font-family:'DM Sans',sans-serif;background:#f0f4f8;min-height:100vh;padding:24px 16px;}
        .container{max-width:480px;margin:0 auto;}
        .card{background:#fff;border-radius:20px;padding:28px;margin-bottom:16px;border:1px solid #e2e8f0;box-shadow:0 4px 16px rgba(0,58,122,.08);}
        .row{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid #f1f5f9;}
        .row:last-child{border-bottom:none;}
        @media print{body{background:#fff;padding:0;}.no-print{display:none!important;}.card{box-shadow:none;}}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>
      <div className="container">
        <div style={{ textAlign:'center', marginBottom:'24px' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:'10px', background:'linear-gradient(135deg,#003A7A,#1a8a3a)', borderRadius:'14px', padding:'14px 24px', marginBottom:'12px' }}>
            <svg width="32" height="32" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="rgba(255,255,255,.2)"/><circle cx="100" cy="100" r="60" fill="white"/><circle cx="100" cy="100" r="34" fill="#00c9b1"/><circle cx="100" cy="100" r="14" fill="white"/></svg>
            <span style={{ fontFamily:'Syne,sans-serif', fontWeight:800, fontSize:'22px', color:'#fff', letterSpacing:'2px' }}>POGO</span>
          </div>
          <h1 style={{ fontFamily:'Syne,sans-serif', fontSize:'18px', color:'#003A7A', marginBottom:'4px' }}>Attestation de réservation</h1>
          <p style={{ fontSize:'12px', color:'#64748b' }}>Université Euromed de Fès — Service Mobilité</p>
        </div>

        <div style={{ background:statusBg, border:`1.5px solid ${statusColor}50`, borderRadius:'14px', padding:'14px 18px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', color:statusColor }}>{statusLabel}</span>
          <span style={{ fontSize:'11px', color:statusColor, fontWeight:600 }}>{ride.reference}</span>
        </div>

        <div className="card">
          <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', paddingBottom:'16px', borderBottom:'1px solid #f1f5f9' }}>
            <div style={{ width:'52px', height:'52px', borderRadius:'14px', background:'linear-gradient(135deg,#e0faf7,#a7f3d0)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="28" height="28" viewBox="0 0 200 200"><rect width="200" height="200" rx="40" fill="#00c9b1"/><circle cx="100" cy="100" r="60" fill="white"/><circle cx="100" cy="100" r="34" fill="#00c9b1"/><circle cx="100" cy="100" r="14" fill="white"/></svg>
            </div>
            <div>
              <div style={{ fontFamily:'Syne,sans-serif', fontSize:'22px', fontWeight:800, color:'#003A7A' }}>Trottinette {ride.scooterCode}</div>
              <div style={{ fontSize:'12px', color:'#64748b' }}>📍 {ride.startStationLabel}</div>
            </div>
          </div>
          <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Référence</span><span style={{ fontFamily:'monospace', fontSize:'12px', fontWeight:700, color:'#003A7A' }}>{ride.reference}</span></div>
          <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Durée</span><span style={{ fontSize:'13px', fontWeight:700 }}>{ride.durationHours}h</span></div>
          <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Réservé le</span><span style={{ fontSize:'13px', fontWeight:700, textAlign:'right', maxWidth:'60%' }}>{fmtDT(ride.reservedAt)}</span></div>
          {ride.startedAt && <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Départ</span><span style={{ fontSize:'13px', fontWeight:700 }}>{fmtDT(ride.startedAt)}</span></div>}
          {ride.endedAt && <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Retour</span><span style={{ fontSize:'13px', fontWeight:700 }}>{fmtDT(ride.endedAt)}</span></div>}
          {ride.endStationLabel && <div className="row"><span style={{ fontSize:'12px', color:'#64748b' }}>Station retour</span><span style={{ fontSize:'13px', fontWeight:700 }}>{ride.endStationLabel}</span></div>}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'14px', marginTop:'4px', borderTop:'2px dashed #e2e8f0' }}>
            <span style={{ fontSize:'14px', fontWeight:700, color:'#1a2a4a' }}>Montant réglé</span>
            <span style={{ fontFamily:'Syne,sans-serif', fontSize:'24px', fontWeight:800, color:'#008c7c' }}>{formatMoney(ride.amountCentimes)}</span>
          </div>
        </div>

        <div style={{ background:'#fffbeb', border:'1px solid #fde68a', borderRadius:'12px', padding:'14px', marginBottom:'16px', fontSize:'12px', color:'#92400e', lineHeight:'1.6' }}>
          <strong>⚠️ Document officiel POGO</strong><br/>
          Ce document atteste que la trottinette <strong>{ride.scooterCode}</strong> a été réservée via le système POGO — UEMF. Valable uniquement pour la durée indiquée.
        </div>

        <div style={{ display:'flex', gap:'10px' }} className="no-print">
          <button onClick={() => window.print()} style={{ flex:1, height:'48px', borderRadius:'14px', background:'linear-gradient(135deg,#003A7A,#1a8a3a)', color:'#fff', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', border:'none', cursor:'pointer' }}>
            🖨️ Imprimer
          </button>
          <button onClick={() => { if (navigator.share) navigator.share({ title:'Attestation POGO', text:'Réservation '+ride.reference, url:window.location.href }); else { navigator.clipboard.writeText(window.location.href); alert('Lien copié !'); } }} style={{ flex:1, height:'48px', borderRadius:'14px', background:'#fff', color:'#003A7A', fontFamily:'Syne,sans-serif', fontWeight:700, fontSize:'14px', border:'1.5px solid #e2e8f0', cursor:'pointer' }}>
            🔗 Partager
          </button>
        </div>

        <p style={{ textAlign:'center', fontSize:'11px', color:'#94a3b8', marginTop:'16px' }}>
          POGO · Université Euromed de Fès · {new Date().getFullYear()}
        </p>
      </div>
    </>
  );
}
