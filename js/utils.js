// Utility Functions for Algorithm Visualizer

class Utils {
    // Generate random array
    static generateRandomArray(size, min = 10, max = 400) {
        return Array.from({ length: size }, () => 
            Math.floor(Math.random() * (max - min + 1)) + min
        );
    }

    // Shuffle array using Fisher-Yates algorithm
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Delay function for animation
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Map speed value to delay
    static getDelayFromSpeed(speed) {
        return Math.max(10, 200 - (speed * 20));
    }

    // Generate color based on value
    static getColorFromValue(value, min, max) {
        const normalized = (value - min) / (max - min);
        const hue = normalized * 240; // Blue to red spectrum
        return `hsl(${hue}, 70%, 50%)`;
    }

    // Create bar element
    static createBar(value, index, maxValue) {
        const bar = document.createElement('div');
        bar.className = 'bar';
        bar.style.height = `${(value / maxValue) * 350}px`;
        bar.style.width = '20px';
        bar.dataset.value = value;
        bar.dataset.index = index;
        bar.title = `Value: ${value}`;
        return bar;
    }

    // Add animation class
    static addAnimationClass(element, className, duration = 300) {
        element.classList.add(className);
        setTimeout(() => {
            element.classList.remove(className);
        }, duration);
    }

    // Format time
    static formatTime(seconds) {
        return seconds.toFixed(2) + 's';
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Check if array is sorted
    static isSorted(array) {
        for (let i = 1; i < array.length; i++) {
            if (array[i] < array[i - 1]) {
                return false;
            }
        }
        return true;
    }

    // Get algorithm complexity
    static getAlgorithmComplexity(algorithm) {
        const complexities = {
            bubble: {
                time: 'O(n²)',
                space: 'O(1)',
                description: 'Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
            },
            quick: {
                time: 'O(n log n)',
                space: 'O(log n)',
                description: 'Quick Sort is a divide-and-conquer algorithm that picks an element as a pivot and partitions the array around the pivot.'
            },
            merge: {
                time: 'O(n log n)',
                space: 'O(n)',
                description: 'Merge Sort is a divide-and-conquer algorithm that divides the array into two halves, sorts them separately, and then merges them.'
            },
            heap: {
                time: 'O(n log n)',
                space: 'O(1)',
                description: 'Heap Sort is a comparison-based sorting algorithm that uses a binary heap data structure.'
            },
            insertion: {
                time: 'O(n²)',
                space: 'O(1)',
                description: 'Insertion Sort builds the final sorted array one item at a time by inserting each element into its correct position.'
            },
            selection: {
                time: 'O(n²)',
                space: 'O(1)',
                description: 'Selection Sort finds the minimum element and places it at the beginning, then repeats for the remaining elements.'
            }
        };
        return complexities[algorithm] || complexities.bubble;
    }

    // Create particle effect
    static createParticleEffect(x, y, color = '#00f5ff') {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        particle.style.boxShadow = `0 0 10px ${color}`;
        
        document.body.appendChild(particle);
        
        const animation = particle.animate([
            { transform: 'translate(0, 0) scale(1)', opacity: 1 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 100 - 50}px) scale(0)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'ease-out'
        });
        
        animation.onfinish = () => particle.remove();
    }

    // Sound effects
    static playSound(type) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        const frequencies = {
            swap: 440,
            compare: 660,
            complete: 880
        };
        
        oscillator.frequency.setValueAtTime(frequencies[type] || 440, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }

    // Get random gradient
    static getRandomGradient() {
        const colors = [
            '#00f5ff', '#ff006e', '#ffd700', '#00ff88', '#ffaa00', '#ff4444'
        ];
        const color1 = colors[Math.floor(Math.random() * colors.length)];
        const color2 = colors[Math.floor(Math.random() * colors.length)];
        return `linear-gradient(45deg, ${color1}, ${color2})`;
    }

    // Animate number counter
    static animateNumber(element, start, end, duration = 1000) {
        const startTime = Date.now();
        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };
        requestAnimationFrame(update);
    }

    // Local storage helpers
    static saveToStorage(key, value) {
        try {
            // Note: localStorage is not available in Claude artifacts
            // This is a placeholder for when code is used in a real environment
            if (typeof Storage !== 'undefined') {
                localStorage.setItem(key, JSON.stringify(value));
            }
        } catch (error) {
            console.warn('Storage not available');
        }
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            // Note: localStorage is not available in Claude artifacts
            // This is a placeholder for when code is used in a real environment
            if (typeof Storage !== 'undefined') {
                const stored = localStorage.getItem(key);
                return stored ? JSON.parse(stored) : defaultValue;
            }
        } catch (error) {
            console.warn('Storage not available');
        }
        return defaultValue;
    }

    // Performance monitoring
    static startPerformanceMonitor() {
        return {
            start: performance.now(),
            mark: function(label) {
                console.log(`${label}: ${(performance.now() - this.start).toFixed(2)}ms`);
            },
            end: function() {
                const total = performance.now() - this.start;
                console.log(`Total time: ${total.toFixed(2)}ms`);
                return total;
            }
        };
    }

    // Validate input
    static validateInput(value, min, max, type = 'number') {
        if (type === 'number') {
            const num = parseInt(value);
            return !isNaN(num) && num >= min && num <= max;
        }
        return false;
    }

    // Deep clone object
    static deepClone(obj) {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj);
        if (obj instanceof Array) return obj.map(item => Utils.deepClone(item));
        if (typeof obj === 'object') {
            const cloned = {};
            for (let key in obj) {
                if (obj.hasOwnProperty(key)) {
                    cloned[key] = Utils.deepClone(obj[key]);
                }
            }
            return cloned;
        }
    }
}