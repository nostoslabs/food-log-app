import jsPDF from 'jspdf';
import { format, parseISO, isValid } from 'date-fns';
import type { FoodLog } from '../types';

export interface ExportOptions {
  format: 'pdf' | 'text' | 'json';
  dateRange: {
    start: string;
    end: string;
  };
  includeMetadata?: boolean;
  includeHealthMetrics?: boolean;
  title?: string;
}

export interface ExportResult {
  success: boolean;
  filename?: string;
  data?: string | Blob;
  error?: string;
}

export class ExportService {
  private formatDate(dateString: string): string {
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : dateString;
    } catch {
      return dateString;
    }
  }

  private formatTime(timeString: string): string {
    if (!timeString) return 'Not recorded';
    
    // Handle various time formats
    if (timeString.includes(':')) {
      try {
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours, 10);
        const min = minutes ? parseInt(minutes, 10) : 0;
        
        if (hour === 0) return `12:${min.toString().padStart(2, '0')} AM`;
        if (hour < 12) return `${hour}:${min.toString().padStart(2, '0')} AM`;
        if (hour === 12) return `12:${min.toString().padStart(2, '0')} PM`;
        return `${hour - 12}:${min.toString().padStart(2, '0')} PM`;
      } catch {
        return timeString;
      }
    }
    
    return timeString;
  }

  private getFoodItemsText(foodLog: FoodLog, mealType: 'breakfast' | 'lunch' | 'dinner'): string {
    const meal = foodLog[mealType];
    if (!meal) return 'No details recorded';

    const items = [
      meal.meat || '',
      meal.vegetables || '',
      meal.grains || '',
      meal.fats || '',
      meal.sweets || '',
      meal.water || '',
      meal.otherDrinks || ''
    ].filter(item => item.trim().length > 0);

    return items.length > 0 ? items.join(', ') : 'No details recorded';
  }

  private getSnackText(foodLog: FoodLog, snackType: 'midMorning' | 'midDay' | 'nighttime'): string {
    const snack = foodLog.snacks?.[snackType];
    if (!snack) return 'No snack recorded';

    const items = [
      snack.items || '',
      snack.drinks || ''
    ].filter(item => item.trim().length > 0);

    return items.length > 0 ? items.join(', ') : 'No snack recorded';
  }

  async exportToPDF(foodLogs: FoodLog[], options: ExportOptions): Promise<ExportResult> {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;
      const lineHeight = 6;
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Header
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      const title = options.title || 'Food & Health Log Report';
      pdf.text(title, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Date range
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      const dateRange = `${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}`;
      pdf.text(dateRange, pageWidth / 2, yPosition, { align: 'center' });
      yPosition += 15;

      // Generation info
      if (options.includeMetadata) {
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Generated on: ${format(new Date(), 'MMM d, yyyy \'at\' h:mm a')}`, margin, yPosition);
        pdf.text(`Total entries: ${foodLogs.length}`, pageWidth - margin, yPosition, { align: 'right' });
        yPosition += 10;
      }

      // Reset text color
      pdf.setTextColor(0, 0, 0);

      // Process each food log
      for (const [index, foodLog] of foodLogs.entries()) {
        // Check if we need a new page
        if (yPosition > pageHeight - 60) {
          pdf.addPage();
          yPosition = 20;
        }

        // Date header
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        const logDate = this.formatDate(foodLog.date);
        pdf.text(logDate, margin, yPosition);
        yPosition += 10;

        // Meals section
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');

        // Breakfast
        if (foodLog.breakfast && (foodLog.breakfast.meat || foodLog.breakfast.vegetables || foodLog.breakfast.grains)) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Breakfast (${this.formatTime(foodLog.breakfast.time || '8:00 AM')})`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          const breakfastText = this.getFoodItemsText(foodLog, 'breakfast');
          const breakfastLines = pdf.splitTextToSize(breakfastText, maxWidth - 20);
          pdf.text(breakfastLines, margin + 10, yPosition);
          yPosition += lineHeight * breakfastLines.length + 3;
        }

        // Lunch
        if (foodLog.lunch && (foodLog.lunch.meat || foodLog.lunch.vegetables || foodLog.lunch.grains)) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Lunch (${this.formatTime(foodLog.lunch.time || '12:00 PM')})`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          const lunchText = this.getFoodItemsText(foodLog, 'lunch');
          const lunchLines = pdf.splitTextToSize(lunchText, maxWidth - 20);
          pdf.text(lunchLines, margin + 10, yPosition);
          yPosition += lineHeight * lunchLines.length + 3;
        }

        // Dinner
        if (foodLog.dinner && (foodLog.dinner.meat || foodLog.dinner.vegetables || foodLog.dinner.grains)) {
          pdf.setFont('helvetica', 'bold');
          pdf.text(`Dinner (${this.formatTime(foodLog.dinner.time || '6:00 PM')})`, margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          const dinnerText = this.getFoodItemsText(foodLog, 'dinner');
          const dinnerLines = pdf.splitTextToSize(dinnerText, maxWidth - 20);
          pdf.text(dinnerLines, margin + 10, yPosition);
          yPosition += lineHeight * dinnerLines.length + 3;
        }

        // Snacks
        if (foodLog.snacks) {
          const snackTypes: Array<{ key: 'midMorning' | 'midDay' | 'nighttime', label: string, time: string }> = [
            { key: 'midMorning', label: 'Mid-Morning Snack', time: '10:00 AM' },
            { key: 'midDay', label: 'Afternoon Snack', time: '3:00 PM' },
            { key: 'nighttime', label: 'Evening Snack', time: '8:00 PM' }
          ];

          for (const snackType of snackTypes) {
            const snack = foodLog.snacks[snackType.key];
            if (snack && (snack.items || snack.drinks)) {
              pdf.setFont('helvetica', 'bold');
              pdf.text(`${snackType.label} (${this.formatTime(snack.time || snackType.time)})`, margin, yPosition);
              yPosition += lineHeight;
              
              pdf.setFont('helvetica', 'normal');
              const snackText = this.getSnackText(foodLog, snackType.key);
              const snackLines = pdf.splitTextToSize(snackText, maxWidth - 20);
              pdf.text(snackLines, margin + 10, yPosition);
              yPosition += lineHeight * snackLines.length + 3;
            }
          }
        }

        // Health metrics
        if (options.includeHealthMetrics && foodLog.health) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Health Metrics', margin, yPosition);
          yPosition += lineHeight;
          
          pdf.setFont('helvetica', 'normal');
          const healthItems = [];
          
          if (foodLog.health.bowelMovements) {
            healthItems.push(`Bowel Movements: ${foodLog.health.bowelMovements}`);
          }
          if (foodLog.health.exercise) {
            healthItems.push(`Exercise: ${foodLog.health.exercise}`);
          }
          if (foodLog.health.waterIntake) {
            healthItems.push(`Water Intake: ${foodLog.health.waterIntake} oz`);
          }
          if (foodLog.health.sleepQuality) {
            healthItems.push(`Sleep Quality: ${foodLog.health.sleepQuality}/5`);
          }
          if (foodLog.health.sleepHours) {
            healthItems.push(`Sleep Hours: ${foodLog.health.sleepHours}`);
          }
          if (foodLog.health.notes) {
            healthItems.push(`Notes: ${foodLog.health.notes}`);
          }

          for (const item of healthItems) {
            const itemLines = pdf.splitTextToSize(item, maxWidth - 20);
            pdf.text(itemLines, margin + 10, yPosition);
            yPosition += lineHeight * itemLines.length;
          }
          yPosition += 3;
        }

        // Add some space between days
        yPosition += 10;
      }

      // Generate filename
      const startDate = format(parseISO(options.dateRange.start), 'yyyy-MM-dd');
      const endDate = format(parseISO(options.dateRange.end), 'yyyy-MM-dd');
      const filename = `food-log-${startDate}-to-${endDate}.pdf`;

      // Generate PDF blob
      const pdfBlob = pdf.output('blob');

      return {
        success: true,
        filename,
        data: pdfBlob
      };
    } catch (error) {
      console.error('PDF export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate PDF'
      };
    }
  }

  async exportToText(foodLogs: FoodLog[], options: ExportOptions): Promise<ExportResult> {
    try {
      let content = '';
      const title = options.title || 'Food & Health Log Report';
      
      // Header
      content += `${title}\n`;
      content += `Date Range: ${this.formatDate(options.dateRange.start)} - ${this.formatDate(options.dateRange.end)}\n`;
      
      if (options.includeMetadata) {
        content += `Generated on: ${format(new Date(), 'MMM d, yyyy \'at\' h:mm a')}\n`;
        content += `Total entries: ${foodLogs.length}\n`;
      }
      
      content += '\n' + '='.repeat(50) + '\n\n';

      // Process each food log
      for (const foodLog of foodLogs) {
        content += `Date: ${this.formatDate(foodLog.date)}\n`;
        content += '-'.repeat(30) + '\n';

        // Meals
        if (foodLog.breakfast && (foodLog.breakfast.meat || foodLog.breakfast.vegetables || foodLog.breakfast.grains)) {
          content += `Breakfast (${this.formatTime(foodLog.breakfast.time || '8:00 AM')})\n`;
          content += `  ${this.getFoodItemsText(foodLog, 'breakfast')}\n\n`;
        }

        if (foodLog.lunch && (foodLog.lunch.meat || foodLog.lunch.vegetables || foodLog.lunch.grains)) {
          content += `Lunch (${this.formatTime(foodLog.lunch.time || '12:00 PM')})\n`;
          content += `  ${this.getFoodItemsText(foodLog, 'lunch')}\n\n`;
        }

        if (foodLog.dinner && (foodLog.dinner.meat || foodLog.dinner.vegetables || foodLog.dinner.grains)) {
          content += `Dinner (${this.formatTime(foodLog.dinner.time || '6:00 PM')})\n`;
          content += `  ${this.getFoodItemsText(foodLog, 'dinner')}\n\n`;
        }

        // Snacks
        if (foodLog.snacks) {
          const snackTypes: Array<{ key: 'midMorning' | 'midDay' | 'nighttime', label: string, time: string }> = [
            { key: 'midMorning', label: 'Mid-Morning Snack', time: '10:00 AM' },
            { key: 'midDay', label: 'Afternoon Snack', time: '3:00 PM' },
            { key: 'nighttime', label: 'Evening Snack', time: '8:00 PM' }
          ];

          for (const snackType of snackTypes) {
            const snack = foodLog.snacks[snackType.key];
            if (snack && (snack.items || snack.drinks)) {
              content += `${snackType.label} (${this.formatTime(snack.time || snackType.time)})\n`;
              content += `  ${this.getSnackText(foodLog, snackType.key)}\n\n`;
            }
          }
        }

        // Health metrics
        if (options.includeHealthMetrics && foodLog.health) {
          content += 'Health Metrics:\n';
          
          if (foodLog.health.bowelMovements) {
            content += `  Bowel Movements: ${foodLog.health.bowelMovements}\n`;
          }
          if (foodLog.health.exercise) {
            content += `  Exercise: ${foodLog.health.exercise}\n`;
          }
          if (foodLog.health.waterIntake) {
            content += `  Water Intake: ${foodLog.health.waterIntake} oz\n`;
          }
          if (foodLog.health.sleepQuality) {
            content += `  Sleep Quality: ${foodLog.health.sleepQuality}/5\n`;
          }
          if (foodLog.health.sleepHours) {
            content += `  Sleep Hours: ${foodLog.health.sleepHours}\n`;
          }
          if (foodLog.health.notes) {
            content += `  Notes: ${foodLog.health.notes}\n`;
          }
          content += '\n';
        }

        content += '\n';
      }

      // Generate filename
      const startDate = format(parseISO(options.dateRange.start), 'yyyy-MM-dd');
      const endDate = format(parseISO(options.dateRange.end), 'yyyy-MM-dd');
      const filename = `food-log-${startDate}-to-${endDate}.txt`;

      return {
        success: true,
        filename,
        data: content
      };
    } catch (error) {
      console.error('Text export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate text export'
      };
    }
  }

  async exportToJSON(foodLogs: FoodLog[], options: ExportOptions): Promise<ExportResult> {
    try {
      const exportData = {
        metadata: {
          title: options.title || 'Food & Health Log Report',
          dateRange: options.dateRange,
          generatedAt: new Date().toISOString(),
          totalEntries: foodLogs.length,
          includeHealthMetrics: options.includeHealthMetrics
        },
        data: foodLogs
      };

      const jsonContent = JSON.stringify(exportData, null, 2);

      // Generate filename
      const startDate = format(parseISO(options.dateRange.start), 'yyyy-MM-dd');
      const endDate = format(parseISO(options.dateRange.end), 'yyyy-MM-dd');
      const filename = `food-log-${startDate}-to-${endDate}.json`;

      return {
        success: true,
        filename,
        data: jsonContent
      };
    } catch (error) {
      console.error('JSON export error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate JSON export'
      };
    }
  }

  async downloadFile(result: ExportResult): Promise<void> {
    if (!result.success || !result.data || !result.filename) {
      throw new Error(result.error || 'Export failed');
    }

    try {
      let blob: Blob;
      
      if (result.data instanceof Blob) {
        blob = result.data;
      } else {
        const mimeType = result.filename.endsWith('.json') 
          ? 'application/json' 
          : 'text/plain';
        blob = new Blob([result.data], { type: mimeType });
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = result.filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      throw new Error('Failed to download file');
    }
  }
}

// Export singleton instance
export const exportService = new ExportService();