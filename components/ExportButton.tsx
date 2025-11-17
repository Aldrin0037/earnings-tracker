"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, FileImage, FileText } from "lucide-react";

interface ExportButtonProps {
  targetId?: string; // ID of the element to export
  filename?: string;
  format?: "png" | "pdf" | "both";
  className?: string;
}

export function ExportButton({ 
  targetId = "earnings-card",
  filename = `earnings-${new Date().toISOString().split('T')[0]}`,
  format = "png",
  className
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const getExportElement = () => {
    const root = document.getElementById(targetId);
    if (!root) {
      throw new Error(`Element with id "${targetId}" not found`);
    }

    // For hidden export elements, temporarily make them visible
    const originalStyles = {
      position: root.style.position,
      left: root.style.left,
      top: root.style.top,
      width: root.style.width,
      visibility: root.style.visibility,
      display: root.style.display,
      opacity: root.style.opacity,
      zIndex: root.style.zIndex
    };

    // If element is hidden off-screen, make it visible for capture
    if (root.style.position === 'fixed' && root.style.left === '-9999px') {
      root.style.position = 'relative';
      root.style.left = 'auto';
      root.style.top = 'auto';
      root.style.visibility = 'visible';
      root.style.display = 'block';
      root.style.opacity = '1';
      root.style.zIndex = '1';
      // Store restore function on element
      (root as any).__exportRestoreStyles = originalStyles;
    }

    const explicitTarget = root.matches("[data-export-surface]")
      ? root
      : (root.querySelector("[data-export-surface]") as HTMLElement | null);

    return explicitTarget ?? root;
  };

  // Temporarily disable all stylesheets that might contain oklab/lab colors
  // This prevents html2canvas from parsing them during initialization
  const disableProblematicStylesheets = (): (() => void) => {
    const allStylesheets = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'));
    const disabled: Array<{ 
      element: HTMLElement | HTMLLinkElement; 
      originalContent?: string;
      originalMedia?: string;
      wasRemoved?: boolean;
      parent?: Node;
      nextSibling?: Node | null;
    }> = [];
    
    allStylesheets.forEach(sheet => {
      const htmlSheet = sheet as HTMLElement | HTMLLinkElement;
      // Skip our override stylesheet
      if (htmlSheet.id === 'html2canvas-rgb-override') {
        return;
      }
      
      // Check if stylesheet content might contain oklab/lab
      let shouldDisable = false;
      if (htmlSheet.tagName === 'STYLE') {
        const styleContent = (htmlSheet as HTMLStyleElement).textContent || '';
        if (styleContent.includes('oklab') || styleContent.includes('oklch') || styleContent.includes('lab(') || styleContent.includes('lch(')) {
          shouldDisable = true;
        }
      } else if (htmlSheet.tagName === 'LINK') {
        // For external stylesheets, disable them to be safe
        shouldDisable = true;
      }
      
      if (shouldDisable) {
        if (htmlSheet.tagName === 'STYLE') {
          // For style elements, temporarily remove their content
          const styleEl = htmlSheet as HTMLStyleElement;
          disabled.push({
            element: htmlSheet,
            originalContent: styleEl.textContent || '',
            wasRemoved: false
          });
          styleEl.textContent = ''; // Clear content
        } else if (htmlSheet.tagName === 'LINK') {
          // For link elements, temporarily remove from DOM
          const linkEl = htmlSheet as HTMLLinkElement;
          disabled.push({
            element: htmlSheet,
            originalMedia: linkEl.media,
            wasRemoved: true,
            parent: linkEl.parentNode || undefined,
            nextSibling: linkEl.nextSibling
          });
          linkEl.remove(); // Remove from DOM
        }
      }
    });
    
    return () => {
      disabled.forEach(({ element, originalContent, originalMedia, wasRemoved, parent, nextSibling }) => {
        if (element.tagName === 'STYLE' && originalContent !== undefined) {
          // Restore style content
          (element as HTMLStyleElement).textContent = originalContent;
        } else if (element.tagName === 'LINK' && wasRemoved && parent) {
          // Re-insert link element
          if (nextSibling) {
            parent.insertBefore(element as HTMLLinkElement, nextSibling);
          } else {
            parent.appendChild(element as HTMLLinkElement);
          }
          if (originalMedia !== undefined) {
            (element as HTMLLinkElement).media = originalMedia;
          }
        }
      });
    };
  };

  // Inject a stylesheet that overrides all oklab() colors with RGB equivalents
  // This prevents html2canvas from encountering oklab() in stylesheets
  const injectRGBOverrideStylesheet = (): (() => void) => {
    const styleId = 'html2canvas-rgb-override';
    let existingStyle = document.getElementById(styleId) as HTMLStyleElement | null;
    
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Override all Tailwind utility classes with explicit RGB values */
      /* This prevents html2canvas from encountering oklab() in stylesheets */
      .bg-background,
      [class*="bg-background"] { background-color: rgb(255, 255, 255) !important; }
      .bg-foreground,
      [class*="bg-foreground"] { background-color: rgb(12, 12, 18) !important; }
      .bg-card,
      [class*="bg-card"] { background-color: rgb(255, 255, 255) !important; }
      .bg-primary,
      [class*="bg-primary"] { background-color: rgb(15, 20, 30) !important; }
      .bg-secondary,
      [class*="bg-secondary"] { background-color: rgb(240, 245, 250) !important; }
      .bg-muted,
      [class*="bg-muted"] { background-color: rgb(240, 245, 250) !important; }
      .bg-accent,
      [class*="bg-accent"] { background-color: rgb(240, 245, 250) !important; }
      .bg-destructive,
      [class*="bg-destructive"] { background-color: rgb(245, 60, 60) !important; }
      
      .text-foreground,
      [class*="text-foreground"] { color: rgb(12, 12, 18) !important; }
      .text-muted-foreground,
      [class*="text-muted-foreground"] { color: rgb(100, 110, 120) !important; }
      .text-primary,
      [class*="text-primary"] { color: rgb(15, 20, 30) !important; }
      .text-secondary,
      [class*="text-secondary"] { color: rgb(15, 20, 30) !important; }
      .text-destructive,
      [class*="text-destructive"] { color: rgb(245, 60, 60) !important; }
      
      .border-border,
      [class*="border-border"] { border-color: rgb(230, 235, 240) !important; }
      .border-input,
      [class*="border-input"] { border-color: rgb(230, 235, 240) !important; }
      
      /* Override CSS variables that might contain oklab() */
      :root {
        --color-background: rgb(255, 255, 255) !important;
        --color-foreground: rgb(12, 12, 18) !important;
        --color-card: rgb(255, 255, 255) !important;
        --color-card-foreground: rgb(12, 12, 18) !important;
        --color-primary: rgb(15, 20, 30) !important;
        --color-primary-foreground: rgb(250, 252, 255) !important;
        --color-secondary: rgb(240, 245, 250) !important;
        --color-secondary-foreground: rgb(15, 20, 30) !important;
        --color-muted: rgb(240, 245, 250) !important;
        --color-muted-foreground: rgb(100, 110, 120) !important;
        --color-accent: rgb(240, 245, 250) !important;
        --color-accent-foreground: rgb(15, 20, 30) !important;
        --color-destructive: rgb(245, 60, 60) !important;
        --color-destructive-foreground: rgb(250, 252, 255) !important;
        --color-border: rgb(230, 235, 240) !important;
        --color-input: rgb(230, 235, 240) !important;
        --color-ring: rgb(12, 12, 18) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    return () => {
      const styleToRemove = document.getElementById(styleId);
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  };

  // CRITICAL: Convert all colors to RGB BEFORE html2canvas processes the element
  // This prevents html2canvas from seeing oklab() values in computed styles
  const convertAllColorsToRGB = (element: HTMLElement): (() => void) => {
    const allElements = element.querySelectorAll('*');
    const elementsToProcess = [element, ...Array.from(allElements)];
    const backups: Array<{ element: HTMLElement; styles: Record<string, string> }> = [];

    elementsToProcess.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const computed = window.getComputedStyle(htmlEl);
      const style = htmlEl.style;
      const backup: Record<string, string> = {};

      // Comprehensive list of all color-related properties
      const colorProps = [
        'color',
        'backgroundColor',
        'borderColor',
        'borderTopColor',
        'borderRightColor',
        'borderBottomColor',
        'borderLeftColor',
        'outlineColor',
        'columnRuleColor',
        'textDecorationColor',
        'fill',
        'stroke',
      ];

      colorProps.forEach(prop => {
        try {
          const computedValue = computed.getPropertyValue(prop);
          if (computedValue && computedValue !== 'transparent' && computedValue !== 'rgba(0, 0, 0, 0)') {
            // Get the actual computed RGB value (browser converts oklab to RGB)
            const rgbValue = computed[prop as keyof CSSStyleDeclaration] as string;
            if (rgbValue && typeof rgbValue === 'string') {
              // Only apply if it's a valid RGB/hex value (not oklab/oklch)
              if (rgbValue.startsWith('rgb') || rgbValue.startsWith('#') || rgbValue.startsWith('rgba')) {
                backup[prop] = style.getPropertyValue(prop);
                style.setProperty(prop, rgbValue, 'important');
              }
            }
          }
        } catch (e) {
          // Ignore errors
        }
      });

      // Fix border shorthand properties
      ['border', 'borderTop', 'borderRight', 'borderBottom', 'borderLeft'].forEach(borderProp => {
        try {
          const borderValue = computed.getPropertyValue(borderProp);
          if (borderValue && borderValue !== 'none' && borderValue !== '0px none rgb(0, 0, 0)') {
            // Extract and convert border color if present
            const parts = borderValue.split(' ');
            const convertedParts = parts.map(part => {
              if (part.includes('oklab') || part.includes('oklch')) {
                // Get computed border color separately
                const borderColorProp = borderProp === 'border' ? 'borderColor' : `${borderProp}Color`;
                const borderColor = computed[borderColorProp as keyof CSSStyleDeclaration] as string;
                if (borderColor && (borderColor.startsWith('rgb') || borderColor.startsWith('#'))) {
                  return borderColor;
                }
              }
              return part;
            });
            backup[borderProp] = style.getPropertyValue(borderProp);
            style.setProperty(borderProp, convertedParts.join(' '), 'important');
          }
        } catch (e) {
          // Ignore
        }
      });

      // Fix box-shadow and text-shadow (may contain colors)
      const boxShadow = computed.boxShadow;
      if (boxShadow && boxShadow !== 'none' && !boxShadow.includes('oklab') && !boxShadow.includes('oklch')) {
        backup.boxShadow = style.boxShadow;
        style.boxShadow = boxShadow;
      }

      const textShadow = computed.textShadow;
      if (textShadow && textShadow !== 'none' && !textShadow.includes('oklab') && !textShadow.includes('oklch')) {
        backup.textShadow = style.textShadow;
        style.textShadow = textShadow;
      }

      if (Object.keys(backup).length > 0) {
        backups.push({ element: htmlEl, styles: backup });
      }
    });

    return () => {
      backups.forEach(({ element: el, styles }) => {
        Object.entries(styles).forEach(([prop, value]) => {
          if (value) {
            el.style.setProperty(prop, value);
          } else {
            el.style.removeProperty(prop);
          }
        });
      });
    };
  };

  // Helper to convert all color properties to RGB in cloned document
  // This is called in html2canvas's onclone callback as a backup fix
  const fixColorsInClonedDoc = (clonedElement: HTMLElement, originalElement: HTMLElement) => {
    // Map of original elements to cloned elements
    const originalElements = originalElement.querySelectorAll('*');
    const clonedElements = clonedElement.querySelectorAll('*');
    const elementMap = new Map<HTMLElement, HTMLElement>();
    
    // Create mapping (assumes same structure)
    elementMap.set(originalElement, clonedElement);
    originalElements.forEach((orig, index) => {
      if (index < clonedElements.length) {
        elementMap.set(orig as HTMLElement, clonedElements[index] as HTMLElement);
      }
    });

    // Process each mapped pair
    elementMap.forEach((clonedEl, originalEl) => {
      try {
        const computed = window.getComputedStyle(originalEl);
        const clonedStyle = clonedEl.style;

        // Convert all color-related properties
        const colorProps = [
          'color',
          'backgroundColor',
          'borderColor',
          'borderTopColor',
          'borderRightColor',
          'borderBottomColor',
          'borderLeftColor',
          'outlineColor',
          'fill',
          'stroke',
        ];

        colorProps.forEach(prop => {
          try {
            const computedValue = computed[prop as keyof CSSStyleDeclaration] as string;
            if (computedValue && typeof computedValue === 'string' && computedValue !== 'transparent' && computedValue !== 'rgba(0, 0, 0, 0)') {
              clonedStyle.setProperty(prop, computedValue, 'important');
            }
          } catch (e) {
            // Ignore
          }
        });

        // Fix box-shadow and text-shadow
        const boxShadow = computed.boxShadow;
        if (boxShadow && boxShadow !== 'none') {
          clonedStyle.boxShadow = boxShadow;
        }

        const textShadow = computed.textShadow;
        if (textShadow && textShadow !== 'none') {
          clonedStyle.textShadow = textShadow;
        }
      } catch (e) {
        // Ignore errors
      }
    });
  };


  const exportAsPNG = async () => {
    try {
      setIsExporting(true);
      
      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      const element = getExportElement();
      
      // If element was hidden, wait a bit more for it to render
      const root = document.getElementById(targetId);
      if (root && (root as any).__exportRestoreStyles) {
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      // Ensure element is visible
      const originalStyles = {
        visibility: element.style.visibility,
        display: element.style.display,
        opacity: element.style.opacity,
      };
      
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        element.style.visibility = 'visible';
        element.style.display = 'block';
        element.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Scroll element into view to ensure it's rendered
      element.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      await new Promise(resolve => setTimeout(resolve, 300));

      // CRITICAL: Disable problematic stylesheets BEFORE html2canvas initializes
      const restoreStylesheets = disableProblematicStylesheets();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // CRITICAL: Inject stylesheet override to prevent oklab() in stylesheets
      const removeStylesheet = injectRGBOverrideStylesheet();
      await new Promise(resolve => setTimeout(resolve, 100));

      // CRITICAL: Convert all colors to RGB BEFORE html2canvas processes the element
      // This prevents html2canvas from seeing oklab() values in computed styles
      const restoreColors = convertAllColorsToRGB(element);
      await new Promise(resolve => setTimeout(resolve, 200)); // Give time for styles to apply

      // Store reference to original element for use in onclone
      const originalElementRef = element;

      try {
        // Create canvas from the element
        const canvas = await html2canvas(element, {
          scale: 1.5,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: false,
          removeContainer: true,
          onclone: (clonedDoc, clonedElement) => {
            // Remove all stylesheets that might contain oklab() from cloned document
            const clonedStylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            clonedStylesheets.forEach(sheet => {
              // Keep only our override stylesheet
              if (sheet.id !== 'html2canvas-rgb-override') {
                sheet.remove();
              }
            });
            
            // Fix oklab() colors in the cloned document using original element's computed styles
            fixColorsInClonedDoc(clonedElement, originalElementRef);
          },
          ignoreElements: (el) => {
            // Ignore buttons and interactive elements
            return el.tagName === 'BUTTON' || el.classList.contains('export-button');
          }
        });

        // Convert to PNG and download
        const dataUrl = canvas.toDataURL('image/png', 1.0);
        if (!dataUrl || dataUrl === 'data:,') {
          throw new Error('Failed to generate image data');
        }

        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        
        // Clean up after a short delay
        setTimeout(() => {
          document.body.removeChild(link);
        }, 100);
      } finally {
        // Restore disabled stylesheets
        restoreStylesheets();
        
        // Remove stylesheet override
        removeStylesheet();
        
        // Restore original color styles
        restoreColors();
        
        // Restore original visibility styles
        if (originalStyles.visibility) element.style.visibility = originalStyles.visibility;
        if (originalStyles.display) element.style.display = originalStyles.display;
        if (originalStyles.opacity) element.style.opacity = originalStyles.opacity;
        
        // Restore hidden export element styles if needed
        const root = document.getElementById(targetId);
        if (root && (root as any).__exportRestoreStyles) {
          const restoreStyles = (root as any).__exportRestoreStyles;
          root.style.position = restoreStyles.position;
          root.style.left = restoreStyles.left;
          root.style.top = restoreStyles.top;
          root.style.width = restoreStyles.width;
          root.style.visibility = restoreStyles.visibility;
          root.style.display = restoreStyles.display;
          root.style.opacity = restoreStyles.opacity;
          root.style.zIndex = restoreStyles.zIndex;
          delete (root as any).__exportRestoreStyles;
        }
      }

    } catch (error: any) {
      console.error("Error exporting PNG:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Failed to export as PNG: ${errorMessage}. Please ensure the table is visible and try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsPDF = async () => {
    try {
      setIsExporting(true);
      
      // Wait a bit to ensure DOM is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const element = getExportElement();

      // Ensure element is visible
      const originalStyles = {
        visibility: element.style.visibility,
        display: element.style.display,
        opacity: element.style.opacity,
      };
      
      if (element.offsetWidth === 0 || element.offsetHeight === 0) {
        element.style.visibility = 'visible';
        element.style.display = 'block';
        element.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Scroll element into view to ensure it's rendered
      element.scrollIntoView({ behavior: 'instant', block: 'nearest' });
      await new Promise(resolve => setTimeout(resolve, 300));

      // CRITICAL: Disable problematic stylesheets BEFORE html2canvas initializes
      const restoreStylesheets = disableProblematicStylesheets();
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // CRITICAL: Inject stylesheet override to prevent oklab() in stylesheets
      const removeStylesheet = injectRGBOverrideStylesheet();
      await new Promise(resolve => setTimeout(resolve, 100));

      // CRITICAL: Convert all colors to RGB BEFORE html2canvas processes the element
      // This prevents html2canvas from seeing oklab() values in computed styles
      const restoreColors = convertAllColorsToRGB(element);
      await new Promise(resolve => setTimeout(resolve, 200)); // Give time for styles to apply

      // Store reference to original element for use in onclone
      const originalElementRef = element;

      try {
        // Create canvas from the element
        const canvas = await html2canvas(element, {
          scale: 1.5,
          backgroundColor: "#ffffff",
          logging: false,
          useCORS: true,
          allowTaint: false,
          removeContainer: true,
          onclone: (clonedDoc, clonedElement) => {
            // Remove all stylesheets that might contain oklab() from cloned document
            const clonedStylesheets = clonedDoc.querySelectorAll('style, link[rel="stylesheet"]');
            clonedStylesheets.forEach(sheet => {
              // Keep only our override stylesheet
              if (sheet.id !== 'html2canvas-rgb-override') {
                sheet.remove();
              }
            });
            
            // Fix oklab() colors in the cloned document using original element's computed styles
            fixColorsInClonedDoc(clonedElement, originalElementRef);
          },
          ignoreElements: (el) => {
            // Ignore buttons and interactive elements
            return el.tagName === 'BUTTON' || el.classList.contains('export-button');
          }
        });

        // Calculate dimensions
        const imgData = canvas.toDataURL('image/png', 1.0);
        if (!imgData || imgData === 'data:,') {
          throw new Error('Failed to generate image data');
        }

        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;

        // Calculate ratio to fit the image on the page
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight) * 200;
        const imgX = (pdfWidth - imgWidth * ratio) / 2;
        const imgY = 10; // 10mm from top

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
        pdf.save(`${filename}.pdf`);
      } finally {
        // Restore disabled stylesheets
        restoreStylesheets();
        
        // Remove stylesheet override
        removeStylesheet();
        
        // Restore original color styles
        restoreColors();
        
        // Restore original visibility styles
        if (originalStyles.visibility) element.style.visibility = originalStyles.visibility;
        if (originalStyles.display) element.style.display = originalStyles.display;
        if (originalStyles.opacity) element.style.opacity = originalStyles.opacity;
        
        // Restore hidden export element styles if needed
        const root = document.getElementById(targetId);
        if (root && (root as any).__exportRestoreStyles) {
          const restoreStyles = (root as any).__exportRestoreStyles;
          root.style.position = restoreStyles.position;
          root.style.left = restoreStyles.left;
          root.style.top = restoreStyles.top;
          root.style.width = restoreStyles.width;
          root.style.visibility = restoreStyles.visibility;
          root.style.display = restoreStyles.display;
          root.style.opacity = restoreStyles.opacity;
          root.style.zIndex = restoreStyles.zIndex;
          delete (root as any).__exportRestoreStyles;
        }
      }

    } catch (error: any) {
      console.error("Error exporting PDF:", error);
      const errorMessage = error?.message || "Unknown error occurred";
      alert(`Failed to export as PDF: ${errorMessage}. Please ensure the table is visible and try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    if (format === "png") {
      exportAsPNG();
    } else if (format === "pdf") {
      exportAsPDF();
    }
  };

  const getIcon = () => {
    if (format === "png") return <FileImage className="h-4 w-4" />;
    if (format === "pdf") return <FileText className="h-4 w-4" />;
    return <Download className="h-4 w-4" />;
  };

  const getLabel = () => {
    if (isExporting) return "Exporting...";
    if (format === "png") return "Download as PNG";
    if (format === "pdf") return "Download as PDF";
    return "Export";
  };

  if (format === "both") {
    return (
      <div className={`flex gap-2 ${className || ""}`}>
        <Button
          variant="default"
          onClick={exportAsPNG}
          disabled={isExporting}
          className="flex-1"
        >
          <FileImage className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Download as PNG"}
        </Button>
        <Button
          variant="default"
          onClick={exportAsPDF}
          disabled={isExporting}
          className="flex-1"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Download as PDF"}
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {getIcon()}
      <span className="ml-2">{getLabel()}</span>
    </Button>
  );
}
