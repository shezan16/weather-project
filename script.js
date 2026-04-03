function addRecord() {
    const data = {
        date: document.getElementById("date").value,
        temp: document.getElementById("temp").value,
        hum: document.getElementById("hum").value,
        rain: document.getElementById("rain").value
    };

    fetch('/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(() => {
         hideLoader();
        showSuccess();

        // 🔥 clear input
        document.getElementById("date").value = "";
        document.getElementById("temp").value = "";
        document.getElementById("hum").value = "";
        document.getElementById("rain").value = "";
    });

}
function searchRecord() {
    const searchDate = document.getElementById("searchDate").value.trim();

    if (!searchDate) {
        alert("Please enter a date to search");
        return;
    }

    fetch('/records')
    .then(res => res.json())
    .then(data => {

        const found = data.find(item => item.date === searchDate);

        if (found) {
            document.getElementById("result").innerText =
                `✅ Found → Temp: ${found.temp}°C | Humidity: ${found.hum}% | Rain: ${found.rain}mm`;
        } else {
            document.getElementById("result").innerText = "❌ No Record Found";
        }

    });
}
function showSuccess() {
    const box = document.getElementById("successBox");
    const sound = document.getElementById("successSound");

    // show popup
    box.classList.add("show");

    // play sound
    sound.play();

    // confetti
    launchConfetti();

    setTimeout(() => {
        box.classList.remove("show");
    }, 3000);
}

// 🎊 Simple Confetti
function launchConfetti() {
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let pieces = [];

    for (let i = 0; i < 100; i++) {
        pieces.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 6 + 2,
            speed: Math.random() * 3 + 2
        });
    }

    let animationId;

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
            ctx.fillStyle = `hsl(${Math.random()*360},100%,50%)`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speed;

            if (p.y > canvas.height) p.y = 0;
        });

        animationId = requestAnimationFrame(update);
    }

    update();

    // 🔥 stop after 3 sec
    setTimeout(() => {
        cancelAnimationFrame(animationId);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);
}

    function update() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        pieces.forEach(p => {
            ctx.fillStyle = `hsl(${Math.random()*360},100%,50%)`;
            ctx.fillRect(p.x, p.y, p.size, p.size);
            p.y += p.speed;

            if (p.y > canvas.height) p.y = 0;
        });

        requestAnimationFrame(update);
    }

    update();

    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 3000);

    // Show Loader
function showLoader() {
    document.getElementById("loader").style.display = "block";
}

// Hide Loader
function hideLoader() {
    document.getElementById("loader").style.display = "none";
}



// 🌦️ Weather Animation Controller

const rain = document.getElementById("rain");

// 👉 Random Rain Intensity
function controlRain() {
    const intensity = Math.random();

    if (intensity < 0.3) {
        rain.style.opacity = "0"; // No rain
    } 
    else if (intensity < 0.6) {
        rain.style.opacity = "0.2"; // Light rain
    } 
    else {
        rain.style.opacity = "0.4"; // Heavy rain
    }
}

// ⚡ Lightning Effect Control
function triggerLightning() {
    const flash = document.createElement("div");

    flash.style.position = "fixed";
    flash.style.top = 0;
    flash.style.left = 0;
    flash.style.width = "100%";
    flash.style.height = "100%";
    flash.style.background = "white";
    flash.style.opacity = "0.8";
    flash.style.zIndex = "999";
    flash.style.pointerEvents = "none";

    document.body.appendChild(flash);

    setTimeout(() => {
        flash.style.opacity = "0.2";
    }, 50);

    setTimeout(() => {
        flash.remove();
    }, 120);
}

// 🌩️ Random Lightning Interval
function autoLightning() {
    setInterval(() => {
        if (Math.random() > 0.7) {
            triggerLightning();
        }
    }, 4000);
}

// 🌈 Mouse Parallax Effect (Premium feel)
document.addEventListener("mousemove", (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;

    document.body.style.backgroundPosition = `${50 + x * 5}% ${50 + y * 5}%`;
});

// ⏱️ Run System
setInterval(controlRain, 3000);
autoLightning();
controlRain();

function dayNightMode() {
    const hour = new Date().getHours();

    if (hour >= 18 || hour <= 6) {
        document.body.style.filter = "brightness(0.6) hue-rotate(180deg)";
    } else {
        document.body.style.filter = "none";
    }
}

dayNightMode();

