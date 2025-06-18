from flask import Flask, render_template, request, redirect, url_for, send_file
import os
import base64
from datetime import datetime

app = Flask(__name__)

UPLOAD_FOLDER = 'static/temp'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/camera')
def camera():
    return render_template('camera.html')

@app.route('/result', methods=['POST'])
def result():
    image_data = request.form.get('image')
    if image_data:
        header, encoded = image_data.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        filename = f"polaroid_{datetime.now().strftime('%Y%m%d%H%M%S')}.png"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        with open(filepath, 'wb') as f:
            f.write(image_bytes)
        return redirect(url_for('show_result', filename=filename))
    return 'No image received', 400

@app.route('/result/<filename>')
def show_result(filename):
    image_url = url_for('static', filename=f'temp/{filename}')
    return render_template('result.html', image_url=image_url)

@app.route('/download/<filename>')
def download_image(filename):
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    return send_file(filepath, as_attachment=True)

if __name__ == '__main__':
    app.run(debug=True)
