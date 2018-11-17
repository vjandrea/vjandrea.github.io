defineNamespace(window, "uiTypes.pages");

(function (ns) {
    var Paginator = function () {
        this.currentIndex = [0];
        this.step = [0];
        this.offset = [0];
    };
    Paginator.prototype.getIndices = function (init) {
        var result = {}
        result.current = [];
        result.previous = [];
        result.next = [];

        for(var i = 0; i < this.step.length; i++)
        {
            var maxIndex = this.offset[i] + this.itemsCount[i];
            if(!this.currentIndex[i])
            {
                this.currentIndex[i] = 0;
            }
            var pageIndex = Math.max(0, this.step[i] == 0 ? 0 : Math.floor((this.currentIndex[i] - this.offset[i]) / this.step[i]));
            var normalizedIndex = this.offset[i] + pageIndex * this.step[i];
            this.currentIndex[i] = normalizedIndex;


            var temp = {
                startIndex: normalizedIndex,
                endIndex: Math.max(0,Math.min(maxIndex, normalizedIndex + this.step[i] - 1)),
                pageIndex: pageIndex
            }
            result.current.push(temp);

            if (normalizedIndex > this.offset[i]) {
                temp = {
                    startIndex: Math.max(this.offset[i], result.current[i].startIndex - this.step[i]),
                    endIndex: result.current[i].startIndex - 1,
                    pageIndex: result.current[i].pageIndex - 1
                };
                result.previous.push(temp);
            }

            if (normalizedIndex + this.step[i] <= maxIndex) {
                temp = {
                    startIndex: result.current[i].endIndex + 1,
                    endIndex: Math.min(maxIndex, result.current[i].endIndex + this.step[i]),
                    pageIndex: result.current[i].pageIndex + 1
                }
                result.next.push(temp);
            }
        }

        return result;
    };
    Paginator.prototype.stepForward = function () {
        for(var i = 0; i < this.currentIndex.length; i++)
        {
            this.currentIndex[i] += this.step[i];
            this.currentIndex[i] = Math.min(this.offset[i] + this.itemsCount[i], this.currentIndex[i]);
        }
    };
    Paginator.prototype.stepBackward = function () {
        for(var i = 0; i < this.currentIndex.length; i++)
        {
            this.currentIndex[i] -= this.step[i];
            this.currentIndex[i] = Math.max(this.offset[i], this.currentIndex[i]);
        }
    };
    Paginator.prototype.setCurrentIndex = function (value) {
        this.currentIndex = [];
        if(typeof(value) == "object")
        {
            for(var i = 0; i < value.length; i++)
            {
                this.currentIndex.push(value[i]);
            }
        }
        else if(typeof(value) == "string")
        {
            this.currentIndex = [];
            value = value.replace("[","");
            value = value.replace("]","");
            var values = value.split(",");
            for(var i = 0; i < values.length; i++)
            {
                var tmp = parseInt(values[i]);
                if(!isNaN(tmp))
                {
                    this.currentIndex.push(tmp);
                }
            }
        }
        else
        {
            this.currentIndex[0] = value;
        }
    };
    Paginator.prototype.setPageIndex = function (value) {
        for(var i = 0; i < value.length; i++)
        {
            if(typeof(value) == "object")
            {
                this.currentIndex[i] = value[i] * this.step[i];
            }
            else
            {
                this.currentIndex[i] = value * this.step[i];
            }
        }
    };
    Paginator.prototype.setStep = function (value) {
        this.step = [];
        if(typeof(value) == "object")
        {
            for(var i = 0; i < value.length; i++)
            {
                this.step[i] = value[i];
            }
        }
        else
        {
            this.step[0] = value;
        }
    };
    Paginator.prototype.setItemsCount = function (value) {
        this.itemsCount = [];
        if(typeof(value) == "object")
        {
            for(var i = 0; i < value.length; i++)
            {
                this.itemsCount.push(Math.max(0, value[i] - 1));
            }
        }
        else
        {
            this.itemsCount[0] = Math.max(0, value - 1);
        }
    };
    Paginator.prototype.setOffset = function (value) {
        this.offset[i] = [];
        if(typeof(value) == "object")
        {
            for(var i = 0; i < value.length; i++)
            {
                if(!this.offset[i])
                {
                    this.offset[i] = 0;
                }
                if(!this.currentIndex[i])
                {
                    this.currentIndex[i] = 0;
                }
                this.currentIndex[i] += value[i] - this.offset[i];
                this.offset[i] = value[i];
            }
        }
        else
        {
            this.currentIndex += value - this.offset;
            this.offset = value;
        }
    };

    ns.Paginator = Paginator;
})(window.uiTypes.pages);
