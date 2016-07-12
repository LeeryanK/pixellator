(function () {
    /** Pixelator class. **/
    
    function Pixelator(imageData) {
        if (!validateProps(imageData, Object, 'width', 'number', 'height', 'number', 'data', Uint8ClampedArray)) {
            throw new TypeError('The first argument passed into the Pixelator constructor was not a valid ImageData object.');
        }
        
        this.width = imageData.width;
        this.height = imageData.height;
        this.data = imageData.data;
        
        this.canvas_ = document.createElement('canvas');
        this.canvas_.width = this.width;
        this.canvas_.height = this.height;
        
        this.ctx_ = this.canvas_.getContext('2d');
        this.ctx_.putImageData(imageData, 0, 0);
    }
    
    Pixelator.prototype.pixelate = function (sectionWidth, sectionHeight) {
        var sections = this.getAllSections(sectionWidth, sectionHeight),
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            i = sections.length;
        
        this.sectionsProcessed_ = 0;
        this.totalSections_ = sections.length;
        
        canvas.width = this.width;
        canvas.height = this.height;
        
        while (i--) {
            var section = sections[i],
                average = this.getAverageColor(section);
            
            ctx.fillStyle = 'rgba(' + (average.r & 255) + ',' + (average.g & 255) + ',' + (average.b & 255) + ',' + (average.a & 255) / 255 + ')';
            ctx.fillRect(section.x, section.y, section.width, section.height);
            
            this.sectionsProcessed_++;
        }
        
        return ctx;
    };
    
    Pixelator.prototype.getAllSections = function (sectionWidth, sectionHeight) {
        var sections = [],
            
            rightEdgeSectionWidth = (this.width % sectionWidth) || sectionWidth,
            bottomEdgeSectionHeight = (this.height % sectionHeight) || sectionHeight,
            
            rightEdgeSectionX = this.width - rightEdgeSectionWidth,
            bottomEdgeSectionY = this.height - bottomEdgeSectionHeight;
        
        function addAllSectionsForRow(y, height) {
            sections.push(new Section(rightEdgeSectionX, y, rightEdgeSectionWidth, height));
            
            var x = rightEdgeSectionX - sectionWidth;
            
            while (x >= 0) {
                sections.push(new Section(x, y, sectionWidth, height));
                
                x -= sectionWidth;
            }
        }
        
        addAllSectionsForRow(bottomEdgeSectionY, bottomEdgeSectionHeight);
        
        var y = bottomEdgeSectionY - sectionHeight;
        
        while (y >= 0) {
            addAllSectionsForRow(y, sectionHeight);
            
            y -= sectionHeight;
        }
        
        return sections;
    };
    
    Pixelator.prototype.getAverageColor = function (section) {
        var data = this.ctx_.getImageData(section.x, section.y, section.width, section.height).data,
            
            sumColor = {r: 0, g: 0, b: 0, a: 0},
            avgColor = {},
            
            len = data.length,
            numOfPixels = len / 4,
            i = 0;//needs serious fixing
        
        while (i < len) {
            sumColor.r += data[i++];
            sumColor.g += data[i++];
            sumColor.b += data[i++];
            sumColor.a += data[i++];
        }
        
        avgColor.r = sumColor.r / numOfPixels;
        avgColor.g = sumColor.g / numOfPixels;
        avgColor.b = sumColor.b / numOfPixels;
        avgColor.a = sumColor.a / numOfPixels;
        
        return avgColor;
    };
    
    Pixelator.prototype.getProgress = function() {
        var progress = this.sectionsProcessed_ / this.totalSections_;
        return (isFinite(progress) && !isNaN(progress)) ? progress : 0;
    };
    
    Pixelator.prototype.filters_ = [];
    
    /** Section class. **/
    
    function Section(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
    }
    
    /** Miscellaneous utilities. **/
    
    function validateProps(obj, constructor) {
        if (!(obj instanceof Object) || typeof constructor !== 'function' || !(obj instanceof constructor)) {
            return false;
        }
        
        var numOfArgs = arguments.length;
        
        for (var i = 2; i < numOfArgs; i += 2) {
            var prop = obj[arguments[i]],
                propType = arguments[i + 1],
                propTypeType = typeof propType;
            
            if (
                (propTypeType === 'function' && !(prop instanceof propType)) ||
                (propTypeType === 'string' && typeof prop !== propType) ||
                (propTypeType !== 'function' && propTypeType !== 'string')
            ) {
                return false;
            }
        }
        
        return true;
    }
    
    window['Pixelator'] = Pixelator;
})();
