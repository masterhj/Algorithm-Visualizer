// Sorting Algorithms Implementation

class SortingAlgorithms {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.isRunning = false;
        this.isPaused = false;
        this.comparisons = 0;
        this.swaps = 0;
        this.steps = [];
    }

    // Bubble Sort
    async bubbleSort(array) {
        this.reset();
        const arr = [...array];
        const n = arr.length;

        for (let i = 0; i < n - 1; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (!this.isRunning) return;
                
                await this.waitIfPaused();
                
                // Compare elements
                this.comparisons++;
                this.visualizer.updateStats(this.comparisons, this.swaps);
                this.visualizer.highlightBars([j, j + 1], 'comparing');
                
                Utils.playSound('compare');
                await Utils.delay(this.visualizer.getSpeed());
                
                if (arr[j] > arr[j + 1]) {
                    // Swap elements
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    this.swaps++;
                    this.visualizer.updateStats(this.comparisons, this.swaps);
                    this.visualizer.highlightBars([j, j + 1], 'swapping');
                    this.visualizer.updateBars(arr);
                    
                    Utils.playSound('swap');
                    await Utils.delay(this.visualizer.getSpeed());
                }
                
                this.visualizer.removeHighlight([j, j + 1]);
            }
            
            // Mark as sorted
            this.visualizer.markSorted([n - i - 1]);
        }
        
        this.visualizer.markSorted([0]);
        this.visualizer.showComplete();
        Utils.playSound('complete');
    }

    // Quick Sort
    async quickSort(array, low = 0, high = array.length - 1) {
        if (low === 0 && high === array.length - 1) {
            this.reset();
        }
        
        if (low < high && this.isRunning) {
            await this.waitIfPaused();
            
            const pivotIndex = await this.partition(array, low, high);
            await this.quickSort(array, low, pivotIndex - 1);
            await this.quickSort(array, pivotIndex + 1, high);
        }
        
        if (low === 0 && high === array.length - 1) {
            this.visualizer.markAllSorted();
            this.visualizer.showComplete();
            Utils.playSound('complete');
        }
    }

    async partition(array, low, high) {
        const pivot = array[high];
        let i = low - 1;
        
        this.visualizer.highlightBars([high], 'pivot');
        
        for (let j = low; j < high; j++) {
            if (!this.isRunning) return i + 1;
            
            await this.waitIfPaused();
            
            this.comparisons++;
            this.visualizer.updateStats(this.comparisons, this.swaps);
            this.visualizer.highlightBars([j], 'comparing');
            
            Utils.playSound('compare');
            await Utils.delay(this.visualizer.getSpeed());
            
            if (array[j] < pivot) {
                i++;
                if (i !== j) {
                    [array[i], array[j]] = [array[j], array[i]];
                    this.swaps++;
                    this.visualizer.updateStats(this.comparisons, this.swaps);
                    this.visualizer.highlightBars([i, j], 'swapping');
                    this.visualizer.updateBars(array);
                    
                    Utils.playSound('swap');
                    await Utils.delay(this.visualizer.getSpeed());
                }
            }
            
            this.visualizer.removeHighlight([j]);
        }
        
        [array[i + 1], array[high]] = [array[high], array[i + 1]];
        this.swaps++;
        this.visualizer.updateStats(this.comparisons, this.swaps);
        this.visualizer.highlightBars([i + 1, high], 'swapping');
        this.visualizer.updateBars(array);
        
        Utils.playSound('swap');
        await Utils.delay(this.visualizer.getSpeed());
        
        this.visualizer.removeHighlight([i + 1, high]);
        this.visualizer.markSorted([i + 1]);
        
        return i + 1;
    }

    // Merge Sort
    async mergeSort(array, left = 0, right = array.length - 1) {
        if (left === 0 && right === array.length - 1) {
            this.reset();
        }
        
        if (left < right && this.isRunning) {
            await this.waitIfPaused();
            
            const middle = Math.floor((left + right) / 2);
            
            await this.mergeSort(array, left, middle);
            await this.mergeSort(array, middle + 1, right);
            await this.merge(array, left, middle, right);
        }
        
        if (left === 0 && right === array.length - 1) {
            this.visualizer.markAllSorted();
            this.visualizer.showComplete();
            Utils.playSound('complete');
        }
    }

    async merge(array, left, middle, right) {
        const leftArr = array.slice(left, middle + 1);
        const rightArr = array.slice(middle + 1, right + 1);
        
        let i = 0, j = 0, k = left;
        
        while (i < leftArr.length && j < rightArr.length) {
            if (!this.isRunning) return;
            
            await this.waitIfPaused();
            
            this.comparisons++;
            this.visualizer.updateStats(this.comparisons, this.swaps);
            this.visualizer.highlightBars([k], 'comparing');
            
            Utils.playSound('compare');
            await Utils.delay(this.visualizer.getSpeed());
            
            if (leftArr[i] <= rightArr[j]) {
                array[k] = leftArr[i];
                i++;
            } else {
                array[k] = rightArr[j];
                j++;
            }
            
            this.visualizer.updateBars(array);
            this.visualizer.removeHighlight([k]);
            k++;
        }
        
        while (i < leftArr.length) {
            if (!this.isRunning) return;
            array[k] = leftArr[i];
            this.visualizer.updateBars(array);
            i++;
            k++;
        }
        
        while (j < rightArr.length) {
            if (!this.isRunning) return;
            array[k] = rightArr[j];
            this.visualizer.updateBars(array);
            j++;
            k++;
        }
    }

    // Heap Sort
    async heapSort(array) {
        this.reset();
        const n = array.length;
        
        // Build max heap
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await this.heapify(array, n, i);
        }
        
        // Extract elements from heap
        for (let i = n - 1; i > 0; i--) {
            if (!this.isRunning) return;
            
            await this.waitIfPaused();
            
            // Move current root to end
            [array[0], array[i]] = [array[i], array[0]];
            this.swaps++;
            this.visualizer.updateStats(this.comparisons, this.swaps);
            this.visualizer.highlightBars([0, i], 'swapping');
            this.visualizer.updateBars(array);
            
            Utils.playSound('swap');
            await Utils.delay(this.visualizer.getSpeed());
            
            this.visualizer.removeHighlight([0, i]);
            this.visualizer.markSorted([i]);
            
            // Heapify reduced heap
            await this.heapify(array, i, 0);
        }
        
        this.visualizer.markSorted([0]);
        this.visualizer.showComplete();
        Utils.playSound('complete');
    }

    async heapify(array, n, i) {
        let largest = i;
        const left = 2 * i + 1;
        const right = 2 * i + 2;
        
        if (left < n) {
            this.comparisons++;
            this.visualizer.updateStats(this.comparisons, this.swaps);
            
            if (array[left] > array[largest]) {
                largest = left;
            }
        }
        
        if (right < n) {
            this.comparisons++;
            this.visualizer.updateStats(this.comparisons, this.swaps);
            
            if (array[right] > array[largest]) {
                largest = right;
            }
        }
        
        if (largest !== i) {
            [array[i], array[largest]] = [array[largest], array[i]];
            this.swaps++;
            this.visualizer.updateStats(this.comparisons, this.swaps);
            this.visualizer.highlightBars([i, largest], 'swapping');
            this.visualizer.updateBars(array);
            
            Utils.playSound('swap');
            await Utils.delay(this.visualizer.getSpeed());
            
            this.visualizer.removeHighlight([i, largest]);
            
            await this.heapify(array, n, largest);
        }
    }

    // Insertion Sort
    async insertionSort(array) {
        this.reset();
        const n = array.length;
        
        for (let i = 1; i < n; i++) {
            if (!this.isRunning) return;
            
            await this.waitIfPaused();
            
            const key = array[i];
            let j = i - 1;
            
            this.visualizer.highlightBars([i], 'comparing');
            
            while (j >= 0 && this.isRunning) {
                await this.waitIfPaused();
                
                this.comparisons++;
                this.visualizer.updateStats(this.comparisons, this.swaps);
                this.visualizer.highlightBars([j], 'comparing');
                
                Utils.playSound('compare');
                await Utils.delay(this.visualizer.getSpeed());
                
                if (array[j] <= key) break;
                
                array[j + 1] = array[j];
                this.swaps++;
                this.visualizer.updateStats(this.comparisons, this.swaps);
                this.visualizer.updateBars(array);
                
                Utils.playSound('swap');
                await Utils.delay(this.visualizer.getSpeed());
                
                this.visualizer.removeHighlight([j]);
                j--;
            }
            
            array[j + 1] = key;
            this.visualizer.updateBars(array);
            this.visualizer.removeHighlight([i]);
        }
        
        this.visualizer.markAllSorted();
        this.visualizer.showComplete();
        Utils.playSound('complete');
    }

    // Selection Sort
    async selectionSort(array) {
        this.reset();
        const n = array.length;
        
        for (let i = 0; i < n - 1; i++) {
            if (!this.isRunning) return;
            
            await this.waitIfPaused();
            
            let minIndex = i;
            this.visualizer.highlightBars([i], 'comparing');
            
            for (let j = i + 1; j < n; j++) {
                if (!this.isRunning) return;
                
                await this.waitIfPaused();
                
                this.comparisons++;
                this.visualizer.updateStats(this.comparisons, this.swaps);
                this.visualizer.highlightBars([j], 'comparing');
                
                Utils.playSound('compare');
                await Utils.delay(this.visualizer.getSpeed());
                
                if (array[j] < array[minIndex]) {
                    if (minIndex !== i) {
                        this.visualizer.removeHighlight([minIndex]);
                    }
                    minIndex = j;
                } else {
                    this.visualizer.removeHighlight([j]);
                }
            }
            
            if (minIndex !== i) {
                [array[i], array[minIndex]] = [array[minIndex], array[i]];
                this.swaps++;
                this.visualizer.updateStats(this.comparisons, this.swaps);
                this.visualizer.highlightBars([i, minIndex], 'swapping');
                this.visualizer.updateBars(array);
                
                Utils.playSound('swap');
                await Utils.delay(this.visualizer.getSpeed());
                
                this.visualizer.removeHighlight([minIndex]);
            }
            
            this.visualizer.removeHighlight([i]);
            this.visualizer.markSorted([i]);
        }
        
        this.visualizer.markSorted([n - 1]);
        this.visualizer.showComplete();
        Utils.playSound('complete');
    }

    // Control methods
    start() {
        this.isRunning = true;
        this.isPaused = false;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
    }

    reset() {
        this.comparisons = 0;
        this.swaps = 0;
        this.visualizer.updateStats(0, 0);
    }

    async waitIfPaused() {
        while (this.isPaused && this.isRunning) {
            await Utils.delay(100);
        }
    }
}