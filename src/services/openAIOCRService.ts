import { toast } from "@/hooks/use-toast";
import { extractTextFromPDF } from './pdfService'; 

export interface OCRResult {
  text: string;
  confidence?: number;
  modelUsed?: string;
}

// Function to get available models from OpenRouter that support vision tasks
async function getAvailableModels(apiKey: string): Promise<string[]> {
  try {
    console.log("Fetching available models from OpenRouter");
    
    const response = await fetch("https://openrouter.ai/api/v1/models", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error when fetching models:", errorData);
      return [];
    }
    
    const data = await response.json();
    console.log("OpenRouter models response:", data);
    
    // Filter models that support vision tasks
    const supportedModels = data.data
      .filter((model: any) => {
        try {
          return model.architecture?.modality?.includes('image') || 
                 model.architecture?.input_modalities?.includes('image');
        } catch (err) {
          console.error("Error filtering model:", model.id, err);
          return false;
        }
      })
      .map((model: any) => model.id);
    
    console.log("Available OCR-capable models:", supportedModels);
    return supportedModels.length > 0 ? supportedModels : getDefaultModels();
  } catch (error) {
    console.error("Error fetching available models:", error);
    return getDefaultModels();
  }
}

// Function to get default models known to work well with OCR
function getDefaultModels(): string[] {
  return [
    "anthropic/claude-3-opus:beta",
    "openai/gpt-4o",
    "anthropic/claude-3-sonnet:beta",
    "google/gemini-pro-vision",
    "anthropic/claude-3-haiku:beta"
  ];
}

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Return the full data URL for production environment
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function performOCRWithModel(file: File, model: string, apiKey: string): Promise<OCRResult | null> {
  try {
    // Handle PDF files
    if (file.type === 'application/pdf') {
      const { text, images } = await extractTextFromPDF(file);
      
      // If we have images in the PDF, process them with OpenRouter
      if (images.length > 0) {
        const imageResults = await Promise.all(
          images.map(async (image) => {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": window.location.origin
              },
              body: JSON.stringify({
                model: model,
                messages: [
                  {
                    role: "user",
                    content: [
                      { type: "text", text: "Extract all text from this image:" },
                      { type: "image_url", image_url: { url: image } }
                    ]
                  }
                ],
                temperature: 0.1,
                max_tokens: 4000
              })
            });
            
            if (!response.ok) {
              throw new Error(`OpenRouter API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices?.[0]?.message?.content || '';
          })
        );
        
        // Combine PDF text and image OCR results
        return {
          text: text + '\n' + imageResults.join('\n'),
          modelUsed: model
        };
      }
      
      // If no images, just return the extracted text
      return { text, modelUsed: 'pdf.js' };
    }
    
    // Handle image files
    const base64File = await convertFileToBase64(file);
    
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": window.location.origin
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all text from this health report:" },
              { type: "image_url", image_url: { url: base64File } }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 4000
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const data = await response.json();
    const extractedText = data.choices?.[0]?.message?.content || '';
    
    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from the image');
    }
    
    return {
      text: extractedText,
      modelUsed: model
    };
  } catch (error) {
    console.error("OCR error:", error);
    return null;
  }
}

export async function performOCR(file: File, customToast?: Function): Promise<OCRResult | null> {
  try {
    const apiKey = localStorage.getItem("openrouter_api_key");
    if (!apiKey) {
      toast({
        title: "API Key Missing",
        description: "Please add your OpenRouter API key in the settings first.",
        variant: "destructive",
      });
      return null;
    }

    // Check if file type is supported
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: "Unsupported File Type",
        description: "Please upload a PDF, JPG, or PNG file.",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if file size is within limits (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File Too Large",
        description: "Maximum file size is 10MB.",
        variant: "destructive",
      });
      return null;
    }

    const toastFn = customToast || toast;
    toastFn({
      title: "Processing Document",
      description: "Extracting text from your document...",
    });

    // Get available models from OpenRouter that support vision tasks
    const availableModels = await getAvailableModels(apiKey);
    const modelsToUse = availableModels.slice(0, 5); // Use top 5 models
    
    if (modelsToUse.length === 0) {
      toast({
        title: "No Available Models",
        description: "Could not find any OpenRouter models that support document analysis. Please try again later.",
        variant: "destructive",
      });
      return null;
    }

    console.log("Selected models for OCR:", modelsToUse);
    
    // Try each model until we get a successful result
    for (const model of modelsToUse) {
      const result = await performOCRWithModel(file, model, apiKey);
      if (result && result.text.trim()) {
        return result;
      }
    }
    
    // If all models failed, try with the default model
    const defaultResult = await performOCRWithModel(file, "anthropic/claude-3-opus:beta", apiKey);
    if (defaultResult && defaultResult.text.trim()) {
      return defaultResult;
    }
    
    throw new Error("All OCR attempts failed");
  } catch (error) {
    console.error("Error performing OCR:", error);
    toast({
      title: "OCR Failed",
      description: "Failed to extract text from your document. Please try again.",
      variant: "destructive",
    });
    return null;
  }
}

// Helper function to extract patient name from filename
function extractPatientNameFromFilename(filename: string): string | null {
  // Remove file extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");
  
  // Common patterns for patient names in filenames:
  // 1. Look for Mr/Mrs/Ms followed by name
  const titleMatch = nameWithoutExt.match(/(?:Mr|Mrs|Ms|Miss|Dr)[\s_\-\.]+([A-Za-z\s_\-]+)/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].replace(/[_\-\.]+/g, " ").trim();
  }
  
  // 2. Names with underscore or dash separators: Report_John_Doe.pdf or Report-John-Doe.pdf
  const underscorePattern = nameWithoutExt.replace(/^(Report|Lab|Test|Result|Health)[\s_\-]+/i, "");
  
  // Split by common separators
  const parts = underscorePattern.split(/[\s_\-\.]+/);
  
  // If we have at least 2 parts that could form a name
  if (parts.length >= 2) {
    // Check if any parts look like a name (not just numbers or single characters)
    const nameParts = parts.filter(part => part.length > 1 && !/^\d+$/.test(part));
    
    if (nameParts.length >= 2) {
      // Format nicely with spaces
      return nameParts.join(" ");
    }
  }
  
  return null;
}

// Utility function to clear all stored data
export function clearAllData(): void {
  console.log("Clearing all stored health data");
  localStorage.removeItem('scannedReports');
  localStorage.removeItem('patientName');
  // Don't show toast here as it might be confusing during the upload process
}
