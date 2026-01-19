// src/components/PWA/InstallPrompt.jsx
import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Detectar si es iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(isIOSDevice);

    // Detectar si ya está instalada
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone ||
                               document.referrer.includes('android-app://');
    setIsStandalone(isInStandaloneMode);

    // Capturar el evento beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Mostrar el prompt solo si no se ha rechazado antes
      const wasRejected = localStorage.getItem('rtvc_install_rejected');
      if (!wasRejected) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Mostrar después de 3 segundos
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar el prompt de instalación
    deferredPrompt.prompt();

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Resultado de instalación: ${outcome}`);

    if (outcome === 'dismissed') {
      localStorage.setItem('rtvc_install_rejected', 'true');
    }

    // Limpiar el prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('rtvc_install_rejected', 'true');
  };

  // No mostrar si ya está instalada
  if (isStandalone) {
    return null;
  }

  // Mostrar instrucciones para iOS
  if (isIOS && showPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-lg z-50 animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <Smartphone className="flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2">Instalar RTVC Programación</h3>
              <p className="text-sm mb-3">
                Para instalar esta app en tu iPhone:
              </p>
              <ol className="text-sm space-y-1 list-decimal list-inside">
                <li>Toca el botón de compartir <span className="inline-block">📤</span> en la barra inferior</li>
                <li>Selecciona "Agregar a pantalla de inicio"</li>
                <li>Toca "Agregar" en la esquina superior derecha</li>
              </ol>
            </div>
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 p-2 hover:bg-blue-800 rounded-lg transition-colors"
              aria-label="Cerrar"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar botón de instalación para Android/Chrome
  if (deferredPrompt && showPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-blue-900 text-white p-4 shadow-lg z-50 animate-slide-up">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <Download className="flex-shrink-0" size={32} />
            <div className="flex-1">
              <h3 className="font-bold text-lg">Instalar RTVC Programación</h3>
              <p className="text-sm text-blue-100">
                Accede más rápido y trabaja sin conexión instalando la app
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="bg-white text-blue-900 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors text-lg"
              >
                Instalar
              </button>
              <button
                onClick={handleDismiss}
                className="p-3 hover:bg-blue-800 rounded-lg transition-colors"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Botón para el menú (siempre visible si no está instalada)
export const InstallButton = () => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                               window.navigator.standalone;
    setIsStandalone(isInStandaloneMode);

    const handleBeforeInstallPrompt = () => {
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  if (isStandalone || !canInstall) {
    return null;
  }

  return (
    <button
      onClick={() => {
        window.dispatchEvent(new Event('rtvc-show-install-prompt'));
      }}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
    >
      <Download size={20} />
      <span className="hidden sm:inline">Instalar App</span>
      <span className="sm:hidden">Instalar</span>
    </button>
  );
};
