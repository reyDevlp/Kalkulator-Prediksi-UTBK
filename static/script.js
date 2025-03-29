document.addEventListener("DOMContentLoaded", function() {
    // Daftar semua input field
    const inputFields = ['ppu', 'pu', 'pbm', 'pk', 'lbi', 'pm', 'lbe'];
    
    // Tambahkan event listener untuk setiap input
    inputFields.forEach(id => {
        document.getElementById(id).addEventListener('input', function() {
            try {
                calculateAndDisplay();
                clearError();
            } catch (error) {
                showError(error.message);
            }
        });
    });
});

function calculateAndDisplay() {
    // Ambil data dari input
    let data = {
        PPU: parseInt(document.getElementById("ppu").value) || 0,
        PU: parseInt(document.getElementById("pu").value) || 0,
        PBM: parseInt(document.getElementById("pbm").value) || 0,
        PK: parseInt(document.getElementById("pk").value) || 0,
        LBI: parseInt(document.getElementById("lbi").value) || 0,
        PM: parseInt(document.getElementById("pm").value) || 0,
        LBE: parseInt(document.getElementById("lbe").value) || 0
    };

    // Hitung hasil
    let results = calculateResults(data);
    
    // Tampilkan hasil
    displayResults(results);
}

function calculateResults(data) {
    const subtesData = {
        PPU: { total: 20 },
        PU: { total: 30 },
        PBM: { total: 20 },
        PK: { total: 20 },
        LBI: { total: 30 },
        PM: { total: 20 },
        LBE: { total: 20 }
    };

    let results = {};
    let totalBenar = 0;
    let totalSoal = 0;

    for (let subtes in data) {
        if (subtes in subtesData) {
            const inputValue = data[subtes];
            const total = subtesData[subtes].total;
            
            // Validasi input
            if (isNaN(inputValue)) {
                throw new Error(`Input untuk ${subtes} harus berupa angka`);
            }
            if (inputValue < 0) {
                throw new Error(`Input untuk ${subtes} tidak boleh negatif`);
            }
            if (inputValue > total) {
                throw new Error(`Input untuk ${subtes} tidak boleh lebih dari ${total}`);
            }

            const benar = Math.min(inputValue, total);
            const persentase = (benar / total) * 100;
            const skorUTBK = 200 + (persentase * 8);

            results[subtes] = {
                minimal_benar: benar,
                total_soal: total,
                persentase_benar: persentase,
                skor_utbk: skorUTBK,
                rumus_persentase: `(${benar}/${total}) × 100`,
                rumus_utbk: `200 + (${persentase.toFixed(0)} × 8)`
            };

            totalBenar += benar;
            totalSoal += total;
        }
    }

    const totalPersentase = (totalBenar / totalSoal) * 100;
    results.total = {
        minimal_benar: totalBenar,
        total_soal: totalSoal,
        persentase_benar: totalPersentase,
        skor_utbk: 200 + (totalPersentase * 8),
        rumus_persentase: `(${totalBenar}/${totalSoal}) × 100`,
        rumus_utbk: `200 + (${totalPersentase.toFixed(0)} × 8)`
    };

    return results;
}

function displayResults(data) {
    let outputDiv = document.getElementById("output");
    if (!outputDiv) return;
    
    let html = `
        <h3 style="margin-top: 0; color: #2c3e50;">Hasil Perhitungan</h3>
        <div style="margin-bottom: 20px;">
            <button onclick="downloadExcelTemplate()" style="margin-bottom: 10px;">Download Template Excel</button>
        </div>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
                <tr style="background-color: #f8f9fa;">
                    <th style="padding: 10px; border: 1px solid #ddd;">Subtes</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Minimal Benar</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Total Soal</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Persentase Benar</th>
                    <th style="padding: 10px; border: 1px solid #ddd;">Skor UTBK</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (let subtes in data) {
        if (subtes !== "total") {
            const item = data[subtes];
            html += `
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${subtes}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.minimal_benar}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.total_soal}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.persentase_benar.toFixed(2)}%</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${item.skor_utbk.toFixed(2)}</td>
                </tr>
            `;
        }
    }

    // Total row
    html += `
                <tr style="background-color: #f8f9fa; font-weight: bold;">
                    <td style="padding: 10px; border: 1px solid #ddd;">TOTAL</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.total.minimal_benar}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.total.total_soal}</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.total.persentase_benar.toFixed(2)}%</td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${data.total.skor_utbk.toFixed(2)}</td>
                </tr>
            </tbody>
        </table>
    `;

    outputDiv.innerHTML = html;
}

// Add this function to handle template download
function downloadExcelTemplate() {
    const templateData = [
        ["Subtes", "Minimal Benar", "Total Soal", "Persentase Benar", "Skor UTBK"],
        ["PPU", 15, 20, 75, 800],
        ["PU", 23, 30, 76.66666667, 813.3333333],
        ["PBM", 16, 20, 80, 840],
        ["PK", 13, 20, 65, 720],
        ["LBI", 23, 30, 76.66666667, 813.3333333],
        ["PM", 12, 20, 60, 680],
        ["LBE", 14, 20, 70, 760],
        ["TOTAL", 116, 160, 72.5, 780]
    ];
    
    const ws = XLSX.utils.aoa_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    XLSX.writeFile(wb, "Template_Pembobotan_UTBK.xlsx");
}

function showError(message) {
    clearError();
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = "block";
    }
    
    // Hilangkan error setelah 5 detik
    setTimeout(clearError, 5000);
}

function clearError() {
    const errorDiv = document.getElementById("error-message");
    if (errorDiv) {
        errorDiv.textContent = "";
        errorDiv.style.display = "none";
    }
}