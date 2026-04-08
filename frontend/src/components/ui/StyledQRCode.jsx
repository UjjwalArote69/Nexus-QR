import { useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';

/**
 * Renders a QR code using qr-code-styling library with support for
 * custom dot shapes, corner shapes, and logo overlay.
 */
const StyledQRCode = ({
  value = 'https://klink.io',
  size = 200,
  fgColor = '#000000',
  bgColor = '#ffffff',
  dotStyle = 'square',
  cornerSquareStyle = 'square',
  cornerDotStyle = 'square',
  logoDataUrl = null,
}) => {
  const containerRef = useRef(null);
  const qrRef = useRef(null);

  useEffect(() => {
    const options = {
      width: size,
      height: size,
      data: value,
      dotsOptions: {
        color: fgColor,
        type: dotStyle,
      },
      backgroundOptions: {
        color: bgColor,
      },
      cornersSquareOptions: {
        color: fgColor,
        type: cornerSquareStyle,
      },
      cornersDotOptions: {
        color: fgColor,
        type: cornerDotStyle,
      },
      qrOptions: {
        errorCorrectionLevel: 'H',
      },
    };

    if (logoDataUrl) {
      options.image = logoDataUrl;
      options.imageOptions = {
        crossOrigin: 'anonymous',
        margin: 4,
        imageSize: 0.3,
      };
    }

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling(options);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
        qrRef.current.append(containerRef.current);
      }
    } else {
      qrRef.current.update(options);
    }
  }, [value, size, fgColor, bgColor, dotStyle, cornerSquareStyle, cornerDotStyle, logoDataUrl]);

  return <div ref={containerRef} />;
};

export default StyledQRCode;
