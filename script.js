const startScannerButton = document.getElementById('startScanner');
const cameraContainer = document.getElementById('cameraContainer');
const placeholder = document.getElementById('placeholder');
const video = document.getElementById('cameraStream');
const canvas = document.getElementById('canvas');
const resultElement = document.getElementById('result');

let isScanning = false;

function hidePlaceholder() {
  placeholder.style.display = 'none';
}

function onBarcodeDetected(result) {
  if (result && result.codeResult && !isScanning) {
    isScanning = true;
    const barcodeData = result.codeResult.code;
    console.log('Detected barcode:', barcodeData);

    // Display the barcode result in the resultElement
    resultElement.textContent = `Detected barcode: ${barcodeData}`;

    // Stop the QuaggaJS scanner and close the camera video
    Quagga.stop();
    video.srcObject.getTracks().forEach(track => track.stop());

    // Show the cameraContainer div (if you want to show the video again)
    // cameraContainer.style.display = 'block';
  }
}

function initScanner() {
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      .then((stream) => {
        video.srcObject = stream;
        cameraContainer.style.display = 'block';
        hidePlaceholder();

        Quagga.init({
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: video,
          },
          locator: {
            patchSize: 'medium',
            halfSample: true,
          },
          decoder: {
            readers: ['code_128_reader', 'ean_reader', 'upc_reader', 'code_39_reader', 'code_93_reader'],
          },
        }, function (err) {
          if (err) {
            console.error('Error initializing Quagga:', err);
            return;
          }
          console.log('Initialization successful.');

          Quagga.onDetected(onBarcodeDetected);
          Quagga.start();
        });
      })
      .catch((error) => {
        console.error('Error accessing rear camera:', error);
        resultElement.textContent = 'Error accessing rear camera. Please make sure the camera is available and accessible.';
      });
  } else {
    // Browser does not support getUserMedia
    console.error('getUserMedia not supported on this browser.');
    resultElement.textContent = 'Your browser does not support accessing the camera.';
  }
}

startScannerButton.addEventListener('click', initScanner);
                      