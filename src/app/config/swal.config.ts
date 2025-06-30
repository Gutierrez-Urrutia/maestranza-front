import Swal from 'sweetalert2';

// Configuración global simple de SweetAlert2
export const configureSweetAlert = () => {
  console.log('📋 Configurando SweetAlert2 con z-index máximo');
  
  // Inyectar CSS personalizado para SweetAlert
  const style = document.createElement('style');
  style.innerHTML = `
    .swal2-container {
      z-index: 999999 !important;
    }
    
    .swal2-popup {
      z-index: 999999 !important;
    }
    
    .swal2-backdrop-show {
      z-index: 999998 !important;
    }
    
    .swal2-toast {
      z-index: 999999 !important;
    }
  `;
  document.head.appendChild(style);
};
