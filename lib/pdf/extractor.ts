import pdfParse from "pdf-parse";

export interface PdfExtractResult {
  text: string;
  pageCount: number;
  charCount: number;
}

export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractResult> {
  const data = await pdfParse(buffer);
  const text = data.text.trim();
  return {
    text,
    pageCount: data.numpages,
    charCount: text.length,
  };
}
