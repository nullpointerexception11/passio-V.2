/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ISamplePdfDoc {
  id: string;
  title: string;
  author: string;
  pageCount: number;
  fileSize: string;
  description: string;
  sampleType: 'generated' | 'url';
  content?: string[];
}

export const SAMPLE_PDF_DOCUMENTS: ISamplePdfDoc[] = [
  {
    id: 'passio-philosophy-manifesto',
    title: 'Passio - Sessiz Okuma ve Odaklanma Rehberi',
    author: 'Passio Archival Press',
    pageCount: 12,
    fileSize: '1.2 MB',
    description: 'Dijital gürültüden uzak, tamamen yerel ve sakin bir çalışma alanının felsefi temelleri.',
    sampleType: 'generated',
    content: [
      'BÖLÜM 1: DİJİTAL SESSİZLİK VE ZİHİNSEL ALAN\n\nGünümüz yazılım dünyası, kullanıcının dikkatini sürekli canlı tutmayı amaçlayan bildirimler, rozetler ve renkli göstergelerle doludur. Passio, bu yaklaşımın tam karşısında yer alır. Bilgi edinme süreci derin bir sessizlik gerektirir.',
      'BÖLÜM 2: OFFLINE-FIRST VE TAMMA HÂKİMİYET\n\nVerilerinizin hiçbir sunucuya veya bulut servisine aktarılmadığı bir sistem, yalnızca gizliliğinizi korumakla kalmaz; aynı zamanda bağlantı koptuğunda dahi kesintisiz bir çalışma ritmi sunar. Bilgisayarınız sizin kütüphanenizdir.',
      'BÖLÜM 3: MİNİMAL TASARIM VE BOŞLUK KULLANIMI\n\nArayüzün sadeliği, düşüncenin derinliği ile doğru orantılıdır. Gereksiz hiçbir butonun bulunmadığı bir ekran, okuyucunun doğrudan metinle ve fikirlerle baş başa kalmasını sağlar.',
      'BÖLÜM 4: OKUMA RİTÜELİ\n\nHer okuma oturumu bir ritüeldir. Sayfalar arasında gezinirken gözü yormayan Tipografi ve dengeli kontrast, saatler süren çalışmalarda bile zihinsel dinginliği korur.',
    ]
  },
  {
    id: 'dostoyevski-notes-from-underground',
    title: 'Yeraltından Notlar - Fyodor Dostoyevski',
    author: 'Fyodor Dostoyevski',
    pageCount: 85,
    fileSize: '3.4 MB',
    description: 'Bireyin iç dünyası, özgür irade ve modern toplum eleştirisi üzerine klasikleşmiş felsefi metin.',
    sampleType: 'generated',
    content: [
      'BİRİNCİ BÖLÜM: YERALTI\n\nI\n\nBen hasta bir adamım... Gösterişsiz, huysuz bir adamım ben. Sanırım karaciğerimden hastayım. Ama hastalığımdan nasibimi almış değilim, ne olduğunu da tam bilmiyorum.',
      'II\n\nŞimdi size, kabul etmek istesem de istemesem de, neden bir böcek bile olamadığımı anlatmak istiyorum. Baylar, yemin ederim ki her şeyi fazlasıyla anlamak bir hastalıktır; gerçek, tam bir hastalık.',
    ]
  }
];

/**
 * Generates a real valid multi-page PDF ArrayBuffer programmatically
 * using canvas rendering & simple PDF stream encoding for instant test rendering in PDF.js!
 */
export async function createDemoPdfBuffer(title: string, pagesText: string[], pageCountMultiplier = 1): Promise<ArrayBuffer> {
  // Generate a minimal valid PDF binary with multiple pages
  // Each page will contain beautifully styled typographic content
  const pages: string[] = [];
  
  const totalPages = pagesText.length * pageCountMultiplier;
  let pageIndex = 1;

  for (let m = 0; m < pageCountMultiplier; m++) {
    for (let i = 0; i < pagesText.length; i++) {
      const text = pagesText[i];
      pages.push(`
        BT
        /F1 20 Tf
        50 750 Td
        (${title.replace(/[()]/g, '')}) Tj
        0 -30 Td
        /F1 10 Tf
        (PASSIO DIGITAL ARCHIVE — PAGE ${pageIndex} OF ${totalPages}) Tj
        0 -40 Td
        /F1 12 Tf
        14 TL
        (${text.replace(/[()\n]/g, ' ')}) Tj
        ET
      `);
      pageIndex++;
    }
  }

  // Construct PDF Objects
  const pdfHeader = `%PDF-1.7\n`;
  let pdfBody = ``;
  const xrefs: number[] = [];

  let currentOffset = pdfHeader.length;

  // Obj 1: Catalog
  xrefs.push(currentOffset);
  const obj1 = `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  pdfBody += obj1;
  currentOffset += obj1.length;

  // Obj 2: Pages Parent
  const pageKids = Array.from({ length: totalPages }, (_, idx) => `${idx + 4} 0 R`).join(' ');
  xrefs.push(currentOffset);
  const obj2 = `2 0 obj\n<< /Type /Pages /Kids [${pageKids}] /Count ${totalPages} >>\nendobj\n`;
  pdfBody += obj2;
  currentOffset += obj2.length;

  // Obj 3: Font
  xrefs.push(currentOffset);
  const obj3 = `3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;
  pdfBody += obj3;
  currentOffset += obj3.length;

  // Obj 4..N: Page Objects
  for (let idx = 0; idx < totalPages; idx++) {
    const pageObjId = idx + 4;
    const streamObjId = totalPages + 4 + idx;

    xrefs.push(currentOffset);
    const pageObj = `${pageObjId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${streamObjId} 0 R >>\nendobj\n`;
    pdfBody += pageObj;
    currentOffset += pageObj.length;
  }

  // Stream Objects
  for (let idx = 0; idx < totalPages; idx++) {
    const streamObjId = totalPages + 4 + idx;
    const streamContent = pages[idx];

    xrefs.push(currentOffset);
    const streamObj = `${streamObjId} 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}\nendstream\nendobj\n`;
    pdfBody += streamObj;
    currentOffset += streamObj.length;
  }

  // XRef Table
  const xrefOffset = currentOffset;
  let xrefTable = `xref\n0 ${xrefs.length + 1}\n0000000000 65535 f \n`;
  for (const offset of xrefs) {
    xrefTable += `${offset.toString().padStart(10, '0')} 00000 n \n`;
  }

  const trailer = `trailer\n<< /Size ${xrefs.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  const fullPdfStr = pdfHeader + pdfBody + xrefTable + trailer;
  
  const encoder = new TextEncoder();
  return encoder.encode(fullPdfStr).buffer;
}
