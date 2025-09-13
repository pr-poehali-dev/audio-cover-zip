export interface FileAnalysis {
  wavFiles: number;
  jpgFiles: number;
  matchedPairs: number;
  unmatchedFiles: string[];
  wavFilesList: string[];
  jpgFilesList: string[];
  matchedPairsList: Array<{wav: string, jpg: string}>;
}

export interface ZipFileData {
  [key: string]: ArrayBuffer;
}

export type ProcessingStep = 'upload' | 'analyzing' | 'processing' | 'complete';