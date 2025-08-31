import type { FoodLog, ExportOptions } from '../types';
import { generatePlainTextExport } from '../utils';

export interface ExportServiceInterface {
  exportAsText(logs: FoodLog[], options: ExportOptions): Promise<void>;
  exportAsPDF(): Promise<void>;
}

export class ExportService implements ExportServiceInterface {
  private static instance: ExportService;

  public static getInstance(): ExportService {
    if (!ExportService.instance) {
      ExportService.instance = new ExportService();
    }
    return ExportService.instance;
  }

  async exportAsText(logs: FoodLog[], options: ExportOptions): Promise<void> {
    if (logs.length === 0) {
      throw new Error('No food log data found for the selected date range');
    }

    const textContent = generatePlainTextExport(logs);
    const filename = `food-log-${options.startDate}-to-${options.endDate}.txt`;

    this.downloadFile(textContent, filename, 'text/plain');
  }

  async exportAsPDF(): Promise<void> {
    // For now, throw an error as PDF export is not implemented in this rewrite
    // This can be implemented later following the same pattern
    throw new Error('PDF export not yet implemented in the new service');
  }

  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const exportService = ExportService.getInstance();
