import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap stilini import et
import { Modal, ModalBody, ModalHeader, Progress } from "reactstrap";
import { Info as InfoIcon } from "lucide-react";
import { Helmet } from 'react-helmet';
import { io, Socket } from 'socket.io-client';

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [trackUrl, setTrackUrl] = useState<string>("");
    const [trackName, setTrackName] = useState<string>("");
    const [startTime] = useState<number>(20); // Başlangıç süresi
    const limit=[30,35,40,50,55,60];
    const [endTime, setEndTime] = useState<number>(limit[0]); // Bitiş süresi
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [liste, setListe] = useState<string>("");
    const [query, setQuery] = useState<string>("");
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number>(-1);
    const [skor,setSkor] = useState<number>(0);
    const [counter,setCounter] = useState<number>(0);
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const toggleInfoModal = () => setModalOpen(!modalOpen);
    //const progressPercentage = (limit[counter-1])*2;
    const [inputPlaylistId, setInputPlaylistId] = useState(''); // Kullanıcının gireceği playlist ID'si için state
    
    // İlerleme çubuğu için yeni state'ler
    const [downloadProgress, setDownloadProgress] = useState<number>(0);
    const [isDownloading, setIsDownloading] = useState<boolean>(false);
    const [downloadStatus, setDownloadStatus] = useState<string>("");
    
    // Socket.IO bağlantısı için ref
    const socketRef = useRef<Socket | null>(null);

    // Socket.IO bağlantısını kur
    useEffect(() => {
        // Socket.IO bağlantısını kur
        socketRef.current = io('https://sarki-tahmin-backend.onrender.com');
        
        // Socket.IO event listener'ları
        if (socketRef.current) {
            socketRef.current.on('connect', () => {
                console.log('Socket.IO bağlantısı kuruldu');
            });
            
            socketRef.current.on('download_progress', (data) => {
                setDownloadProgress(data.progress);
                setDownloadStatus(data.status || `İndiriliyor... ${data.progress}%`);
                
                // İndirme tamamlandığında state'leri güncelle
                if (data.progress === 100) {
                    setIsDownloading(false);
                    setLoading(false);
                    
                    // 3 saniye sonra progress'i sıfırla
                    setTimeout(() => {
                        setDownloadProgress(0);
                        setDownloadStatus("");
                    }, 3000);
                }
            });
            
            socketRef.current.on('disconnect', () => {
                console.log('Socket.IO bağlantısı kesildi');
            });
            
            socketRef.current.on('error', (error) => {
                console.error('Socket.IO hatası:', error);
            });
        }
        
        // Cleanup
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    // Backend'den doğru URL'yi almak
    useEffect(() => {
        setLoading(true);
        axios.get("https://sarki-tahmin-backend.onrender.com/random-audio")
            .then(response => {
                setTrackUrl(`https://sarki-tahmin-backend.onrender.com${response.data.url}`);
                setTrackName(response.data.name);
                setListe(response.data.list);
                console.log(response.data.name);
                setLoading(false);
            })
            .catch(() => setLoading(false));
            toggleInfoModal();

    }, []);


    const togglePlay = async () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 20;

            if (isPlaying) {
                audioRef.current.pause();
            } else {
                try {
                    await audioRef.current.play();
                } catch (error) {
                    console.error("Oynatma hatası:", error);
                }
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            // Eğer ses bitiş süresine ulaşırsa, durdur
            if (audioRef.current.currentTime >= startTime+endTime) {
                console.log(startTime+endTime);
                audioRef.current.pause();
                setIsPlaying(false);
            }
        }
    };

    const toggleNext = (deger:boolean) => {
        if (deger) {
            alert("Doğru cevap = "+trackName )
            setIsPlaying(false);
        }
        setLoading(true);
        
        // trackName boş değilse silme işlemi yap
        if (trackName && trackName.trim() !== '') {
            axios.get(`https://sarki-tahmin-backend.onrender.com/delete-music/${trackName}`)
                .catch(error => {
                    console.error("Silme hatası:", error);
                });
        }
        
        axios.get("https://sarki-tahmin-backend.onrender.com/random-audio")
            .then(response => {
                console.log(counter);
                setTrackUrl(`https://sarki-tahmin-backend.onrender.com${response.data.url}`);
                setTrackName(response.data.name);
                setCounter(0)
                setEndTime(limit[0]);
                setLoading(false);
            })
            .catch((error) => {
                console.error("Random audio hatası:", error);
                setLoading(false);
            });
    };
    const toggleDownload = (playlistId: string) => {
        if (!playlistId || playlistId.trim() === '') {
            alert("Lütfen geçerli bir YouTube Playlist ID'si girin!");
            return;
        }

        // İndirme durumunu başlat
        setIsDownloading(true);
        setDownloadProgress(0);
        setDownloadStatus("İndirme başlatılıyor...");
        setLoading(true);

        // Socket.IO üzerinden indirme başlat
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit('start_download', {
                playlist_id: playlistId
            });
        } else {
            // Socket.IO bağlantısı yoksa hata mesajı göster
            setDownloadStatus("Bağlantı hatası! Lütfen sayfayı yenileyin.");
            setIsDownloading(false);
            setLoading(false);
            return;
        }

        // Backend endpoint'ine GET isteği (artık gerekli değil, sadece Socket.IO kullanıyoruz)
        // axios.get(`http://127.0.0.1:5000/playlist-link/${playlistId}`)
        //     .then(response => {
        //         // Sunucudan gelen cevaba göre state'leri güncelle
        //         setTrackUrl(`http://127.0.0.1:5000${response.data.url}`);
        //         setTrackName(response.data.name);
        //         setListe(response.data.list);
        //         console.log("Sunucudan gelen cevap:", response.data);
        //         
        //         // Polling'i durdur
        //         clearInterval(progressInterval);
        //         
        //         // İndirme tamamlandı
        //         setDownloadProgress(100);
        //         setDownloadStatus("İndirme tamamlandı!");
        //         setLoading(false);
        //         setIsDownloading(false);
        //         
        //         // 2 saniye sonra progress'i sıfırla
        //         setTimeout(() => {
        //             setDownloadProgress(0);
        //             setDownloadStatus("");
        //         }, 2000);
        //     })
        //     .catch(error => {
        //         console.error("İndirme isteği sırasında hata oluştu:", error);
        //         
        //         // Polling'i durdur
        //         clearInterval(progressInterval);
        //         
        //         setDownloadStatus("İndirme sırasında hata oluştu!");
        //         setLoading(false);
        //         setIsDownloading(false);
        //         
        //         // 3 saniye sonra hata mesajını temizle
        //         setTimeout(() => {
        //             setDownloadProgress(0);
        //             setDownloadStatus("");
        //         }, 3000);
        //     });
    };
    /*const toggleUp = () => {
        setCounter(counter + 1);
        setEndTime(limit[counter]);
        if (counter==limit.length) {
            setCounter(0);
            setEndTime(limit[counter]);
            toggleNext(true);
        }
        console.log(counter);

    }*/



    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown") {
            setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        } else if (e.key === "ArrowUp") {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === "Enter") {
            if (selectedIndex >= 0) {
                setQuery(suggestions[selectedIndex]);
                setSuggestions([]);
                setSelectedIndex(-1);
            }
        }
    };
    const handleSuggestionClick = (song: string) => {
        setQuery(song);
        setSuggestions([]);
        setSelectedIndex(-1);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setQuery(value);
    
        if (value) {
            // Ensure 'liste' is an array before filtering
            const filtered = Array.isArray(liste)
                ? liste.filter((song: string) => song.toLowerCase().includes(value.toLowerCase()))
                : [];
            setSuggestions(filtered);
        } else {
            setSuggestions([]);
        }
    };
    
    const handleSubmit = () => {
        if (query.trim().toLowerCase() === trackName.toLowerCase()) {
            setCounter(0);
            alert("Doğru cevap!");
            setSkor(skor+1);
            toggleNext(false);
        } else {
            alert("Yanlış cevap, tekrar deneyin.");
        }
        setQuery("");
    };

    return (
        <div>
            <Helmet>
                <title>Şarkıyı Bil
                
                </title>
            </Helmet>

        <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-dark text-white p-4">
            <button
                onClick={toggleInfoModal}
                className="btn btn-link text-info position-absolute top-0 start-0 m-3 p-2"
                style={{fontSize: "1.5rem"}}
            >
                <InfoIcon />

            </button>

            <Modal isOpen={modalOpen} toggle={toggleInfoModal} centered>
                <ModalHeader toggle={toggleInfoModal}>Bilgi</ModalHeader>
                <ModalBody>
                    <p>
                        <strong>Şarkıyı Bil</strong>
                        <br/>
                        Rastgele Şarkıların kısa bir aralığını dinleyerek tahmin edin.
                        Sunucu inaktife düşmesi sebebiyle 3-4 dakika içinde oyun oynanabilir duruma geçicektir.
                    </p>
                </ModalBody>
            </Modal>
            <h1 className="display-4 text-success mb-4 text-center">Şarkıyı Bil</h1>

            {loading ? (
                <p>Loading song...</p>
            ) : (
                <>
                    <div className="mb-4">

                        <audio
                            ref={audioRef}
                            src={trackUrl}
                            controls
                            onTimeUpdate={handleTimeUpdate}
                            className="w-100"
                        />
                    </div>
                    <div className="mb-3 w-50 position-relative">
                        <input
                            type="text"
                            className="form-control"
                            value={query}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Type song name..."
                        />
                        {suggestions.length > 0 && (
                            <ul className="list-group position-absolute w-100 mt-1">
                                {suggestions.map((song, index) => (
                                    <li
                                        key={index}
                                        className={`list-group-item list-group-item-action ${
                                            index === selectedIndex ? "active" : ""
                                        }`}
                                        onMouseDown={() => handleSuggestionClick(song)}
                                    >
                                        {song}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                    <div className="mb-4 w-90 position-relative">
                        <button className="btn btn-success mt-2" onClick={handleSubmit}>
                            Gönder
                        </button>
                    </div>

                    <div className="d-flex justify-content-center gap-3 mb-4">
                        <button
                            onClick={togglePlay}
                            className="btn btn-outline-success btn-lg"
                        >
                            {isPlaying ? "Pause" : "Play"}
                        </button>
                        {/*
                            <button
                                onClick={toggleUp}
                                className="btn btn-outline-info btn-lg"
                            >
                                Help?
                            </button>
                        */}

                        <button
                            onClick={() => toggleNext(true)}
                            className="btn btn-outline-primary btn-lg"
                        >
                        Next
                        </button>
                        <div>
                            {/* Kullanıcının playlist ID'sini gireceği input alanı */}
                            <input
                                type="text"
                                value={inputPlaylistId}
                                onChange={(e) => setInputPlaylistId(e.target.value)}
                                placeholder="YouTube Playlist ID'sini girin"
                                className="form-control mb-3"
                            />

                            {/* İndirme Butonu */}
                            <button
                                onClick={() => toggleDownload(inputPlaylistId)}
                                className="btn btn-outline-primary btn-lg"
                                disabled={isDownloading}
                            >
                                {isDownloading ? 'İndiriliyor...' : 'Download List'}
                            </button>

                            {/* İlerleme Çubuğu */}
                            {isDownloading && (
                                <div className="mt-3">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <span className="text-muted">İndirme İlerlemesi</span>
                                        <span className="badge bg-primary">{Math.round(downloadProgress)}%</span>
                                    </div>
                                    <Progress 
                                        value={downloadProgress} 
                                        color="success"
                                        className="mb-2"
                                        animated={downloadProgress < 100}
                                    />
                                    <small className="text-muted">{downloadStatus}</small>
                                </div>
                            )}

                            {/* Tamamlanma/Hata Mesajı */}
                            {!isDownloading && downloadStatus && (
                                <div className="mt-2">
                                    <div className={`alert alert-${downloadProgress === 100 ? 'success' : 'danger'} py-2`}>
                                        <small>{downloadStatus}</small>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="position-absolute top-0 end-0 m-3">
                            <span className="badge bg-success fs-5">Doğru Sayısı: {skor}</span>
                        </div>

                    </div>

                    <div className="w-50">
                        {/*    <Progress value={progressPercentage} color="info">
                        {limit[counter-1]}
                        </Progress>*/}
                    </div>
                </>

            )}
        </div>
        </div>

    );

}
