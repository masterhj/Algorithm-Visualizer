// Main Visualizer Class for Algorithm Visualization

class Visualizer {
    constructor() {
        this.array = [];
        this.isRunning = false;
        this.isPaused = false;
        this.speed = 5;
        this.startTime = 0;
        this.timerInterval = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.generateNewArray();
    }

    initializeElements() {
        this.visualizationArea = document.getElementById('visualization-area');
        this.comparisonsElement = document.getElementById('comparisons');
        this.swapsElement = document.getElementById('swaps');
        this.timeElement = document.getElementById('time');
        this.timeComplexityElement = document.getElementById('time-complexity');
        this.spaceComplexityElement = document.getElementById('space-complexity');
        this.descriptionElement = document.getElementById('algorithm-description');
        this.sizeSlider = document.getElementById('array-size');
        this.speedSlider = document.getElementById('speed');
        this.sizeValueElement = document.getElementById('size-value');
        this.speedValueElement = document.getElementById('speed-value');
    }

    setupEventListeners() {
        // Size slider
        this.sizeSlider.addEventListener('input', (e) => {
            this.sizeValueElement.textContent = e.target.value;
            if (!this.isRunning) {
                this.generateNewArray();
            }
        });

        // Speed slider
        this.speedSlider.addEventListener('input', (e) => {
            this.speed = parseInt(e.target.value);
            this.speedValueElement.textContent = e.target.value;
        });

        // Algorithm select
        document.getElementById('algorithm-select').addEventListener('change', (e) => {
            this.updateAlgorithmInfo(e.target.value);
        });
    }

    generateNewArray() {
        const size = parseInt(this.sizeSlider.value);
        this.array = Utils.generateRandomArray(size, 10, 400);
        this.renderBars();
        this.resetStats();
    }

    renderBars() {
        this.visualizationArea.innerHTML = '';
        const maxValue = Math.max(...this.array);
        const containerWidth = this.visualizationArea.clientWidth;
        const barWidth = Math.max(4, (containerWidth - (this.array.length * 2)) / this.array.length);

        this.array.forEach((value, index) => {
            const bar = document.createElement('div');
            bar.className = 'bar';
            bar.style.height = `${(value / maxValue) * 350}px`;
            bar.style.width = `${barWidth}px`;
            bar.dataset.value = value;
            bar.dataset.index = index;
            bar.title = `Value: ${value}`;
            
            // Add value label on hover
            bar.addEventListener('mouseenter', () => {
                bar.style.transform = 'translateY(-5px) rotateX(10deg)';
            });
            
            bar.addEventListener('mouseleave', () => {
                if (!bar.classList.contains('comparing') && 
                    !bar.classList.contains('swapping') && 
                    !bar.classList.contains('sorted')) {
                    bar.style.transform = '';
                }
            });

            this.visualizationArea.appendChild(bar);
        });
    }

    updateBars(newArray) {
        this.array = [...newArray];
        const bars = this.visualizationArea.querySelectorAll('.bar');
        const maxValue = Math.max(...this.array);

        bars.forEach((bar, index) => {
            const value = newArray[index];
            bar.style.height = `${(value / maxValue) * 350}px`;
            bar.dataset.value = value;
            bar.title = `Value: ${value}`;
        });
    }

    highlightBars(indices, type) {
        const bars = this.visualizationArea.querySelectorAll('.bar');
        indices.forEach(index => {
            if (bars[index]) {
                bars[index].classList.add(type);
            }
        });
    }

    removeHighlight(indices) {
        const bars = this.visualizationArea.querySelectorAll('.bar');
        indices.forEach(index => {
            if (bars[index]) {
                bars[index].classList.remove('comparing', 'swapping');
            }
        });
    }

    markSorted(indices) {
        const bars = this.visualizationArea.querySelectorAll('.bar');
        indices.forEach(index => {
            if (bars[index]) {
                bars[index].classList.add('sorted');
                bars[index].classList.remove('comparing', 'swapping');
            }
        });
    }

    markAllSorted() {
        const bars = this.visualizationArea.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                bar.classList.add('sorted');
                bar.classList.remove('comparing', 'swapping');
            }, index * 50);
        });
    }

    updateStats(comparisons, swaps) {
        this.comparisonsElement.textContent = comparisons;
        this.swapsElement.textContent = swaps;
    }

    updateAlgorithmInfo(algorithm) {
        const info = Utils.getAlgorithmComplexity(algorithm);
        this.timeComplexityElement.textContent = info.time;
        this.spaceComplexityElement.textContent = info.space;
        this.descriptionElement.textContent = info.description;
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            if (!this.isPaused) {
                const elapsed = (Date.now() - this.startTime) / 1000;
                this.timeElement.textContent = Utils.formatTime(elapsed);
            }
        }, 10);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    resetStats() {
        this.comparisonsElement.textContent = '0';
        this.swapsElement.textContent = '0';
        this.timeElement.textContent = '0.00s';
        this.stopTimer();
    }

    showComplete() {
        // Create completion effect
        const bars = this.visualizationArea.querySelectorAll('.bar');
        bars.forEach((bar, index) => {
            setTimeout(() => {
                Utils.createParticleEffect(
                    bar.offsetLeft + bar.offsetWidth / 2,
                    bar.offsetTop,
                    '#00ff88'
                );
            }, index * 20);
        });

        // Show completion message
        setTimeout(() => {
            this.showMessage('Sorting Complete!', 'success');
        }, bars.length * 20);
    }

    showMessage(text, type = 'info') {
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 15px;
            padding: 20px 40px;
            color: var(--text-primary);
            font-size: 1.2rem;
            font-weight: 600;
            backdrop-filter: blur(20px);
            z-index: 1000;
            animation: messageSlide 0.5s ease-out;
        `;

        document.body.appendChild(message);

        setTimeout(() => {
            message.style.animation = 'messageSlide 0.5s ease-out reverse';
            setTimeout(() => message.remove(), 500);
        }, 2000);
    }

    getSpeed() {
        return Utils.getDelayFromSpeed(this.speed);
    }

    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.stopTimer();
        this.resetStats();
        
        // Remove all highlights
        const bars = this.visualizationArea.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.classList.remove('comparing', 'swapping', 'sorted');
            bar.style.transform = '';
        });
    }

    // Animation methods for different visualizations
    animateSwap(bar1, bar2) {
        return new Promise(resolve => {
            const temp = bar1.style.transform;
            bar1.style.transform = bar2.style.transform;
            bar2.style.transform = temp;
            
            setTimeout(resolve, 300);
        });
    }

    animateComparison(bar1, bar2) {
        return new Promise(resolve => {
            bar1.style.transform = 'translateY(-10px) rotateX(10deg)';
            bar2.style.transform = 'translateY(-10px) rotateX(10deg)';
            
            setTimeout(() => {
                bar1.style.transform = '';
                bar2.style.transform = '';
                resolve();
            }, 300);
        });
    }

    // Pathfinding visualization methods
    createGrid(rows, cols) {
        const grid = document.createElement('div');
        grid.className = 'grid';
        grid.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        
        for (let i = 0; i < rows * cols; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = Math.floor(i / cols);
            cell.dataset.col = i % cols;
            cell.style.aspectRatio = '1';
            grid.appendChild(cell);
        }
        
        return grid;
    }

    highlightPath(path, className) {
        path.forEach((cell, index) => {
            setTimeout(() => {
                const gridCell = document.querySelector(
                    `[data-row="${cell.row}"][data-col="${cell.col}"]`
                );
                if (gridCell) {
                    gridCell.classList.add(className);
                }
            }, index * 50);
        });
    }

    // Graph visualization methods
    drawGraph(canvas, nodes, edges) {
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.clearRect(0, 0, width, height);
        
        // Draw edges
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        edges.forEach(edge => {
            const from = nodes[edge.from];
            const to = nodes[edge.to];
            
            ctx.beginPath();
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        });
        
        // Draw nodes
        nodes.forEach(node => {
            ctx.beginPath();
            ctx.arc(node.x, node.y, 20, 0, 2 * Math.PI);
            ctx.fillStyle = node.color || '#00f5ff';
            ctx.fill();
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Draw node label
            ctx.fillStyle = '#000000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.label, node.x, node.y + 4);
        });
    }
}

// Add CSS for message animation
const style = document.createElement('style');
style.textContent = `
    @keyframes messageSlide {
        0% {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        100% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
`;
document.head.appendChild(style);