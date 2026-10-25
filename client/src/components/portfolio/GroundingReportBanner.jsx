/**
 * GroundingReportBanner
 *
 * Displays the resume grounding validation summary after a resume upload.
 * Shows passed, soft-fixed, and rejected portfolio sections alongside
 * the AI source mappings and rejection reasons.
 *
 * Usage:
 *   <GroundingReportBanner report={uploadResponse.groundingReport} />
 *
 * The `report` prop shape (from the server groundingReport):
 *   {
 *     passed:     number,
 *     rejected:   number,
 *     softFixed:  number,
 *     rejections: [{ section, reason }],
 *     softFixes:  [{ section, warning }],
 *   }
 */

import { useState } from 'react';

const STATUS_ICONS = {
  pass:    '✓',
  fix:     '⚠',
  reject:  '✕',
};

function Tag({ type, children }) {
  const styles = {
    pass:   { background: '#14532d', color: '#86efac', border: '1px solid #166534' },
    fix:    { background: '#422006', color: '#fde68a', border: '1px solid #78350f' },
    reject: { background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d' },
  };
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '2px 10px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: 'inherit',
      ...styles[type],
    }}>
      {STATUS_ICONS[type]} {children}
    </span>
  );
}

function CollapsibleList({ title, items, type, emptyText }) {
  const [open, setOpen] = useState(false);
  if (!items || items.length === 0) return null;

  return (
    <div style={{ marginTop: '10px' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '13px',
          fontWeight: 600,
          color: type === 'reject' ? '#fca5a5' : '#fde68a',
          padding: 0,
          fontFamily: 'inherit',
        }}
        aria-expanded={open}
      >
        <span style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s', display: 'inline-block' }}>▶</span>
        {title} ({items.length})
      </button>

      {open && (
        <ul style={{ margin: '8px 0 0 20px', padding: 0, listStyle: 'none' }}>
          {items.map((item, i) => (
            <li key={i} style={{
              fontSize: '12.5px',
              color: type === 'reject' ? '#fca5a5' : '#fde68a',
              padding: '4px 0',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                {item.section}:
              </span>{' '}
              {item.reason || item.warning || ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function GroundingReportBanner({ report }) {
  const [dismissed, setDismissed] = useState(false);

  if (!report || dismissed) return null;

  const { passed = 0, rejected = 0, softFixed = 0, rejections = [], softFixes = [] } = report;
  const total = passed + rejected + softFixed;

  // Don't show the banner if everything passed perfectly and nothing to report
  const hasIssues = rejected > 0 || softFixed > 0;

  const borderColor = rejected > 0
    ? '#7f1d1d'
    : softFixed > 0
    ? '#78350f'
    : '#166534';

  const bgGradient = rejected > 0
    ? 'linear-gradient(135deg, rgba(127,29,29,0.15), rgba(69,10,10,0.25))'
    : softFixed > 0
    ? 'linear-gradient(135deg, rgba(120,53,15,0.15), rgba(66,32,6,0.25))'
    : 'linear-gradient(135deg, rgba(20,83,45,0.15), rgba(22,101,52,0.25))';

  const titleColor = rejected > 0 ? '#fca5a5' : softFixed > 0 ? '#fde68a' : '#86efac';

  return (
    <div
      role="region"
      aria-label="AI Content Grounding Report"
      style={{
        background: bgGradient,
        border: `1px solid ${borderColor}`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '24px',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        position: 'relative',
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        aria-label="Dismiss grounding report"
        style={{
          position: 'absolute',
          top: '12px',
          right: '14px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '16px',
          lineHeight: 1,
          padding: '2px 6px',
          borderRadius: '4px',
          fontFamily: 'inherit',
        }}
        title="Dismiss"
      >
        ✕
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '18px' }}>🛡️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: titleColor }}>
            AI Content Grounding Validation
          </div>
          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginTop: '2px' }}>
            AI-generated portfolio content was verified against your resume. Only resume-supported information is included.
          </div>
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: hasIssues ? '12px' : '0' }}>
        <Tag type="pass">{passed} section{passed !== 1 ? 's' : ''} passed</Tag>
        {softFixed > 0 && (
          <Tag type="fix">{softFixed} soft-fixed</Tag>
        )}
        {rejected > 0 && (
          <Tag type="reject">{rejected} rejected → replaced with resume data</Tag>
        )}
      </div>

      {/* Expandable detail lists */}
      <CollapsibleList
        title="Rejected sections (replaced with original resume content)"
        items={rejections}
        type="reject"
      />
      <CollapsibleList
        title="Soft fixes (unsupported items removed)"
        items={softFixes}
        type="fix"
      />

      {/* Footer note */}
      {!hasIssues && (
        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '4px' }}>
          All {total} generated sections are grounded in your resume. No fabricated content detected.
        </div>
      )}
    </div>
  );
}
