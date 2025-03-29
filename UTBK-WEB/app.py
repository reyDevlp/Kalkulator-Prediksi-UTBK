from flask import Flask, render_template, send_from_directory
import pandas as pd
from io import BytesIO
import matplotlib.pyplot as plt
import numpy as np

app = Flask(__name__)

# Membaca data dari file Excel
file_path = "Perkiraan_Pembobotan_UTBK.xlsx"
df = pd.read_excel(file_path, sheet_name="Sheet1")

# Route untuk halaman utama
@app.route('/')
@app.route('/index.html')
def index():
    return render_template('index.html')

# Route untuk halaman info rumus
@app.route('/info_rumus')
@app.route('/info_rumus.html')
def info_rumus():
    return render_template('info_rumus.html')

# Route untuk halaman info Excel
@app.route('/info_rumus_excel')
@app.route('/info_rumus_excel.html')
def info_rumus_excel():
    return render_template('info_rumus_excel.html')

# Route untuk halaman coding Python
@app.route('/info_codingpython')
@app.route('/info_codingpython.html')
def info_codingpython():
    return render_template('info_codingpython.html')

# Route untuk halaman profil pembuat
@app.route('/nama_pembuat')
@app.route('/nama_pembuat.html')
def nama_pembuat():
    return render_template('nama_pembuat.html')

# Fungsi untuk menghitung skor (tetap pertahankan)
def hitung_skor(data):
    hasil = {}
    total_skor = 0
    total_benar = 0
    total_soal = 0

    for subtes, nilai in data.items():
        if subtes in df["Subtes"].values:
            row = df[df["Subtes"] == subtes].iloc[0]
            total_soal_subtes = row["Total Soal"]
            
            persentase_benar = (nilai / total_soal_subtes) * 100 if total_soal_subtes > 0 else 0
            skor_utbk = 200 + (persentase_benar * 8)
            skor_bobot = (nilai / total_soal_subtes) * row["Bobot"] if total_soal_subtes > 0 else 0

            hasil[subtes] = {
                "nama_subtes": row["Nama Subtes"],
                "skor": round(skor_bobot, 2),
                "persentase_benar": round(persentase_benar, 2),
                "skor_utbk": round(skor_utbk, 2),
                "minimal_benar": nilai,
                "total_soal": total_soal_subtes,
                "bobot": row["Bobot"]
            }
            
            total_skor += skor_bobot
            total_benar += nilai
            total_soal += total_soal_subtes

    persentase_total = (total_benar / total_soal) * 100 if total_soal > 0 else 0
    total_skor_utbk = 200 + (persentase_total * 8)
    
    hasil["total"] = {
        "minimal_benar": total_benar,
        "total_soal": total_soal,
        "persentase_benar": round(persentase_total, 2),
        "skor_utbk": round(total_skor_utbk, 2),
        "total_skor": round(total_skor, 2)
    }

    return hasil

# Fungsi untuk generate chart (tetap pertahankan)
def generate_chart_image(data):
    subtes = list(data.keys())
    values = list(data.values())
    
    plt.figure(figsize=(10, 6))
    bars = plt.bar(subtes, values, color='#4361ee')
    
    for bar in bars:
        height = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2., height,
                 f'{int(height)}',
                 ha='center', va='bottom')
    
    plt.title('Perbandingan Nilai Subtes UTBK')
    plt.xlabel('Subtes')
    plt.ylabel('Jumlah Benar')
    plt.ylim(0, max(values) + 5)
    plt.grid(axis='y', linestyle='--', alpha=0.7)
    
    img_buffer = BytesIO()
    plt.savefig(img_buffer, format='png', dpi=120, bbox_inches='tight')
    img_buffer.seek(0)
    plt.close()
    
    return img_buffer

# API endpoint untuk kalkulasi skor
@app.route('/api/calculate', methods=['POST'])
def calculate():
    data = request.json
    hasil_perhitungan = hitung_skor(data)
    return jsonify({
        "success": True,
        "data": hasil_perhitungan
    })

# API endpoint untuk generate chart
@app.route('/api/chart', methods=['POST'])
def get_chart():
    data = request.json
    chart_img = generate_chart_image(data)
    return send_file(
        chart_img,
        mimetype='image/png',
        as_attachment=True,
        download_name='chart_utbk.png'
    )

# API endpoint untuk info subtes
@app.route('/api/subtes-info')
def get_subtes_info():
    subtes_info = {}
    for _, row in df.iterrows():
        subtes_info[row["Subtes"]] = {
            "nama_lengkap": row["Nama Subtes"],
            "total_soal": row["Total Soal"],
            "bobot": row["Bobot"],
            "deskripsi": row.get("Deskripsi", "")
        }
    return jsonify(subtes_info)

if __name__ == '__main__':
    app.run(debug=True, port=5000)