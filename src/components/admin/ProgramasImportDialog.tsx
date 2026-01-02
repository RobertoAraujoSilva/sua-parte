import { useState, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { useProgramasImport } from '@/hooks/useProgramasImport';
import { ProgramValidationResult } from '@/types/programasSpreadsheet';
import { cn } from '@/lib/utils';

interface ProgramasImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

type ImportStep = 'upload' | 'validate' | 'confirm' | 'complete';

export function ProgramasImportDialog({
  open,
  onOpenChange,
  onImportComplete
}: ProgramasImportDialogProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isLoading,
    validationResults,
    importSummary,
    progress,
    validateFile,
    importPrograms,
    downloadTemplate,
    resetImport,
    getImportStats
  } = useProgramasImport();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  const handleValidate = async () => {
    if (!selectedFile) return;
    
    setStep('validate');
    try {
      await validateFile(selectedFile);
      setStep('confirm');
    } catch {
      setStep('upload');
    }
  };

  const handleImport = async () => {
    try {
      await importPrograms(validationResults);
      setStep('complete');
      onImportComplete?.();
    } catch {
      // Error handled in hook
    }
  };

  const handleClose = () => {
    setStep('upload');
    setSelectedFile(null);
    resetImport();
    onOpenChange(false);
  };

  const stats = getImportStats(validationResults);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importar Programas
          </DialogTitle>
          <DialogDescription>
            Importe programas em massa a partir de uma planilha Excel
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between text-sm">
            <StepIndicator 
              step={1} 
              label="Upload" 
              active={step === 'upload'} 
              completed={step !== 'upload'} 
            />
            <div className="flex-1 h-0.5 bg-muted mx-2" />
            <StepIndicator 
              step={2} 
              label="Validar" 
              active={step === 'validate'} 
              completed={step === 'confirm' || step === 'complete'} 
            />
            <div className="flex-1 h-0.5 bg-muted mx-2" />
            <StepIndicator 
              step={3} 
              label="Confirmar" 
              active={step === 'confirm'} 
              completed={step === 'complete'} 
            />
          </div>

          {/* Upload Step */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25",
                  selectedFile && "border-green-500 bg-green-500/5"
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="space-y-2">
                    <CheckCircle2 className="h-12 w-12 mx-auto text-green-500" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedFile(null)}
                    >
                      Trocar arquivo
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                    <p className="font-medium">Arraste um arquivo Excel aqui</p>
                    <p className="text-sm text-muted-foreground">
                      ou clique para selecionar
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Selecionar arquivo
                    </Button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={downloadTemplate}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Baixar template
                </Button>

                <Button
                  onClick={handleValidate}
                  disabled={!selectedFile}
                >
                  Validar arquivo
                </Button>
              </div>
            </div>
          )}

          {/* Validate Step */}
          {step === 'validate' && (
            <div className="space-y-4 py-8">
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary" />
              <p className="text-center font-medium">Validando dados...</p>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Confirm Step */}
          {step === 'confirm' && (
            <div className="space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-4">
                <StatCard 
                  label="Total" 
                  value={stats.total} 
                  icon={FileSpreadsheet}
                />
                <StatCard 
                  label="Válidos" 
                  value={stats.valid} 
                  icon={CheckCircle2}
                  variant="success"
                />
                <StatCard 
                  label="Erros" 
                  value={stats.invalid} 
                  icon={XCircle}
                  variant="error"
                />
              </div>

              {/* Validation Results */}
              {validationResults.length > 0 && (
                <ScrollArea className="h-[200px] border rounded-lg">
                  <div className="p-4 space-y-2">
                    {validationResults.map((result, index) => (
                      <ValidationRow key={index} result={result} />
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={stats.valid === 0 || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importando...
                    </>
                  ) : (
                    <>Importar {stats.valid} programa(s)</>
                  )}
                </Button>
              </div>

              {isLoading && (
                <Progress value={progress} className="w-full" />
              )}
            </div>
          )}

          {/* Complete Step */}
          {step === 'complete' && importSummary && (
            <div className="space-y-4 py-4">
              <div className="text-center space-y-2">
                <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
                <h3 className="text-lg font-medium">Importação concluída!</h3>
                <p className="text-muted-foreground">
                  {importSummary.imported} programa(s) importado(s) com sucesso
                </p>
              </div>

              {importSummary.errors.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <p className="text-sm text-destructive font-medium">
                    {importSummary.errors.length} linha(s) não foram importadas
                  </p>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Helper Components
interface StepIndicatorProps {
  step: number;
  label: string;
  active: boolean;
  completed: boolean;
}

function StepIndicator({ step, label, active, completed }: StepIndicatorProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
          completed && "bg-primary text-primary-foreground",
          active && "bg-primary/20 text-primary border-2 border-primary",
          !active && !completed && "bg-muted text-muted-foreground"
        )}
      >
        {completed ? <CheckCircle2 className="h-4 w-4" /> : step}
      </div>
      <span className={cn("text-xs", active ? "text-primary" : "text-muted-foreground")}>
        {label}
      </span>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'success' | 'error';
}

function StatCard({ label, value, icon: Icon, variant = 'default' }: StatCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border text-center",
      variant === 'success' && "bg-green-500/10 border-green-500/20",
      variant === 'error' && value > 0 && "bg-destructive/10 border-destructive/20"
    )}>
      <Icon className={cn(
        "h-6 w-6 mx-auto mb-2",
        variant === 'success' && "text-green-500",
        variant === 'error' && value > 0 && "text-destructive"
      )} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

interface ValidationRowProps {
  result: ProgramValidationResult;
}

function ValidationRow({ result }: ValidationRowProps) {
  return (
    <div className={cn(
      "flex items-start gap-3 p-2 rounded-lg",
      result.isValid ? "bg-green-500/5" : "bg-destructive/5"
    )}>
      {result.isValid ? (
        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
      ) : (
        <XCircle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Linha {result.rowIndex}</span>
          {result.data && (
            <span className="text-sm text-muted-foreground truncate">
              {result.data.titulo}
            </span>
          )}
        </div>
        
        {result.errors.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {result.errors.map((error, i) => (
              <Badge key={i} variant="destructive" className="text-xs">
                {error}
              </Badge>
            ))}
          </div>
        )}
        
        {result.warnings.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {result.warnings.map((warning, i) => (
              <Badge key={i} variant="outline" className="text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3 mr-1" />
                {warning}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
