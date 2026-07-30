/**
 * AI Producer Platform Studio App Logic
 */

let mediaRecorder = null;
let audioChunks = [];
let isRecording = false;
let audioBlob = null;
let audioContext = null;
let analyser = null;
let visualizerAnimationId = null;
let referenceAnalysisData = null;

// On Page Load
document.addEventListener("DOMContentLoaded", () => {
    initVisualizerCanvas();
    loadViralTrends();
});

// Canvas Audio Spectrum Initializer
function initVisualizerCanvas() {
    const canvas = document.getElementById("audioCanvas");
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Idle sine wave animation
    let phase = 0;
    function renderIdle() {
        if (isRecording && analyser) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";

        const width = canvas.width;
        const height = canvas.height;
        const midY = height / 2;

        for (let x = 0; x < width; x++) {
            const y = midY + Math.sin(x * 0.02 + phase) * 12 * Math.sin(x * 0.005);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.04;
        visualizerAnimationId = requestAnimationFrame(renderIdle);
    }

    renderIdle();
}

// MediaRecorder Toggle
async function toggleRecording() {
    const recordBtn = document.getElementById("recordBtn");
    const recordText = document.getElementById("recordText");
    const playVocalBtn = document.getElementById("playVocalBtn");
    const overlay = document.getElementById("visualizerOverlay");

    if (!isRecording) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                playVocalBtn.disabled = false;
                appendSystemChatMessage("🎙️ **Vokal Kaydı Tamamlandı!** Yapay zeka prodüktör vokalinizi analiz etti ve autotune zincirine hazırladı.");
            };

            mediaRecorder.start();
            isRecording = true;

            recordBtn.classList.add("recording");
            recordText.innerText = "Kayıt Durdur";
            overlay.style.display = "none";

            visualizeAudioLive();
        } catch (err) {
            alert("Mikrofon erişim izni verilmeli: " + err.message);
        }
    } else {
        if (mediaRecorder) mediaRecorder.stop();
        isRecording = false;

        recordBtn.classList.remove("recording");
        recordText.innerText = "Ses Kaydet";
    }
}

// Real-time Spectrum Visualizer
function visualizeAudioLive() {
    if (!analyser) return;

    const canvas = document.getElementById("audioCanvas");
    const ctx = canvas.getContext("2d");
    analyser.fftSize = 64;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
        if (!isRecording) return;
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * canvas.height;

            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, "#8B5CF6");
            gradient.addColorStop(1, "#06B6D4");

            ctx.fillStyle = gradient;
            ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);

            x += barWidth;
        }
    }
    draw();
}

function playVocalPreview() {
    if (!audioBlob) return;
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
}

function updateVocalFx() {
    const preset = document.getElementById("autotunePreset").value;
    appendSystemChatMessage(`🎚️ **Autotune Efekti Güncellendi:** ${preset.toUpperCase()} modu aktifleştirildi.`);
}

// Reference Audio Drag & Drop / Upload
function triggerFileInput() {
    document.getElementById("referenceInput").click();
}

async function handleReferenceUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch("/api/v1/audio/analyze-reference", {
            method: "POST",
            body: formData
        });
        const data = await res.json();
        referenceAnalysisData = data;

        document.getElementById("analysisResults").style.display = "grid";
        document.getElementById("resBpm").innerText = data.bpm;
        document.getElementById("resKey").innerText = data.key;
        document.getElementById("resEnergy").innerText = "%" + Math.round(data.energy_rating * 100);
        document.getElementById("resGroove").innerText = data.drum_groove;

        appendSystemChatMessage(`🎵 **Referans Audio Analiz Edildi!**\n- **BPM:** ${data.bpm}\n- **Ton:** ${data.key}\n- **Davul Akışı:** ${data.drum_groove}\nProdüktör bu parametrelere %100 sadık kalacak.`);
    } catch (err) {
        console.error("Reference upload error:", err);
    }
}

// Tab Switcher
function switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach(content => content.classList.remove("active"));

    const targetContent = document.getElementById(tabId);
    if (targetContent) targetContent.classList.add("active");

    event.currentTarget.classList.add("active");
}

// Chat Functions
async function sendMessage() {
    const input = document.getElementById("userInput");
    const text = input.value.trim();
    if (!text) return;

    appendUserChatMessage(text);
    input.value = "";

    try {
        const response = await fetch("/api/v1/producer/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                has_vocal: audioBlob !== null,
                reference_meta: referenceAnalysisData
            })
        });

        const data = await response.json();
        appendProducerChatMessage(data);
    } catch (err) {
        console.error("Chat API Error:", err);
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") sendMessage();
}

function sendQuickPrompt(promptText) {
    document.getElementById("userInput").value = promptText;
    sendMessage();
}

function appendUserChatMessage(msg) {
    const chatContainer = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "message user-msg";
    div.innerHTML = `
        <div class="msg-avatar"><i data-lucide="user"></i></div>
        <div class="msg-content"><p>${msg}</p></div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    lucide.createIcons();
}

function appendProducerChatMessage(data) {
    const chatContainer = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "message system-msg";
    div.innerHTML = `
        <div class="msg-avatar"><i data-lucide="bot"></i></div>
        <div class="msg-content">
            <h4>AI Prodüktör Yanıtı 🎧</h4>
            <p>${data.producer_message}</p>
            <div class="quick-prompts" style="margin-top:10px;">
                <span class="badge purple">BPM: ${data.beat_parameters.bpm}</span>
                <span class="badge green">Ton: ${data.beat_parameters.key}</span>
                <span class="badge gold">Mix: ${data.mastering_target}</span>
            </div>
        </div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    lucide.createIcons();
}

function appendSystemChatMessage(msgText) {
    const chatContainer = document.getElementById("chatMessages");
    const div = document.createElement("div");
    div.className = "message system-msg";
    div.innerHTML = `
        <div class="msg-avatar"><i data-lucide="zap"></i></div>
        <div class="msg-content"><p>${msgText}</p></div>
    `;
    chatContainer.appendChild(div);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    lucide.createIcons();
}

// Load Viral Trend Cards (Yapay Zekaya Aksiyon Aldır)
async function loadViralTrends() {
    const grid = document.getElementById("viralCardsGrid");
    grid.innerHTML = "<p>Viral trendler ve en popüler altyapılar taranıyor...</p>";

    try {
        const res = await fetch("/api/v1/trends/viral-beats");
        const data = await res.json();
        grid.innerHTML = "";

        data.trends.forEach(item => {
            const card = document.createElement("div");
            card.className = "viral-card";
            card.innerHTML = `
                <div>
                    <span class="viral-badge">🔥 Viral Score ${item.viral_score}</span>
                    <h3 style="margin-top:10px; font-size:1.1rem;">${item.title}</h3>
                    <p style="color:var(--text-secondary); font-size:0.8rem; margin-top:4px;">${item.original_reference}</p>
                    <p style="margin-top:10px; font-size:0.85rem;">${item.description}</p>
                </div>
                <div>
                    <div class="analysis-results" style="margin-bottom:12px;">
                        <div class="metric-pill">BPM: ${item.bpm}</div>
                        <div class="metric-pill">Ton: ${item.key}</div>
                    </div>
                    <button class="action-btn" onclick="applyViralBeatProposal('${item.title}', ${item.bpm}, '${item.key}')">
                        ⚡ Bu Viral Tarzda Beat Üret & Vokali Miksle
                    </button>
                </div>
            `;
            grid.appendChild(card);
        });
    } catch (err) {
        console.error("Viral load error:", err);
    }
}

function applyViralBeatProposal(title, bpm, key) {
    switchTab('producer-tab');
    document.getElementById("userInput").value = `Aksiyon Al: Viral trend '${title}' altyapısını (${bpm} BPM, ${key}) vokalimle birleştir.`;
    sendMessage();
}

// Modal Controls
function openSubscriptionModal() {
    document.getElementById("subModal").classList.add("active");
}

function closeSubscriptionModal() {
    document.getElementById("subModal").classList.remove("active");
}
