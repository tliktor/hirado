import { QrCode, Smartphone, MessageCircle } from 'lucide-react';

export default function ViberQR() {
  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-8 text-center max-w-sm mx-auto">
      <div className="inline-flex p-4 rounded-full bg-purple-500/10 mb-4">
        <Smartphone className="w-8 h-8 text-purple-500" />
      </div>
      <h3 className="text-lg font-semibold text-light-text dark:text-dark-text mb-2">
        Viber Bot
      </h3>
      <p className="text-sm text-light-muted dark:text-dark-muted mb-6">
        Küldj fotókat a Viber bot-nak, és azok automatikusan megjelennek a galériádban!
      </p>
      <div className="flex flex-col items-center p-6 bg-light-bg dark:bg-dark-bg rounded-xl mb-4">
        <QrCode className="w-32 h-32 text-light-muted dark:text-dark-muted" />
      </div>
      <div className="flex items-center justify-center gap-2 text-sm text-light-muted dark:text-dark-muted">
        <MessageCircle className="w-4 h-4" />
        <span>Szkenneld be a QR kódot a Viber-rel</span>
      </div>
    </div>
  );
}
