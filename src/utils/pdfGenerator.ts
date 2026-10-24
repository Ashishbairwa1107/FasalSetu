import jsPDF from 'jspdf';
import { toPng, toCanvas } from 'html-to-image';

export interface GeneratePdfOptions {
  filename?: string;
  onProgress?: (step: string) => void;
}

/**
 * Generates a clean, multi-page PDF from an HTML report container.
 * Uses html-to-image which natively supports Tailwind v4 CSS, oklch colors,
 * CSS variables, SVG icons, Recharts charts, and full Unicode Devanagari Hindi text.
 */
export async function generateSoilHealthPdf(
  element: HTMLElement,
  options: GeneratePdfOptions = {}
): Promise<void> {
  const filename = options.filename || 'FasalSetu_Soil_Health_Report.pdf';

  options.onProgress?.('रिपोर्ट का विश्लेषण हो रहा है...');

  // Capture the element using html-to-image
  // skipFonts: true avoids network font fetching delays/failures while preserving native system Devanagari fonts
  let dataUrl: string;
  try {
    dataUrl = await toPng(element, {
      quality: 0.95,
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true,
      cacheBust: true
    });
  } catch (err) {
    console.warn('toPng failed, falling back to toCanvas:', err);
    const canvas = await toCanvas(element, {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      skipFonts: true
    });
    dataUrl = canvas.toDataURL('image/jpeg', 0.95);
  }

  options.onProgress?.('PDF पृष्ठ तैयार किए जा रहे हैं...');

  // Create an image element to get true dimensions
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('कैप्चर की गई रिपोर्ट इमेज लोड करने में त्रुटि हुई'));
    img.src = dataUrl;
  });

  const pdf = new jsPDF('p', 'mm', 'a4');
  const a4WidthMm = 210;
  const a4HeightMm = 297;
  const marginMm = 8;
  const printWidthMm = a4WidthMm - (marginMm * 2); // 194 mm
  const printHeightMm = a4HeightMm - (marginMm * 2); // 281 mm

  // Calculate pixel height corresponding to one A4 printable area
  const pageHeightPx = Math.floor((img.width * printHeightMm) / printWidthMm);
  const totalPages = Math.max(1, Math.ceil(img.height / pageHeightPx));

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      pdf.addPage();
    }

    const sourceY = pageIndex * pageHeightPx;
    const sourceHeight = Math.min(pageHeightPx, img.height - sourceY);

    // Create a sub-canvas for this specific page slice
    const pageCanvas = document.createElement('canvas');
    pageCanvas.width = img.width;
    pageCanvas.height = sourceHeight;
    const ctx = pageCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
      ctx.drawImage(
        img,
        0, sourceY, img.width, sourceHeight,
        0, 0, img.width, sourceHeight
      );
    }

    const pageDataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
    const sliceHeightMm = (sourceHeight * printWidthMm) / img.width;

    pdf.addImage(pageDataUrl, 'JPEG', marginMm, marginMm, printWidthMm, sliceHeightMm, undefined, 'FAST');

    // Clean page numbering in standard ASCII to ensure 100% jsPDF font compatibility
    pdf.setFontSize(8);
    pdf.setTextColor(110, 125, 115);
    pdf.text(
      `FasalSetu Digital Agriculture • Soil Health & Productivity Report • Page ${pageIndex + 1} of ${totalPages}`,
      a4WidthMm / 2,
      a4HeightMm - 3.5,
      { align: 'center' }
    );
  }

  options.onProgress?.('डाउनलोड प्रारंभ हो रहा है...');
  pdf.save(filename);
}
