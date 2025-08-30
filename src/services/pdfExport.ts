import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import type { FoodLog, ExportData } from '../types';
import { formatDate } from '../utils';

export class PDFExportService {
  private doc: jsPDF;
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 6;

  constructor() {
    this.doc = new jsPDF();
  }

  // Generate PDF export for food logs
  async generatePDF(exportData: ExportData): Promise<Blob> {
    this.doc = new jsPDF();
    this.currentY = this.margin;

    // Header
    this.addHeader(exportData);
    
    // Date range info
    this.addDateRangeInfo(exportData);
    
    // Food logs
    for (const log of exportData.logs) {
      this.addFoodLogEntry(log);
    }
    
    // Footer
    this.addFooter(exportData);

    return new Blob([this.doc.output('blob')], { type: 'application/pdf' });
  }

  // Add header to PDF
  private addHeader(_exportData: ExportData) {
    const centerX = this.doc.internal.pageSize.getWidth() / 2;
    
    // Title
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DAILY FOOD LOG', centerX, this.currentY, { align: 'center' });
    this.currentY += 8;
    
    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Health in Hand - Your diet may be the key to better health', centerX, this.currentY, { align: 'center' });
    this.currentY += 15;
  }

  // Add date range information
  private addDateRangeInfo(exportData: ExportData) {
    const { startDate, endDate } = exportData.options;
    const centerX = this.doc.internal.pageSize.getWidth() / 2;
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    
    if (startDate === endDate) {
      const date = parseISO(startDate);
      this.doc.text(formatDate(date), centerX, this.currentY, { align: 'center' });
    } else {
      const start = parseISO(startDate);
      const end = parseISO(endDate);
      this.doc.text(`${formatDate(start)} - ${formatDate(end)}`, centerX, this.currentY, { align: 'center' });
    }
    
    this.currentY += 15;
  }

  // Add individual food log entry
  private addFoodLogEntry(log: FoodLog) {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 50) {
      this.doc.addPage();
      this.currentY = this.margin;
    }

    const date = parseISO(log.date);
    
    // Date header for individual entries (only if multiple days)
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(formatDate(date), this.margin, this.currentY);
    this.currentY += 10;
    
    // Draw line separator
    this.doc.line(this.margin, this.currentY, this.doc.internal.pageSize.getWidth() - this.margin, this.currentY);
    this.currentY += 8;

    // Meals
    this.addMealsSection(log);
    
    // Snacks
    this.addSnacksSection(log);
    
    // Health Metrics
    if (log.bowelMovements || log.exercise || log.dailyWaterIntake || log.sleepQuality || log.sleepHours) {
      this.addHealthMetricsSection(log);
    }
    
    // Notes
    if (log.notes) {
      this.addNotesSection(log);
    }
    
    this.currentY += 10; // Space between entries
  }

  // Add meals section
  private addMealsSection(log: FoodLog) {
    const meals = [
      { key: 'breakfast' as const, name: 'BREAKFAST' },
      { key: 'lunch' as const, name: 'LUNCH' },
      { key: 'dinner' as const, name: 'DINNER' }
    ];

    meals.forEach(meal => {
      const data = log[meal.key];
      
      // Check if meal has any data
      if (this.hasContent(data)) {
        this.checkPageSpace(25);
        
        // Meal title
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`${meal.name}${data.time ? ` (${data.time})` : ''}`, this.margin, this.currentY);
        this.currentY += 8;
        
        // Meal details
        this.doc.setFontSize(10);
        this.doc.setFont('helvetica', 'normal');
        
        this.addMealDetail('Meat & Dairy', data.meatDairy);
        this.addMealDetail('Vegetables & Fruits', data.vegetablesFruits);
        this.addMealDetail('Breads, Cereals & Grains', data.breadsCerealsGrains);
        this.addMealDetail('Fats', data.fats);
        this.addMealDetail('Candy, Sweets & Junk Food', data.candySweets);
        this.addMealDetail('Water Intake', data.waterIntake ? `${data.waterIntake} fl oz` : '');
        this.addMealDetail('Other Drinks', data.otherDrinks);
        
        this.currentY += 5;
      }
    });
  }

  // Add snacks section
  private addSnacksSection(log: FoodLog) {
    const hasSnacks = log.midMorningSnack.snack || log.midDaySnack.snack || log.nighttimeSnack.snack;
    
    if (hasSnacks) {
      this.checkPageSpace(20);
      
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('SNACKS', this.margin, this.currentY);
      this.currentY += 8;
      
      this.doc.setFontSize(10);
      this.doc.setFont('helvetica', 'normal');
      
      if (log.midMorningSnack.snack) {
        this.doc.text(`  Mid-Morning${log.midMorningSnack.time ? ` (${log.midMorningSnack.time})` : ''}: ${log.midMorningSnack.snack}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      if (log.midDaySnack.snack) {
        this.doc.text(`  Mid-Day${log.midDaySnack.time ? ` (${log.midDaySnack.time})` : ''}: ${log.midDaySnack.snack}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      if (log.nighttimeSnack.snack) {
        this.doc.text(`  Nighttime${log.nighttimeSnack.time ? ` (${log.nighttimeSnack.time})` : ''}: ${log.nighttimeSnack.snack}`, this.margin, this.currentY);
        this.currentY += this.lineHeight;
      }
      
      this.currentY += 5;
    }
  }

  // Add health metrics section
  private addHealthMetricsSection(log: FoodLog) {
    this.checkPageSpace(20);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('HEALTH METRICS', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    if (log.bowelMovements) {
      this.doc.text(`  Bowel Movements: ${log.bowelMovements}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    if (log.exercise) {
      this.doc.text(`  Exercise: ${log.exercise} minutes`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    if (log.dailyWaterIntake) {
      this.doc.text(`  Daily Water Intake: ${log.dailyWaterIntake} quarts`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    if (log.sleepQuality) {
      this.doc.text(`  Sleep Quality: ${log.sleepQuality}/5`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    if (log.sleepHours) {
      this.doc.text(`  Hours of Sleep: ${log.sleepHours}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
    
    this.currentY += 5;
  }

  // Add notes section
  private addNotesSection(log: FoodLog) {
    this.checkPageSpace(20);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('NOTES', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    
    // Split long text into multiple lines
    const lines = this.doc.splitTextToSize(log.notes, this.doc.internal.pageSize.getWidth() - (this.margin * 2));
    this.doc.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * this.lineHeight + 5;
  }

  // Add footer
  private addFooter(exportData: ExportData) {
    const centerX = this.doc.internal.pageSize.getWidth() / 2;
    const bottomY = this.pageHeight - 15;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Generated on ${format(new Date(exportData.generatedAt), 'MMMM d, yyyy \'at\' h:mm a')}`, centerX, bottomY, { align: 'center' });
  }

  // Helper methods
  private addMealDetail(label: string, value: string) {
    if (value && value.trim()) {
      this.doc.text(`  ${label}: ${value}`, this.margin, this.currentY);
      this.currentY += this.lineHeight;
    }
  }

  private hasContent(mealData: any): boolean {
    return Object.values(mealData).some(value => value && String(value).trim() !== '');
  }

  private checkPageSpace(requiredSpace: number) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  // Generate filename for download
  static generateFilename(exportData: ExportData): string {
    const { startDate, endDate } = exportData.options;
    const start = parseISO(startDate);
    
    if (startDate === endDate) {
      return `food-log-${format(start, 'yyyy-MM-dd')}.pdf`;
    } else {
      const end = parseISO(endDate);
      return `food-log-${format(start, 'yyyy-MM-dd')}-to-${format(end, 'yyyy-MM-dd')}.pdf`;
    }
  }

  // Trigger download
  static async downloadPDF(exportData: ExportData) {
    const service = new PDFExportService();
    const pdfBlob = await service.generatePDF(exportData);
    const filename = this.generateFilename(exportData);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Export singleton instance
export const pdfExportService = new PDFExportService();