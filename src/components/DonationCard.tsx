import React, { useState } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Heart, 
  Copy, 
  QrCode, 
  ExternalLink, 
  CreditCard,
  MapPin,
  User,
  CheckCircle
} from "lucide-react";
import { donationConfig, donationUtils } from "@/config/donations";

interface DonationCardProps {
  /**
   * Título do card de doação
   */
  title?: string;
  
  /**
   * Descrição do card de doação
   */
  description?: string;
  
  /**
   * Se deve mostrar informações detalhadas do recebedor
   */
  showRecipientInfo?: boolean;
  
  /**
   * Se deve mostrar botões de doação externa (Wise, Stripe)
   */
  showExternalOptions?: boolean;
  
  /**
   * Tamanho do QR Code
   */
  qrSize?: number;
  
  /**
   * Classe CSS adicional para o card
   */
  className?: string;
}

const DonationCard: React.FC<DonationCardProps> = ({
  title = "Apoie o Sistema Ministerial",
  description = "Sua contribuição ajuda a manter o sistema funcionando e em constante melhoria",
  showRecipientInfo = true,
  showExternalOptions = true,
  qrSize = 128,
  className = ""
}) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedEmv, setCopiedEmv] = useState(false);
  const [qrError, setQrError] = useState(false);

  const handleCopyPixKey = async () => {
    const success = await donationUtils.copyToClipboard(donationConfig.pix.key);
    if (success) {
      setCopiedPix(true);
      toast({
        title: "Chave PIX copiada!",
        description: "A chave PIX foi copiada para sua área de transferência.",
      });
      setTimeout(() => setCopiedPix(false), 3000);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a chave PIX.",
        variant: "destructive"
      });
    }
  };

  const handleCopyEmv = async () => {
    const success = await donationUtils.copyToClipboard(donationConfig.pix.emv);
    if (success) {
      setCopiedEmv(true);
      toast({
        title: "PIX Copia e Cola copiado!",
        description: "O código PIX foi copiado. Cole no seu app bancário.",
      });
      setTimeout(() => setCopiedEmv(false), 3000);
    } else {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código PIX.",
        variant: "destructive"
      });
    }
  };

  const handleWiseDonation = () => {
    if (donationConfig.wise?.enabled && donationConfig.wise.link) {
      window.open(donationConfig.wise.link, '_blank');
    }
  };

  const handleStripeDonation = () => {
    if (donationConfig.stripe?.enabled && donationConfig.stripe.paymentLink) {
      window.open(donationConfig.stripe.paymentLink, '_blank');
    }
  };

  const handleQrError = () => {
    setQrError(true);
  };

  return (
    <Card className={`border-2 border-jw-gold/20 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-500" />
          {title}
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="flex flex-col lg:flex-row items-center gap-6">
          {/* QR Code Section */}
          <div className="flex-shrink-0 text-center">
            {!qrError && donationUtils.isValidEmv(donationConfig.pix.emv) ? (
              <div className="p-4 bg-white rounded-lg border-4 border-jw-blue/20 shadow-lg">
                <QRCode
                  value={donationConfig.pix.emv}
                  size={qrSize}
                  level="M"
                  includeMargin={false}
                  onError={handleQrError}
                />
              </div>
            ) : (
              <div className={`w-${qrSize} h-${qrSize} bg-gradient-to-br from-jw-blue to-jw-blue-dark rounded-lg flex items-center justify-center border-4 border-white shadow-lg`}>
                <QrCode className="w-16 h-16 text-white" />
              </div>
            )}
            <p className="text-xs text-center mt-2 text-gray-500">QR Code PIX</p>
          </div>

          {/* Content Section */}
          <div className="flex-1 text-center lg:text-left space-y-4">
            <h3 className="text-lg font-semibold">Contribua via PIX</h3>
            <p className="text-gray-600">
              Qualquer valor é bem-vindo e faz a diferença para manter
              o sistema ativo e gratuito para todas as congregações.
            </p>

            {/* Recipient Info */}
            {showRecipientInfo && (
              <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm">
                  <User className="w-4 h-4 text-jw-blue" />
                  <span className="font-medium">{donationConfig.pix.recipientName}</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{donationConfig.pix.recipientCity}</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="hero"
                  onClick={handleCopyPixKey}
                  className="flex-1"
                >
                  {copiedPix ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Chave Copiada!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Chave PIX
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleCopyEmv}
                  className="flex-1"
                >
                  {copiedEmv ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Código Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar Pix Copia e Cola
                    </>
                  )}
                </Button>
              </div>

              {/* External Payment Options */}
              {showExternalOptions && (
                <div className="space-y-2">
                  {donationConfig.wise?.enabled && (
                    <Button
                      variant="outline"
                      onClick={handleWiseDonation}
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Doar via Wise
                    </Button>
                  )}
                  
                  {donationConfig.stripe?.enabled && (
                    <Button
                      variant="outline"
                      onClick={handleStripeDonation}
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Doar com Cartão (Stripe)
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* PIX Key Display */}
            <div className="text-xs text-gray-500 space-y-1">
              <p>Chave PIX: {donationConfig.pix.key}</p>
              {qrError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-yellow-800 text-xs">
                    QR Code indisponível. Use a chave PIX ou o código Copia e Cola acima.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DonationCard;
