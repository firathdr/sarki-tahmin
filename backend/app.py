from tkinter.font import names

from flask import Response
from flask import Flask, jsonify, send_from_directory
import os
import random
from flask_cors import CORS


app = Flask(__name__)
from flask_cors import CORS
CORS(app, resources={r"/random-audio": {"origins": "http://localhost:5173"}})


@app.route('/stream/<filename>')
def stream_music(filename):
    def generate():
        with open(f"C:\\Users\\firat\\Desktop\\songless\\müzik\\{filename}", "rb") as music_file:
            yield from music_file

    return Response(generate(), content_type="audio/mpeg")



# Ses dosyalarının bulunduğu dizin
AUDIO_DIRECTORY = 'C:\\Users\\firat\\Desktop\\songless\\müzik'  # Buraya ses dosyalarınızın bulunduğu dizini yazın
@app.route('/random-audio', methods=['GET'])
def get_random_audio():
    # Ses dosyalarını al
    try:
        audio_files = [f for f in os.listdir(AUDIO_DIRECTORY) if f.endswith('.mp3')]
        if not audio_files:
            return jsonify({'error': 'No audio files found'}), 404

        # Rastgele bir ses dosyası seç
        random_audio = random.choice(audio_files)
        audio_name=random_audio[:-4]
        audio_url = f'/audio-files/{random_audio}'  # Frontend'de kullanılacak URL
        print(audio_url)

        return jsonify({"url":audio_url,"name":audio_name,"list":get_names()})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
#şarkı isimleri
@app.route('/audio_names',methods=["GET"])
def get_names():
    try:
        audio_files = [f for f in os.listdir(AUDIO_DIRECTORY) if f.endswith('.mp3')]
        audios=[]
        for i in audio_files:
            audios.append(i[:-4])
        return audios
    except Exception as e:
        return jsonify({'error': str(e)}), 500



# Ses dosyalarını sunma
@app.route('/audio-files/<filename>')
def get_audio(filename):
    return send_from_directory(AUDIO_DIRECTORY, filename, mimetype='audio/mpeg')


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000,debug=True)


