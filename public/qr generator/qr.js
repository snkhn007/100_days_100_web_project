const qrType = document.getElementById('qr-type');
const inputText = document.getElementById('inputtext');

const wifiInputs = document.getElementById('wifi-inputs');
const vcardInputs = document.getElementById('vcard-inputs');

const qrColor = document.getElementById('qr-color');
const qrShape = document.getElementById('qr-shape');

const errorCorrection = document.getElementById('error-correction');

const generateBtn = document.querySelector('.submit');

const qrcodeDiv = document.getElementById('qrcode');

const downloadBtn = document.getElementById('download-qr');

const scanBtn = document.getElementById('scan-qr');

const qrReader = document.getElementById('qr-reader');

const qrReaderResults =
document.getElementById('qr-reader-results');

let qrcode = null;

/* INPUT FIELDS */

function updateInputFields(){

    const selectedType = qrType.value;

    inputText.style.display =
    (selectedType === 'text' ||
    selectedType === 'url')
    ? 'block'
    : 'none';

    wifiInputs.style.display =
    selectedType === 'wifi'
    ? 'block'
    : 'none';

    vcardInputs.style.display =
    selectedType === 'vcard'
    ? 'block'
    : 'none';
}

qrType.addEventListener('change',
updateInputFields);

/* GENERATE QR */
function generateQRCode(){

    qrcodeDiv.innerHTML = '';

    let data = '';

    switch(qrType.value){

        case 'text':
        case 'url':
            data = inputText.value;
            break;

        case 'wifi':

            const ssid =
            document.getElementById('wifi-ssid').value;

            const password =
            document.getElementById('wifi-password').value;

            const encryption =
            document.getElementById('wifi-encryption').value;

            data =
            `WIFI:T:${encryption};S:${ssid};P:${password};;`;

            break;

        case 'vcard':

            const name =
            document.getElementById('vcard-name').value;

            const phone =
            document.getElementById('vcard-phone').value;

            const email =
            document.getElementById('vcard-email').value;

            const website =
            document.getElementById('vcard-website').value;

            data =
`BEGIN:VCARD
VERSION:3.0
N:${name}
TEL:${phone}
EMAIL:${email}
URL:${website}
END:VCARD`;

            break;
    }

    if(data.trim() !== ''){

        qrcode = new QRCode(qrcodeDiv,{
            text:data,
            width:220,
            height:220,
            colorDark:qrColor.value,
            colorLight:"#ffffff",
            correctLevel:
            QRCode.CorrectLevel[errorCorrection.value]
        });

        setTimeout(()=>{

            const qrImage =
            qrcodeDiv.querySelector('img');

            const qrCanvas =
            qrcodeDiv.querySelector('canvas');

            if(qrShape.value === 'rounded'){

                if(qrImage){
                    qrImage.style.borderRadius = '15px';
                }

                if(qrCanvas){
                    qrCanvas.style.borderRadius = '15px';
                }
            }

        },200);
    }
}

generateBtn.addEventListener('click',
generateQRCode);

/* DOWNLOAD */

downloadBtn.addEventListener('click',()=>{

    const qrImage =
    qrcodeDiv.querySelector('img');

    const qrCanvas =
    qrcodeDiv.querySelector('canvas');

    const link =
    document.createElement('a');

    link.download = 'qrcode.png';

    if(qrImage){
        link.href = qrImage.src;
    }

    else if(qrCanvas){
        link.href = qrCanvas.toDataURL();
    }

    else{
        alert("Generate QR Code first");
        return;
    }

    link.click();
});
/* SCAN */

scanBtn.addEventListener('click',()=>{

    if(qrReader.style.display === 'none'){

        qrReader.style.display = 'block';

        const html5QrCode =
        new Html5Qrcode("qr-reader");

        html5QrCode.start(
            { facingMode:"environment" },
            { qrbox:250 },

            (decodedText)=>{

                qrReaderResults.innerHTML =
                `<p>Decoded QR: ${decodedText}</p>`;

                html5QrCode.stop();

                qrReader.style.display = 'none';
            }
        );

    }else{

        qrReader.style.display = 'none';
    }
});

/* THEME SWITCHER */

const themeButtons =
document.querySelectorAll('.theme-btn');

themeButtons.forEach(button=>{

    button.addEventListener('click',()=>{

        const selectedTheme =
        button.dataset.theme;

        document.body.setAttribute(
            'data-theme',
            selectedTheme
        );

        localStorage.setItem(
            'selectedTheme',
            selectedTheme
        );
    });
});

/* LOAD SAVED THEME */

window.addEventListener('DOMContentLoaded',()=>{

    const savedTheme =
    localStorage.getItem('selectedTheme');

    if(savedTheme){

        document.body.setAttribute(
            'data-theme',
            savedTheme
        );
    }

    updateInputFields();
});