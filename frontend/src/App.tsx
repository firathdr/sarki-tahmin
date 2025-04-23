import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import 'bootstrap/dist/css/bootstrap.min.css'; // Bootstrap stilini import et
import { Modal, ModalBody, ModalHeader ,Progress} from "reactstrap";
import { Info as InfoIcon } from "lucide-react";
import { Helmet } from 'react-helmet';

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
    const progressPercentage = (limit[counter-1])*2;

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


    const togglePlay = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 20;

            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
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
        }
        setLoading(true);
        axios.get("https://sarki-tahmin-backend.onrender.com/random-audio")
            .then(response => {
                console.log(counter);
                setTrackUrl(`https://sarki-tahmin-backend.onrender.com${response.data.url}`);
                setTrackName(response.data.name);
                setCounter(0)
                setEndTime(limit[0]);
                setLoading(false);
            })
            .catch(() => setLoading(false));

    };
    const toggleUp = () => {
        setCounter(counter + 1);
        setEndTime(limit[counter]);
        if (counter==limit.length) {
            setCounter(0);
            setEndTime(limit[counter]);
            toggleNext(true);
        }
        console.log(counter);

    }



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
            <h1 className="display-4 text-success mb-4 text-center">Türkiş Songless</h1>

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
