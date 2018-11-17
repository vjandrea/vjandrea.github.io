defineNamespace(window, "ui");
(function (ns) {
    var Layout = {};

    // $container: $element,
    // items: [
    //     {
    //       $item: ,
    //       location:
    //     }
    // ]
    // options: {
    //     grid: {
    //         columnsCount: number
    //     },
    //     prepend: bool // append or prepend
    // }
    Layout.Place = function($container, items, options){
        options = options || {};

        if (options.grid) {
            createGrid($container, items, options.grid);
            return;
        }

        var useLocationProperty = false;
        var defaultWidth = (100 / items.length) + "%";
        //var itemContainer = $.createItem( { class:"line-element" } );
        for (var i = 0; i < items.length; i++) {
            var $item = items[i].$item;
            var location = items[i].location;

            if (!location) {
                $item.addClass("line-element");
                //$item = itemContainer.clone().append($item);
            } else {
                useLocationProperty = true;
                $item.css({
                    position: "absolute",
                    left: location.x,
                    top: location.y,
                    width: location.width,
                    height: location.height
                });
            }

            options.prepend ? $container.prepend($item) : $container.append($item);
        }

        if (useLocationProperty) {
            $container.css("position", "relative");
        } else {
            $container.addClass("line");
        }
    };

    var createGrid = function($container, $items, options) {
        assert($items && ($items.length > 0), "createGrid Argument $items is not Array", true);
        assert($container, "createGrid Argument $container is null", true);

        var colCount = options.columnsCount;
        assert(colCount > 0, "createGrid Argument options.columnsCount is invalid", true);
        var itemsCount = $items.length;
        var itemWidth = (100 / colCount) + "%";
        var itemHeight = (100 / Math.ceil(itemsCount / colCount)) + "%";

        for (var i = 0; i < $items.length; i++) {
            var $item = $items[i].$item;
            if(window.isDot2())
            {
                $item.css({
                    width: "calc("+itemWidth+" - 1px)",
                    height: "calc("+itemHeight+" - 1px)",
                    float: "left"
                });
            }
            else
            {
                $item.css({
                    width: itemWidth,
                    height: itemHeight,
                    float: "left"
                });
            }
            $container.append($item);
        }
    };


    ns.Layout = Layout;

})(window.ui);
