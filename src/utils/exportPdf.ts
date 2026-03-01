import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { RoomAllocation, RoomMix, FixedCostConfig, PricingTier, FinancialSummary } from '../types';
import { fmt } from './pricing';
import { CONTRACT } from '../constants';

interface ExportOptions {
  allocation: RoomAllocation;
  roomMix: RoomMix;
  fixedConfig: FixedCostConfig;
  tiers: PricingTier[];
  summary: FinancialSummary;
}

type RGB = [number, number, number];
const INDIGO: RGB = [79, 70, 229];
const EMERALD: RGB = [16, 185, 129];
const RED: RGB = [239, 68, 68];
const SLATE: RGB = [71, 85, 105];
const LIGHT: RGB = [248, 250, 252];

function fill(pdf: jsPDF, c: RGB) { pdf.setFillColor(c[0], c[1], c[2]); }
function tc(pdf: jsPDF, c: RGB) { pdf.setTextColor(c[0], c[1], c[2]); }
function dc(pdf: jsPDF, c: RGB) { pdf.setDrawColor(c[0], c[1], c[2]); }
function white(pdf: jsPDF) { pdf.setTextColor(255, 255, 255); }

export async function exportToPdf(options: ExportOptions, onProgress?: (pct: number) => void) {
  const { tiers, summary, fixedConfig, roomMix } = options;
  const activeTiers = tiers.filter(t => t.roomCount > 0);

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;
  const PH = 297;
  const M = 14;
  const CW = PW - M * 2;
  let y = M;

  function newPage() { pdf.addPage(); y = M; }
  function checkPageBreak(needed: number) { if (y + needed > PH - M) newPage(); }

  // ── Header ───────────────────────────────────────────────────────────────
  fill(pdf, INDIGO);
  pdf.rect(0, 0, PW, 28, 'F');
  white(pdf);
  pdf.setFontSize(16);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Sojourners Retreat — Pricing Analysis', M, 12);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Staybridge Suites Oxnard River Ridge  ·  October 9–11, 2026  ·  2 Nights', M, 19);
  pdf.text(`Generated ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`, M, 24);
  y = 36;

  onProgress?.(10);

  // ── Room Configuration ───────────────────────────────────────────────────
  sectionHeader(pdf, 'Room Configuration', y, M, CW);
  y += 8;

  fill(pdf, LIGHT);
  pdf.roundedRect(M, y, CW, 18, 2, 2, 'F');
  tc(pdf, SLATE);
  pdf.setFontSize(9);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Room Mix', M + 4, y + 6);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`${roomMix.studio} Studio King Suites  ·  ${roomMix.penthouse} Penthouse Suites  ·  ${roomMix.studio + roomMix.penthouse} Total Rooms`, M + 4, y + 12);
  pdf.text(`Fixed retreat cost: ${fmt(fixedConfig.retreatCostPerPerson)}/person  ·  Children under 3: ${fixedConfig.childrenUnder3} (free)`, M + 4, y + 17);
  y += 23;

  const cols: number[] = [60, 28, 22, 28, 28, 32];
  const headers = ['Tier', 'Rooms', 'People', 'Room Cost', 'Retreat', 'Total/Person'];
  tableHeader(pdf, headers, cols, M, y, CW);
  y += 7;

  activeTiers.forEach((tier, i) => {
    checkPageBreak(8);
    if (i % 2 === 0) {
      fill(pdf, LIGHT);
      pdf.rect(M, y - 4, CW, 7, 'F');
    }
    tc(pdf, SLATE);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', tier.isBestValue ? 'bold' : 'normal');
    const vals = [
      tier.label + (tier.isBestValue ? ' \u2605' : ''),
      String(tier.roomCount),
      String(tier.headcount),
      fmt(tier.roomCostPerPerson),
      fmt(tier.fixedCostPerPerson),
      fmt(tier.totalPerPerson),
    ];
    let x = M;
    vals.forEach((v, ci) => {
      pdf.text(v, x + 2, y);
      x += cols[ci];
    });
    y += 7;
  });
  y += 4;

  onProgress?.(35);

  // ── Financial Summary ────────────────────────────────────────────────────
  checkPageBreak(60);
  sectionHeader(pdf, 'Financial Summary', y, M, CW);
  y += 8;

  const hasSurplus = summary.surplus >= 0;
  const statBoxes = [
    { label: 'Total Headcount', value: String(summary.totalHeadcount + summary.childrenUnder3), sub: `${summary.totalHeadcount} paying + ${summary.childrenUnder3} children` },
    { label: 'Rooms Used', value: `${summary.totalRoomsUsed} / ${summary.totalRoomsCommitted}`, sub: summary.attritionRisk ? 'Below 48 room minimum' : 'Attrition safe' },
    { label: 'Fees Collected', value: fmt(summary.totalRevenueCollected), sub: 'From all attendees' },
    { label: hasSurplus ? 'Surplus' : 'Deficit', value: fmt(Math.abs(summary.surplus)), sub: hasSurplus ? 'Above break-even' : 'Below break-even' },
  ];

  const bw = (CW - 6) / 4;
  statBoxes.forEach((box, i) => {
    const bx = M + i * (bw + 2);
    const color: RGB = i === 3 ? (hasSurplus ? EMERALD : RED) : INDIGO;
    fill(pdf, color);
    pdf.roundedRect(bx, y, bw, 20, 2, 2, 'F');
    white(pdf);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(box.label.toUpperCase(), bx + 3, y + 5);
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text(box.value, bx + 3, y + 13);
    pdf.setFontSize(7);
    pdf.setFont('helvetica', 'normal');
    pdf.text(box.sub, bx + 3, y + 19);
  });
  y += 26;

  const costRows: { label: string; value: number; bold?: boolean; color?: RGB }[] = [
    { label: 'Accommodation cost (rooms allocated)', value: summary.accommodationsCost },
    { label: 'Meeting room rental (ballroom 3 days)', value: summary.meetingCost },
    { label: 'Total hotel bill', value: summary.totalHotelBill, bold: true },
    { label: 'Total fees collected from attendees', value: summary.totalRevenueCollected, bold: true },
    { label: hasSurplus ? 'Surplus' : 'Deficit', value: summary.surplus, bold: true, color: hasSurplus ? EMERALD : RED },
  ];

  costRows.forEach((row, i) => {
    checkPageBreak(8);
    if (row.bold) {
      fill(pdf, LIGHT);
      pdf.rect(M, y - 4, CW, 7, 'F');
    }
    tc(pdf, row.color ?? SLATE);
    pdf.setFontSize(9);
    pdf.setFont('helvetica', row.bold ? 'bold' : 'normal');
    pdf.text(row.label, M + 4, y);
    pdf.text(
      (row.value < 0 ? '\u2212' : '') + fmt(Math.abs(row.value)),
      M + CW - 4,
      y,
      { align: 'right' }
    );
    if (i < costRows.length - 1) {
      dc(pdf, [220, 220, 220]);
      pdf.line(M, y + 2, M + CW, y + 2);
    }
    y += 7;
  });
  y += 6;

  onProgress?.(60);

  // ── Contract Reference ───────────────────────────────────────────────────
  checkPageBreak(60);
  sectionHeader(pdf, 'Contract Reference', y, M, CW);
  y += 8;

  const refRows = [
    ['Studio King Suite rate', `${fmt(CONTRACT.rooms.studioKing.ratePerNight)}/night x 2 nights`],
    ['Penthouse Suite rate', `${fmt(CONTRACT.rooms.penthouse.ratePerNight)}/night x 2 nights`],
    ['Combined room tax', `${(CONTRACT.taxes.total * 100).toFixed(3)}%  (10% Occupancy + 2% Oxnard + 2% Ventura + 0.195% CA)`],
    ['Meeting room rental', `3 days x $1,500 = $4,500 base + fees = ${fmt(CONTRACT.meetingRooms.totalEstimated)}`],
    ['Attrition threshold', '80% of 60 rooms = 48 rooms minimum per night'],
    ['Contract grand total', fmt(CONTRACT.grandTotal)],
  ];
  refRows.forEach(([label, value], i) => {
    checkPageBreak(8);
    if (i % 2 === 0) {
      fill(pdf, LIGHT);
      pdf.rect(M, y - 4, CW, 7, 'F');
    }
    tc(pdf, SLATE);
    pdf.setFontSize(8.5);
    pdf.setFont('helvetica', 'bold');
    pdf.text(label, M + 4, y);
    pdf.setFont('helvetica', 'normal');
    pdf.text(value, M + CW - 4, y, { align: 'right' });
    y += 7;
  });
  y += 6;

  onProgress?.(75);

  // ── Chart capture ────────────────────────────────────────────────────────
  const chartEl = document.getElementById('pricing-tiers-chart');
  if (chartEl) {
    checkPageBreak(80);
    sectionHeader(pdf, 'Per-Person Price Comparison', y, M, CW);
    y += 6;
    try {
      const canvas = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff', logging: false });
      const imgData = canvas.toDataURL('image/png');
      const ratio = canvas.height / canvas.width;
      const imgW = CW;
      const imgH = Math.min(imgW * ratio, 70);
      checkPageBreak(imgH + 4);
      pdf.addImage(imgData, 'PNG', M, y, imgW, imgH);
      y += imgH + 6;
    } catch {
      // chart capture failed — skip
    }
  }

  onProgress?.(90);

  // ── Footer on every page ─────────────────────────────────────────────────
  type PdfWithInternal = typeof pdf & { internal: { getNumberOfPages: () => number } };
  const totalPages = (pdf as PdfWithInternal).internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFillColor(241, 245, 249);
    pdf.rect(0, PH - 10, PW, 10, 'F');
    pdf.setTextColor(148, 163, 184);
    pdf.setFontSize(7.5);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Sojourners Retreat Pricing Planner  \u00b7  Confidential', M, PH - 4);
    pdf.text(`Page ${p} of ${totalPages}`, PW - M, PH - 4, { align: 'right' });
  }

  onProgress?.(100);
  pdf.save(`sojourners-retreat-pricing-${new Date().toISOString().slice(0, 10)}.pdf`);
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function sectionHeader(pdf: jsPDF, title: string, y: number, margin: number, cw: number) {
  pdf.setFillColor(79, 70, 229);
  pdf.rect(margin, y - 1, cw, 0.5, 'F');
  pdf.setTextColor(79, 70, 229);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, margin, y + 5);
}

function tableHeader(pdf: jsPDF, headers: string[], cols: number[], margin: number, y: number, _cw: number) {
  pdf.setFillColor(79, 70, 229);
  const totalW = cols.reduce((a, b) => a + b, 0);
  pdf.rect(margin, y - 4, totalW, 7, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  let x = margin;
  headers.forEach((h, i) => {
    pdf.text(h, x + 2, y);
    x += cols[i];
  });
  pdf.setTextColor(71, 85, 105);
}
