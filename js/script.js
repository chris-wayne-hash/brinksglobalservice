const validateBtn = document.getElementById("validateBtn");
const tokenInput = document.getElementById("tokenInput");
const tokenValid = document.getElementById("tokenValid");
const trackBtn = document.getElementById("trackBtn");
const roadmapSection = document.getElementById("roadmapSection");
const currentStatus = document.getElementById("currentStatus");
const estimatedDelivery = document.getElementById("estimatedDelivery");
const roadmapNodes = document.querySelectorAll(".roadmap-node");
const roadmapLine = document.querySelector(".roadmap-line");
const statusSection = document.getElementById("statusSection");
const statusSteps = document.querySelectorAll(".status-step");
const toast = document.getElementById("toast");

// Check for token in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const tokenFromUrl = urlParams.get('token');

if (tokenFromUrl) {
    tokenInput.value = tokenFromUrl;
    // Auto-validate if token is in URL
    setTimeout(() => {
        validateBtn.click();
    }, 500);
}

validateBtn.addEventListener("click", () => {
    const token = tokenInput.value.trim();
    
    if (token === "") {
        showError("Please enter a tracking token");
        return;
    }
    
    if (isValidToken(token)) {
        showTokenValid();
        showTrackButton();
        hideOldStatusSection(); // Hide the old timeline
    } else {
        // If user entered 12 characters but token is incorrect, show a clear Invalid Token message
        if (token.length === 12) {
            showError("Invalid Token");
        } else {
            showError("Invalid token format. Must be 12 uppercase alphanumeric characters.");
        }
        hideTrackButton();
        hideRoadmap();
        hideOldStatusSection();
    }
});

// Track button event listener
trackBtn.addEventListener("click", () => {
    startTrackingAnimation();
    showRoadmap();
    hideOldStatusSection();
});

// Add Enter key support for the input field
tokenInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        validateBtn.click();
    }
});

// Function to validate token format: 12 uppercase alphanumeric characters
function isValidToken(token) {
    return token === "AU46718ED4H2";
}

function showTokenValid() {
    tokenValid.textContent = "✔ Token Valid - Ready to Track";
    tokenValid.style.color = "#4caf50";
    tokenValid.style.opacity = "1";
}

function hideTokenValid() {
    tokenValid.style.opacity = "0";
}

function showTrackButton() {
    trackBtn.classList.remove("hidden");
    setTimeout(() => {
        trackBtn.classList.add("show");
    }, 50);
}

function hideTrackButton() {
    trackBtn.classList.remove("show");
    setTimeout(() => {
        trackBtn.classList.add("hidden");
    }, 300);
}

function showRoadmap() {
    roadmapSection.classList.remove("hidden");
    setTimeout(() => {
        roadmapSection.classList.add("show");
    }, 50);
}

function hideRoadmap() {
    roadmapSection.classList.remove("show");
    setTimeout(() => {
        roadmapSection.classList.add("hidden");
    }, 300);
}

function showOldStatusSection() {
    statusSection.classList.remove("hidden");
    setTimeout(() => {
        statusSection.classList.add("show");
    }, 50);
}

function hideOldStatusSection() {
    statusSection.classList.remove("show");
    setTimeout(() => {
        statusSection.classList.add("hidden");
    }, 300);
}

function showError(message) {
    tokenValid.textContent = "✗ " + message;
    tokenValid.style.color = "#f44336";
    tokenValid.style.opacity = "1";
    
    showToast(message, "error");
    
    setTimeout(() => {
        if (tokenValid.style.color === "rgb(244, 67, 54)") {
            tokenValid.style.opacity = "0";
        }
    }, 3000);
}

// NEW ROADMAP TRACKING ANIMATION - PAUSES AT IN TRANSIT
function startTrackingAnimation() {
    // Reset everything first
    resetRoadmap();
    
    // Update tracking info
    updateTrackingInfo("Starting tracking...", "Calculating...");
    
    // Define tracking stages - animation will pause at "In Transit"
    const trackingStages = [
        { 
            status: "Processed", 
            nodeIndex: 0,
            delay: 1000,
            message: "Gold shipment confirmed and processed",
            deliveryEstimate: "5-7 business days",
            progressPercent: 33
        },
        { 
            status: "In Transit", 
            nodeIndex: 1,
            delay: 3000,
            message: "Gold in secure transit - Tracking active",
            deliveryEstimate: "3-5 business days",
            progressPercent: 66,
            pauseHere: true
        },
        { 
            status: "Delivered", 
            nodeIndex: 2,
            delay: 5000,
            message: "Gold shipment successfully delivered",
            deliveryEstimate: "Completed",
            progressPercent: 100
        }
    ];
    
    // Start the tracking animation
    let totalProgress = 0;
    
    trackingStages.forEach((stage, index) => {
        // Skip the Delivered stage - animation pauses at In Transit
        if (stage.pauseHere) {
            setTimeout(() => {
                // Mark previous nodes as completed
                if (index > 0) {
                    roadmapNodes[index - 1].classList.remove("active");
                    roadmapNodes[index - 1].classList.add("completed");
                }
                
                // Activate current node
                roadmapNodes[stage.nodeIndex].classList.add("active");
                roadmapNodes[stage.nodeIndex].classList.remove("completed");
                
                // Update progress line
                totalProgress = stage.progressPercent;
                updateProgressLine(totalProgress);
                
                // Update tracking info
                updateTrackingInfo(stage.message, stage.deliveryEstimate);
                
                // Add continuous pulse animation to indicate ongoing transit
                const activeNode = roadmapNodes[stage.nodeIndex];
                if (activeNode) {
                    const nodeCircle = activeNode.querySelector('.node-circle');
                    if (nodeCircle) {
                        nodeCircle.style.animation = "circleGlow 1.5s infinite, goldPulse 2s infinite";
                    }
                }
                
                // Show pause alert after animation completes
                setTimeout(() => {
                    showToast("Shipment has been Paused", "info", 7000);
                }, 800);
            }, stage.delay);
        } else if (!stage.pauseHere && index < trackingStages.length - 1) {
            // Only show stages before the pause point
            setTimeout(() => {
                // Mark previous nodes as completed
                if (index > 0) {
                    roadmapNodes[index - 1].classList.remove("active");
                    roadmapNodes[index - 1].classList.add("completed");
                }
                
                // Activate current node
                roadmapNodes[stage.nodeIndex].classList.add("active");
                roadmapNodes[stage.nodeIndex].classList.remove("completed");
                
                // Update progress line
                totalProgress = stage.progressPercent;
                updateProgressLine(totalProgress);
                
                // Update tracking info
                updateTrackingInfo(stage.message, stage.deliveryEstimate);
            }, stage.delay);
        }
    });
}

function resetRoadmap() {
    // Reset all nodes
    roadmapNodes.forEach(node => {
        node.classList.remove("active", "completed");
        // Reset any special animations
        const nodeCircle = node.querySelector('.node-circle');
        if (nodeCircle) {
            nodeCircle.style.animation = "";
        }
    });
    
    // Reset progress line
    updateProgressLine(0);
}

function updateProgressLine(progress) {
    // Set CSS variable for progress line
    document.documentElement.style.setProperty('--progress', `${progress}%`);
    
    // Also update the ::after pseudo-element
    if (roadmapLine) {
        roadmapLine.style.setProperty('--progress', `${progress}%`);
    }
}

function updateTrackingInfo(status, delivery) {
    if (currentStatus) currentStatus.textContent = status;
    if (estimatedDelivery) estimatedDelivery.textContent = delivery;
}

function showToast(message, type = "info", duration = 7000) {
    if (type === "error") {
        toast.style.borderColor = "#f44336";
        toast.style.backgroundColor = "#2c1c1c";
    } else {
        toast.style.borderColor = "var(--gold)";
        toast.style.backgroundColor = "#1c1c1c";
    }
    
    toast.textContent = message;
    toast.classList.add("show");
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, duration);
}

// Input formatting
tokenInput.addEventListener("input", function() {
    // Convert to uppercase
    this.value = this.value.toUpperCase();
    
    // Remove any non-alphanumeric characters
    this.value = this.value.replace(/[^A-Z0-9]/g, '');
    
    // Limit to 12 characters
    if (this.value.length > 12) {
        this.value = this.value.substring(0, 12);
    }
});

// Visual feedback for valid/invalid tokens as user types
tokenInput.addEventListener("keyup", function() {
    const token = this.value.trim();
    
    if (token.length === 0) {
        // Reset to default state when empty
        tokenValid.style.opacity = "0";
        tokenInput.style.borderColor = "";
    } else if (isValidToken(token)) {
        // Show green border for valid token
        tokenInput.style.border = "2px solid #4caf50";
    } else {
        // Show red border for invalid token
        tokenInput.style.border = "2px solid #f44336";
    }
});

// Optional: Add example token button for testing
function addExampleTokenButton() {
    const exampleBtn = document.createElement("button");
    exampleBtn.textContent = "Use Example Token";
    exampleBtn.style.cssText = `
        margin-top: 10px;
        padding: 0.5rem 1rem;
        background: transparent;
        color: var(--gold);
        border: 1px solid var(--gold);
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
    `;
    
    exampleBtn.addEventListener("click", function() {
        // Example valid token: 12 uppercase alphanumeric characters
        const exampleToken = "ABC123DEF456";
        tokenInput.value = exampleToken;
        tokenInput.style.border = "2px solid #4caf50";
    });
    
    // Add the button after the token input group
    const tokenSection = document.querySelector(".token-section");
    if (tokenSection && tokenValid) {
        tokenSection.insertBefore(exampleBtn, tokenValid.nextSibling);
    }
}

// Uncomment if you want the example button
// addExampleTokenButton();

// Initialize progress line
updateProgressLine(0);

// Position vertical line so it connects to the wrap connector nodes
function positionRoadmapLine() {
    const origin = document.querySelector('.origin-wrap');
    const dest = document.querySelector('.destination-wrap');
    const container = document.querySelector('.roadmap-container');
    const line = document.querySelector('.roadmap-line');

    if (!origin || !dest || !container || !line) return;

    const originRect = origin.getBoundingClientRect();
    const destRect = dest.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // The CSS places the connector circle at right: -34px and it's 12px wide (see .roadmap-wrap::before)
    const connectorOffset = 34; // px
    const connectorRadius = 6; // half of 12px

    // Calculate left position relative to container
    const leftPx = originRect.right - containerRect.left - connectorOffset + connectorRadius;

    // Calculate top (y) for origin connector center and bottom distance for destination connector center
    const originCenterY = originRect.top - containerRect.top + originRect.height / 2;
    const destCenterY = destRect.top - containerRect.top + destRect.height / 2;

    const bottomPx = containerRect.height - destCenterY;

    // Apply as inline styles (px values)
    line.style.left = `${leftPx}px`;
    line.style.top = `${originCenterY}px`;
    line.style.bottom = `${bottomPx}px`;
}

// Run on load and resize
window.addEventListener('load', () => {
    positionRoadmapLine();
    // also recalc after a short delay for fonts/images
    setTimeout(positionRoadmapLine, 300);
});

window.addEventListener('resize', () => {
    positionRoadmapLine();
});




document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('pixie-dust-container');
    let mouseX = 0;
    let mouseY = 0;
    let particles = [];
    let particleCount = 15;
    let lastParticleTime = 0;
    const particleInterval = 50; // ms between particle creation

    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Create particles at regular intervals
        const now = Date.now();
        if (now - lastParticleTime > particleInterval) {
            createParticles(3);
            lastParticleTime = now;
        }
    });

    // Create multiple particles at once
    function createParticles(count) {
        for (let i = 0; i < count; i++) {
            createParticle();
        }
    }

    // Create a single particle
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'pixie-particle';
        
        // Random size variation
        const size = 5 + Math.random() * 6;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        
        // Position at mouse with slight random offset
        const offsetX = (Math.random() - 0.5) * 30;
        const offsetY = (Math.random() - 0.5) * 30;
        particle.style.left = `${mouseX + offsetX}px`;
        particle.style.top = `${mouseY + offsetY}px`;
        
        // Random opacity
        const opacity = 0.5 + Math.random() * 0.5;
        particle.style.opacity = opacity;
        
        // Add sparkle effect to some particles
        if (Math.random() > 0.7) {
            particle.classList.add('sparkle');
        }
        
        container.appendChild(particle);
        particles.push({
            element: particle,
            x: mouseX + offsetX,
            y: mouseY + offsetY,
            velocityX: (Math.random() - 0.5) * 4,
            velocityY: (Math.random() - 0.5) * 4,
            life: 1.0,
            decay: 0.01 + Math.random() * 0.02
        });
        
        // Limit number of particles
        if (particles.length > particleCount) {
            removeOldestParticle();
        }
    }

    // Remove oldest particle
    function removeOldestParticle() {
        if (particles.length > 0) {
            const oldest = particles.shift();
            if (oldest.element.parentNode) {
                oldest.element.remove();
            }
        }
    }

    // Animate particles
    function animateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            
            // Update position
            p.x += p.velocityX;
            p.y += p.velocityY;
            
            // Apply gravity
            p.velocityY += 0.05;
            
            // Apply air resistance
            p.velocityX *= 0.98;
            p.velocityY *= 0.98;
            
            // Update life
            p.life -= p.decay;
            
            // Update particle element
            p.element.style.left = `${p.x}px`;
            p.element.style.top = `${p.y}px`;
            p.element.style.opacity = p.life;
            
            // Remove dead particles
            if (p.life <= 0) {
                p.element.remove();
                particles.splice(i, 1);
            }
        }
        
        requestAnimationFrame(animateParticles);
    }

    // Start animation
    animateParticles();

    // Create initial particles
    createParticles(5);

    // Optional: Create particles on click
    document.addEventListener('click', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        createParticles(8);
    });

    // Clean up on page unload
    window.addEventListener('beforeunload', function() {
        particles.forEach(p => {
            if (p.element.parentNode) {
                p.element.remove();
            }
        });
        particles = [];
    });
});