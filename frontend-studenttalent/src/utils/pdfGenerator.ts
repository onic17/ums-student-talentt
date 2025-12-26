import jsPDF from 'jspdf';
import { Talent } from '../contexts/TalentContext';

async function loadImageData(url: string) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const blob = await response.blob();
    const format = blob.type === 'image/png' ? 'PNG' : 'JPEG';
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read image'));
      reader.readAsDataURL(blob);
    });
    return { dataUrl, format };
  } catch {
    return null;
  }
}

export async function generateCV(talent: Talent) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPosition = 20;
  const photo = talent.avatar ? await loadImageData(talent.avatar) : null;
  const photoSize = 30;
  const headerRightPad = photo ? photoSize + 10 : 0;
  const headerWidth = pageWidth - margin * 2 - headerRightPad;

  // Header
  doc.setFontSize(24);
  const nameLines = doc.splitTextToSize(talent.name, headerWidth);
  doc.text(nameLines, margin, yPosition);
  yPosition += nameLines.length * 10;

  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`${talent.major} - Year ${talent.year}`, margin, yPosition, {
    maxWidth: headerWidth,
  });
  yPosition += 6;
  doc.text(talent.email, margin, yPosition, { maxWidth: headerWidth });
  yPosition += 15;

  if (photo) {
    const photoX = pageWidth - margin - photoSize;
    const photoY = margin;
    doc.addImage(
      photo.dataUrl,
      photo.format,
      photoX,
      photoY,
      photoSize,
      photoSize,
      undefined,
      'FAST'
    );
    yPosition = Math.max(yPosition, photoY + photoSize + 10);
  }

  // Bio
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text('About', margin, yPosition);
  yPosition += 8;

  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const bioLines = doc.splitTextToSize(talent.bio, pageWidth - 2 * margin);
  doc.text(bioLines, margin, yPosition);
  yPosition += bioLines.length * 6 + 10;

  // Skills
  if (talent.skills.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Skills', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(11);
    doc.setTextColor(60, 60, 60);
    talent.skills.forEach(skill => {
      doc.text(`- ${skill.name} - ${skill.level}`, margin + 5, yPosition);
      yPosition += 6;
    });
    yPosition += 8;
  }

  // Experience
  if (talent.experiences.length > 0) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Experience', margin, yPosition);
    yPosition += 8;

    talent.experiences.forEach(exp => {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(exp.title, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      const dateRange = exp.current
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate}`;
      doc.text(`${exp.company} | ${dateRange}`, margin, yPosition);
      yPosition += 6;

      doc.setFontSize(10);
      doc.setTextColor(60, 60, 60);
      const descLines = doc.splitTextToSize(
        exp.description,
        pageWidth - 2 * margin
      );
      doc.text(descLines, margin, yPosition);
      yPosition += descLines.length * 5 + 8;
    });
  }

  // Links
  if (talent.linkedin || talent.github || talent.website) {
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Links', margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 255);
    if (talent.linkedin) {
      doc.text(`LinkedIn: ${talent.linkedin}`, margin, yPosition);
      yPosition += 6;
    }
    if (talent.github) {
      doc.text(`GitHub: ${talent.github}`, margin, yPosition);
      yPosition += 6;
    }
    if (talent.website) {
      doc.text(`Website: ${talent.website}`, margin, yPosition);
      yPosition += 6;
    }
  }

  // Save PDF
  doc.save(`${talent.name.replace(/\s+/g, '_')}_CV.pdf`);
}
